'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import apiFetch from '@/lib/apiClient';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  qty: number;
  image: string | null;
}

export interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Omit<CartItem, 'qty'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage
  const loadCart = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      
      // Always load from localStorage first for instant display
      try {
        const raw = localStorage.getItem('unimart:cart');
        const localCart = raw ? JSON.parse(raw) : [];
        if (Array.isArray(localCart)) {
          setItems(localCart);
        }
      } catch (e) {
        setItems([]);
      }

      // Then sync with backend if logged in
      if (token) {
        try {
          const res = await apiFetch('/cart');
          if (res?.data?.items && Array.isArray(res.data.items)) {
            const backendItems = res.data.items.map((it: any) => ({
              id: it.product?._id || it.product?.id || it._id,
              title: it.product?.title || it.title || 'Item',
              price: it.product?.price ?? it.price ?? 0,
              qty: it.quantity ?? it.qty ?? 1,
              image: (it.product?.images?.[0]) || it.product?.image || null,
            }));
            
            // Merge: prioritize localStorage
            setItems((current) => {
              const merged = [...current];
              backendItems.forEach((bItem: CartItem) => {
                if (!merged.find((l) => l.id === bItem.id)) {
                  merged.push(bItem);
                }
              });
              return merged;
            });
          }
        } catch (e) {
          // Silently fail, user already has localStorage data
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    loadCart();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'unimart:cart') {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setItems(updated);
        } catch (err) {
          console.error('Failed to parse cart from storage event:', err);
        }
      }
    };

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('unimart:cartUpdated', handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('unimart:cartUpdated', handleCartUpdate as EventListener);
    };
  }, [loadCart]);

  // Add item to cart
  const addToCart = useCallback(async (product: Omit<CartItem, 'qty'>) => {
    try {
      const key = 'unimart:cart';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const existingIndex = current.findIndex((c: CartItem) => c.id === product.id);

      if (existingIndex >= 0) {
        current[existingIndex].qty = (current[existingIndex].qty || 1) + 1;
      } else {
        current.push({ ...product, qty: 1 });
      }

      localStorage.setItem(key, JSON.stringify(current));
      setItems(current);

      // Dispatch event for other listeners
      window.dispatchEvent(new Event('unimart:cartUpdated'));

      // Save to backend if logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      if (token) {
        try {
          await apiFetch('/cart/add', {
            method: 'POST',
            body: { productId: product.id, quantity: 1 },
          });
        } catch (err) {
          console.error('Failed to sync cart to backend:', err);
        }
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (id: string) => {
    try {
      const key = 'unimart:cart';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = current.filter((c: CartItem) => c.id !== id);

      localStorage.setItem(key, JSON.stringify(updated));
      setItems(updated);

      // Dispatch event for other listeners
      window.dispatchEvent(new Event('unimart:cartUpdated'));

      // Remove from backend if logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      if (token) {
        try {
          await apiFetch(`/cart/${id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Failed to sync removal to backend:', err);
        }
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    }
  }, []);

  // Update quantity
  const updateQuantity = useCallback(async (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);

    try {
      const key = 'unimart:cart';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const itemIndex = current.findIndex((c: CartItem) => c.id === id);

      if (itemIndex >= 0) {
        current[itemIndex].qty = qty;
        localStorage.setItem(key, JSON.stringify(current));
        setItems(current);

        // Dispatch event for other listeners
        window.dispatchEvent(new Event('unimart:cartUpdated'));

        // Update backend if logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
        if (token) {
          try {
            await apiFetch('/cart/update', {
              method: 'PUT',
              body: { productId: id, quantity: qty },
            });
          } catch (err) {
            console.error('Failed to sync quantity update to backend:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    }
  }, [removeFromCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      const key = 'unimart:cart';
      localStorage.setItem(key, JSON.stringify([]));
      setItems([]);

      // Dispatch event
      window.dispatchEvent(new Event('unimart:cartUpdated'));

      // Clear backend if logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      if (token) {
        try {
          await apiFetch('/cart/clear', { method: 'POST' });
        } catch (err) {
          console.error('Failed to clear backend cart:', err);
        }
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  }, []);

  // Derived values
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const value: CartContextType = {
    items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

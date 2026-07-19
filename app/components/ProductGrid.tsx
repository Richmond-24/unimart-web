// app/components/ProductGrid.tsx

"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";

interface Product {
  _id: string;
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  sellerName?: string;
  seller?: string;
  imageUrls?: string[];
  views?: number;
  sales?: number;
  category?: string;
  condition?: string;
}

interface ProductGridProps {
  horizontal?: boolean;
  title?: string;
  limit?: number;
  endpoint?: string;
}

// Fallback products for when API fails
const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: '1',
    title: 'Sample Product 1',
    price: 99.99,
    sellerName: 'Campus Seller',
    imageUrls: ['/images/placeholder.png'],
    category: 'Electronics',
    condition: 'New'
  },
  {
    _id: '2',
    title: 'Sample Product 2',
    price: 149.99,
    sellerName: 'Tech Seller',
    imageUrls: ['/images/placeholder.png'],
    category: 'Fashion',
    condition: 'Like New'
  },
  {
    _id: '3',
    title: 'Sample Product 3',
    price: 49.99,
    sellerName: 'Book Seller',
    imageUrls: ['/images/placeholder.png'],
    category: 'Books',
    condition: 'Good'
  },
  {
    _id: '4',
    title: 'Sample Product 4',
    price: 199.99,
    sellerName: 'Gadget Seller',
    imageUrls: ['/images/placeholder.png'],
    category: 'Electronics',
    condition: 'New'
  }
];

export default function ProductGrid({ 
  horizontal = false,
  title = "Trending near you",
  limit = 8,
  endpoint = "/public/trending" // ✅ FIXED: Removed /api prefix
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setLoadError(null);
      setUsingFallback(false);
      
      try {
        console.log(`📡 [ProductGrid] Fetching from: ${endpoint}`);
        
        const res = await apiFetch(endpoint);
        
        if (!mounted) return;
        
        console.log(`✅ [ProductGrid] Response:`, res);
        
        // Extract products from different response structures
        let productData: Product[] = [];
        
        if (res?.data && Array.isArray(res.data)) {
          productData = res.data;
          console.log(`✅ Found ${productData.length} products in res.data`);
        } else if (Array.isArray(res)) {
          productData = res;
          console.log(`✅ Found ${productData.length} products in array`);
        } else if (res?.products && Array.isArray(res.products)) {
          productData = res.products;
          console.log(`✅ Found ${productData.length} products in res.products`);
        } else if (res?.listings && Array.isArray(res.listings)) {
          productData = res.listings;
          console.log(`✅ Found ${productData.length} products in res.listings`);
        }
        
        if (productData.length > 0) {
          // Apply limit
          if (limit && productData.length > limit) {
            productData = productData.slice(0, limit);
          }
          setProducts(productData);
          setLoadError(null);
        } else {
          // No products found - use fallback
          console.log('ℹ️ [ProductGrid] No products from API, using fallback');
          setUsingFallback(true);
          setProducts(FALLBACK_PRODUCTS.slice(0, limit));
        }
        
      } catch (error: any) {
        console.log('ℹ️ [ProductGrid] API error, using fallback products');
        if (mounted) {
          setUsingFallback(true);
          setProducts(FALLBACK_PRODUCTS.slice(0, limit));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [endpoint, limit]);

  // Loading state
  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6">
          {Array(limit || 8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (loadError && !usingFallback) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">⚠️ {loadError}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🔄 Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="text-center text-slate-500 py-12">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Check back later for new listings!</p>
        </div>
      </section>
    );
  }

  // Render products
  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-slate-400">
          {usingFallback ? 'Sample products' : `${products.length} items`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6">
        {products.map((product) => {
          const id = product._id || product.id;
          if (!id) return null;

          return (
            <Link
              key={id}
              href={`/listings/${id}`}
              className="block group"
            >
              <div className="flex flex-col">
                {/* Image */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title || "Product"}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f1f5f9"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-0.5">
                  <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                    {product.sellerName || product.seller || "Campus Seller"}
                  </p>

                  <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mb-1">
                    {product.title || "Untitled"}
                  </p>

                  <p className="text-[15px] font-bold" style={{ color: "var(--temu-orange)" }}>
                    ₵{product.price ?? "—"}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-slate-400 line-through ml-1.5 text-[12px] font-normal">
                        ₵{product.originalPrice}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
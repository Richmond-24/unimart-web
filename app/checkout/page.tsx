
"use client";

import { useState, useEffect } from "react";
import apiFetch from '../../lib/apiClient';

// ─── TYPES ──────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  seller: string;
  sellerAvatar: string;
  price: number;
  qty: number;
  color: string;
  emoji: string;
  likes: number;
  friendsBought: string[];
}

interface DeliveryOption {
  id: string;
  label: string;
  eta: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  color: string;
  tag: string | null;
}

interface Address {
  name: string;
  phone: string;
  region: string;
  city: string;
  landmark: string;
}

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

interface OrderPayload {
  items: { productId: string; qty: number; price: number }[];
  delivery: {
    method: string;
    address: Address | null;
  };
  payment: {
    method: string;
    momoNumber?: string;
    card?: CardDetails;
  };
  totals: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
}

interface PaymentResponse {
  id: string;
  reference: string;
  status: string;
}

interface OrderResponse {
  id: string;
  orderId: string;
  status: string;
}

interface SuccessState {
  orderId: string;
  total: number;
}

// ─── API CONFIG ──────────────────────────────────────────────
const api = {
  async createOrder(payload: OrderPayload): Promise<OrderResponse> {
    return apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) }) as Promise<OrderResponse>;
  },
  async initiateMobileMoney(payload: { orderId: string; phone: string; provider: string }): Promise<PaymentResponse> {
    return apiFetch('/payments/mobile-money', { method: 'POST', body: JSON.stringify(payload) }) as Promise<PaymentResponse>;
  },
  async initiateCardPayment(payload: { orderId: string; card: CardDetails }): Promise<PaymentResponse> {
    return apiFetch('/payments/card', { method: 'POST', body: JSON.stringify(payload) }) as Promise<PaymentResponse>;
  },
};

// ─── MOCK CART DATA ──────────────────────────────────────
const MOCK_CART: CartItem[] = [
  {
    id: "p1",
    name: "Ankara Print Tote Bag",
    seller: "@adwoa.creates",
    sellerAvatar: "AC",
    price: 85,
    qty: 1,
    color: "#E8603C",
    emoji: "👜",
    likes: 234,
    friendsBought: ["Ama", "Kofi"],
  },
];

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "standard", label: "Standard Delivery", eta: "3–5 days", price: 15 },
  { id: "express", label: "Express Delivery", eta: "1–2 days", price: 35 },
  { id: "pickup", label: "Pickup Station", eta: "Today", price: 0 },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "mtn", label: "MTN MoMo", icon: "📱", color: "#FFC300", tag: "Popular" },
  { id: "vodafone", label: "Vodafone Cash", icon: "📲", color: "#E60000", tag: null },
  { id: "card", label: "Card", icon: "💳", color: "#4361EE", tag: null },
  { id: "airteltigo", label: "AirtelTigo", icon: "📡", color: "#FF6B00", tag: null },
];

// ─── UTILITY ─────────────────────────────────────────────────
const fmt = (n: number): string => `GH₵ ${Number(n).toFixed(2)}`;

// ─── SUB-COMPONENTS ──────────────────────────────────────────
function Section({ title, subtitle, icon, children, collapsed, onEdit }: any) {
  return (
    <div style={{ 
      background: "var(--color-background-primary)", 
      borderRadius: 16, 
      border: "0.5px solid var(--color-border-tertiary)", 
      padding: "1rem" 
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: collapsed ? 0 : "1rem",
        flexWrap: "wrap",
        gap: "0.5rem"
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)" }}>{icon} {title}</p>
          {subtitle && !collapsed && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>{subtitle}</p>}
        </div>
        {collapsed && onEdit && (
          <button onClick={onEdit} style={{ fontSize: 12, color: "#E8603C", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "0.25rem 0.5rem" }}>Edit</button>
        )}
      </div>
      {!collapsed && children}
    </div>
  );
}

function Row({ label, value, bold, valueColor }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: 13, color: bold ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: valueColor || "var(--color-text-primary)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function QtyBtn({ onClick, children }: any) {
  return (
    <button onClick={onClick} style={{ 
      width: 28, 
      height: 28, 
      borderRadius: 8, 
      border: "0.5px solid var(--color-border-secondary)", 
      background: "var(--color-background-secondary)", 
      fontSize: 16, 
      cursor: "pointer", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      color: "var(--color-text-primary)",
      flexShrink: 0
    }}>
      {children}
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function SocialCheckout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<number>(1);
  const [delivery, setDelivery] = useState<string>("standard");
  const [payMethod, setPayMethod] = useState<string>("mtn");
  const [momoNumber, setMomoNumber] = useState<string>("");
  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    region: "",
    city: "",
    landmark: "",
  });
  const [card, setCard] = useState<CardDetails>({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === delivery);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = selectedDelivery?.price ?? 0;
  const discount = subtotal > 200 ? 20 : 0;
  const total = subtotal + deliveryFee - discount;

  const updateQty = (id: string, delta: number) => {
    const apply = (cur: CartItem[]) => cur
      .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
      .filter((i) => i.qty > 0);

    (async () => {
      const next = apply(cart);
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('unimart:token')) {
          const target = next.find((it) => it.id === id);
          const qty = target ? target.qty : 0;
          if (qty <= 0) {
            await apiFetch(`/cart/${id}`, { method: 'DELETE' });
          } else {
            await apiFetch('/cart/update', { method: 'PUT', body: JSON.stringify({ productId: id, quantity: qty }) });
          }
          try { window.dispatchEvent(new Event('unimart:cartUpdated')); } catch (e) {}
          await loadCart();
          return;
        }
      } catch (e) {}

      try {
        const raw = localStorage.getItem('unimart:cart');
        const cur = raw ? JSON.parse(raw) : [];
        const idx = cur.findIndex((c: any) => c.id === id);
        if (idx >= 0) {
          cur[idx].qty = Math.max(0, cur[idx].qty + delta);
          const nextLocal = cur.filter((c: any) => c.qty > 0);
          localStorage.setItem('unimart:cart', JSON.stringify(nextLocal));
          try { window.dispatchEvent(new Event('unimart:cartUpdated')); } catch (e) {}
          setCart(nextLocal.map(mapLocalToCartItem));
        }
      } catch (e) {}
    })();
  };

  const mapBackendToCartItem = (it: any): CartItem => ({
    id: it.product?._id || it.product?.id || it._id || (it.product && it.product.toString && it.product.toString()) || String(it.product),
    name: it.product?.title || it.title || it.name || 'Item',
    seller: it.product?.seller?.username || it.seller || '@creator',
    sellerAvatar: (it.product?.seller?.name && it.product.seller.name.split(' ').map((s: string) => s[0]).slice(0,2).join('')) || (it.sellerAvatar || ''),
    price: Number(it.product?.price ?? it.price ?? 0),
    qty: Number(it.quantity ?? it.qty ?? 1),
    color: it.product?.color || it.color || '#DDD',
    emoji: it.product?.emoji || it.emoji || '🛍',
    likes: Number(it.product?.likes ?? it.likes ?? 0),
    friendsBought: Array.isArray(it.friendsBought) ? it.friendsBought : [],
  });

  const mapLocalToCartItem = (c: any): CartItem => ({
    id: c.id,
    name: c.title || c.name || 'Item',
    seller: c.seller || '@creator',
    sellerAvatar: c.sellerAvatar || '',
    price: Number(c.price || 0),
    qty: Number(c.qty || 1),
    color: c.color || '#DDD',
    emoji: c.emoji || '🛍',
    likes: Number(c.likes || 0),
    friendsBought: Array.isArray(c.friendsBought) ? c.friendsBought : [],
  });

  const loadCart = async () => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('unimart:token')) {
        try {
          const res = await apiFetch('/cart');
          if (res && res.success && res.data) {
            setCart((Array.isArray(res.data.items) ? res.data.items : []).map(mapBackendToCartItem));
            return;
          }
        } catch (e) {}
      }
      try {
        const raw = localStorage.getItem('unimart:cart');
        const cur = raw ? JSON.parse(raw) : [];
        if (Array.isArray(cur)) setCart(cur.map(mapLocalToCartItem));
        else setCart([]);
      } catch (e) { setCart([]); }
    } catch (e) { setCart([]); }
  };

  const validateDelivery = (): boolean => {
    if (delivery === "pickup") return true;
    return !!address.name && !!address.phone && !!address.region && !!address.city;
  };

  const validatePayment = (): boolean => {
    if (payMethod === "card") {
      return card.number.length >= 16 && !!card.expiry && !!card.cvv && !!card.name;
    }
    return momoNumber.length >= 10;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const orderPayload: OrderPayload = {
        items: cart.map((i) => ({ productId: i.id, qty: i.qty, price: i.price })),
        delivery: { 
          method: delivery, 
          address: delivery !== "pickup" ? address : null 
        },
        payment: {
          method: payMethod,
          ...(payMethod === "card"
            ? { 
                card: { 
                  number: card.number, 
                  expiry: card.expiry, 
                  cvv: card.cvv,
                  name: card.name 
                } 
              }
            : { momoNumber }),
        },
        totals: { subtotal, deliveryFee, discount, total },
      };

      const order: OrderResponse = await api.createOrder(orderPayload);

      if (payMethod === "card") {
        await api.initiateCardPayment({ 
          orderId: order.id, 
          card: {
            number: card.number,
            expiry: card.expiry,
            cvv: card.cvv,
            name: card.name
          }
        });
      } else {
        await api.initiateMobileMoney({ orderId: order.id, phone: momoNumber, provider: payMethod });
      }

      setSuccess({ orderId: order.orderId || "ORD-" + Date.now(), total });
      
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('unimart:token')) {
          await apiFetch('/cart/clear', { method: 'DELETE' });
        } else {
          localStorage.removeItem('unimart:cart');
        }
        try { window.dispatchEvent(new Event('unimart:cartUpdated')); } catch (e) {}
        setCart([]);
      } catch (e) {}
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field: keyof CardDetails, value: string) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const handleTouch = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    loadCart();
    const onCustom = () => loadCart();
    window.addEventListener('unimart:cartUpdated', onCustom as EventListener);
    window.addEventListener('storage', (e) => { if ((e as StorageEvent).key === 'unimart:cart') loadCart(); });
    return () => { window.removeEventListener('unimart:cartUpdated', onCustom as EventListener); };
  }, []);

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ background: "var(--color-background-primary)", borderRadius: 24, border: "0.5px solid var(--color-border-tertiary)", padding: "2rem 1.5rem", maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 0.5rem", color: "var(--color-text-primary)" }}>Order Placed!</h2>
          <p style={{ color: "var(--color-text-secondary)", margin: "0 0 1.5rem", fontSize: 14 }}>Your order <strong>{success.orderId}</strong> is confirmed.</p>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Total paid</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#E8603C" }}>{fmt(success.total)}</p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setSuccess(null); setStep(1); setCart(MOCK_CART); }} style={{ padding: "10px 20px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--color-text-primary)" }}>Continue Shopping</button>
            <button style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#E8603C", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Track Order</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)" }}>
      {/* Header - Responsive */}
      <div style={{ 
        background: "var(--color-background-primary)", 
        borderBottom: "0.5px solid var(--color-border-tertiary)", 
        padding: isMobile ? "0 1rem" : "0 2rem", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        height: "auto",
        minHeight: 60,
        flexWrap: "wrap",
        gap: "0.75rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8603C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛍</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--color-text-primary)" }}>Uni-Mart</span>
        </div>
        
        {/* Steps - Responsive */}
        <div style={{ display: "flex", gap: isMobile ? 4 : 8, flexWrap: "wrap", alignItems: "center" }}>
          {["Delivery", "Payment", "Confirm"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: isMobile ? 2 : 6 }}>
              <div style={{ 
                width: isMobile ? 22 : 26, 
                height: isMobile ? 22 : 26, 
                borderRadius: "50%", 
                background: step > i + 1 ? "#2D6A4F" : step === i + 1 ? "#E8603C" : "var(--color-background-secondary)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: isMobile ? 10 : 11, 
                fontWeight: 600, 
                color: step >= i + 1 ? "#fff" : "var(--color-text-tertiary)", 
                transition: "all 0.2s" 
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ 
                fontSize: isMobile ? 10 : 13, 
                color: step === i + 1 ? "var(--color-text-primary)" : "var(--color-text-tertiary)", 
                fontWeight: step === i + 1 ? 600 : 400,
                display: isMobile && i === 1 ? "none" : "inline"
              }}>{s}</span>
              {i < 2 && <div style={{ width: isMobile ? 12 : 20, height: 1, background: "var(--color-border-tertiary)" }} />}
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{cart.length} items</div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div style={{ 
        maxWidth: 1100, 
        margin: "0 auto", 
        padding: isMobile ? "1rem" : "2rem 1.5rem", 
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "1.5rem", 
        alignItems: "flex-start" 
      }}>
        
        {/* LEFT COLUMN - Takes full width on mobile */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.25rem", 
          flex: isMobile ? 1 : undefined,
          width: isMobile ? "100%" : "auto"
        }}>

          {/* Cart Summary */}
          <Section title="Your Cart" subtitle={`${cart.length} items from local creators`} icon="🛒">
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", flexWrap: "wrap" }}>
                <div style={{ width: isMobile ? 50 : 64, height: isMobile ? 50 : 64, borderRadius: 12, background: item.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 24 : 28, flexShrink: 0 }}>{item.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: isMobile ? 13 : 14, color: "var(--color-text-primary)" }}>{item.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#E8603C" }}>{item.seller}</p>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: isMobile ? 14 : 15, color: "var(--color-text-primary)" }}>{fmt(item.price * item.qty)}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>❤️ {item.likes.toLocaleString()} · </span>
                      {item.friendsBought.length > 0 && (
                        <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                          {item.friendsBought.slice(0, 2).join(", ")} {item.friendsBought.length > 2 ? `+${item.friendsBought.length - 2}` : ""} bought this
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <QtyBtn onClick={() => updateQty(item.id, -1)}>−</QtyBtn>
                      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                      <QtyBtn onClick={() => updateQty(item.id, 1)}>+</QtyBtn>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* Step 1: Delivery */}
          {step >= 1 && (
            <Section title="Delivery" subtitle="Where should we send your order?" icon="🚚" collapsed={step > 1} onEdit={() => setStep(1)}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
                gap: 10, 
                marginBottom: "1.25rem" 
              }}>
                {DELIVERY_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setDelivery(opt.id)} style={{ 
                    padding: "12px 10px", 
                    borderRadius: 12, 
                    border: `${delivery === opt.id ? "2px solid #E8603C" : "0.5px solid var(--color-border-tertiary)"}`, 
                    background: delivery === opt.id ? "#FFF5F2" : "var(--color-background-primary)", 
                    cursor: "pointer", 
                    textAlign: "left" 
                  }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: delivery === opt.id ? "#E8603C" : "var(--color-text-primary)" }}>{opt.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--color-text-secondary)" }}>{opt.eta}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: opt.price === 0 ? "#2D6A4F" : "var(--color-text-primary)" }}>{opt.price === 0 ? "Free" : fmt(opt.price)}</p>
                  </button>
                ))}
              </div>

              {delivery !== "pickup" && (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "name" as keyof Address, label: "Full Name", placeholder: "Ama Owusu", col: 2, required: true },
                    { key: "phone" as keyof Address, label: "Phone Number", placeholder: "0244 123 456", col: 1, required: true },
                    { key: "region" as keyof Address, label: "Region", placeholder: "Greater Accra", col: 1, required: true },
                    { key: "city" as keyof Address, label: "City / Town", placeholder: "Accra", col: 1, required: true },
                    { key: "landmark" as keyof Address, label: "Landmark (optional)", placeholder: "Near Accra Mall", col: 1, required: false },
                  ].map((f) => (
                    <div key={f.key} style={{ gridColumn: !isMobile && f.col === 2 ? "span 2" : "span 1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>{f.label}</label>
                      <input
                        value={address[f.key]}
                        onChange={(e) => handleFieldChange(f.key, e.target.value)}
                        onBlur={() => handleTouch(f.key)}
                        placeholder={f.placeholder}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `0.5px solid ${touched[f.key] && f.required && !address[f.key] ? "#E24B4A" : "var(--color-border-secondary)"}`, background: "var(--color-background-primary)", fontSize: 14, color: "var(--color-text-primary)", boxSizing: "border-box", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => { if (validateDelivery()) setStep(2); else setTouched({ name: true, phone: true, region: true, city: true }); }} style={{
                width: "100%",
                marginTop: "1rem",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: "#E8603C",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.3,
              }}>
                Continue to Payment →
              </button>
            </Section>
          )}

          {/* Step 2: Payment */}
          {step >= 2 && (
            <Section title="Payment" subtitle="Choose how you'd like to pay" icon="💰" collapsed={step > 2} onEdit={() => setStep(2)}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
                {PAYMENT_METHODS.map((pm) => (
                  <button key={pm.id} onClick={() => setPayMethod(pm.id)} style={{ padding: "12px 14px", borderRadius: 12, border: `${payMethod === pm.id ? "2px solid #E8603C" : "0.5px solid var(--color-border-tertiary)"}`, background: payMethod === pm.id ? "#FFF5F2" : "var(--color-background-primary)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                    <span style={{ fontSize: 22 }}>{pm.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: payMethod === pm.id ? "#E8603C" : "var(--color-text-primary)" }}>{pm.label}</p>
                    </div>
                    {pm.tag && <span style={{ position: "absolute", top: -8, right: 10, fontSize: 10, fontWeight: 700, background: "#FFC300", color: "#412402", padding: "2px 7px", borderRadius: 20 }}>{pm.tag}</span>}
                  </button>
                ))}
              </div>

              {payMethod !== "card" ? (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>
                    {PAYMENT_METHODS.find(p => p.id === payMethod)?.label} Number
                  </label>
                  <input
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="0244000000"
                    maxLength={10}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", fontSize: 16, letterSpacing: 2, color: "var(--color-text-primary)", boxSizing: "border-box", outline: "none" }}
                  />
                  <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "8px 0 0" }}>You'll receive a prompt to approve {fmt(total)}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "number" as keyof CardDetails, label: "Card Number", placeholder: "1234 5678 9012 3456", col: 2, maxLen: 19 },
                    { key: "expiry" as keyof CardDetails, label: "Expiry", placeholder: "MM/YY", col: 1, maxLen: 5 },
                    { key: "cvv" as keyof CardDetails, label: "CVV", placeholder: "123", col: 1, maxLen: 3 },
                    { key: "name" as keyof CardDetails, label: "Name on Card", placeholder: "Ama Owusu", col: 2, maxLen: 50 },
                  ].map((f) => (
                    <div key={f.key} style={{ gridColumn: !isMobile && f.col === 2 ? "span 2" : "span 1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>{f.label}</label>
                      <input
                        value={card[f.key]}
                        onChange={(e) => handleCardChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        maxLength={f.maxLen}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", fontSize: 14, color: "var(--color-text-primary)", boxSizing: "border-box", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => { if (validatePayment()) setStep(3); }} style={{
                width: "100%",
                marginTop: "1rem",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: "#E8603C",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.3,
                opacity: validatePayment() ? 1 : 0.5
              }}>
                Review Order →
              </button>
            </Section>
          )}

          {/* Step 3: Confirm */}
          {step >= 3 && (
            <Section title="Review & Place Order" subtitle="Everything look good?" icon="✅">
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
                <Row label="Delivery" value={selectedDelivery?.label || ""} />
                <Row label="Payment" value={PAYMENT_METHODS.find(p => p.id === payMethod)?.label || ""} />
                {payMethod !== "card" && momoNumber && <Row label="Number" value={momoNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")} />}
              </div>

              {error && (
                <div style={{ background: "#FCEBEB", border: "0.5px solid #F09595", borderRadius: 10, padding: "10px 14px", marginBottom: "1rem", fontSize: 13, color: "#A32D2D" }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={handlePlaceOrder} disabled={loading} style={{
                width: "100%",
                marginTop: "1rem",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#ccc" : "#E8603C",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: 0.3,
              }}>
                {loading ? "Processing..." : `Place Order · ${fmt(total)}`}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 10 }}>
                🔒 Secured by Paystack · 256-bit encryption
              </p>
            </Section>
          )}
        </div>

        {/* RIGHT: Order Summary - Responsive */}
        <div style={{ 
          position: isMobile ? "static" : "sticky", 
          top: 20,
          width: isMobile ? "100%" : "360px",
          flexShrink: 0
        }}>
          <div style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)" }}>Order Summary</p>
            </div>
            <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
              <Row label={`Subtotal (${cart.reduce((s, i) => s + i.qty, 0)} items)`} value={fmt(subtotal)} />
              <Row label="Delivery" value={deliveryFee === 0 ? "Free 🎉" : fmt(deliveryFee)} valueColor={deliveryFee === 0 ? "#2D6A4F" : undefined} />
              {discount > 0 && <Row label="Friend discount" value={`–${fmt(discount)}`} valueColor="#2D6A4F" />}
              <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10, marginTop: 4 }}>
                <Row label="Total" value={fmt(total)} bold />
              </div>
            </div>

            {/* Social Proof */}
            <div style={{ margin: "0 1.25rem 1.25rem", background: "#FFF8F5", border: "0.5px solid #FDDDD5", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#E8603C" }}>👥 Social Activity</p>
              <p style={{ margin: 0, fontSize: 12, color: "#9E4A2A" }}>3 friends from your network shopped these items this week</p>
            </div>

            {subtotal < 200 && (
              <div style={{ margin: "0 1.25rem 1.25rem", background: "var(--color-background-secondary)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: "0.5rem" }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Spend {fmt(200 - subtotal)} more for a discount</span>
                </div>
                <div style={{ height: 6, background: "var(--color-background-tertiary)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((subtotal / 200) * 100, 100)}%`, background: "#E8603C", borderRadius: 999, transition: "width 0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
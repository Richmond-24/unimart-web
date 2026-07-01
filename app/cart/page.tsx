
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../lib/apiClient";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const unifyBackendItems = (backend: any) => {
    if (!backend) return [];
    const src = Array.isArray(backend.items) ? backend.items : [];
    return src.map((it: any) => ({
      id: it.product?._id || it.product?.id || (it.product && it.product.toString && it.product.toString()) || it._id,
      title: it.product?.title || it.title || "Item",
      price: it.product?.price ?? it.price ?? 0,
      qty: it.quantity ?? it.qty ?? 1,
      image: (it.product?.images && it.product.images[0]) || it.product?.image || it.image || null,
    }));
  };

  const load = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && localStorage.getItem("unimart:token")) {
        try {
          const res = await apiFetch("/cart");
          if (res && res.success && res.data) {
            setItems(unifyBackendItems(res.data));
            setLoading(false);
            return;
          }
        } catch (e) {}
      }
      try {
        const raw = localStorage.getItem("unimart:cart");
        const cur = raw ? JSON.parse(raw) : [];
        if (Array.isArray(cur)) {
          setItems(cur.map((c: any) => ({ id: c.id, title: c.title, price: c.price || 0, qty: c.qty || 1, image: c.image || null })));
        } else setItems([]);
      } catch (e) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onCustom = () => load();
    window.addEventListener("unimart:cartUpdated", onCustom as EventListener);
    window.addEventListener("storage", (e) => { if (e.key === "unimart:cart") load(); });
    return () => { window.removeEventListener("unimart:cartUpdated", onCustom as EventListener); };
  }, []);

  const updateQty = async (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    try {
      if (localStorage.getItem("unimart:token")) {
        await apiFetch("/cart/update", { method: "PUT", body: JSON.stringify({ productId: id, quantity: qty }) });
        try { window.dispatchEvent(new Event("unimart:cartUpdated")); } catch (e) {}
        await load();
        return;
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem("unimart:cart");
      const cur = raw ? JSON.parse(raw) : [];
      const idx = cur.findIndex((c: any) => c.id === id);
      if (idx >= 0) {
        cur[idx].qty = qty;
        localStorage.setItem("unimart:cart", JSON.stringify(cur));
        try { window.dispatchEvent(new Event("unimart:cartUpdated")); } catch (e) {}
        setItems(cur.map((c: any) => ({ id: c.id, title: c.title, price: c.price || 0, qty: c.qty || 1, image: c.image || null })));
      }
    } catch (e) {}
  };

  const removeItem = async (id: string) => {
    try {
      if (localStorage.getItem("unimart:token")) {
        await apiFetch(`/cart/${id}`, { method: "DELETE" });
        try { window.dispatchEvent(new Event("unimart:cartUpdated")); } catch (e) {}
        await load();
        return;
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem("unimart:cart");
      const cur = raw ? JSON.parse(raw) : [];
      const next = cur.filter((c: any) => c.id !== id);
      localStorage.setItem("unimart:cart", JSON.stringify(next));
      try { window.dispatchEvent(new Event("unimart:cartUpdated")); } catch (e) {}
      setItems(next.map((c: any) => ({ id: c.id, title: c.title, price: c.price || 0, qty: c.qty || 1, image: c.image || null })));
    } catch (e) {}
  };

  const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
  const itemCount = items.reduce((s, it) => s + Number(it.qty || 1), 0);

  /* ── Skeleton loader ── */
  if (loading) {
    return (
      <div className="cart-root">
        <style>{styles}</style>
        <div className="cart-container">
          <div className="cart-header-row">
            <div className="skeleton" style={{ width: 160, height: 28, borderRadius: 6 }} />
          </div>
          <div className="cart-layout">
            <div className="cart-items-col">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cart-item skeleton-item">
                  <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ width: "60%", height: 16, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: "30%", height: 14, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary-col">
              <div className="skeleton" style={{ width: "100%", height: 200, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="cart-root">
        <style>{styles}</style>
        <div className="cart-container">
          <div className="cart-header-row">
            <h1 className="cart-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Your cart
            </h1>
          </div>
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="empty-desc">Looks like you haven't added anything yet. Browse the store and find something you love.</p>
            <button className="btn-primary" onClick={() => router.push("/")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main cart ── */
  return (
    <div className="cart-root">
      <style>{styles}</style>
      <div className="cart-container">

        {/* Header */}
        <div className="cart-header-row">
          <h1 className="cart-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            Your cart
          </h1>
          <span className="item-badge">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        </div>

        <div className="cart-layout">

          {/* Items column */}
          <div className="cart-items-col">
            <div className="items-card">
              {items.map((it, idx) => (
                <div key={it.id} className={`cart-item${idx < items.length - 1 ? " with-divider" : ""}`}>
                  {/* Image */}
                  <div className="item-img-wrap">
                    <img
                      src={it.image || "/placeholder.png"}
                      alt={it.title}
                      className="item-img"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="item-info">
                    <p className="item-title">{it.title}</p>
                    <p className="item-unit-price">GHS {Number(it.price).toFixed(2)} / unit</p>
                  </div>

                  {/* Qty stepper */}
                  <div className="qty-stepper">
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(it.id, (it.qty || 1) - 1)}
                      aria-label="Decrease quantity"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>
                    </button>
                    <span className="qty-value">{it.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                      aria-label="Increase quantity"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>

                  {/* Line total + remove */}
                  <div className="item-total-col">
                    <span className="item-line-total">GHS {(Number(it.price) * Number(it.qty)).toFixed(2)}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(it.id)}
                      aria-label={`Remove ${it.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue shopping */}
            <button className="btn-ghost" onClick={() => router.push("/")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Continue shopping
            </button>
          </div>

          {/* Summary column */}
          <div className="cart-summary-col">
            <div className="summary-card">
              <h2 className="summary-title">Order summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-label">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                  <span className="summary-value">GHS {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Shipping</span>
                  <span className="summary-value summary-muted">Calculated at checkout</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-value">GHS {subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout is disabled — removed per request */}
              <button className="btn-primary btn-full" disabled title="Checkout disabled">
                Checkout disabled
              </button>

              {/* Trust badges */}
              <div className="trust-row">
                <div className="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Secure checkout
                </div>
                <div className="trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Free local delivery
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Styles — scoped via .cart-root
───────────────────────────────────────────── */
const styles = `
  .cart-root {
    --brand: #0d9488;
    --brand-dark: #0f766e;
    --brand-light: #ccfbf1;
    --brand-xlight: #f0fdfa;
    font-family: 'DM Sans', 'Outfit', ui-sans-serif, system-ui, sans-serif;
  }

  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .cart-root * { box-sizing: border-box; }

  .cart-container {
    min-height: 100vh;
    background: #f8fafb;
    padding: 7rem 1.5rem 4rem;
  }

  /* ── Header ── */
  .cart-header-row {
    max-width: 1080px;
    margin: 0 auto 2rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cart-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    letter-spacing: -0.02em;
  }
  .cart-title svg { color: var(--brand); }

  .item-badge {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--brand-dark);
    background: var(--brand-light);
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.01em;
  }

  /* ── Layout ── */
  .cart-layout {
    max-width: 1080px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 860px) {
    .cart-layout { grid-template-columns: 1fr; }
    .cart-summary-col { order: -1; }
  }

  /* ── Items card ── */
  .items-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8edf2;
    overflow: hidden;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 80px 1fr auto auto;
    gap: 16px;
    align-items: center;
    padding: 20px 24px;
  }

  .cart-item.with-divider {
    border-bottom: 1px solid #f1f5f9;
  }

  @media (max-width: 600px) {
    .cart-item {
      grid-template-columns: 64px 1fr;
      grid-template-rows: auto auto;
      gap: 12px;
      padding: 16px;
    }
    .qty-stepper { grid-column: 2; }
    .item-total-col { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; }
  }

  /* Image */
  .item-img-wrap {
    width: 80px;
    height: 80px;
    border-radius: 10px;
    overflow: hidden;
    background: #f8f9fa;
    flex-shrink: 0;
    border: 1px solid #f1f5f9;
  }
  .item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Info */
  .item-info { min-width: 0; }
  .item-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: #0f172a;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-unit-price {
    font-size: 0.82rem;
    color: #64748b;
    margin: 0;
  }

  /* Qty stepper */
  .qty-stepper {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    height: 36px;
  }
  .qty-btn {
    width: 34px;
    height: 34px;
    background: #f8fafc;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #475569;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .qty-btn:hover { background: var(--brand-xlight); color: var(--brand); }
  .qty-btn:active { background: var(--brand-light); }
  .qty-value {
    width: 40px;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 500;
    color: #0f172a;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Line total */
  .item-total-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    min-width: 110px;
  }
  .item-line-total {
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
  }
  .remove-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.78rem;
    color: #94a3b8;
    padding: 0;
    transition: color 0.15s;
    font-family: inherit;
  }
  .remove-btn:hover { color: #ef4444; }

  /* Ghost button */
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 14px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    padding: 6px 2px;
    font-family: inherit;
    transition: color 0.15s;
  }
  .btn-ghost:hover { color: var(--brand); }

  /* ── Summary card ── */
  .summary-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8edf2;
    padding: 24px;
  }

  .summary-title {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 20px;
    letter-spacing: -0.01em;
  }

  .summary-rows { display: flex; flex-direction: column; gap: 12px; }
  .summary-row { display: flex; justify-content: space-between; align-items: center; }
  .summary-label { font-size: 0.875rem; color: #64748b; }
  .summary-value { font-size: 0.875rem; font-weight: 500; color: #0f172a; }
  .summary-muted { color: #94a3b8 !important; font-weight: 400 !important; }

  .summary-divider { height: 1px; background: #f1f5f9; margin: 18px 0; }

  .summary-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .summary-total-label { font-size: 1rem; font-weight: 600; color: #0f172a; }
  .summary-total-value { font-size: 1.25rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }

  /* Primary button */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--brand);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 13px 20px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: -0.01em;
    transition: background 0.18s, transform 0.1s;
  }
  .btn-primary:hover { background: var(--brand-dark); }
  .btn-primary:active { transform: scale(0.985); }
  .btn-full { width: 100%; }

  /* Trust row */
  .trust-row {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    justify-content: center;
  }
  .trust-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
    color: #94a3b8;
  }
  .trust-item svg { color: var(--brand); opacity: 0.7; flex-shrink: 0; }

  /* ── Empty state ── */
  .empty-state {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e8edf2;
    padding: 60px 24px;
    text-align: center;
    max-width: 1080px;
    margin: 0 auto;
  }
  .empty-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--brand-xlight);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: var(--brand);
  }
  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 8px;
  }
  .empty-desc {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 auto 28px;
    max-width: 360px;
    line-height: 1.6;
  }

  /* ── Skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    display: block;
  }
  .skeleton-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
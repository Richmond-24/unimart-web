"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */
type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; message: string; type: ToastType; }

/* ─── SVG Icons ─── */
const IconStore = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7h20M2 7l2-4h16l2 4M2 7v13a1 1 0 001 1h18a1 1 0 001-1V7" />
    <path d="M9 11v5M15 11v5" />
  </svg>
);
const IconBag = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconSend = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconX = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconPhone = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z" />
  </svg>
);
const IconCheck = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowRight = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconHeadset = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6" />
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);
const IconHome = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-8H9v8H5a2 2 0 0 1-2-2z" />
  </svg>
);
const IconZap = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconUsers = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconShield = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconGlobe = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
const IconHeart = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconTag = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

/* ─── Toast ─── */
function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const add = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function Toast({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, width: "calc(100% - 32px)", maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "success" ? "#0d9488" : t.type === "error" ? "#dc2626" : "#0f172a",
          color: "#fff", padding: "12px 18px", borderRadius: 14, display: "flex", alignItems: "center",
          gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}>
          {t.type === "success" && <IconCheck size={15} color="#fff" />}
          {t.type === "error" && <IconX size={15} color="#fff" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: "#fff", borderRadius: 18, padding: "20px 18px",
      border: `1.5px solid ${hovered ? accent + "44" : "#e2e8f0"}`,
      boxShadow: hovered ? `0 8px 28px ${accent}18` : "0 2px 6px rgba(0,0,0,0.04)",
      transition: "all 0.22s ease", transform: hovered ? "translateY(-2px)" : "none",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        {icon}
      </div>
      <h4 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#0f172a", fontFamily: "inherit" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function JoinPage() {
  const router = useRouter();
  const { toasts, add: toast, remove } = useToast();

  const handleSellerClick = () => {
    try {
      router.push('/seller/dashboard');
    } catch {
      window.location.href = '/seller/dashboard';
    }
  };

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; background: #f8fafc; }

        .join-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); cursor: pointer; }
        .join-btn:hover { transform: translateY(-2px); }
        .join-btn:active { transform: scale(0.97); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { opacity: 0; animation: fadeUp 0.5s ease forwards; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.15s; }
        .d3 { animation-delay: 0.25s; }
        .d4 { animation-delay: 0.35s; }
        .d5 { animation-delay: 0.45s; }

        /* ── Fixed home bar ── */
        .home-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid #e2e8f0;
          padding: 0 16px;
          height: 52px;
          display: flex;
          align-items: center;
        }
        .home-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 7px 12px;
          border-radius: 10px;
          font-family: inherit;
          font-weight: 600;
          font-size: 14px;
          color: #0f172a;
          transition: background 0.18s;
        }
        .home-btn:hover { background: #f1f5f9; }

        /* ── Responsive CTA grid ── */
        .cta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .cta-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── About grid ── */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .about-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Feature grid ── */
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .feature-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ── Support banner ── */
        .support-inner {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .support-inner {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        .support-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>

        {/* ── Fixed Home Bar (just the button, nothing else) ── */}
        <div className="home-bar">
          <button className="home-btn" onClick={() => router.push("/")}>
            <IconHome size={17} color="#0d9488" />
            Home
          </button>
        </div>

        {/* ── Content (padded below fixed bar) ── */}
        <main style={{ maxWidth: 1060, margin: "0 auto", padding: "72px 16px 80px" }}>

          {/* Page Header */}
          <div className="fade-up d1" style={{ marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#ccfbf1", color: "#0f766e", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 18 }}>
              <IconHeart size={12} color="#0f766e" />
              Fair Prices · Real Products · No Scams
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(1.75rem, 6vw, 3rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.15, fontFamily: "inherit" }}>
              Sell smarter.<br />Buy cheaper.
            </h1>
            <p style={{ margin: 0, fontSize: "clamp(13px, 3.5vw, 16px)", color: "#475569", lineHeight: 1.75, maxWidth: 600 }}>
              Uni-Mart is a marketplace built on trust and transparency. Whether you're a seller looking for honest customers or a buyer hunting for the best deals — every price is real and every product is exactly what you expect.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="cta-grid fade-up d2" style={{ marginBottom: 48 }}>

            {/* Seller */}
            <div style={{ background: "linear-gradient(145deg,#0f766e,#0d9488)", borderRadius: 24, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -30, bottom: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <IconStore size={23} color="#fff" />
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "clamp(20px, 5vw, 24px)", fontWeight: 800, color: "#fff", fontFamily: "inherit", letterSpacing: "-0.01em" }}>I'm a Seller</h2>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 }}>
                  List your products and reach buyers who value honest prices and quality goods. No hidden fees, no fake reviews.
                </p>
                <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Easy product listing with AI help", "Reach price-conscious buyers", "No price manipulation or fake bids", "Secure payments & fraud protection"].map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                      <span style={{ width: 19, height: 19, borderRadius: 6, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <IconCheck size={11} color="#fff" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="join-btn" onClick={handleSellerClick}
                  style={{ width: "100%", background: "#fff", color: "#0f766e", border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit" }}>
                  Start Selling Today <IconArrowRight size={16} color="#0f766e" />
                </button>
              </div>
            </div>

            {/* Buyer */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "28px 24px", border: "1.5px solid #e2e8f0" }}>
              <div style={{ width: 50, height: 50, borderRadius: 15, background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <IconBag size={23} color="#0d9488" />
              </div>
              <h2 style={{ margin: "0 0 8px", fontSize: "clamp(20px, 5vw, 24px)", fontWeight: 800, color: "#0f172a", fontFamily: "inherit", letterSpacing: "-0.01em" }}>I'm a Buyer</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                Find the best deals on authentic products. We verify sellers, track prices, and flag unfair hikes — so you always pay what's fair.
              </p>
              <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {["Compare prices across trusted sellers", "No hidden fees or surprise charges", "Scam-free guarantee on every purchase", "Real reviews from real buyers"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155", fontWeight: 500 }}>
                    <span style={{ width: 19, height: 19, borderRadius: 6, background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <IconCheck size={11} color="#0d9488" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="join-btn" onClick={() => { toast("Redirecting to Sign-Up…", "success"); router.push("/auth"); }}
                style={{ width: "100%", background: "#0d9488", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit" }}>
                Start Shopping <IconArrowRight size={16} color="#fff" />
              </button>
            </div>
          </div>

          {/* About */}
          <div className="fade-up d3" style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 4, height: 24, borderRadius: 4, background: "#0d9488" }} />
              <h2 style={{ margin: 0, fontSize: "clamp(17px, 4vw, 21px)", fontWeight: 800, color: "#0f172a", fontFamily: "inherit", letterSpacing: "-0.01em" }}>What makes Uni-Mart different?</h2>
            </div>
            <div className="about-grid">
              <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", border: "1.5px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.85 }}>
                  <strong style={{ color: "#0f172a" }}>Most marketplaces look away when prices inflate.</strong> We don't. Uni-Mart monitors price changes, flags suspicious hikes, and ensures no bait-and-switch or fake discounts.
                </p>
              </div>
              <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", border: "1.5px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.85 }}>
                  For sellers, a transparent, low-fee platform where your reputation is built on quality and fair pricing. <strong style={{ color: "#0f172a" }}>Honest sellers win here.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="fade-up d4" style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 4, height: 24, borderRadius: 4, background: "#0d9488" }} />
              <h2 style={{ margin: 0, fontSize: "clamp(17px, 4vw, 21px)", fontWeight: 800, color: "#0f172a", fontFamily: "inherit", letterSpacing: "-0.01em" }}>Why choose Uni-Mart?</h2>
            </div>
            <div className="feature-grid">
              <FeatureCard icon={<IconTag size={20} color="#0d9488" />} title="Fair Price Guarantee" desc="We track price history and flag unfair increases so you never overpay." accent="#0d9488" />
              <FeatureCard icon={<IconShield size={20} color="#6366f1" />} title="Scam-Free Promise" desc="Every seller is verified. Every transaction is protected by our buyer guarantee." accent="#6366f1" />
              <FeatureCard icon={<IconUsers size={20} color="#f59e0b" />} title="Real Reviews" desc="No fake ratings. Only genuine feedback from real buyers and sellers." accent="#f59e0b" />
              <FeatureCard icon={<IconZap size={20} color="#10b981" />} title="AI-Powered Help" desc="Smart listings, price suggestions, and scam detection built in." accent="#10b981" />
              <FeatureCard icon={<IconGlobe size={20} color="#0ea5e9" />} title="Pan-African Reach" desc="Starting in Ghana, expanding across Nigeria, Kenya, and all of Africa." accent="#0ea5e9" />
              <FeatureCard icon={<IconHeart size={20} color="#ec4899" />} title="Community Trust" desc="Built by and for people who are tired of getting cheated online." accent="#ec4899" />
            </div>
          </div>

          {/* Support Banner */}
          <div className="fade-up d5" style={{ background: "#0f172a", borderRadius: 22, padding: "28px 24px" }}>
            <div className="support-inner">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(13,148,136,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconHeadset size={18} color="#2dd4bf" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "clamp(16px, 4vw, 19px)", fontWeight: 800, color: "#fff", fontFamily: "inherit" }}>Need help? We're here.</h3>
                </div>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                  Support available 7 days a week — help with listings, purchases, or reporting a scam.
                </p>
              </div>
              <div className="support-btns">
                <a href="tel:+233123456789" style={{ textDecoration: "none" }}>
                  <button className="join-btn" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 13, padding: "12px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    <IconPhone size={14} color="#2dd4bf" /> Call Us
                  </button>
                </a>
                <a href="https://wa.me/233123456789" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <button className="join-btn" style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 13, padding: "12px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    WhatsApp
                  </button>
                </a>
              </div>
            </div>
          </div>

        </main>

        <Toast toasts={toasts} remove={remove} />
      </div>
    </>
  );
}
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─── Types ─── */
type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; message: string; type: ToastType; }

/* ─── SVG Icons ─── */
const IconStore = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h20M2 7l2-4h16l2 4M2 7v13a1 1 0 001 1h18a1 1 0 001-1V7" /><path d="M9 11v5M15 11v5" /></svg>
);
const IconBag = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
);
const IconCheck = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArrowRight = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const IconHeadset = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>
);
const IconPhone = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z" /></svg>
);
const IconTag = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
);
const IconShield = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconUsers = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
);
const IconZap = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const IconGlobe = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
);
const IconHeart = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);

/* ─── Social Icons ─── */
const IconTwitter = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const IconInstagram = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const IconFacebook = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const IconTikTok = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
);

/* ─── Hooks ─── */
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

// Hook for scroll animations
function useOnScreen(ref: React.RefObject<HTMLElement>, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin, threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

/* ─── Components ─── */
function Toast({ toasts, remove }: { toasts: ToastItem[]; remove: (id: number) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, width: "calc(100% - 32px)", maxWidth: 360, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "success" ? "#0d9488" : t.type === "error" ? "#dc2626" : "#0f172a",
          color: "#fff", padding: "12px 18px", borderRadius: 14, display: "flex", alignItems: "center",
          gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          animation: "fadeUp 0.3s ease forwards", pointerEvents: "auto"
        }}>
          {t.type === "success" && <IconCheck size={15} color="#fff" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function AnimatedSection({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref, "-50px");
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)} 
      style={{
        background: "#fff", borderRadius: 18, padding: "24px 20px",
        border: `1.5px solid ${hovered ? accent + "44" : "#e2e8f0"}`,
        boxShadow: hovered ? `0 12px 32px ${accent}15` : "0 2px 6px rgba(0,0,0,0.02)",
        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)", 
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        cursor: "default"
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: accent + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transition: "transform 0.3s ease", transform: hovered ? "rotate(10deg) scale(1.1)" : "none" }}>
        {icon}
      </div>
      <h4 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{desc}</p>
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
        html, body { margin: 0; padding: 0; overflow-x: hidden; background: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        .btn-primary {
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
        .btn-primary:active {
          transform: scale(0.98);
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px" }}>

          {/* Header / Logo Area */}
          <AnimatedSection className="text-center mb-16">
             <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", padding: "8px 20px", borderRadius: 50, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: 24 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #0d9488, #0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>K</span>
                </div>
                   <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, letterSpacing: "-0.01em" }}>Koombo App</span>
             </div>
             
             <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
               The Future of <span style={{ color: "#0d9488" }}>Social Commerce</span>
             </h1>
             <p style={{ color: "#64748b", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
               Connect, shop, and sell with confidence. Koombo brings people and products together in a transparent, community-driven marketplace.
             </p>
             
             <div style={{ marginTop: 32, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => router.push("/")}
                  style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Start Shopping <IconArrowRight size={18} />
                </button>
                <button className="btn-primary" onClick={handleSellerClick}
                  style={{ background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 28px", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Become a Seller
                </button>
             </div>
          </AnimatedSection>

          {/* Value Props Grid */}
          <AnimatedSection delay={200} style={{ marginBottom: 64 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              
              {/* Seller Side */}
              <div style={{ background: "linear-gradient(145deg,#0f766e,#0d9488)", borderRadius: 24, padding: "32px", color: "white", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                <div style={{ marginBottom: 20 }}>
                  <IconStore size={32} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>For Sellers</h3>
                <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 24 }}>
                  Grow your business with zero hidden fees. Our AI tools help you list faster and reach buyers who value quality.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Smart AI Listing Assistant", "Verified Buyer Network", "Instant Payouts"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500 }}>
                      <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: 4 }}><IconCheck size={12} /></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buyer Side */}
              <div style={{ background: "#fff", borderRadius: 24, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <div style={{ marginBottom: 20 }}>
                  <IconBag size={32} color="#0d9488" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "#0f172a" }}>For Buyers</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
                  Shop safely with our Price Guard technology. We flag unfair price hikes and ensure you get the best deal.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Price History Tracking", "Scam-Free Guarantee", "Community Reviews"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#334155" }}>
                      <div style={{ background: "#ccfbf1", borderRadius: 6, padding: 4 }}><IconCheck size={12} color="#0d9488" /></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </AnimatedSection>

          {/* Features Grid */}
          <AnimatedSection delay={400} style={{ marginBottom: 64 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Why Koombo?</h2>
              <p style={{ color: "#64748b" }}>Built for trust, designed for growth.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              <FeatureCard icon={<IconTag size={22} color="#0d9488" />} title="Fair Price Guarantee" desc="We monitor market trends to ensure you never overpay for products." accent="#0d9488" />
              <FeatureCard icon={<IconShield size={22} color="#6366f1" />} title="Secure Transactions" desc="End-to-end encryption and buyer protection on every single order." accent="#6366f1" />
              <FeatureCard icon={<IconUsers size={22} color="#f59e0b" />} title="Community First" desc="Real reviews from real people. No bots, no fake ratings." accent="#f59e0b" />
              <FeatureCard icon={<IconZap size={22} color="#10b981" />} title="AI-Powered" desc="Smart recommendations and automated fraud detection keep you safe." accent="#10b981" />
              <FeatureCard icon={<IconGlobe size={22} color="#0ea5e9" />} title="Pan-African" desc="Connecting markets across Ghana, Nigeria, Kenya and beyond." accent="#0ea5e9" />
              <FeatureCard icon={<IconHeart size={22} color="#ec4899" />} title="Social Shopping" desc="Share finds with friends and discover what's trending in your circle." accent="#ec4899" />
            </div>
          </AnimatedSection>

          {/* Support & Social Footer */}
          <AnimatedSection delay={600}>
            <div style={{ 
              background: "#0f172a", 
              borderRadius: 24, 
              padding: "40px 32px", 
              color: "white", 
              display: "flex", 
              flexDirection: "column", 
              gap: 40, 
              alignItems: "center", 
              justifyContent: "space-between"
            }} className="md:flex-row">
              
              {/* Support Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "rgba(13,148,136,0.2)", padding: 10, borderRadius: 12 }}>
                    <IconHeadset size={24} color="#2dd4bf" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>We're here to help</h3>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, maxWidth: 400 }}>
                  Have questions about a listing or need help with your account? Our support team is available 7 days a week.
                </p>
                
                <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  <a href="tel:+233123456789" style={{ textDecoration: "none" }}>
                    <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <IconPhone size={14} /> Call Support
                    </button>
                  </a>
                  <a href="https://wa.me/233123456789" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ background: "#25D366", border: "none", color: "white", padding: "10px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                      WhatsApp
                    </button>
                  </a>
                </div>
              </div>

              {/* Divider for mobile */}
              <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.1)" }} className="md:hidden" />

              {/* Social Links */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Follow Us</p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                  {[
                    { icon: <IconTwitter size={20} />, label: "Twitter", href: "#" },
                    { icon: <IconInstagram size={20} />, label: "Instagram", href: "#" },
                    { icon: <IconFacebook size={20} />, label: "Facebook", href: "#" },
                    { icon: <IconTikTok size={20} />, label: "TikTok", href: "#" },
                  ].map((social, i) => (
                    <Link key={i} href={social.href} style={{ 
                      background: "rgba(255,255,255,0.05)", 
                      width: 44, height: 44, 
                      borderRadius: 12, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#94a3b8",
                      transition: "all 0.2s",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0d9488";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
                <p style={{ marginTop: 24, fontSize: 12, color: "#475569" }}>© 2026 Koombo Inc. All rights reserved.</p>
              </div>

            </div>
          </AnimatedSection>

        </main>

        <Toast toasts={toasts} remove={remove} />
      </div>
    </>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight, Zap, BadgePercent, Rocket, Crown, Flame, ShoppingBag, } from "lucide-react";

interface CatItem { src: string; label: string; discount: string; from: string; accent: string; }
interface Feature { icon: React.ElementType; title: string; desc: string; }

const CATEGORIES: CatItem[] = [
  { src: "/tech.jpg",      label: "Gadgets",    discount: "40%", from: "GH₵ 499",  accent: "#0d9488" },
  { src: "/home.jpg",      label: "Stationery", discount: "35%", from: "GH₵ 29",   accent: "#0891b2" },
  { src: "/groceries.jpg", label: "Essentials", discount: "50%", from: "GH₵ 59",   accent: "#14b8a6" },
  { src: "/books.jpg",     label: "Textbooks",  discount: "45%", from: "GH₵ 149",  accent: "#06b6d4" },
];

const FEATURES: Feature[] = [
  { icon: Rocket,        title: "Free Delivery",   desc: "Orders above GH₵ 300" },
  { icon: BadgePercent,  title: "Student ID +10%", desc: "Verify & save more"   },
  { icon: Crown,         title: "24/7 Support",    desc: "Student helpline"      },
];

const pad = (n: number): string => String(n).padStart(2, "0");

export default function BigBanner() {
  const [timeLeft, setTimeLeft] = useState<number>(8 * 3600 + 42 * 60 + 17);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const TOTAL = 8 * 3600 + 42 * 60 + 17;

  return (
    <section style={{
      padding: "clamp(1rem, 4vw, 2.5rem) clamp(0.75rem, 3vw, 1.25rem)",
      background: "linear-gradient(145deg,#e0fdf4 0%,#ccfbf1 40%,#cffafe 70%,#dbeafe 100%)",
      fontFamily: "'DM Sans','Outfit',system-ui,sans-serif",
      width: "100%",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800&family=Space+Grotesk:wght@700;800&display=swap');

        .bb-card {
          position: relative;
          overflow: hidden;
          border-radius: clamp(1.25rem, 4vw, 2rem);
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          background: linear-gradient(135deg,#0f766e 0%,#0e7490 55%,#0891b2 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,.14) inset, 0 30px 80px rgba(8,145,178,.38), 0 8px 28px rgba(15,118,110,.3);
        }
        .bb-bgimg {
          position: absolute;
          border-radius: 20px;
          overflow: hidden;
          pointer-events: none;
          box-shadow: 0 8px 32px rgba(0,0,0,.22);
        }
        .bb-bgimg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .bb-bgimg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,rgba(15,118,110,.72) 0%,rgba(8,145,178,.65) 100%);
          border-radius: inherit;
        }
        .bb-body {
          position: relative;
          z-index: 10;
          padding: clamp(1.25rem, 5vw, 3.25rem);
        }
        .bb-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.14);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 100px;
          padding: clamp(0.375rem, 2vw, 0.5rem) clamp(0.875rem, 3vw, 1.125rem);
          font-size: clamp(0.625rem, 2vw, 0.75rem);
          font-weight: 700;
          letter-spacing: .07em;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
        }
        @media (max-width: 480px) {
          .bb-badge { white-space: normal; font-size: 0.625rem; }
        }
        .bb-pulse {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #34d399;
          flex-shrink: 0;
        }
        .bb-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          line-height: 1.05;
          font-size: clamp(1.75rem, 6.5vw, 4.5rem);
          letter-spacing: -.025em;
          color: #fff;
          margin: 0;
        }
        .bb-accent {
          background: linear-gradient(90deg,#fde68a,#fbbf24,#f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
          gap: clamp(0.75rem, 2vw, 1rem);
        }
        @media (max-width: 480px) {
          .bb-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
        .bb-cat {
          border-radius: clamp(1rem, 3vw, 1.25rem);
          overflow: hidden;
          cursor: pointer;
          position: relative;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          backdrop-filter: blur(16px);
          transition: transform .28s ease, background .28s ease, border-color .28s ease, box-shadow .28s ease;
        }
        .bb-cat:hover {
          transform: translateY(-7px) scale(1.025);
          background: rgba(255,255,255,.2);
          border-color: rgba(255,255,255,.45);
          box-shadow: 0 16px 36px rgba(0,0,0,.18);
        }
        .bb-cat-img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          display: block;
        }
        .bb-cat-img-wrap {
          position: relative;
          overflow: hidden;
          height: 100px;
        }
        .bb-cat-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,transparent 40%,rgba(0,0,0,.45) 100%);
        }
        .bb-cat-body {
          padding: clamp(0.625rem, 2vw, 0.875rem);
        }
        .bb-cat-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
          color: #fff;
        }
        .bb-cat-row {
          display: flex;
          align-items: baseline;
          gap: 5px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .bb-cat-pct {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          font-weight: 800;
          color: #fbbf24;
        }
        .bb-cat-off {
          font-size: 0.625rem;
          font-weight: 700;
          color: rgba(255,255,255,.5);
          letter-spacing: .06em;
        }
        .bb-cat-from {
          font-size: 0.6875rem;
          color: rgba(255,255,255,.6);
          margin-top: 2px;
        }
        .bb-feat {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 100px;
          padding: clamp(0.5rem, 2vw, 0.625rem) clamp(0.875rem, 3vw, 1.125rem);
          transition: background .2s, transform .2s;
        }
        .bb-feat:hover {
          background: rgba(255,255,255,.22);
          transform: scale(1.03);
        }
        .bb-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg,#fbbf24,#f97316);
          color: #1c1917;
          font-weight: 800;
          font-size: clamp(0.8125rem, 2.5vw, 0.9375rem);
          font-family: 'Space Grotesk', sans-serif;
          padding: clamp(0.75rem, 2vw, 0.875rem) clamp(1.25rem, 4vw, 1.875rem);
          border-radius: 100px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(251,191,36,.42), 0 0 0 1px rgba(255,255,255,.2) inset;
          transition: transform .22s, box-shadow .22s;
          letter-spacing: -.01em;
        }
        .bb-primary:hover {
          transform: scale(1.055) translateY(-2px);
          box-shadow: 0 16px 40px rgba(251,191,36,.55), 0 0 0 1px rgba(255,255,255,.3) inset;
        }
        .bb-primary:active {
          transform: scale(.97);
        }
        .bb-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.12);
          backdrop-filter: blur(12px);
          color: #fff;
          font-weight: 600;
          font-size: clamp(0.75rem, 2vw, 0.875rem);
          padding: clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.5rem);
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,.3);
          cursor: pointer;
          transition: background .2s, transform .2s;
        }
        .bb-secondary:hover {
          background: rgba(255,255,255,.22);
          transform: scale(1.03);
        }
        .bb-countdown {
          position: relative;
          z-index: 10;
          background: rgba(0,0,0,.2);
          backdrop-filter: blur(14px);
          border-top: 1px solid rgba(255,255,255,.12);
          padding: clamp(0.625rem, 2vw, 0.875rem) clamp(0.875rem, 4vw, 1.75rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        @media (max-width: 640px) {
          .bb-countdown {
            flex-direction: column;
            text-align: center;
          }
        }
        .bb-tblock {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,.12);
          backdrop-filter: blur(8px);
          border-radius: clamp(0.75rem, 2vw, 0.875rem);
          padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
          min-width: 50px;
          border: 1px solid rgba(255,255,255,.15);
          transition: background .2s;
        }
        @media (max-width: 480px) {
          .bb-tblock {
            min-width: 45px;
            padding: 0.5rem 0.625rem;
          }
        }
        .bb-tblock:hover {
          background: rgba(255,255,255,.22);
        }
        .bb-tnum {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1rem, 3vw, 1.5rem);
          font-weight: 800;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }
        .bb-tlabel {
          font-size: 0.5625rem;
          font-weight: 700;
          color: rgba(255,255,255,.5);
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .bb-divider {
          width: 48px;
          height: 3px;
          border-radius: 4px;
          background: linear-gradient(90deg,#fbbf24,#f97316);
          margin-top: 14px;
        }
        .bb-chip {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 100px;
          padding: 0.3125rem 0.875rem;
          font-size: 0.6875rem;
          font-weight: 700;
          color: rgba(255,255,255,.8);
          letter-spacing: .05em;
          white-space: nowrap;
        }
        @media (max-width: 480px) {
          .bb-chip { white-space: normal; font-size: 0.625rem; padding: 0.25rem 0.625rem; }
        }
        .bb-save {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(251,191,36,.18);
          border: 1px solid rgba(251,191,36,.35);
          border-radius: 10px;
          padding: 0.375rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fde68a;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .bb-cat, .bb-feat, .bb-primary, .bb-secondary, .bb-tblock {
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
          }
          .bb-cat:active, .bb-feat:active, .bb-secondary:active {
            transform: scale(0.98);
          }
        }
      `}</style>

      <div className="bb-card">

        <div className="bb-body">
          <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:"clamp(1rem, 3vw, 1.5rem)" }}>
            <div className="bb-badge">
              <div className="bb-pulse" />
              <span>Live — 50k+ Students Shopping</span>
            </div>
            <div className="bb-chip">Flash Sale</div>
            <div className="bb-chip">Free Returns</div>
          </div>

          <div style={{ marginBottom:"clamp(0.75rem, 2vw, 1rem)" }}>
            <h3 className="bb-h1">
              Campus Deals<br />
              <span className="bb-accent">That Actually Save</span>
            </h3>
          </div>

          <div style={{ marginBottom:"clamp(1.25rem, 4vw, 1.75rem)" }}>
            <p style={{
              color:"rgba(255,255,255,.78)",
              fontSize:"clamp(0.8125rem, 2.5vw, 1rem)",
              maxWidth:"min(100%, 500px)",
              lineHeight:1.6,
              margin:"0 0 0.75rem",
            }}>
              Smart savings on everything you need for campus life —
              from late-night study snacks to next semester's books.
            </p>
            <div className="bb-save">
              <Zap size="clamp(0.75rem, 2vw, 0.875rem)" />
              <span>Save up to GH₵ 2,500 this week only</span>
            </div>
            <div className="bb-divider" />
          </div>

          <div className="bb-grid" style={{ marginBottom:"clamp(1.25rem, 4vw, 1.5rem)" }}>
            {CATEGORIES.map((cat) => (
              <div className="bb-cat" key={cat.label}>
                <div className="bb-cat-img-wrap">
                  <img className="bb-cat-img" src={cat.src} alt={cat.label} loading="lazy" />
                </div>
                <div className="bb-cat-body">
                  <div className="bb-cat-label">{cat.label}</div>
                  <div className="bb-cat-row">
                    <span className="bb-cat-pct">{cat.discount}</span>
                    <span className="bb-cat-off">OFF</span>
                  </div>
                  <div className="bb-cat-from">From {cat.from}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:"clamp(1.25rem, 4vw, 1.75rem)" }}>
            {FEATURES.map((f) => (
              <div className="bb-feat" key={f.title}>
                <f.icon size="clamp(0.875rem, 2vw, 1rem)" color="#fbbf24" />
                <div>
                  <p style={{ margin:0, fontSize:"clamp(0.75rem, 2vw, 0.8125rem)", fontWeight:700, color:"#fff" }}>{f.title}</p>
                  <p style={{ margin:0, fontSize:"clamp(0.625rem, 1.8vw, 0.6875rem)", color:"rgba(255,255,255,.55)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display:"flex",
            flexWrap:"wrap",
            gap:"clamp(0.75rem, 3vw, 1rem)",
            alignItems:"center",
            justifyContent: "flex-start",
          }}>
            <a
              href="#flash-deals"
              onClick={(e) => {
                try {
                  e.preventDefault();
                  const el = document.getElementById('flash-deals');
                  if (!el) return;
                  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
                  const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
                  window.scrollTo({ top, behavior: 'smooth' });
                } catch (err) {
                  // fallback to anchor navigation
                }
              }}
              className="bb-primary"
            >
              Shop the Sale
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ArrowRight size="clamp(0.875rem, 2vw, 1rem)" />
              </span>
            </a>
            <button className="bb-secondary">
              <ShoppingBag size="clamp(0.875rem, 2vw, 1rem)" />
              View All Deals
            </button>
          </div>
        </div>

        <div className="bb-countdown">
          <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", width:"100%", maxWidth:"fit-content" }}>
            <Flame size="clamp(0.875rem, 2vw, 1rem)" color="#fbbf24" />
            <span style={{ fontSize:"clamp(0.625rem, 2vw, 0.6875rem)", fontWeight:700, textTransform:"uppercase", letterSpacing:" .1em", color:"rgba(255,255,255,.6)" }}>
              Flash Sale Ends In
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"clamp(0.5rem, 2vw, 0.75rem)", justifyContent:"center" }}>
            {([{ label:"HRS", val:pad(h) },{ label:"MIN", val:pad(m) },{ label:"SEC", val:pad(s) }] as const).map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <span style={{ color:"rgba(255,255,255,.3)", fontSize:"clamp(1rem, 3vw, 1.25rem)", fontWeight:700 }}>: </span>}
                <div className="bb-tblock">
                  <span className="bb-tnum">{item.val}</span>
                  <span className="bb-tlabel">{item.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
            <Zap size="clamp(0.75rem, 2vw, 0.875rem)" color="#fbbf24" />
            <span style={{ fontSize:"clamp(0.625rem, 2vw, 0.6875rem)", color:"rgba(255,255,255,.55)" }}>Limited stock available</span>
          </div>
        </div>

        <div
          style={{
            position:"absolute",
            bottom:0,
            left:0,
            height:"clamp(0.1875rem, 0.5vw, 0.25rem)",
            width:"60%",
            background:"linear-gradient(90deg,#fbbf24,#f97316)",
            borderRadius: "0 0 0 28px",
          }}
        />
      </div>
    </section>
  );
}

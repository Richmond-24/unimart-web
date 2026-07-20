"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Each slide's inline SVG scene (renders if real image is missing) ──────────
const SlideScene = ({ index, accent }: { index: number; accent: string }) => {
  const scenes = [
    // Slide 0 — Discover: grid of product cards floating
    <svg key={0} viewBox="0 0 390 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="bg0" x1="0" y1="0" x2="390" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#0d2d5e" />
        </linearGradient>
        <linearGradient id="card0" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
      </defs>
      <rect width="390" height="420" fill="url(#bg0)" />
      {/* Glow orb */}
      <ellipse cx="195" cy="180" rx="160" ry="140" fill={accent} fillOpacity="0.12" />
      {/* Product card 1 */}
      <rect x="30" y="40" width="130" height="155" rx="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <rect x="44" y="54" width="102" height="78" rx="10" fill="rgba(255,255,255,0.06)" />
      <circle cx="95" cy="93" r="22" fill={accent} fillOpacity="0.3" />
      <path d="M85 93 L95 103 L107 85" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="44" y="145" width="70" height="7" rx="4" fill="rgba(255,255,255,0.25)" />
      <rect x="44" y="158" width="45" height="6" rx="3" fill={accent} fillOpacity="0.7" />
      <rect x="104" y="155" width="28" height="22" rx="8" fill={accent} />
      <path d="M112 166 L116 170 L122 162" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Product card 2 */}
      <rect x="175" y="25" width="130" height="155" rx="16" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <rect x="189" y="39" width="102" height="78" rx="10" fill="rgba(255,255,255,0.06)" />
      <rect x="215" y="60" width="50" height="36" rx="6" fill={accent} fillOpacity="0.25" />
      <rect x="222" y="67" width="36" height="5" rx="3" fill={accent} fillOpacity="0.6" />
      <rect x="222" y="76" width="28" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="222" y="84" width="32" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="189" y="130" width="70" height="7" rx="4" fill="rgba(255,255,255,0.25)" />
      <rect x="189" y="143" width="45" height="6" rx="3" fill={accent} fillOpacity="0.7" />
      <rect x="249" y="140" width="28" height="22" rx="8" fill={accent} />
      <path d="M257 151 L261 155 L267 147" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Product card 3 — partial bottom */}
      <rect x="60" y="215" width="130" height="155" rx="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="74" y="229" width="102" height="78" rx="10" fill="rgba(255,255,255,0.05)" />
      <circle cx="125" cy="268" r="28" fill={accent} fillOpacity="0.18" />
      <path d="M115 268 Q125 255 135 268" stroke={accent} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="74" y="320" width="70" height="7" rx="4" fill="rgba(255,255,255,0.2)" />
      {/* Floating badge */}
      <rect x="220" y="200" width="130" height="155" rx="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="234" y="214" width="102" height="78" rx="10" fill="rgba(255,255,255,0.05)" />
      <rect x="249" y="237" width="45" height="32" rx="5" fill={accent} fillOpacity="0.2" />
      <rect x="255" y="243" width="33" height="4" rx="2" fill={accent} fillOpacity="0.5" />
      <rect x="255" y="251" width="24" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="234" y="305" width="60" height="7" rx="4" fill="rgba(255,255,255,0.2)" />
      {/* Notification pill */}
      <rect x="120" y="190" width="92" height="26" rx="13" fill={accent} />
      <text x="164" y="208" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">12 new deals</text>
    </svg>,

    // Slide 1 — Connect: profile/follow UI
    <svg key={1} viewBox="0 0 390 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="390" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#041e1c" />
          <stop offset="100%" stopColor="#063832" />
        </linearGradient>
      </defs>
      <rect width="390" height="420" fill="url(#bg1)" />
      <ellipse cx="195" cy="200" rx="170" ry="150" fill={accent} fillOpacity="0.1" />
      {/* Big profile card */}
      <rect x="55" y="30" width="280" height="180" rx="20" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx="130" cy="90" r="36" fill={accent} fillOpacity="0.25" />
      <circle cx="130" cy="80" r="18" fill={accent} fillOpacity="0.5" />
      <path d="M97 122 Q130 108 163 122" fill={accent} fillOpacity="0.35" />
      <rect x="178" y="65" width="120" height="9" rx="5" fill="rgba(255,255,255,0.3)" />
      <rect x="178" y="82" width="85" height="7" rx="4" fill="rgba(255,255,255,0.15)" />
      <rect x="178" y="100" width="95" height="7" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="178" y="125" width="80" height="32" rx="10" fill={accent} />
      <text x="218" y="146" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="system-ui">+ Follow</text>
      {/* Stats row */}
      <rect x="75" y="165" width="58" height="34" rx="8" fill="rgba(255,255,255,0.05)" />
      <text x="104" y="179" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">142</text>
      <text x="104" y="192" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Items</text>
      <rect x="145" y="165" width="58" height="34" rx="8" fill="rgba(255,255,255,0.05)" />
      <text x="174" y="179" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">4.9★</text>
      <text x="174" y="192" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Rating</text>
      <rect x="215" y="165" width="58" height="34" rx="8" fill="rgba(255,255,255,0.05)" />
      <text x="244" y="179" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">2.1k</text>
      <text x="244" y="192" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">Sales</text>
      {/* Small seller cards */}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${55 + i * 110}, 240)`}>
          <rect width="100" height="118" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <circle cx="50" cy="36" r="22" fill={accent} fillOpacity={0.15 + i * 0.07} />
          <rect x="14" y="68" width="72" height="7" rx="4" fill="rgba(255,255,255,0.2)" />
          <rect x="22" y="80" width="56" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
          <rect x="20" y="95" width="60" height="18" rx="8" fill={accent} fillOpacity="0.8" />
          <text x="50" y="108" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="system-ui">Follow</text>
        </g>
      ))}
      {/* Notification */}
      <rect x="95" y="366" width="200" height="34" rx="17" fill={accent} fillOpacity="0.9" />
      <text x="195" y="388" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="system-ui">🔔 New drop from 3 sellers</text>
    </svg>,

    // Slide 2 — Sell: listing creation UI
    <svg key={2} viewBox="0 0 390 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="390" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a0f00" />
          <stop offset="100%" stopColor="#2d1a00" />
        </linearGradient>
      </defs>
      <rect width="390" height="420" fill="url(#bg2)" />
      <ellipse cx="195" cy="180" rx="180" ry="150" fill={accent} fillOpacity="0.1" />
      {/* Phone mockup listing form */}
      <rect x="60" y="20" width="270" height="380" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Image upload zone */}
      <rect x="80" y="40" width="230" height="130" rx="14" fill="rgba(255,255,255,0.05)" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx="195" cy="90" r="24" fill={accent} fillOpacity="0.2" />
      <path d="M185 90 L195 80 L205 90 M195 80 L195 102" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="195" y="148" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="system-ui">Tap to add photos</text>
      {/* Form fields */}
      <rect x="80" y="185" width="230" height="36" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="96" y="208" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="system-ui">Item title</text>
      <rect x="80" y="232" width="230" height="36" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="96" y="255" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="system-ui">Price — ₦</text>
      <rect x="80" y="279" width="230" height="36" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="96" y="302" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="system-ui">Category</text>
      {/* Publish button */}
      <rect x="80" y="330" width="230" height="50" rx="14" fill={accent} />
      <text x="195" y="361" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui">Publish Listing</text>
      {/* Success badge floating */}
      <rect x="90" y="388" width="210" height="26" rx="13" fill="rgba(34,197,94,0.9)" />
      <text x="195" y="405" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="system-ui">✓ Listed in 42 seconds!</text>
    </svg>,
  ];
  return scenes[index] ?? scenes[0];
};

const slides = [
  {
    image: "/images/tech.jpg",
    tag: "Huge Savings",
    headline: "Shop Like\nA Student\nBillionaire",
    sub: "Up to 90% off textbooks, fashion, and tech. Unbeatable prices from verified students on your campus.",
    accent: "#f97316", // Vibrant Temu Orange
  },
  {
    image: "/images/event.jpg",
    tag: "Flash Deals",
    headline: "Crazy Daily\nCampus\nMarkdowns",
    sub: "New deals drop every hour. Don't miss out on exclusive flash sales—snag the best items before they're gone!",
    accent: "#ef4444", // Bright Red
  },
  {
    image: "/images/used.jpg",
    tag: "Free Cash",
    headline: "Sell Fast,\nEarn Real\nMoney",
    sub: "List your unused items in seconds. Reach thousands of buyers and turn your closet into instant cash.",
    accent: "#8b5cf6", // Purple
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }

  .ob-root {
    position: fixed; inset: 0; z-index: 9999;
    background: linear-gradient(180deg, #ea580c 0%, #9a3412 100%);
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center;
  }

  /* Phone-shaped container on desktop, full-screen on mobile */
  .ob-phone {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(13,148,136,0.06), rgba(79,70,229,0.04));
  }
  @media (min-width: 520px) {
    .ob-phone {
      width: 390px;
      height: min(844px, 95vh);
      border-radius: 48px;
      box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07);
    }
  }

  /* HERO */
  .ob-hero {
    flex: 1; position: relative; overflow: hidden; min-height: 0;
  }

  /* Image layers */
  .ob-img-layer {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    opacity: 0;
    transform: scale(1.06);
    transition: opacity 0.65s cubic-bezier(.4,0,.2,1), transform 7s ease;
    will-change: opacity, transform;
  }
  .ob-img-layer.ob-img-active {
    opacity: 1; transform: scale(1);
  }

  /* SVG scene fallback */
  .ob-scene-layer {
    position: absolute; inset: 0;
    opacity: 0;
    transition: opacity 0.65s cubic-bezier(.4,0,.2,1);
    display: flex; align-items: stretch;
  }
  .ob-scene-layer.ob-scene-active { opacity: 1; }
  .ob-img-layer.ob-img-active + .ob-scene-layer,
  .ob-img-layer.ob-img-active ~ .ob-scene-layer { opacity: 0 !important; }

  .ob-scrim-top {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 40%, transparent 100%);
    z-index: 3; pointer-events: none;
  }
  .ob-scrim-bottom {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(6,6,12,0.4) 60%, rgba(6,6,12,0.95) 100%);
    z-index: 3; pointer-events: none;
  }

  /* Top bar */
  .ob-topbar {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 52px 22px 0;
    display: flex; align-items: center; justify-content: space-between;
    z-index: 10;
  }
  .ob-logo { display: flex; align-items: center; gap: 8px; }
  .ob-logo-text {
    font-family: 'Fraunces', serif;
    font-size: 19px; font-weight: 700; color: white; letter-spacing: -0.3px;
  }
  .ob-skip {
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.13);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px; padding: 8px 16px;
    color: white; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  .ob-skip:hover  { background: rgba(255,255,255,0.22); }
  .ob-skip:active { transform: scale(0.96); background: rgba(255,255,255,0.28); }

  /* BOTTOM SHEET */
  .ob-sheet {
    flex-shrink: 0;
    background: #0f0f17;
    border-radius: 26px 26px 0 0;
    padding: 14px 26px 32px;
    position: relative; z-index: 10;
    box-shadow: 0 -1px 0 rgba(255,255,255,0.06);
  }
  @media (min-width: 520px) {
    .ob-sheet { border-radius: 0 0 48px 48px; padding-bottom: 36px; }
  }

  .ob-handle {
    width: 36px; height: 4px; border-radius: 100px;
    background: rgba(255,255,255,0.13);
    margin: 0 auto 20px;
  }

  .ob-tag {
    display: inline-flex; align-items: center;
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 1px solid;
    border-radius: 100px; padding: 5px 12px;
    width: fit-content; margin-bottom: 12px;
    transition: color 0.4s, border-color 0.4s, background 0.4s;
  }

  .ob-headline {
    font-family: 'Fraunces', serif;
    font-size: clamp(30px, 8.5vw, 40px);
    font-weight: 900; line-height: 1.07;
    letter-spacing: -1.5px; color: #ffffff;
    margin: 0 0 10px; white-space: pre-line;
  }

  .ob-sub {
    font-size: 13.5px; line-height: 1.7;
    color: rgba(255,255,255,0.46);
    margin: 0 0 20px; max-width: 300px;
  }

  /* Animations */
  @keyframes ob-in-left  { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
  @keyframes ob-in-right { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
  @keyframes ob-out-left { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(-20px) } }

  .ob-anim-enter-left  { animation: ob-in-left  0.36s cubic-bezier(.22,1,.36,1) both; }
  .ob-anim-enter-right { animation: ob-in-right 0.36s cubic-bezier(.22,1,.36,1) both; }
  .ob-anim-exit        { animation: ob-out-left 0.16s ease both; }

  /* Dots */
  .ob-dots {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 18px;
  }
  .ob-dot {
    height: 6px; border-radius: 100px;
    border: none; cursor: pointer; padding: 0;
    transition: width 0.35s cubic-bezier(.22,1,.36,1), background 0.35s;
    -webkit-tap-highlight-color: transparent;
  }

  /* CTA */
  .ob-cta {
    width: 100%; height: 54px; border-radius: 15px;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15.5px; font-weight: 700; color: white;
    transition: filter 0.18s, transform 0.1s, box-shadow 0.18s;
    margin-bottom: 13px; letter-spacing: 0.1px;
    -webkit-tap-highlight-color: transparent;
    position: relative; z-index: 2;
    outline: none;
  }
  .ob-cta:hover  { filter: brightness(1.1); }
  .ob-cta:active { transform: scale(0.97); filter: brightness(0.95); }

  .ob-legal {
    font-size: 11px; color: rgba(255,255,255,0.24);
    text-align: center; line-height: 1.6;
  }
  .ob-legal-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.4); font-size: 11px;
    font-family: 'DM Sans', sans-serif;
    text-decoration: underline; padding: 0;
  }
`;

export default function Onboard({ onDone }: { onDone?: () => void | Promise<void> }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animClass, setAnimClass] = useState("ob-anim-enter-left");
  const [exiting, setExiting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState([false, false, false]);
  const touchStartX = useRef<number | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = slides[current];

  const clearAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const startAuto = () => {
    clearAuto();
    autoRef.current = setInterval(() => doAdvance("left"), 4800);
  };

  const doAdvance = (dir: "left" | "right") => {
    setExiting(true);
    setAnimClass("ob-anim-exit");
    setTimeout(() => {
      setCurrent(prev =>
        dir === "left" ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length
      );
      setAnimClass(dir === "left" ? "ob-anim-enter-left" : "ob-anim-enter-right");
      setExiting(false);
    }, 170);
  };

  const next = () => { doAdvance("left"); startAuto(); };
  const goTo = (i: number) => { if (i === current) return; doAdvance(i > current ? "left" : "right"); startAuto(); };
  const goAuth = async () => {
    if (onDone) {
      try { await onDone(); } catch (e) { /* ignore */ }
    } else {
      router.push("/auth");
    }
  };

  useEffect(() => { startAuto(); return clearAuto; }, []);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { d > 0 ? next() : (doAdvance("right"), startAuto()); }
    touchStartX.current = null;
  };

  const markLoaded = (i: number) =>
    setImgLoaded(prev => { const n = [...prev]; n[i] = true; return n; });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="ob-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ob-phone">

          {/* ── HERO ── */}
          <div className="ob-hero">

            {/* Real image layers — shown when loaded */}
            {slides.map((s, i) => (
              <div
                key={`img-${i}`}
                className={`ob-img-layer${i === current && imgLoaded[i] ? " ob-img-active" : ""}`}
                style={{ backgroundImage: `url(${s.image})` }}
              />
            ))}

            {/* SVG scene layers — shown when image NOT loaded */}
            {slides.map((s, i) => (
              <div
                key={`scene-${i}`}
                className={`ob-scene-layer${i === current && !imgLoaded[i] ? " ob-scene-active" : ""}`}
              >
                <SlideScene index={i} accent={s.accent} />
              </div>
            ))}

            {/* Hidden img tags to detect successful loads */}
            {slides.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`probe-${i}`} src={s.image} alt="" style={{ display: "none" }}
                onLoad={() => markLoaded(i)} />
            ))}

            <div className="ob-scrim-top" />
            <div className="ob-scrim-bottom" />

            {/* Top bar */}
            <div className="ob-topbar">
              <div className="ob-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span className="ob-logo-text">Uni-Mart</span>
              </div>
              <button type="button" className="ob-skip" onClick={goAuth}>
                Skip
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── BOTTOM SHEET ── */}
          <div className="ob-sheet">
            <div className="ob-handle" />

            {/* Animated content */}
            <div className={exiting ? "ob-anim-exit" : animClass}>
              <div
                className="ob-tag"
                style={{
                  color: slide.accent,
                  borderColor: `${slide.accent}50`,
                  background: `${slide.accent}18`,
                }}
              >
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")} — {slide.tag}
              </div>
              <h1 className="ob-headline">{slide.headline}</h1>
              <p className="ob-sub">{slide.sub}</p>
            </div>

            {/* Dots */}
            <div className="ob-dots">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="ob-dot"
                  style={{
                    background: i === current ? slide.accent : "rgba(255,255,255,0.2)",
                    width: i === current ? 28 : 6,
                  }}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* CTA */}
            {current < slides.length - 1 ? (
              <button
                type="button"
                className="ob-cta"
                style={{
                  background: slide.accent,
                  boxShadow: `0 8px 24px ${slide.accent}55`,
                }}
                onClick={next}
              >
                Next
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="ob-cta"
                style={{
                  background: slide.accent,
                  boxShadow: `0 8px 24px ${slide.accent}55`,
                }}
                onClick={goAuth}
              >
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            )}

            <p className="ob-legal">
              By continuing you agree to our{" "}
              <button type="button" className="ob-legal-btn">Terms &amp; Privacy</button>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

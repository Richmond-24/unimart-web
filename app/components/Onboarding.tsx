"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Lottie-style Animated SVG Components (Temu/Shopping Themed) ──

const TemuDiscover = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Pulse */}
    <circle cx="200" cy="200" r="160" fill={color} opacity="0.05" className="animate-pulse-slow" />
    
    {/* Shopping Bag */}
    <g className="animate-float-1">
      <path d="M140 180 H260 V320 C260 331 251 340 240 340 H160 C149 340 140 331 140 320 Z" fill="white" stroke={color} strokeWidth="4" />
      <path d="M170 180 V140 C170 125 182 113 197 113 H203 C218 113 230 125 230 140 V180" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
      
      {/* Discount Tag on Bag */}
      <g className="animate-bounce-slow">
        <circle cx="240" cy="280" r="35" fill={color} filter="url(#glow-teal)" />
        <text x="240" y="275" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="sans-serif">90%</text>
        <text x="240" y="295" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">OFF</text>
      </g>
    </g>

    {/* Floating Items */}
    <g className="animate-float-2">
       <rect x="80" y="120" width="50" height="50" rx="8" fill="white" opacity="0.9" transform="rotate(-15 105 145)" />
       <circle cx="105" cy="145" r="10" fill={color} opacity="0.5" />
    </g>
    
    <g className="animate-float-3">
       <rect x="270" y="100" width="60" height="40" rx="8" fill="white" opacity="0.9" transform="rotate(10 300 120)" />
       <rect x="285" y="110" width="30" height="5" rx="2" fill={color} opacity="0.5" />
    </g>
  </svg>
);

const KoomboAuthentic = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Central Verified Badge */}
    <g className="animate-pop-in">
      <circle cx="200" cy="200" r="80" fill="white" stroke={color} strokeWidth="4" />
      <path d="M160 200 L185 225 L240 170" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Sparkles */}
      <g className="animate-float-2">
         <path d="M280 120 L285 135 L300 140 L285 145 L280 160 L275 145 L260 140 L275 135 Z" fill={color} />
      </g>
      <g className="animate-float-3">
         <path d="M120 280 L125 295 L140 300 L125 305 L120 320 L115 305 L100 300 L115 295 Z" fill={color} />
      </g>
    </g>

    {/* Orbiting Products */}
    <g className="animate-orbit-1">
      <rect x="185" y="60" width="30" height="30" rx="4" fill={color} opacity="0.8" />
    </g>
    
    <g className="animate-orbit-2">
      <rect x="300" y="185" width="30" height="30" rx="4" fill={color} opacity="0.8" />
    </g>
    
    <g className="animate-orbit-3">
      <rect x="185" y="310" width="30" height="30" rx="4" fill={color} opacity="0.8" />
    </g>

    <g className="animate-orbit-4">
      <rect x="70" y="185" width="30" height="30" rx="4" fill={color} opacity="0.8" />
    </g>
  </svg>
);

const TemuSell = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Phone Frame */}
    <g className="animate-float-1">
      <rect x="120" y="60" width="160" height="280" rx="24" fill="rgba(255,255,255,0.1)" stroke={color} strokeWidth="2" />
      
      {/* Screen Content - Upload UI */}
      <rect x="135" y="90" width="130" height="100" rx="8" fill="rgba(255,255,255,0.05)" className="animate-pulse-slow" />
      <path d="M180 140 L200 120 L220 140" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="185" y="140" width="30" height="40" fill={color} opacity="0.2" />
      
      {/* AI Scanning Line */}
      <line x1="135" y1="120" x2="265" y2="120" stroke={color} strokeWidth="2" className="animate-scan" />
      
      <rect x="135" y="205" width="130" height="20" rx="4" fill="white" opacity="0.8" />
      <rect x="135" y="235" width="80" height="20" rx="4" fill={color} opacity="0.8" />
    </g>
    
    {/* Success Check */}
    <g className="animate-pop-in">
       <circle cx="280" cy="100" r="20" fill={color} />
       <path d="M272 100L276 104L284 96" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const slides = [
  {
    image: "/images/tech.jpg",
    tag: "SHOP SMARTER",
    headline: "Unbeatable\nPrices.",
    sub: "Shop millions of items at factory direct prices. Free shipping on every order.",
    accent: "#00bcd4", // Teal Blue
    animation: TemuDiscover
  },
  {
    image: "/images/event.jpg",
    tag: "SOCIAL COMMERCE REDEFINED",
    headline: "Shop authentic\nproducts on Koombo",
    sub: "Join the community! Discover verified products and shop with confidence alongside friends.",
    accent: "#00bcd4", // Teal Blue
    animation: KoomboAuthentic
  },
  {
    image: "/images/used.jpg",
    tag: "AI AUTHENTICATED",
    headline: "Upload a screenshot\nor video. AI verifies it.",
    sub: "Simply upload a screenshot or video of the product. Our advanced AI instantly authenticates it for you.",
    accent: "#00bcd4", // Teal Blue
    animation: TemuSell
  },
];

export default function Onboard({ onDone }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animClass, setAnimClass] = useState("ob-anim-enter-left");
  const [exiting, setExiting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState([false, false, false]);
  const touchStartX = useRef(null);
  const autoRef = useRef(null);

  const slide = slides[current];
  const AnimationComponent = slide.animation;

  const clearAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const startAuto = () => {
    clearAuto();
    autoRef.current = setInterval(() => doAdvance("left"), 5000);
  };

  const doAdvance = (dir) => {
    setExiting(true);
    setAnimClass("ob-anim-exit");
    setTimeout(() => {
      setCurrent(prev =>
        dir === "left" ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length
      );
      setAnimClass(dir === "left" ? "ob-anim-enter-left" : "ob-anim-enter-right");
      setExiting(false);
    }, 300);
  };

  const next = () => { doAdvance("left"); startAuto(); };
  const goTo = (i) => { if (i === current) return; doAdvance(i > current ? "left" : "right"); startAuto(); };
  
  const goAuth = async () => {
    try {
      try { localStorage.setItem('unimart:onboarded', '1'); } catch (e) {}
      if (onDone) await onDone();
      else router.push("/auth");
    } catch (err) {
      try { router.push('/auth'); } catch (e) {}
    }
  };

  useEffect(() => { startAuto(); return clearAuto; }, []);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { d > 0 ? next() : (doAdvance("right"), startAuto()); }
    touchStartX.current = null;
  };

  const markLoaded = (i) => setImgLoaded(prev => { const n = [...prev]; n[i] = true; return n; });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .ob-root {
          position: fixed; inset: 0; z-index: 9999;
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        .ob-phone {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          overflow: hidden;
          position: relative;
          background: white;
        }
        
        @media (min-width: 520px) {
          .ob-phone {
            width: 390px;
            height: min(844px, 90vh);
            border-radius: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 8px solid #f3f4f6;
          }
        }

        /* HERO AREA - Clean White Canvas for Temu Style */
        .ob-hero {
          flex: 1; 
          position: relative; 
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Subtle Background Pattern */
        .ob-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.5;
        }

        /* Lottie Container */
        .ob-lottie-container {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          max-width: 400px;
          max-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Top Bar */
        .ob-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          z-index: 10;
        }
        .ob-logo-img {
          height: 28px;
          width: auto;
          object-fit: contain;
          /* Force Teal Blue Tint using CSS Filter */
          filter: brightness(0) saturate(100%) invert(44%) sepia(93%) saturate(1352%) hue-rotate(130deg) brightness(95%) contrast(90%);
        }
        .ob-skip {
          color: #6b7280; 
          font-size: 14px; 
          font-weight: 600;
          cursor: pointer; 
          background: none;
          border: none;
        }

        /* BOTTOM SHEET - Card Style */
        .ob-sheet {
          flex-shrink: 0;
          background: white;
          padding: 0 24px 40px;
          position: relative; 
          z-index: 10;
          display: flex; 
          flex-direction: column;
          gap: 16px;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          /* Shadow to lift it up */
          box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
        }

        .ob-tag {
          display: inline-flex; align-items: center;
          font-size: 12px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #00bcd4;
          background: #E0F7FA;
          border-radius: 6px; 
          padding: 6px 12px;
          width: fit-content;
        }

        .ob-headline {
          font-size: clamp(36px, 10vw, 48px);
          font-weight: 900; 
          line-height: 1.05;
          letter-spacing: -1.5px; 
          color: #111827;
          white-space: pre-line;
        }

        .ob-sub {
          font-size: 16px; 
          line-height: 1.5;
          color: #6B7280;
          font-weight: 500;
        }

        /* Animations */
        @keyframes ob-in-up { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ob-out-down { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-30px) } }
        
        .ob-anim-enter { animation: ob-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .ob-anim-exit { animation: ob-out-down 0.3s ease both; }

        /* SVG Internal Animations */
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        @keyframes dash { to { stroke-dashoffset: -20; } }
        @keyframes pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float-up { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-60px) scale(1); opacity: 0; } }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @keyframes scan { 0% { transform: translateY(-20px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }

        .animate-float-1 { animation: float 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float 8s ease-in-out infinite 2s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-orbit-1 { animation: orbit 12s linear infinite; transform-origin: 200px 200px; }
        .animate-orbit-2 { animation: orbit 12s linear infinite 3s; transform-origin: 200px 200px; }
        .animate-orbit-3 { animation: orbit 12s linear infinite 6s; transform-origin: 200px 200px; }
        .animate-orbit-4 { animation: orbit 12s linear infinite 9s; transform-origin: 200px 200px; }
        .animate-dash { animation: dash 1s linear infinite; }
        .animate-pop-in { animation: pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-float-up-1 { animation: float-up 3s ease-out infinite; }
        .animate-float-up-2 { animation: float-up 3s ease-out infinite 1.5s; }
        .animate-bounce-slow { animation: float 3s ease-in-out infinite; }
        .animate-scan { animation: scan 2s ease-in-out infinite; }

        /* Dots & CTA */
        .ob-controls {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 24px;
        }
        .ob-dots { display: flex; gap: 8px; }
        .ob-dot {
          height: 8px; border-radius: 100px; border: none; cursor: pointer;
          transition: all 0.3s; width: 8px; background: #E5E7EB;
        }
        .ob-dot.active { width: 24px; background: #00bcd4; }

        .ob-cta {
          flex: 1; height: 56px; border-radius: 30px; border: none;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700;
          color: white; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          margin-left: 20px;
          box-shadow: 0 4px 12px rgba(0, 188, 212, 0.3);
        }
        .ob-cta:hover { box-shadow: 0 6px 16px rgba(0, 188, 212, 0.4); transform: translateY(-1px); }
        .ob-cta:active { transform: scale(0.98); }

        .ob-legal {
          font-size: 11px; color: #9CA3AF;
          text-align: center; margin-top: 16px;
        }
      `}</style>

      <div className="ob-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ob-phone">
          
          {/* HERO */}
          <div className="ob-hero">
            <div className="ob-pattern" />
            
            {/* Lottie-style SVG Animation Layer */}
            <div className="ob-lottie-container">
               <AnimationComponent color={slide.accent} />
            </div>

            {/* Top bar */}
            <div className="ob-topbar">
              <img src="/swoop-logo.png" alt="Koombo Logo" className="ob-logo-img" />
              <button type="button" className="ob-skip" onClick={goAuth}>Skip</button>
            </div>
          </div>

          {/* CONTENT SHEET */}
          <div className="ob-sheet">
            <div className={exiting ? "ob-anim-exit" : "ob-anim-enter"}>
              <div className="ob-tag">
                {slide.tag}
              </div>
              <h1 className="ob-headline">{slide.headline}</h1>
              <p className="ob-sub">{slide.sub}</p>
            </div>

            <div className="ob-controls">
              <div className="ob-dots">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ob-dot ${i === current ? "active" : ""}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>

              {current < slides.length - 1 ? (
                <button
                  type="button"
                  className="ob-cta"
                  style={{ background: slide.accent }}
                  onClick={next}
                >
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button
                  type="button"
                  className="ob-cta"
                  style={{ background: slide.accent }}
                  onClick={goAuth}
                >
                  Start Shopping
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                </button>
              )}
            </div>
            
            <p className="ob-legal">
              By continuing you agree to our Terms & Privacy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
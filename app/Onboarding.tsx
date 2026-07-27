"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Lottie-style Animated SVG Components (Lightweight replacement for heavy JSON files) ──

const FloatingIcons = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Blobs */}
    <circle cx="200" cy="200" r="150" fill={color} opacity="0.1" className="animate-pulse-slow" />
    <circle cx="280" cy="120" r="80" fill={color} opacity="0.05" className="animate-float-1" />
    
    {/* Card 1 */}
    <g className="animate-float-2">
      <rect x="60" y="100" width="120" height="160" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="75" y="120" width="90" height="90" rx="8" fill="rgba(255,255,255,0.05)" />
      <circle cx="120" cy="165" r="20" fill={color} opacity="0.8" />
      <rect x="75" y="225" width="60" height="8" rx="4" fill="white" opacity="0.8" />
      <rect x="75" y="240" width="40" height="6" rx="3" fill="white" opacity="0.4" />
      <rect x="145" y="235" width="24" height="24" rx="12" fill={color} />
      <path d="M153 247L157 251L163 243" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Card 2 */}
    <g className="animate-float-3">
      <rect x="220" y="140" width="120" height="160" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <rect x="235" y="160" width="90" height="90" rx="8" fill="rgba(255,255,255,0.05)" />
      <rect x="250" y="180" width="60" height="40" rx="4" fill={color} opacity="0.6" />
      <rect x="235" y="265" width="60" height="8" rx="4" fill="white" opacity="0.8" />
      <rect x="235" y="280" width="40" height="6" rx="3" fill="white" opacity="0.4" />
    </g>

    {/* Notification Badge */}
    <g className="animate-bounce-slow">
      <rect x="140" y="60" width="120" height="40" rx="20" fill={color} filter="url(#glow)" />
      <text x="200" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">New Deals!</text>
    </g>
  </svg>
);

const ConnectAnimation = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Central Hub */}
    <circle cx="200" cy="200" r="60" fill={color} opacity="0.2" className="animate-pulse" />
    <circle cx="200" cy="200" r="40" fill={color} opacity="0.4" />
    <path d="M185 200L195 210L215 190" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Orbiting Users */}
    <g className="animate-orbit-1">
      <circle cx="200" cy="80" r="25" fill="white" opacity="0.9" />
      <circle cx="200" cy="75" r="10" fill={color} />
    </g>
    
    <g className="animate-orbit-2">
      <circle cx="320" cy="200" r="25" fill="white" opacity="0.9" />
      <circle cx="320" cy="195" r="10" fill={color} />
    </g>
    
    <g className="animate-orbit-3">
      <circle cx="200" cy="320" r="25" fill="white" opacity="0.9" />
      <circle cx="200" cy="315" r="10" fill={color} />
    </g>

    <g className="animate-orbit-4">
      <circle cx="80" cy="200" r="25" fill="white" opacity="0.9" />
      <circle cx="80" cy="195" r="10" fill={color} />
    </g>

    {/* Connection Lines */}
    <path d="M200 140L200 80" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" className="animate-dash" />
    <path d="M260 200L320 200" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" className="animate-dash" />
  </svg>
);

const SellAnimation = ({ color }) => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Phone Frame */}
    <rect x="120" y="60" width="160" height="280" rx="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    
    {/* Screen Content */}
    <rect x="135" y="90" width="130" height="100" rx="8" fill="rgba(255,255,255,0.05)" className="animate-pulse-slow" />
    <rect x="135" y="205" width="130" height="20" rx="4" fill="white" opacity="0.8" />
    <rect x="135" y="235" width="80" height="20" rx="4" fill={color} opacity="0.8" />
    
    {/* Floating Coins */}
    <g className="animate-float-up-1">
      <circle cx="80" cy="300" r="15" fill="#FFD700" />
      <text x="80" y="305" textAnchor="middle" fill="#B8860B" fontSize="12" fontWeight="bold">$</text>
    </g>
    <g className="animate-float-up-2">
      <circle cx="320" cy="250" r="15" fill="#FFD700" />
      <text x="320" y="255" textAnchor="middle" fill="#B8860B" fontSize="12" fontWeight="bold">$</text>
    </g>
    <g className="animate-float-up-3">
      <circle cx="300" cy="100" r="12" fill="#FFD700" />
      <text x="300" y="104" textAnchor="middle" fill="#B8860B" fontSize="10" fontWeight="bold">$</text>
    </g>

    {/* Success Check */}
    <g className="animate-pop-in">
       <circle cx="200" cy="140" r="30" fill={color} />
       <path d="M190 140L195 145L210 130" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const slides = [
  {
    image: "/images/tech.jpg",
    tag: "Discover",
    headline: "Campus deals\nat your\nfingertips",
    sub: "Thousands of student listings — textbooks, gadgets, fashion & more. All from verified campus sellers.",
    accent: "#0D9488", // Teal
    animation: FloatingIcons
  },
  {
    image: "/images/event.jpg",
    tag: "Connect",
    headline: "Follow sellers\nyou trust",
    sub: "Build your campus network. Get notified the moment your favourite sellers drop something new.",
    accent: "#06B6D4", // Cyan
    animation: ConnectAnimation
  },
  {
    image: "/images/used.jpg",
    tag: "Sell",
    headline: "Turn your\nstuff into\ncash",
    sub: "List anything in under 60 seconds. Reach every student on your campus instantly.",
    accent: "#4F46E5", // Indigo
    animation: SellAnimation
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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .ob-root {
          position: fixed; inset: 0; z-index: 9999;
          background: #0f172a;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        .ob-phone {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        
        @media (min-width: 520px) {
          .ob-phone {
            width: 390px;
            height: min(844px, 90vh);
            border-radius: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 8px solid #1e293b;
          }
        }

        /* HERO AREA */
        .ob-hero {
          flex: 1; position: relative; overflow: hidden;
          background: #000;
        }

        .ob-img-layer {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0; transform: scale(1.1);
          transition: opacity 0.8s ease, transform 8s ease;
        }
        .ob-img-layer.ob-img-active { opacity: 0.6; transform: scale(1); }

        /* Lottie Container */
        .ob-lottie-container {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
          pointer-events: none;
        }

        .ob-scrim-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 100%);
          z-index: 3; pointer-events: none;
        }

        /* Top Bar */
        .ob-topbar {
          position: absolute; top: 0; left: 0; right: 0;
          padding: 24px 24px 0;
          display: flex; align-items: center; justify-content: space-between;
          z-index: 10;
        }
        .ob-logo-text {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 700; color: white; letter-spacing: -0.5px;
        }
        .ob-skip {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 8px 16px;
          color: white; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .ob-skip:hover { background: rgba(255,255,255,0.2); }

        /* BOTTOM SHEET */
        .ob-sheet {
          flex-shrink: 0;
          background: transparent; /* Let gradient show through */
          padding: 0 24px 32px;
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          gap: 20px;
        }

        .ob-tag {
          display: inline-flex; align-items: center;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          border-radius: 100px; padding: 6px 14px;
          width: fit-content;
          transition: all 0.4s;
        }

        .ob-headline {
          font-family: 'Fraunces', serif;
          font-size: clamp(32px, 9vw, 42px);
          font-weight: 900; line-height: 1.1;
          letter-spacing: -1px; color: #ffffff;
          white-space: pre-line;
        }

        .ob-sub {
          font-size: 15px; line-height: 1.6;
          color: rgba(255,255,255,0.7);
          max-width: 320px;
        }

        /* Animations */
        @keyframes ob-in-up { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ob-out-down { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(-20px) } }
        
        .ob-anim-enter { animation: ob-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .ob-anim-exit { animation: ob-out-down 0.3s ease both; }

        /* SVG Internal Animations */
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(100px) rotate(0deg); } to { transform: rotate(360deg) translateX(100px) rotate(-360deg); } }
        @keyframes dash { to { stroke-dashoffset: -8; } }
        @keyframes pop { 0% { transform: scale(0); } 80% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }

        .animate-float-1 { animation: float 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-float-3 { animation: float 8s ease-in-out infinite 2s; }
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
        .animate-orbit-1 { animation: orbit 10s linear infinite; transform-origin: 200px 200px; }
        .animate-orbit-2 { animation: orbit 10s linear infinite 2.5s; transform-origin: 200px 200px; }
        .animate-orbit-3 { animation: orbit 10s linear infinite 5s; transform-origin: 200px 200px; }
        .animate-orbit-4 { animation: orbit 10s linear infinite 7.5s; transform-origin: 200px 200px; }
        .animate-dash { animation: dash 1s linear infinite; }
        .animate-pop-in { animation: pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-float-up-1 { animation: float-up 3s ease-in-out infinite; }
        .animate-float-up-2 { animation: float-up 3s ease-in-out infinite 1s; }
        .animate-float-up-3 { animation: float-up 3s ease-in-out infinite 2s; }
        .animate-bounce-slow { animation: float 3s ease-in-out infinite; }

        /* Dots & CTA */
        .ob-controls {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px;
        }
        .ob-dots { display: flex; gap: 8px; }
        .ob-dot {
          height: 8px; border-radius: 100px; border: none; cursor: pointer;
          transition: all 0.3s; width: 8px; background: rgba(255,255,255,0.2);
        }
        .ob-dot.active { width: 24px; }

        .ob-cta {
          flex: 1; height: 56px; border-radius: 16px; border: none;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700;
          color: white; cursor: pointer; transition: transform 0.2s;
          margin-left: 20px;
        }
        .ob-cta:active { transform: scale(0.98); }

        .ob-legal {
          font-size: 11px; color: rgba(255,255,255,0.4);
          text-align: center; margin-top: 10px;
        }
      `}</style>

      <div className="ob-root" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ob-phone">
          
          {/* Dynamic Background Gradient based on slide accent */}
          <div 
            className="absolute inset-0 transition-colors duration-700"
            style={{ background: `linear-gradient(180deg, ${slide.accent}20 0%, #0f172a 100%)` }}
          />

          {/* HERO */}
          <div className="ob-hero">
            {/* Real Images (Low Opacity) */}
            {slides.map((s, i) => (
              <div
                key={`img-${i}`}
                className={`ob-img-layer${i === current && imgLoaded[i] ? " ob-img-active" : ""}`}
                style={{ backgroundImage: `url(${s.image})` }}
              />
            ))}
            
            {/* Hidden probes */}
            {slides.map((s, i) => (
              <img key={`probe-${i}`} src={s.image} alt="" style={{ display: "none" }} onLoad={() => markLoaded(i)} />
            ))}

            {/* Lottie-style SVG Animation Layer */}
            <div className="ob-lottie-container">
               <div style={{ width: '100%', height: '100%', maxWidth: 400, maxHeight: 400 }}>
                 <AnimationComponent color={slide.accent} />
               </div>
            </div>

            <div className="ob-scrim-bottom" />

            {/* Top bar */}
            <div className="ob-topbar">
              <div className="ob-logo-text">Uni-Mart</div>
              <button type="button" className="ob-skip" onClick={goAuth}>Skip</button>
            </div>
          </div>

          {/* CONTENT SHEET */}
          <div className="ob-sheet">
            <div className={exiting ? "ob-anim-exit" : "ob-anim-enter"}>
              <div
                className="ob-tag"
                style={{
                  color: slide.accent,
                  backgroundColor: `${slide.accent}20`,
                  border: `1px solid ${slide.accent}40`
                }}
              >
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
                    style={{ background: i === current ? slide.accent : "rgba(255,255,255,0.2)" }}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>

              {current < slides.length - 1 ? (
                <button
                  type="button"
                  className="ob-cta"
                  style={{ background: slide.accent, boxShadow: `0 10px 30px -10px ${slide.accent}` }}
                  onClick={next}
                >
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button
                  type="button"
                  className="ob-cta"
                  style={{ background: slide.accent, boxShadow: `0 10px 30px -10px ${slide.accent}` }}
                  onClick={goAuth}
                >
                  Get Started
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
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

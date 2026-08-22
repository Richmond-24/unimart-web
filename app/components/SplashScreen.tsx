"use client";

import React, { useEffect, useRef } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    // Increased time slightly to allow the user to appreciate the smoother animation
    const timer = setTimeout(() => {
      finishedRef.current = true;
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#111b21", overflow: "hidden" }}
    >
      {/* Animated Background Elements */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        
        {/* Floating Commerce Icons (SVGs) - Inline for reliability */}
        <div className="floating-icon icon-1">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <div className="floating-icon icon-2">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00a884" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <div className="floating-icon icon-3">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        </div>
        <div className="floating-icon icon-4">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
      </div>

      {/* Center Content Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          width: "100%",
        }}
      >
        {/* Logo Container with Netflix-style Zoom */}
        <div
          style={{
            position: "relative",
            width: "min(65vw, 220px)",
            perspective: "1000px",
            margin: "0 auto", // Ensures centering in flex container
          }}
        >
          <img
            src="/swoop-logo.png"
            alt="Swoop"
            className="netflix-logo-anim"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: "block",
              position: "relative",
              zIndex: 2,
              opacity: 0, 
              transform: "scale(0.8)",
            }}
          />

          {/* Dynamic Glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              borderRadius: "20%",
              background: "radial-gradient(circle, rgba(0,168,132,0.4) 0%, transparent 70%)",
              zIndex: 1,
              opacity: 0,
              animation: "glowExpand 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          />
        </div>

        {/* Motto */}
        {/* Brand text positioned well below logo */}
        <div style={{ height: 18 }} />
        <div
          className="brand-name-splash"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "clamp(2rem, 7vw, 4rem)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textTransform: "none",
            opacity: 0,
            animation: "fadeUpText 0.8s ease-out 1.8s forwards",
            textAlign: "center",
            marginTop: 8,
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #00d4a8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 8px rgba(0, 212, 168, 0.3))",
          }}
        >
          ComfyQwest
        </div>

        {/* Motto */}
        <span
          className="motto"
          style={{
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)",
            fontWeight: 500,
            color: "#8696a0",
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0,
            animation: "fadeUpText 0.8s ease-out 2.2s forwards",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Shop Smarter
          <span style={{ color: "#00d4a8", margin: "0 8px", opacity: 0.6 }}>•</span>
          Spend Less
        </span>
      </div>

      {/* Bottom Spinner */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: 0,
          animation: "fadeUpText 0.5s ease 2s forwards",
          zIndex: 10,
        }}
      >
        <div className="spinner" />
      </div>

      <style jsx>{`
        /* --- Logo Animation --- */
        .netflix-logo-anim {
          animation: netflixZoom 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes netflixZoom {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); filter: blur(10px); }
          40% { opacity: 1; filter: blur(0px); }
          70% { transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes glowExpand {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.5); }
        }

        @keyframes fadeUpText {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* --- Floating Icons Animation (Fixed Flow) --- */
        .floating-icon {
          position: absolute;
          opacity: 0;
          /* Using a longer, smoother cycle that doesn't rely on network resources */
          animation: floatIcon 4s ease-in-out infinite;
        }
        
        /* Distributed positions to avoid overlap and ensure visibility */
        .icon-1 { top: 15%; left: 10%; animation-delay: 0s; }
        .icon-2 { top: 20%; right: 10%; animation-delay: 1s; }
        .icon-3 { bottom: 20%; left: 15%; animation-delay: 2s; }
        .icon-4 { bottom: 15%; right: 15%; animation-delay: 3s; }

        @keyframes floatIcon {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.8) rotate(-10deg); 
          }
          20% { 
            opacity: 0.7; 
          }
          50% { 
            opacity: 0.4; 
            transform: translateY(-10px) scale(1) rotate(0deg); 
          }
          80% { 
            opacity: 0.7; 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-30px) scale(0.8) rotate(10deg); 
          }
        }

        /* --- Spinner & Blobs --- */
        .spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid #2a3942; border-top-color: #00d4a8; border-right-color: #00a884;
          animation: spin 0.85s linear infinite;
          box-shadow: 0 0 12px rgba(0, 212, 168, 0.25);
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.1;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .blob-1 { width: 300px; height: 300px; background: radial-gradient(circle, #00a884, transparent); top: -100px; left: -80px; }
        .blob-2 { width: 240px; height: 240px; background: radial-gradient(circle, #00d4a8, transparent); bottom: -80px; right: -60px; animation-delay: 2s; }
        @keyframes blobFloat { from { transform: translate(0, 0); } to { transform: translate(20px, 30px); } }
      `}</style>
    </div>
  );
}
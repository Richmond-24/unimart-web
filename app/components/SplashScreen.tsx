"use client";

import React, { useEffect, useRef } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    const timer = setTimeout(() => {
      finishedRef.current = true;
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  // ─── Brand Color Palette ─────────────────────────────────────────────
  const brandColors = {
    primary: "#25d366",        // WhatsApp light green
    secondary: "#128c7e",      // WhatsApp teal green
    accent: "#075e54",         // WhatsApp dark teal
    background: "#1a1a1a",     // Deep gray background
    textPrimary: "#ffffff",    // White text
    textMuted: "#b0b0b0",      // Light gray muted text
    tealBlue: "#00bcd4",       // Teal blue for loading dots
  };

  // Commerce SVG Icons data
  const commerceIcons = [
    {
      id: 1,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2L6 7H3l3 10h12l3-10h-3l-3-5H9z"/><circle cx="9" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/></svg>`,
      position: { top: '10%', left: '8%' },
      size: 40,
      delay: 0,
      duration: 8,
    },
    {
      id: 2,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M12 15v4"/></svg>`,
      position: { top: '15%', right: '12%' },
      size: 35,
      delay: 0.5,
      duration: 9,
    },
    {
      id: 3,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
      position: { bottom: '20%', left: '5%' },
      size: 38,
      delay: 1,
      duration: 10,
    },
    {
      id: 4,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="8"/></svg>`,
      position: { top: '25%', right: '8%' },
      size: 32,
      delay: 1.5,
      duration: 7,
    },
    {
      id: 5,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      position: { bottom: '25%', right: '10%' },
      size: 36,
      delay: 0.8,
      duration: 8.5,
    },
    {
      id: 6,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
      position: { top: '60%', left: '10%' },
      size: 34,
      delay: 1.2,
      duration: 9.5,
    },
    {
      id: 7,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
      position: { top: '5%', left: '45%' },
      size: 30,
      delay: 0.3,
      duration: 7.5,
    },
    {
      id: 8,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      position: { bottom: '10%', left: '40%' },
      size: 33,
      delay: 1.8,
      duration: 8,
    },
    {
      id: 9,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      position: { top: '70%', right: '15%' },
      size: 31,
      delay: 0.6,
      duration: 9,
    },
    {
      id: 10,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      position: { top: '40%', left: '3%' },
      size: 29,
      delay: 1.4,
      duration: 8.5,
    },
    {
      id: 11,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
      position: { bottom: '35%', right: '5%' },
      size: 37,
      delay: 0.9,
      duration: 7,
    },
    {
      id: 12,
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      position: { top: '80%', left: '20%' },
      size: 35,
      delay: 1.6,
      duration: 9.5,
    },
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: brandColors.background }}
    >
      {/* Scattered Commerce Icons Background */}
      <div className="absolute inset-0 pointer-events-none">
        {commerceIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute animate-float-commerce opacity-20"
            style={{
              ...icon.position,
              width: icon.size,
              height: icon.size,
              animationDelay: `${icon.delay}s`,
              animationDuration: `${icon.duration}s`,
              color: brandColors.tealBlue,
            }}
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
        ))}
      </div>

      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center flex-grow animate-fade-in px-6 relative z-10">
        
        {/* Main Logo - No box, just the logo */}
        <div 
          className="relative mx-auto"
          style={{
            width: 'min(75vw, 320px)',
          }}
        >
          {/* Your Logo Image - Clean, no box, no glow */}
          <img
            src="/h.png"
            alt="Koombo Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* App Name - Koombo beneath the logo */}
       

        {/* Tagline - Where your hustle meets opportunities */}
        <p 
          className="text-base md:text-lg mt-3 animate-slide-up-delay text-center max-w-md px-4"
          style={{ 
            color: brandColors.textMuted,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
          }}
        >
          Where your hustle meets opportunities
        </p>

        {/* Loading Indicator - Three animated teal blue dots */}
        <div className="mt-10 flex items-center justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce-dot"
              style={{
                backgroundColor: brandColors.tealBlue,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer - Powered by ComfyQuest */}
      <div className="w-full pb-8 animate-fade-in-delay relative z-10">
        <p 
          className="text-center text-xs md:text-sm"
          style={{ color: brandColors.textMuted }}
        >
          powered by <span style={{ color: brandColors.tealBlue, fontWeight: 600 }}>ComfyQuest</span>
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes float-commerce {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.15;
          }
          25% {
            transform: translateY(-15px) rotate(5deg);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-25px) rotate(-3deg);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-10px) rotate(3deg);
            opacity: 0.22;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
          opacity: 0;
        }
        
        .animate-bounce-dot {
          animation: bounce-dot 1.4s infinite ease-in-out both;
        }
        
        .animate-float-commerce {
          animation: float-commerce infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
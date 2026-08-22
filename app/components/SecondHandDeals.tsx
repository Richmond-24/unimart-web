"use client";

import React, { useEffect, useState } from "react";

interface SplashProps {
  onLoaded?: () => void;
}

export default function SplashScreen({ onLoaded }: SplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Auto-hide after animation completes
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onLoaded?.();
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoaded]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D9A3]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6">
        {/* Logo Container */}
        <div className="mb-6 sm:mb-8 md:mb-10 animate-fade-in-down">
          <div className="relative">
            {/* Logo Placeholder - Replace with your actual logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-[#00D9A3] to-[#00b88a] shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">C</span>
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-2 rounded-2xl border-2 border-[#00D9A3]/20 animate-spin-slow" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Brand Name - Responsive Modern Typography */}
        <div className="animate-fade-in-up">
          <h1 
            className="text-center font-display tracking-tight leading-none select-none"
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              fontWeight: 800,
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 50%, #00D9A3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            comfyquest
          </h1>
          
          {/* Subtle underline accent */}
          <div className="mt-2 sm:mt-3 md:mt-4 h-1 w-16 sm:w-20 md:w-24 mx-auto rounded-full bg-gradient-to-r from-[#00D9A3] to-transparent opacity-60" />
        </div>

        {/* Tagline */}
        <p 
          className="mt-4 sm:mt-6 md:mt-8 text-center text-gray-500 font-light tracking-wide animate-fade-in-up-delayed"
          style={{
            fontSize: 'clamp(0.75rem, 2.5vw, 1.125rem)',
          }}
        >
          Discover • Connect • Thrive
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-[#00D9A3]" />
          <div className="w-2 h-2 rounded-full bg-[#00D9A3] animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 rounded-full bg-[#00D9A3] animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up-delayed {
          animation: fade-in-up 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
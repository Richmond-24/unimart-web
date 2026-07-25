"use client";

import React from "react";

type LoadingSpinnerProps = {
  size?: number;
  label?: string;
  className?: string;
};

export default function LoadingSpinner({ 
  size = 48, 
  label = "Loading", 
  className = "" 
}: LoadingSpinnerProps) {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {/* Modern Figma-style Spinner with Multiple Animations */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer rotating ring */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite]"
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#spinnerGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="60 200"
            className="animate-[dash_1.5s_ease-in-out_infinite]"
          />
        </svg>

        {/* Inner pulsing dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-3 h-3 rounded-full bg-teal-600 animate-[pulse_1.5s_ease-in-out_infinite]"
            style={{ 
              boxShadow: '0 0 12px rgba(13, 148, 136, 0.6)',
              animationDelay: '0.3s'
            }}
          />
        </div>

        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-full h-full animate-[orbit_3s_linear_infinite]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <div 
              className="absolute top-[10%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-400 opacity-60"
              style={{ transformOrigin: 'center 200%' }}
            />
          </div>
        ))}
      </div>

      {/* Animated loading text */}
      <span className="text-sm font-medium text-gray-500 animate-pulse tracking-wide">
        {label}
      </span>

      {/* CSS Keyframes for custom animations */}
      <style jsx>{`
        @keyframes dash {
          0% { stroke-dashoffset: 250; }
          50% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 250; }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

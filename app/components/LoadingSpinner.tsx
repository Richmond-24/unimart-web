"use client";

import React from "react";

type LoadingSpinnerProps = {
  size?: number;
  label?: string;
  className?: string;
};

export default function LoadingSpinner({ size = 32, label = "Loading", className = "" }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-live="polite" className={`inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 44 44"
        className="animate-spin"
        style={{ width: size, height: size }}
      >
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="5"
        />
        <path
          fill="#0d9488"
          d="M22 4a18 18 0 0 1 0 36 18 18 0 0 1 0-36z"
          opacity="0.85"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

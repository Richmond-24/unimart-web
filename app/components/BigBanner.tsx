
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 8h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 14.2c2.6.5 4.5 2.7 4.5 5.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function BigBanner() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const node = bannerRef.current;
    if (!node) return;

    // Respect reduced-motion users: show immediately, skip the animation state machine.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsVisible(true);
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Mark "entered" a beat after becoming visible so the entrance
          // transition finishes before the attention nudge kicks in.
          const timer = setTimeout(() => setHasEntered(true), 700);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bannerRef}
      className={`w-full rounded-2xl shadow-md overflow-hidden bg-gradient-to-br from-orange-600 via-orange-600 to-orange-500 relative transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"
      } ${hasEntered ? "animate-attention-nudge" : ""}`}
    >
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 animate-banner-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Soft decorative glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-400/30 blur-2xl animate-glow-pulse" />
      <div className="pointer-events-none absolute -bottom-8 left-1/4 w-28 h-28 rounded-full bg-orange-300/20 blur-2xl animate-glow-pulse [animation-delay:1.2s]" />

      <div className="relative flex flex-col sm:flex-row items-stretch">
        {/* Left: the pitch */}
        <div className="flex-1 min-w-0 px-5 py-5 sm:px-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-400 flex items-center justify-center shadow-inner animate-badge-float">
            <BagIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-100" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
                Live now &middot; 128 shopping this deal
              </p>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white leading-snug break-words">
              Dorm Essentials, picked by your community
            </p>
            <p className="text-sm text-orange-100 break-words flex items-center gap-1.5">
              <UsersIcon className="w-4 h-4 flex-shrink-0" />
              Trending among students near you — up to 50% off
            </p>
          </div>
        </div>

        {/* Right: the CTA */}
        <Link
          href="/search?category=flash-deals"
          className="group flex-shrink-0 bg-orange-50 px-6 py-4 sm:py-5 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1.5 hover:bg-white transition-colors"
        >
          <BagIcon className="w-5 h-5 text-orange-500" />
          <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-sm whitespace-nowrap flex items-center gap-1.5 transition-transform group-hover:translate-x-0.5">
            Shop the deals
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>

      <style jsx>{`
        @keyframes bannerShimmer {
          0% {
            transform: translateX(-100%);
          }
          60%,
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }
        @keyframes badgeFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes attentionNudge {
          0%,
          100% {
            transform: scale(1);
          }
          4% {
            transform: scale(1.015);
          }
          8% {
            transform: scale(1);
          }
          12% {
            transform: scale(1.01);
          }
          16%,
          100% {
            transform: scale(1);
          }
        }
        .animate-banner-shimmer {
          animation: bannerShimmer 5s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: glowPulse 4s ease-in-out infinite;
        }
        .animate-badge-float {
          animation: badgeFloat 3s ease-in-out infinite;
        }
        .animate-attention-nudge {
          animation: attentionNudge 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-banner-shimmer,
          .animate-glow-pulse,
          .animate-badge-float,
          .animate-attention-nudge {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
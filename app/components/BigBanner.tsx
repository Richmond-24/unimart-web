"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BigBanner() {
  const [bounce, setBounce] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Create a bouncing effect based on scroll position
      // The bounce oscillates between -8 and 8 pixels
      const bounceAmount = Math.sin(scrollY * 0.01) * 8;
      setBounce(bounceAmount);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="w-full rounded-2xl shadow-md overflow-hidden bg-orange-600 relative transition-transform duration-300 ease-out"
      style={{
        transform: `translateY(${bounce}px)`,
      }}
    >
      {/* Faint decorative bolts scattered in the background */}
      <BoltIcon className="pointer-events-none absolute -top-3 left-1/3 w-10 h-10 text-orange-500/30 rotate-12" />
      <BoltIcon className="pointer-events-none absolute bottom-1 left-[58%] w-6 h-6 text-orange-400/30 -rotate-12" />

      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Left: the deal */}
        <div className="flex-1 min-w-0 px-5 py-5 sm:px-6 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-400 flex items-center justify-center rotate-[-6deg] shadow-inner">
            <BoltIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
              Today only
            </p>
            <p className="text-base sm:text-lg font-extrabold text-white leading-snug break-words">
              Flash Sale on Dorm Essentials
            </p>
            <p className="text-sm text-orange-100 break-words">
              Textbooks, snacks &amp; supplies — up to 50% off
            </p>
          </div>
        </div>

        {/* Right: the CTA */}
        <Link
          href="/search?category=flash-deals"
          className="flex-shrink-0 bg-orange-50 px-6 py-4 sm:py-5 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1.5 hover:bg-orange-100 transition"
        >
          <BoltIcon className="w-5 h-5 text-orange-500" />
          <span className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-sm whitespace-nowrap">
            See flash deals →
          </span>
        </Link>
      </div>
    </div>
  );
}
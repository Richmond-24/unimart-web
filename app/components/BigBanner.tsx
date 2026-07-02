"use client";

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
  return (
    <div className="w-full rounded-2xl shadow-md overflow-hidden bg-orange-600 relative">
      {/* Faint decorative bolts scattered in the background */}
      <BoltIcon className="pointer-events-none absolute -top-3 left-1/3 w-10 h-10 text-orange-500/30 rotate-12" />
      <BoltIcon className="pointer-events-none absolute bottom-1 left-[58%] w-6 h-6 text-orange-400/30 -rotate-12" />

      <div className="flex items-stretch">
        {/* Left: the deal */}
        <div className="flex-1 min-w-0 px-6 py-5 flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-400 flex items-center justify-center rotate-[-6deg] shadow-inner">
            <BoltIcon className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
              Today only
            </p>
            <p className="text-lg font-extrabold text-white leading-tight truncate">
              Flash Sale on Dorm Essentials
            </p>
            <p className="text-sm text-orange-100 truncate">
              Textbooks, snacks &amp; supplies — up to 50% off
            </p>
          </div>
        </div>

        {/* Perforated seam */}
        <div className="relative flex-shrink-0 border-l-2 border-dashed border-orange-300/70">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white" />
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-white" />
        </div>

        {/* Right: the stub / CTA */}
        <Link
          href="/search?category=flash-deals"
          className="flex-shrink-0 bg-orange-50 px-6 py-5 flex flex-col items-center justify-center gap-1.5 hover:bg-orange-100 transition"
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
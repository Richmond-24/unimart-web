"use client";

import Link from "next/link";

export default function BigBanner() {
  return (
    <div className="w-full rounded-2xl shadow-md overflow-hidden bg-orange-600 relative">
      <div className="flex items-stretch">
        {/* Left: the deal */}
        <div className="flex-1 min-w-0 px-4 py-3.5 flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center rotate-[-6deg]">
            <span className="text-base leading-none">⚡</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100">
              Today only
            </p>
            <p className="text-sm font-extrabold text-white leading-tight truncate">
              Flash Sale on Dorm Essentials
            </p>
            <p className="text-xs text-orange-100 truncate">
              Textbooks, snacks & supplies — up to 50% off
            </p>
          </div>
        </div>

        {/* Perforated seam */}
        <div className="relative flex-shrink-0 border-l-2 border-dashed border-orange-300/70">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white" />
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white" />
        </div>

        {/* Right: the stub / CTA */}
        <Link
          href="/search?tag=flash"
          className="flex-shrink-0 bg-orange-50 px-4 py-3 flex flex-col items-center justify-center gap-1 hover:bg-orange-100 transition"
        >
          <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs whitespace-nowrap">
            Shop Now →
          </span>
          <span className="text-[10px] font-mono text-orange-700/80 tracking-wide">
            CODE: FLASH50
          </span>
        </Link>
      </div>
    </div>
  );
}

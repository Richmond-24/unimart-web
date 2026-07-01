"use client";

export default function BigBanner() {
  return (
    <div className="w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">🎯 Flash Sale Today Only</p>
          <p className="text-xs text-orange-100 mt-1 truncate">Save up to 50% on selected items</p>
        </div>
        <a href="/search?tag=flash" className="flex-shrink-0 px-3 py-1.5 bg-white text-orange-600 font-semibold text-xs rounded-full hover:bg-orange-50 transition">
          Shop Now →
        </a>
      </div>
    </div>
  );
}

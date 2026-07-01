"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import apiFetch from "../../lib/apiClient";

const DEFAULT_SLIDES = [
  { image: "/tech.jpg", tag: "Campus Life", title: "Back to Campus", sub: "Fire-Boltt Rise from GH₵199", cta: "Shop now" },
  { image: "/home.jpg", tag: "Home & Furniture", title: "Style & Groom", sub: "Premium kits from GH₵89", cta: "Explore" },
];

const GAP = 14;

export default function HeroCarousel() {
  const [cur, setCur] = useState(0);
  const [vis, setVis] = useState(1);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [imageErrors, setImageErrors] = useState<boolean[]>(Array(slides.length).fill(false));

  const trackRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number>(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TOTAL = slides.length;
  const maxIndex = Math.max(0, TOTAL - vis);

  useEffect(() => {
    const upd = () => setVis(window.innerWidth >= 640 ? 3 : 1);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const goTo = useCallback((idx: number) => {
    setCur(Math.max(0, Math.min(idx, maxIndex)));
  }, [maxIndex]);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => setCur(c => (c < maxIndex ? c + 1 : 0)),
      3500
    );
  }, [maxIndex]);

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [resetAuto]);

  // Load flash-deals to populate featured slides (shows flash deals as featured)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
          const res = await apiFetch('/public/flash-deals').catch(() => null);
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (!mounted || !data || !data.length) return;
        const mapped = data.slice(0, 8).map((p: any) => ({
          image: (p.images && p.images[0]) || p.image || p.imageUrls?.[0] || '/tech.jpg',
          tag: p.category || 'Flash Deal',
          title: p.title || p.name || p.productName || 'Deal',
          sub: p.price ? `From GH₵${p.price}` : (p.subtitle || ''),
          cta: 'Shop now',
          href: `/listings/${p._id || p.id}`,
        }));
        setSlides(mapped);
      } catch (e) {
        // ignore and keep defaults
      }
    })();
    return () => { mounted = false; };
  }, []);

  function cardPx(): number {
    if (!vpRef.current) return 0;
    const vw = vpRef.current.offsetWidth;
    return vis === 1 ? vw : (vw - GAP * (vis - 1)) / vis;
  }

  const offset = cur * (cardPx() + (vis === 1 ? 0 : GAP));

  const handleImageError = (index: number) => {
    setImageErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  return (
    <div className="w-full pt-[72px] pb-5 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div className="flex justify-between items-center mb-4 px-0.5">
          <span className="font-semibold text-gray-900 text-xl">Featured Deals</span>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-400 font-medium tabular-nums">
              {cur + 1} / {TOTAL}
            </span>
            <div className="flex gap-1.5">
              {([-1, 1] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { resetAuto(); goTo(cur + d); }}
                  disabled={d === -1 ? cur === 0 : cur === maxIndex}
                  className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center disabled:opacity-40 hover:bg-gray-800 hover:border-gray-800 hover:text-white transition-all text-gray-700 text-sm"
                >
                  {d === -1 ? "←" : "→"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div ref={vpRef} className="overflow-hidden w-full">
          <div
            ref={trackRef}
            className="flex transition-transform duration-[450ms] ease-[cubic-bezier(.4,0,.2,1)]"
            style={{
              gap: vis === 1 ? 0 : GAP,
              transform: `translateX(-${offset}px)`,
            }}
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const dx = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(dx) > 44) { resetAuto(); goTo(cur + (dx > 0 ? 1 : -1)); }
            }}
          >
            {slides.map((s, i) => (
              <div
                key={i}
                className="flex-none rounded-3xl overflow-hidden bg-white shadow-md border border-gray-100 flex flex-col group hover:shadow-lg transition-shadow duration-300"
                style={{ width: cardPx() || "100%" }}
              >
                {/* Image Container - Smaller and rounded */}
                <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: "200px" }}>
                  {!imageErrors[i] ? (
                    <img 
                      src={s.image} 
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => handleImageError(i)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
                        <path d="M21 15l-5-5L5 21" strokeWidth="1.5"/>
                      </svg>
                      <p className="text-xs text-gray-500">Image not found</p>
                    </div>
                  )}
                </div>

                {/* Content Container - Compact */}
                <div className="flex-1 p-3 bg-white">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 rounded-full px-2 py-0.5 inline-block mb-1.5">
                    {s.tag}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{s.title}</h3>
                  <p className="text-gray-600 text-xs mb-2.5">{s.sub}</p>
                  <button className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors w-full">
                    {s.cta} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { resetAuto(); goTo(i); }}
              className={`h-1.5 rounded-full transition-all border-none cursor-pointer
                ${i === cur ? "w-6 bg-gray-900" : "w-1.5 bg-gray-300"}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
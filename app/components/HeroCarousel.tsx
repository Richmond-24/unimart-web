"use client";

import * as React from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from "lucide-react";

type Ad = {
  title: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  cta: string;
  image: string;
  accent: string;
};

const ads: Ad[] = [
  {
    title: "Wireless Earbuds Pro",
    tagline: "Noise cancelling, all-day battery",
    price: "GHS 249",
    oldPrice: "GHS 349",
    discount: "29% OFF",
    cta: "Shop now",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop",
    accent: "#7C3AED",
  },
  {
    title: "Campus Sneaker Drop",
    tagline: "Limited colorways, sizes going fast",
    price: "GHS 199",
    oldPrice: "GHS 260",
    discount: "23% OFF",
    cta: "Grab a pair",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    accent: "#EA580C",
  },
  {
    title: "Mini Desk Lamp",
    tagline: "Warm light for late-night study",
    price: "GHS 79",
    oldPrice: "GHS 110",
    discount: "28% OFF",
    cta: "Light it up",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop",
    accent: "#059669",
  },
  {
    title: "Everyday Backpack",
    tagline: "Water-resistant, laptop-ready",
    price: "GHS 159",
    oldPrice: "GHS 210",
    discount: "24% OFF",
    cta: "See details",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
    accent: "#2563EB",
  },
];

const AUTOPLAY_MS = 3500;

export default function AdsCardSlider() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [progressKey, setProgressKey] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % ads.length);
      setProgressKey((k) => k + 1);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, active]);

  const goTo = (idx: number) => {
    setActive(idx);
    setProgressKey((k) => k + 1);
  };

  const prev = () => goTo((active - 1 + ads.length) % ads.length);
  const next = () => goTo((active + 1) % ads.length);

  return (
    <section className="bg-[#FAF9F6] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* SIGNIFICANTLY INCREASED CARD HEIGHTS */}
        <div
          className="group relative h-72 w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5 sm:h-96 md:h-[32rem]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides */}
          {ads.map((ad, idx) => (
            <div
              key={ad.title}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: idx === active ? 1 : 0, pointerEvents: idx === active ? "auto" : "none" }}
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="h-full w-full object-cover"
                style={{
                  transform: idx === active ? "scale(1.06)" : "scale(1)",
                  transition: "transform 4.2s ease-out",
                }}
              />
              {/* Scrim for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="flex flex-col gap-3 px-6 sm:px-10 md:px-14">
                  {ad.discount && (
                    <span
                      className="flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white sm:text-base"
                      style={{ backgroundColor: ad.accent }}
                    >
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                      {ad.discount}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{ad.title}</h3>
                  <p className="hidden text-base text-white/80 sm:block sm:text-lg md:text-xl">
                    {ad.tagline}
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
                      {ad.price}
                    </span>
                    {ad.oldPrice && (
                      <span className="text-sm text-white/50 line-through sm:text-base md:text-lg">
                        {ad.oldPrice}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="group/btn mt-3 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-all duration-300 hover:gap-3 sm:px-6 sm:py-3 sm:text-base"
                  >
                    {ad.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* LARGER NAVIGATION ARROWS */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 opacity-0 shadow-lg transition-all duration-300 hover:bg-white group-hover:opacity-100 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 opacity-0 shadow-lg transition-all duration-300 hover:bg-white group-hover:opacity-100 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* LARGER PROGRESS DOTS */}
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
            {ads.map((ad, idx) => (
              <button
                key={ad.title}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-2 overflow-hidden rounded-full bg-white/40 transition-all duration-500"
                style={{ width: idx === active ? 32 : 8 }}
              >
                {idx === active && !paused && (
                  <span
                    key={progressKey}
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    style={{ animation: `slideProgress ${AUTOPLAY_MS}ms linear forwards` }}
                  />
                )}
                {idx === active && paused && (
                  <span className="absolute inset-0 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
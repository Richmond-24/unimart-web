"use client";

import * as React from "react";
import Image from "next/image";
import { Gift, Store, Sparkles, TrendingUp, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Images are served from /public
const promos = [
  {
    title: "Campus style drops",
    subtitle: "Fresh fashion finds and creator picks landing every Friday.",
    status: "Coming soon",
    accent: "#7C3AED",
    accentSoft: "#EDE9FE",
    image: "/last.webp",
    icon: Sparkles,
  },
  {
    title: "Smart student savings",
    subtitle: "Budget-friendly essentials, gadgets, and pre-loved deals nearby.",
    status: "Live now",
    accent: "#059669",
    accentSoft: "#D1FAE5",
    image: "/camp.webp",
    icon: Gift,
  },
  {
    title: "Seller spotlight",
    subtitle: "Meet verified campus sellers with trending products and fast replies.",
    status: "Trending",
    accent: "#EA580C",
    accentSoft: "#FFEDD5",
    image: "/spot.jpg",
    icon: Store,
  },
  {
    title: "Quick checkout, joyful finds",
    subtitle: "A smoother shopping flow designed around how students actually browse.",
    status: "Updated",
    accent: "#2563EB",
    accentSoft: "#DBEAFE",
    image: "/check.gif",
    icon: TrendingUp,
  },
];

export default function CampaignBannerGrid() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.clientWidth ?? 280;
    const gap = 16;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-label="Campus campaign highlights"
      className="relative overflow-hidden bg-[#FAF9F6] py-10 opacity-0 md:py-20"
      style={{ animation: "fadeIn 0.7s ease-out forwards" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 pb-5 sm:mb-12 sm:pb-7 md:flex-row md:items-end md:justify-between">
          <div
            className="opacity-0"
            style={{ animation: "fadeInUp 0.5s ease-out 0.05s forwards" }}
          >
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white sm:text-[11px]">
                Campus campaigns
              </p>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Latest update{" "}
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                on Koombo
              </span>{" "}
              right now
            </h2>
          </div>

          <div
            className="flex items-center justify-between gap-3 opacity-0 sm:justify-end"
            style={{ animation: "fadeInUp 0.5s ease-out 0.15s forwards" }}
          >
            <p className="max-w-[220px] text-xs text-gray-500 sm:max-w-xs sm:text-right md:text-sm">
              Four things worth knowing before you shop this week.
            </p>
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Scroll left"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md active:scale-95"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Scroll right"
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all duration-300 hover:translate-x-0.5 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md active:scale-95"
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroller */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          {promos.map((promo, idx) => {
            const Icon = promo.icon;
            const isHovered = hovered === idx;
            return (
              <article
                key={promo.title}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                className="group relative flex w-[70%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] sm:w-[46%] lg:w-[23%]"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                {/* Gradient ring on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${promo.accent}00, ${promo.accent}40)`,
                    padding: "1px",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                />

                {/* Image */}
                <div className="relative h-32 w-full overflow-hidden sm:h-40">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 70vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Image gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                  <span
                    className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:text-[11px]"
                    style={{ backgroundColor: `${promo.accent}E6` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {promo.status}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2.5 p-4 sm:gap-3 sm:p-5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 sm:h-9 sm:w-9"
                    style={{ backgroundColor: promo.accentSoft, color: promo.accent }}
                  >
                    <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">
                      {promo.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 sm:text-sm">
                      {promo.subtitle}
                    </p>
                  </div>

                  <div
                    className="mt-auto flex items-center gap-1.5 pt-2 text-[11px] font-medium sm:text-xs"
                    style={{ color: isHovered ? promo.accent : "#9CA3AF" }}
                  >
                    <span className="transition-all duration-300">On the campus board</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
"use client";

import * as React from "react";
import Image from "next/image";
import { Gift, Store, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";

// Images are served from /public/free.jpeg
// All promos now use the same free.jpeg image
const promos = [
  {
    title: "Campus style drops",
    subtitle: "Fresh fashion finds and creator picks landing every Friday.",
    status: "Coming soon",
    accent: "#7C3AED",
    image: "/last.webp",
    icon: Sparkles,
  },
  {
    title: "Smart student savings",
    subtitle: "Budget-friendly essentials, gadgets, and pre-loved deals nearby.",
    status: "Live now",
    accent: "#059669",
    image: "/camp.webp",
    icon: Gift,
  },
  {
    title: "Seller spotlight",
    subtitle: "Meet verified campus sellers with trending products and fast replies.",
    status: "Trending",
    accent: "#EA580C",
    image: "/spot.jpg",
    icon: Store,
  },
  {
    title: "Quick checkout, joyful finds",
    subtitle: "A smoother shopping flow designed around how students actually browse.",
    status: "Updated",
    accent: "#2563EB",
    image: "/check.gif",
    icon: TrendingUp,
  },
];

export default function CampaignBannerGrid() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.clientWidth ?? 280;
    const gap = 16; // reduced from 24 to match new gap
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <section aria-label="Campus campaign highlights" className="bg-[#FAF9F6] py-8 md:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Header - More compact on mobile */}
        <div className="mb-6 flex flex-col gap-2 border-b border-gray-200 pb-4 sm:mb-10 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4F46E5] sm:text-xs">
              Campus campaigns
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900 md:text-3xl">
              What's happening on campus right now
            </h2>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="max-w-[200px] text-xs text-gray-500 sm:max-w-xs sm:text-right md:text-sm">
              Four things worth knowing before you shop this week.
            </p>
            {/* Nav arrows */}
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Scroll left"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                <ArrowUpRight className="h-3.5 w-3.5 -rotate-135" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Scroll right"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroller - Reduced gaps and widths on mobile */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 sm:pb-4"
        >
          {promos.map((promo) => {
            const Icon = promo.icon;
            return (
              <article
                key={promo.title}
                className="flex w-[65%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white sm:w-[46%] lg:w-[23%]"
              >
                {/* Image - Reduced height on mobile */}
                <div className="relative h-28 w-full sm:h-36">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 65vw"
                    className="object-cover"
                  />
                  <span
                    className="absolute left-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white sm:px-2 sm:py-1 sm:text-[11px]"
                    style={{ backgroundColor: promo.accent }}
                  >
                    {promo.status}
                  </span>
                </div>

                {/* Content - Reduced padding on mobile */}
                <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                    style={{ backgroundColor: `${promo.accent}1A`, color: promo.accent }}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">
                      {promo.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:mt-1.5 sm:text-sm">
                      {promo.subtitle}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-1.5 text-[10px] font-medium text-gray-400 sm:pt-2 sm:text-xs">
                    <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    On the campus board
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
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
    image: "/last.webp", // Correct: root of public folder
    icon: Sparkles,
  },
  {
    title: "Smart student savings",
    subtitle: "Budget-friendly essentials, gadgets, and pre-loved deals nearby.",
    status: "Live now",
    accent: "#059669",
    image: "/camp.webp", // Correct: root of public folder
    icon: Gift,
  },
  {
    title: "Seller spotlight",
    subtitle: "Meet verified campus sellers with trending products and fast replies.",
    status: "Trending",
    accent: "#EA580C",
    image: "/spot.jpg", // Correct: root of public folder
    icon: Store,
  },
  {
    title: "Quick checkout, joyful finds",
    subtitle: "A smoother shopping flow designed around how students actually browse.",
    status: "Updated",
    accent: "#2563EB",
    image: "/check.gif", // Correct: root of public folder
    icon: TrendingUp,
  },
];

export default function CampaignBannerGrid() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.clientWidth ?? 280;
    const gap = 24; // matches gap-6
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <section aria-label="Campus campaign highlights" className="bg-[#FAF9F6] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">
              Campus campaigns
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              What's happening on campus right now
            </h2>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="max-w-xs text-sm text-gray-500 sm:text-right">
              Four things worth knowing before you shop this week.
            </p>
            {/* Nav arrows */}
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Scroll left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                <ArrowUpRight className="h-4 w-4 -rotate-135" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Scroll right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                <ArrowUpRight className="h-4 w-4 rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scroller */}
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {promos.map((promo) => {
            const Icon = promo.icon;
            return (
              <article
                key={promo.title}
                className="flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white sm:w-[46%] lg:w-[23%]"
              >
                {/* Image */}
                <div className="relative h-36 w-full">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 78vw"
                    className="object-cover"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-md px-2 py-1 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: promo.accent }}
                  >
                    {promo.status}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${promo.accent}1A`, color: promo.accent }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold leading-snug text-gray-900">
                      {promo.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      {promo.subtitle}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-gray-400">
                    <ArrowUpRight className="h-3.5 w-3.5" />
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
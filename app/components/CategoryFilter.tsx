"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { slug: "tech-gadgets", name: "Tech", fileName: "tech.jpg", alt: "Circuit board", discount: "70%", sold: "12k+ sold" },
  { slug: "fashion", name: "Fashion", fileName: "Fashion.jpg", alt: "Clothing rack", discount: "60%", sold: "8.5k+ sold" },
  { slug: "food", name: "Food", fileName: "Food.jpg", alt: "Colourful bowl", discount: "45%", sold: "3k+ sold" },
  { slug: "home-furniture", name: "Home", fileName: "home.jpg", alt: "Modern room", discount: "80%", sold: "20k+ sold" },
  { slug: "services", name: "Services", fileName: "services.jpg", alt: "Handyman tools", discount: "30%", sold: "900+ sold" },
  { slug: "second-hand", name: "Second-hand", fileName: "used.jpg", alt: "Vintage items", discount: "55%", sold: "5.2k+ sold" },
  { slug: "events", name: "Events", fileName: "event.jpg", alt: "Concert crowd", discount: "25%", sold: "1.1k+ sold" },
  { slug: "books", name: "Books", fileName: "books.jpg", alt: "Bookshelf", discount: "65%", sold: "4.7k+ sold" },
];

// Only the categories in the auto-slider, with a flat color per banner
const SLIDER_SLUGS = ["fashion", "food", "tech-gadgets", "events", "books"];
const BANNER_COLORS: Record<string, string> = {
  fashion: "#E5231B",
  food: "#FF6000",
  "tech-gadgets": "#1A1A1A",
  events: "#7C3AED",
  books: "#0F766E",
};
const SLIDER_CATEGORIES = SLIDER_SLUGS
  .map((slug) => CATEGORIES.find((c) => c.slug === slug))
  .filter(Boolean) as typeof CATEGORIES;

// Duplicate the list so the CSS scroll loop is seamless
const SLIDER_LOOP = [...SLIDER_CATEGORIES, ...SLIDER_CATEGORIES];

function localPhotoUrl(fileName: string) {
  return `/${fileName}`;
}

export default function CategoryFilter({ activeCategory }: { activeCategory?: string }) {
  const [highlightedCategory, setHighlightedCategory] = useState(activeCategory || "tech-gadgets");

  const selectedCategory = useMemo(
    () => CATEGORIES.find((cat) => cat.slug === highlightedCategory) ?? CATEGORIES[0],
    [highlightedCategory]
  );

  return (
    <section className="bg-[#F7F7F7] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Category avatar strip — the Temu signature element */}
        <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-4 pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = highlightedCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/search?category=${encodeURIComponent(cat.slug)}`}
                  onClick={() => setHighlightedCategory(cat.slug)}
                  className="flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
                  <span
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full p-[2px] transition ${
                      isSelected
                        ? "bg-gradient-to-br from-[#FF6000] to-[#E5231B]"
                        : "bg-transparent"
                    }`}
                  >
                    <span className="relative h-full w-full overflow-hidden rounded-full border border-[#EDEDED] bg-white">
                      <Image src={localPhotoUrl(cat.fileName)} alt={cat.alt} fill className="object-cover" />
                    </span>
                  </span>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      isSelected ? "text-[#FF6000]" : "text-[#1A1A1A]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Auto-sliding promo banners (text only, no images) */}
        <div className="mt-5 overflow-hidden rounded-2xl bg-white p-2.5 ring-1 ring-[#EDEDED]">
          <div className="group relative overflow-hidden">
            <div className="flex w-max animate-[slide_18s_linear_infinite] gap-2.5 group-hover:[animation-play-state:paused]">
              {SLIDER_LOOP.map((cat, i) => (
                <Link
                  key={`${cat.slug}-${i}`}
                  href={`/search?category=${encodeURIComponent(cat.slug)}`}
                  onClick={() => setHighlightedCategory(cat.slug)}
                  style={{ backgroundColor: BANNER_COLORS[cat.slug] }}
                  className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <span>Shop {cat.name}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    -{cat.discount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
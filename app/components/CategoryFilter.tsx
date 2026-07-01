
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    slug: "tech-gadgets",
    name: "Tech",
    fileName: "tech.jpg",
    crop: "center",
    alt: "Circuit board close-up",
  },
  {
    slug: "fashion",
    name: "Fashion",
    fileName: "Fashion.jpg",
    crop: "center",
    alt: "Clothing rack with garments",
  },
  {
    slug: "food",
    name: "Food",
    fileName: "Food.jpg",
    crop: "center",
    alt: "Colourful food bowl",
  },
  {
    slug: "home-furniture",
    name: "Home Appliance",
    fileName: "home.jpg",
    crop: "center",
    alt: "Modern living room sofa",
  },
  {
    slug: "services",
    name: "Services",
    fileName: "services.jpg",
    crop: "center",
    alt: "Handyman tools on a workbench",
  },
  {
    slug: "second-hand",
    name: "Second-hand",
    fileName: "used.jpg",
    crop: "center",
    alt: "Vintage items at a market stall",
  },
  {
    slug: "events",
    name: "Events",
    fileName: "event.jpg",
    crop: "top",
    alt: "Concert crowd at an event",
  },
  {
    slug: "books",
    name: "Books",
    fileName: "books.jpg",
    crop: "center",
    alt: "Books arranged on a shelf",
  },
];

function localPhotoUrl(fileName: string) {
  // image files live in the `public/` folder — prefix with `/` so Next serves them from public
  return `/${fileName}`;
}

interface CategoryFilterProps {
  activeCategory?: string;
}

export default function CategoryFilter({ activeCategory }: CategoryFilterProps) {
  return (
    <section className="py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.slug;

            return (
              <Link
                key={cat.slug}
                href={`/search?category=${encodeURIComponent(cat.slug)}`}
                className={[
                  "category-chip group flex flex-col items-center gap-2",
                  "py-3 px-1 rounded-[18px] border-[1.5px] transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                  "active:scale-95",
                  isActive
                    ? "border-teal-500 bg-teal-50"
                    : "border-transparent bg-white hover:border-teal-500 hover:shadow-[0_4px_16px_rgba(13,148,136,0.15)]",
                ].join(" ")}
              >
                {/* Photo tile */}
                <span
                  className={[
                    "relative overflow-hidden rounded-[13px] flex-shrink-0 block",
                    // larger base sizes for better visibility on mobile & desktop
                    "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
                    "border-2 transition-colors duration-200",
                    isActive
                      ? "border-teal-500"
                      : "border-transparent group-hover:border-teal-500",
                  ].join(" ")}
                >
                  {/* Local photo from public/ */}
                  <Image
                    src={localPhotoUrl(cat.fileName || 'G.jpg')}
                    alt={cat.alt}
                    fill
                    sizes="(max-width: 640px) 72px, (max-width: 768px) 96px, 128px"
                    className={`object-cover ${cat.crop === 'top' ? 'object-top' : 'object-center'} transition-transform duration-300 group-hover:scale-110`}
                  />

                  {/* Teal hover tint */}
                  <span
                    className={[
                      "absolute inset-0 bg-teal-500 transition-opacity duration-200 pointer-events-none",
                      isActive ? "opacity-10" : "opacity-0 group-hover:opacity-15",
                    ].join(" ")}
                  />
                </span>

                {/* Label */}
                <span
                  className={[
                    "text-sm sm:text-base font-medium text-center w-full truncate leading-none transition-colors duration-200",
                    isActive
                      ? "text-teal-600"
                      : "text-gray-500 group-hover:text-teal-600",
                  ].join(" ")}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
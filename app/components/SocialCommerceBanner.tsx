"use client";

import React from "react";
import Link from "next/link";
import { Archivo_Black, Manrope } from "next/font/google";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

type Row = {
  key: "fashion" | "tech" | "food";
  label: string;
  items: string[];
  direction: "left" | "right";
  duration: string;
  chipClass: string;
  labelClass: string;
};

const rows: Row[] = [
  {
    key: "fashion",
    label: "Fashion",
    items: ["Zara", "Nike", "H&M", "Adidas", "Uniqlo", "Gucci", "Levi's", "Shein"],
    direction: "left",
    duration: "26s",
    chipClass: "bg-[#2B1620] text-[#F4C0D1] border-[#4B1F2E]",
    labelClass: "bg-[#4B1528]",
  },
  {
    key: "tech",
    label: "Tech",
    items: ["Apple", "Samsung", "Sony", "Dell", "Boat", "JBL", "Xiaomi", "OnePlus"],
    direction: "right",
    duration: "30s",
    chipClass: "bg-[#0F1E2E] text-[#B5D4F4] border-[#173049]",
    labelClass: "bg-[#042C53]",
  },
  {
    key: "food",
    label: "Food",
    items: [
      "Starbucks",
      "KFC",
      "Domino's",
      "McDonald's",
      "Subway",
      "Pizza Hut",
      "Baskin Robbins",
      "Burger King",
    ],
    direction: "left",
    duration: "24s",
    chipClass: "bg-[#2B1E0B] text-[#FAC775] border-[#4A3512]",
    labelClass: "bg-[#412402]",
  },
];

export default function SocialCommerceBanner() {
  return (
    <div
      className={`${archivoBlack.variable} ${manrope.variable} flex items-center justify-center bg-[#0B0A10] px-3 py-10 font-[family-name:var(--font-body)]`}
    >
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[20px] border border-[#2A2733] bg-[#14121B]">
        {/* Header */}
        <div className="relative z-[2] px-6 pb-[22px] pt-[34px] sm:px-11">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7B2C4]">
            Trending on the app
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="max-w-[640px] font-[family-name:var(--font-display)] text-[26px] leading-[1.05] text-[#F3F1EA] sm:text-[38px]">
                Every brand you follow,{" "}
                <span className="text-transparent [-webkit-text-stroke:1.5px_#F3F1EA]">in one feed</span>
              </h2>
              <p className="mt-2.5 max-w-[480px] text-sm font-medium text-[#9C97AC]">
                Fashion, tech and food — the labels everyone's shopping right now.
              </p>
            </div>

            <div className="hidden sm:flex sm:items-center">
              <Link href="/ads" className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10">
                View all ads
              </Link>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3.5 pb-[34px] pt-1.5">
          {rows.map((row) => {
            const doubled = [...row.items, ...row.items];
            return (
              <div key={row.key} className="relative flex h-[60px] items-center">
                {/* left fade */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[120px] sm:w-[160px]"
                  style={{
                    background: "linear-gradient(90deg, #14121B 55%, transparent 100%)",
                  }}
                />
                {/* row label */}
                <div
                  className={`absolute inset-y-0 left-0 z-[3] flex w-[90px] items-center justify-center font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.04em] text-[#F3F1EA] sm:w-[120px] sm:text-[13px] ${row.labelClass}`}
                >
                  {row.label}
                </div>

                {/* right fade */}
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[80px]"
                  style={{
                    background: "linear-gradient(270deg, #14121B 40%, transparent 100%)",
                  }}
                />

                {/* scrolling track */}
                <div className="flex h-full w-full items-center overflow-hidden">
                  <div
                    className={`marquee-track flex flex-shrink-0 gap-3.5 pl-[90px] sm:pl-[120px] ${
                      row.direction === "left" ? "marquee-left" : "marquee-right"
                    }`}
                    style={{ animationDuration: row.duration }}
                  >
                    {doubled.map((item, i) => (
                      <div
                        key={`${item}-${i}`}
                        className={`flex h-[42px] flex-shrink-0 items-center whitespace-nowrap rounded-full border px-[22px] text-[15px] font-bold ${row.chipClass}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marquee keyframes — scoped to this component, no tailwind.config changes needed */}
      <style jsx>{`
        .marquee-track {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .marquee-left {
          animation-name: scrollLeft;
        }
        .marquee-right {
          animation-name: scrollRight;
        }
        @keyframes scrollLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes scrollRight {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gift, Sparkles, Store, TrendingUp } from "lucide-react";

// Images are served from /public/images/promos/ — drop a file with the exact
// name below into that folder (or change the path to match your own file).
const promos = [
  {
    title: "Campus style drops",
    subtitle: "Fresh fashion finds and creator picks landing every Friday.",
    badge: "Coming soon",
    href: "/search?category=fashion",
    accent: "from-[#6C5CE7] via-[#8B5CF6]/80 to-transparent",
    image: "/images/promos/campus-style.jpg",
    icon: Sparkles,
  },
  {
    title: "Smart student savings",
    subtitle: "Budget-friendly essentials, gadgets, and pre-loved deals nearby.",
    badge: "Live now",
    href: "/search?category=second-hand",
    accent: "from-[#0F766E] via-[#22C55E]/70 to-transparent",
    image: "/images/promos/student-savings.jpg",
    icon: Gift,
  },
  {
    title: "Seller spotlight",
    subtitle: "Meet verified campus sellers with trending products and fast replies.",
    badge: "Trending",
    href: "/seller",
    accent: "from-[#9A3412] via-[#FF8A65]/70 to-transparent",
    image: "/images/promos/seller-spotlight.jpg",
    icon: Store,
  },
  {
    title: "Quick checkout, joyful finds",
    subtitle: "Discover must-have items with a smoother shopping flow designed for students.",
    badge: "Updated",
    href: "/search",
    accent: "from-[#1D4ED8] via-[#2563EB]/70 to-transparent",
    image: "/images/promos/quick-checkout.jpg",
    icon: TrendingUp,
  },
];

export default function CampaignBannerMarquee() {
  return (
    <section className="py-8 md:py-10 bg-gradient-to-b from-[#f8f7ff] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6C5CE7]">
              Campus campaigns
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              A moving feed of fresh drops and community favorites
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Auto-playing highlights for fashion, second-hand finds, and seller buzz.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/80 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex w-max animate-marquee">
            {[...promos, ...promos].map((promo, index) => {
              const Icon = promo.icon;
              return (
                <Link
                  key={`${promo.title}-${index}`}
                  href={promo.href}
                  className="group relative mx-3 my-3 flex h-48 w-[320px] flex-col justify-between overflow-hidden rounded-[1.5rem] p-5 text-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Background photo — served from /public/images/promos */}
                  <Image
                    src={promo.image}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Color-tinted scrim so the copy stays legible and the brand accent survives */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${promo.accent} opacity-90`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] backdrop-blur">
                      {promo.badge}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold leading-tight drop-shadow-sm">{promo.title}</h3>
                    <p className="mt-2 text-sm text-white/90 drop-shadow-sm">{promo.subtitle}</p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-sm font-semibold">
                    <span>Explore now</span>
                    <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur transition group-hover:bg-white/25">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
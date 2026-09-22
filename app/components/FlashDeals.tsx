"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  Heart,
  Eye,
  BadgeCheck,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

type Deal = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  img?: string;
  videoUrl?: string;
  slug?: string;
  endsAt: number;
  sellerName?: string;
  sellerAvatar?: string;
  views?: number;
  likes?: number;
  isVerified?: boolean;
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "Ended";

  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60));

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatCompactNumber(num: number) {
  if (!Number.isFinite(num)) return "0";

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toString();
}

function getDiscountPercent(
  price?: string,
  originalPrice?: string
): number | null {
  if (!price || !originalPrice) return null;

  const current = Number(
    price.replace(/[^\d.]/g, "")
  );

  const original = Number(
    originalPrice.replace(/[^\d.]/g, "")
  );

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(original) ||
    original <= current ||
    original <= 0
  ) {
    return null;
  }

  return Math.round(((original - current) / original) * 100);
}

interface VideoDealCardProps {
  deal: Deal;
  now: number;
}

function VideoDealCard({
  deal,
  now,
}: VideoDealCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] =
    useState(true);

  const remaining = deal.endsAt - now;
  const isExpired = remaining <= 0;

  const discountPercent = getDiscountPercent(
    deal.price,
    deal.originalPrice
  );

  const getUrgencyStyle = () => {
    if (isExpired) {
      return {
        bg: "bg-black/45",
        label: "Ended",
        pulse: false,
      };
    }

    if (remaining < 1000 * 60 * 30) {
      return {
        bg: "bg-red-500/90",
        label: formatRemaining(remaining),
        pulse: true,
      };
    }

    if (remaining < 1000 * 60 * 60) {
      return {
        bg: "bg-orange-500/90",
        label: formatRemaining(remaining),
        pulse: false,
      };
    }

    return {
      bg: "bg-black/45",
      label: formatRemaining(remaining),
      pulse: false,
    };
  };

  const urgencyStyle = getUrgencyStyle();

  /* =========================================================
     AUTOPLAY WHEN CARD ENTERS VIEWPORT
  ========================================================== */
  useEffect(() => {
    if (
      !deal.videoUrl ||
      !videoRef.current ||
      !cardRef.current
    ) {
      return;
    }

    const video = videoRef.current;

    video.muted = isMuted;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.55 &&
          !isExpired
        ) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setShowPlayOverlay(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setShowPlayOverlay(true);
            });
        } else {
          video.pause();
          setIsPlaying(false);
          setShowPlayOverlay(true);
        }
      },
      {
        threshold: 0.55,
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [
    deal.videoUrl,
    isMuted,
    isExpired,
  ]);

  /* =========================================================
     PLAY / PAUSE
  ========================================================== */
  const togglePlay = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current || isExpired) {
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayOverlay(false);
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayOverlay(true);
    }
  };

  /* =========================================================
     MUTE
  ========================================================== */
  const toggleMute = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoRef.current) {
      return;
    }

    const nextMuted = !isMuted;

    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  /* =========================================================
     LIKE
  ========================================================== */
  const toggleLike = (
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLiked((prev) => !prev);
  };

  return (
    <Link
      href={`/listings/${deal.slug || deal.id}`}
      className="
        group
        block
        w-[280px]
        flex-none
        snap-start
      "
    >
      <div
        ref={cardRef}
        className="
          relative
          overflow-hidden
          rounded-[26px]
          border
          border-gray-100
          bg-white
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-[#D5EFEC]
          hover:shadow-xl
        "
      >
        {/* =====================================================
            MEDIA
        ====================================================== */}
        <div className="relative aspect-[4/5] overflow-hidden bg-black">

          {/* VIDEO */}
          {deal.videoUrl ? (
            <video
              ref={videoRef}
              src={deal.videoUrl}
              poster={deal.img}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.025]
              "
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
            />
          ) : deal.img ? (
            <img
              src={deal.img}
              alt={deal.title}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.025]
              "
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Zap
                className="text-[#0B8F86]"
                size={44}
              />
            </div>
          )}

          {/* ===================================================
              MEDIA GRADIENT
          ==================================================== */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

          {/* ===================================================
              TOP BADGES
          ==================================================== */}
          <div className="absolute left-3 top-3 z-20 flex max-w-[80%] flex-wrap gap-2">

            {/* FLASH DEAL */}
            <div className="flex items-center gap-1.5 rounded-full bg-[#0B8F86] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
              <Zap
                size={11}
                fill="currentColor"
              />
              Flash Deal
            </div>

            {/* DISCOUNT */}
            {discountPercent && (
              <div className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-gray-900 shadow-lg backdrop-blur-md">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* ===================================================
              COUNTDOWN
          ==================================================== */}
          <div
            className={`
              absolute
              right-3
              top-3
              z-20
              flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-bold
              text-white
              shadow-lg
              backdrop-blur-md
              ${urgencyStyle.bg}
              ${
                urgencyStyle.pulse
                  ? "animate-pulse"
                  : ""
              }
            `}
          >
            <Clock size={11} />

            <span>
              {urgencyStyle.label}
            </span>
          </div>

          {/* ===================================================
              PLAY / PAUSE
          ==================================================== */}
          {deal.videoUrl && (
            <>
              {showPlayOverlay && !isExpired && (
                <button
                  onClick={togglePlay}
                  className="
                    absolute
                    inset-0
                    z-30
                    m-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/40
                    bg-white/20
                    text-white
                    shadow-xl
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:scale-110
                    hover:bg-white/30
                  "
                  aria-label="Play video"
                >
                  <Play
                    size={25}
                    fill="white"
                    className="ml-0.5"
                  />
                </button>
              )}

              {/* MUTE */}
              <button
                onClick={toggleMute}
                className="
                  absolute
                  bottom-4
                  left-4
                  z-30
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/40
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-black/60
                "
                aria-label={
                  isMuted
                    ? "Unmute"
                    : "Mute"
                }
              >
                {isMuted ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>
            </>
          )}

          {/* ===================================================
              SOCIAL ACTIONS
          ==================================================== */}
          <div className="absolute bottom-[138px] right-3 z-30 flex flex-col gap-3">

            {/* LIKE */}
            <button
              onClick={toggleLike}
              className="flex flex-col items-center gap-1"
              aria-label={
                isLiked
                  ? "Unlike"
                  : "Like"
              }
            >
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  backdrop-blur-md
                  transition-all
                  ${
                    isLiked
                      ? "bg-red-500 shadow-lg shadow-red-500/30"
                      : "bg-black/40 hover:bg-black/60"
                  }
                `}
              >
                <Heart
                  size={18}
                  className="text-white"
                  fill={
                    isLiked
                      ? "white"
                      : "none"
                  }
                />
              </div>

              <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {formatCompactNumber(
                  (deal.likes || 0) +
                    (isLiked ? 1 : 0)
                )}
              </span>
            </button>

            {/* VIEWS */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md">
                <Eye size={18} />
              </div>

              <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {formatCompactNumber(
                  deal.views || 0
                )}
              </span>
            </div>
          </div>

          {/* ===================================================
              SELLER + PRODUCT INFO
          ==================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pr-16 pb-5">

            {/* SELLER */}
            <div className="mb-2.5 flex items-center gap-2">

              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white shadow-sm">
                {deal.sellerAvatar ? (
                  <img
                    src={deal.sellerAvatar}
                    alt={
                      deal.sellerName ||
                      "Seller"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#0B8F86] text-xs font-bold text-white">
                    {(
                      deal.sellerName ||
                      "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 items-center gap-1">
                <p className="truncate text-xs font-semibold text-white">
                  {deal.sellerName ||
                    "Koombo Seller"}
                </p>

                {deal.isVerified && (
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-[#21D4C5] text-white" />
                )}
              </div>
            </div>

            {/* TITLE */}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow-md">
              {deal.title}
            </h3>
          </div>
        </div>

        {/* =====================================================
            PRICE / CTA
        ====================================================== */}
        <div className="flex items-center justify-between gap-3 bg-white p-4">

          <div className="min-w-0">
            <div className="flex items-baseline gap-2">

              <span className="truncate text-lg font-extrabold tracking-tight text-gray-950">
                {deal.price}
              </span>

              {deal.originalPrice && (
                <span className="truncate text-xs font-medium text-gray-400 line-through">
                  {deal.originalPrice}
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-1.5">
              <Clock
                size={11}
                className={
                  isExpired
                    ? "text-gray-400"
                    : "text-[#0B8F86]"
                }
              />

              <span className="text-[11px] font-medium text-gray-500">
                {isExpired
                  ? "Deal ended"
                  : "Limited time"}
              </span>
            </div>
          </div>

          {/* VIEW PRODUCT */}
          <div
            className="
              flex
              h-10
              shrink-0
              items-center
              gap-1.5
              rounded-xl
              bg-[#0B8F86]
              px-3.5
              text-xs
              font-bold
              text-white
              shadow-sm
              transition-all
              group-hover:bg-[#087A73]
            "
          >
            <ShoppingBag size={15} />

            <span className="hidden min-[340px]:inline">
              View
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FlashDealsVideo() {
  const [now, setNow] = useState(
    Date.now()
  );

  const [deals, setDeals] = useState<
    Deal[]
  >([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  /* =========================================================
     COUNTDOWN TIMER
  ========================================================== */
  useEffect(() => {
    const id = setInterval(
      () => setNow(Date.now()),
      1000
    );

    return () =>
      clearInterval(id);
  }, []);

  /* =========================================================
     LOAD DEALS
  ========================================================== */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        let flashRes: any = null;

        try {
          flashRes = await apiFetch(
            "/public/flash-deals",
            {
              suppressErrorLog: true,
            }
          );
        } catch {
          flashRes = null;
        }

        if (!mounted) return;

        let flashItems: any[] = [];

        if (
          flashRes?.data &&
          Array.isArray(
            flashRes.data
          )
        ) {
          flashItems =
            flashRes.data;
        } else if (
          Array.isArray(flashRes)
        ) {
          flashItems = flashRes;
        }

        let featuredItems: any[] =
          [];

        try {
          const featuredRes =
            await apiFetch(
              "/home/featured",
              {
                suppressErrorLog: true,
              }
            );

          if (
            featuredRes?.data &&
            Array.isArray(
              featuredRes.data
            )
          ) {
            featuredItems =
              featuredRes.data;
          } else if (
            Array.isArray(
              featuredRes
            )
          ) {
            featuredItems =
              featuredRes;
          }
        } catch {
          // Ignore featured fallback errors
        }

        const combined = [
          ...flashItems,
          ...featuredItems,
        ];

        const seen = new Set();

        const unique: any[] = [];

        for (const product of combined) {
          const id =
            product._id ||
            product.id;

          if (!id) continue;
          if (seen.has(id)) continue;

          seen.add(id);
          unique.push(product);
        }

        if (!mounted) return;

        if (unique.length > 0) {
          const mapped: Deal[] =
            unique.map(
              (p: any) => {
                const id =
                  p._id ||
                  p.id;

                const title =
                  p.title ||
                  p.name ||
                  "Untitled";

                /* PRICE */
                let price =
                  "GH₵0";

                const priceVal =
                  p.price ??
                  p.priceAmount ??
                  p.productPrice ??
                  null;

                if (
                  typeof priceVal ===
                  "number"
                ) {
                  price =
                    `GH₵${priceVal}`;
                } else if (
                  priceVal
                ) {
                  price =
                    String(
                      priceVal
                    );
                }

                /* ORIGINAL PRICE */
                let originalPrice:
                  | string
                  | undefined;

                const originalVal =
                  p.originalPrice ??
                  p.listPrice ??
                  p.mrp ??
                  null;

                if (
                  typeof originalVal ===
                  "number"
                ) {
                  originalPrice =
                    `GH₵${originalVal}`;
                } else if (
                  originalVal
                ) {
                  originalPrice =
                    String(
                      originalVal
                    );
                }

                /* IMAGE */
                const img =
                  (p.images &&
                    p.images[0]) ||
                  p.image ||
                  (p.imageUrls &&
                    p.imageUrls[0]) ||
                  undefined;

                /* VIDEO */
                const videoUrl =
                  p.videoUrl ||
                  p.video ||
                  undefined;

                /* EXPIRY */
                let endsAt =
                  Date.now() +
                  1000 *
                    60 *
                    60 *
                    2;

                if (
                  p.flashDealExpiry
                ) {
                  endsAt =
                    new Date(
                      p.flashDealExpiry
                    ).getTime();
                } else if (
                  p.expiresAt
                ) {
                  endsAt =
                    new Date(
                      p.expiresAt
                    ).getTime();
                } else if (
                  p.flashDeal
                    ?.endsAt
                ) {
                  endsAt =
                    new Date(
                      p.flashDeal.endsAt
                    ).getTime();
                }

                const slug =
                  p.slug ||
                  p.permalink ||
                  p.handle ||
                  id;

                return {
                  id,
                  title,
                  price,
                  originalPrice,
                  img,
                  videoUrl,
                  endsAt,
                  slug,

                  sellerName:
                    p.sellerName ||
                    p.seller?.name ||
                    "Koombo Seller",

                  sellerAvatar:
                    p.sellerAvatar ||
                    p.seller?.avatar,

                  views:
                    Number(
                      p.views ??
                        p.viewCount ??
                        0
                    ) || 0,

                  likes:
                    Number(
                      p.likes ??
                        p.likeCount ??
                        0
                    ) || 0,

                  isVerified:
                    Boolean(
                      p.isVerified ??
                        p.verified ??
                        p.seller
                          ?.isVerified ??
                        false
                    ),
                };
              }
            );

          setDeals(mapped);
        } else {
          setDeals([]);
        }
      } catch (err) {
        console.error(
          "Failed to load flash deals",
          err
        );

        if (mounted) {
          setDeals([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      id="flash-deals-video"
      className="bg-white py-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-7 flex items-end justify-between gap-4">

          <div>
            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F8F6]">
                <Zap
                  className="h-4 w-4 text-[#0B8F86]"
                  fill="currentColor"
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B8F86]">
                Koombo Deals
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Flash Deals
            </h2>

            <p className="mt-1.5 flex items-center gap-2 text-sm text-gray-500">
              <Clock
                size={15}
                className="text-[#0B8F86]"
              />

              Limited-time offers from sellers on Koombo
            </p>
          </div>

          {!loading &&
            deals.length > 0 && (
              <Link
                href="/search?category=flash-deals"
                className="
                  hidden
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition-all
                  hover:border-[#BFE9E5]
                  hover:bg-[#F4FCFB]
                  hover:text-[#0B8F86]
                  sm:flex
                "
              >
                See All
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            )}
        </div>

        {/* =====================================================
            HORIZONTAL FEED
        ====================================================== */}
        <div
          className="
            flex
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            pb-5
            scrollbar-hide
          "
        >

          {/* ===================================================
              SKELETONS
          ==================================================== */}
          {loading &&
            [1, 2, 3, 4].map(
              (s) => (
                <div
                  key={s}
                  className="
                    flex
                    w-[280px]
                    flex-none
                    snap-start
                    overflow-hidden
                    rounded-[26px]
                    border
                    border-gray-100
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="w-full">

                    <div className="aspect-[4/5] animate-pulse bg-gray-100" />

                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />

                      <div className="flex items-end justify-between">
                        <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" />

                        <div className="h-10 w-20 animate-pulse rounded-xl bg-gray-100" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

          {/* ===================================================
              EMPTY
          ==================================================== */}
          {!loading &&
            deals.length === 0 && (
              <div className="w-full rounded-[26px] border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Zap
                    className="text-gray-400"
                    size={25}
                  />
                </div>

                <h3 className="font-semibold text-gray-900">
                  No flash deals right now
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Check back soon for new limited-time offers.
                </p>
              </div>
            )}

          {/* ===================================================
              DEALS
          ==================================================== */}
          {!loading &&
            deals.map((deal) => (
              <VideoDealCard
                key={deal.id}
                deal={deal}
                now={now}
              />
            ))}
        </div>

        {/* =====================================================
            MOBILE SEE ALL
        ====================================================== */}
        {!loading &&
          deals.length > 0 && (
            <div className="mt-4 flex justify-center sm:hidden">
              <Link
                href="/search?category=flash-deals"
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition-colors
                  hover:border-[#BFE9E5]
                  hover:bg-[#F4FCFB]
                  hover:text-[#0B8F86]
                "
              >
                Explore All Deals
                <ChevronRight size={16} />
              </Link>
            </div>
          )}
      </div>

      {/* =======================================================
          SCROLLBAR
      ======================================================== */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
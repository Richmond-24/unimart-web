"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  Star,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  CheckCircle2,
  ArrowRight,
  Eye,
  X,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Sparkles,
  Tag,
  ShoppingBag,
} from "lucide-react";

import apiFetch from "../../lib/apiClient";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FashionItem {
  _id: string;
  id?: string;

  title: string;

  price: number | string;
  originalPrice?: number | string;

  sellerName?: string;
  seller?: string;

  imageUrls?: string[];
  images?: string[];

  videoUrl?: string;
  video?: string;

  rating?: number | string;
  reviewCount?: number;

  isNewArrival?: boolean;
  newArrival?: boolean;

  category?: string;

  discountPercent?: number;

  likes?: number;
  views?: number;

  isVerified?: boolean;

  condition?: string;

  description?: string;
  location?: string;
}

interface VideoFashionCardProps {
  item: FashionItem;
}

interface ShopLayerProps {
  item: FashionItem;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(price: number | string | undefined) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "GH₵0";
  }

  return `GH₵${numericPrice.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getImage(item: FashionItem) {
  if (item.imageUrls?.length) {
    return item.imageUrls[0];
  }

  if (item.images?.length) {
    return item.images[0];
  }

  return "";
}

function getVideo(item: FashionItem) {
  return item.videoUrl || item.video || "";
}

function getSellerName(item: FashionItem) {
  return item.sellerName || item.seller || "Koombo Seller";
}

function getDiscountPercent(item: FashionItem) {
  if (
    typeof item.discountPercent === "number" &&
    item.discountPercent > 0
  ) {
    return Math.round(item.discountPercent);
  }

  const price = Number(item.price);
  const originalPrice = Number(item.originalPrice);

  if (
    Number.isFinite(price) &&
    Number.isFinite(originalPrice) &&
    originalPrice > price
  ) {
    return Math.round(
      ((originalPrice - price) / originalPrice) * 100
    );
  }

  return 0;
}

function formatCompactNumber(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
}

function getConditionLabel(condition?: string) {
  if (!condition) return null;

  const value = condition.toLowerCase();

  if (value.includes("new")) {
    return "Brand New";
  }

  if (value.includes("slight") || value.includes("like")) {
    return "Like New";
  }

  if (value.includes("good")) {
    return "Good Condition";
  }

  return condition;
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] bg-white">
      <div className="aspect-[4/5] animate-pulse bg-gray-200" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fashion Product Card                                                       */
/* -------------------------------------------------------------------------- */

function VideoFashionCard({
  item,
}: VideoFashionCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShopLayer, setShowShopLayer] = useState(false);

  const image = getImage(item);
  const video = getVideo(item);

  const hasVideo = Boolean(video);

  const sellerName = getSellerName(item);
  const discount = getDiscountPercent(item);

  const likes = formatCompactNumber(item.likes);
  const views = formatCompactNumber(item.views);

  const conditionLabel = getConditionLabel(item.condition);

  /* ---------------------------------------------------------------------- */
  /* Intersection observer                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !hasVideo) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoElement
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              setIsPlaying(false);
            });
        } else {
          videoElement.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: 0.55,
      }
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [hasVideo]);

  /* ---------------------------------------------------------------------- */
  /* Play                                                                    */
  /* ---------------------------------------------------------------------- */

  const togglePlay = (
    event?: React.MouseEvent
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (videoElement.paused) {
      videoElement
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Mute                                                                    */
  /* ---------------------------------------------------------------------- */

  const toggleMute = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    videoElement.muted = !videoElement.muted;

    setIsMuted(videoElement.muted);
  };

  /* ---------------------------------------------------------------------- */
  /* Share                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleShare = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const id = item._id || item.id;

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/listings/${id}`
        : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: `Check out ${item.title} on Koombo`,
          url: shareUrl,
        });
      } else if (
        navigator.clipboard &&
        shareUrl
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );
      }
    } catch {
      // User cancelled sharing.
    }
  };

  return (
    <>
      <article
        className="
          group
          relative
          overflow-hidden
          rounded-[26px]
          bg-black
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Media                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            relative
            aspect-[4/5]
            w-full
            overflow-hidden
            bg-gray-100
          "
          onClick={togglePlay}
        >
          {hasVideo ? (
            <video
              ref={videoRef}
              src={video}
              poster={image || undefined}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.02]
              "
            />
          ) : image ? (
            <img
              src={image}
              alt={item.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.02]
              "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ShoppingBag
                size={42}
                className="text-gray-300"
              />
            </div>
          )}

          {/* Gradient */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/85
              via-black/10
              to-black/10
            "
          />

          {/* ---------------------------------------------------------------- */}
          {/* Top badges                                                       */}
          {/* ---------------------------------------------------------------- */}

          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {discount > 0 && (
              <span
                className="
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-gray-900
                  shadow-lg
                "
              >
                {discount}% off
              </span>
            )}

            {(item.isNewArrival ||
              item.newArrival) && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  bg-[#0B8F86]
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-white
                  shadow-lg
                "
              >
                <Sparkles size={12} />
                NEW
              </span>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Mute                                                             */}
          {/* ---------------------------------------------------------------- */}

          {hasVideo && (
            <button
              type="button"
              aria-label={
                isMuted
                  ? "Unmute video"
                  : "Mute video"
              }
              onClick={toggleMute}
              className="
                absolute
                right-3
                top-3
                z-20
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-black/45
                text-white
                backdrop-blur-md
                transition
                hover:bg-black/65
              "
            >
              {isMuted ? (
                <VolumeX size={17} />
              ) : (
                <Volume2 size={17} />
              )}
            </button>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Play                                                             */}
          {/* ---------------------------------------------------------------- */}

          {hasVideo && !isPlaying && (
            <button
              type="button"
              aria-label="Play video"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                togglePlay();
              }}
              className="
                absolute
                left-1/2
                top-1/2
                z-20
                flex
                h-14
                w-14
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/90
                text-gray-900
                shadow-xl
                backdrop-blur
                transition
                hover:scale-105
              "
            >
              <Play
                size={22}
                fill="currentColor"
                className="ml-0.5"
              />
            </button>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Social controls                                                   */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              absolute
              bottom-[130px]
              right-3
              z-20
              flex
              flex-col
              items-center
              gap-4
            "
          >
            {/* Like */}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsLiked((value) => !value);
              }}
              className="flex flex-col items-center gap-1 text-white"
              aria-label={
                isLiked ? "Unlike" : "Like"
              }
            >
              <span
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  transition
                  hover:scale-105
                  ${
                    isLiked
                      ? "text-red-500"
                      : "text-white"
                  }
                `}
              >
                <Heart
                  size={19}
                  fill={
                    isLiked
                      ? "currentColor"
                      : "none"
                  }
                />
              </span>

              {likes && (
                <span className="text-[10px] font-medium text-white">
                  {likes}
                </span>
              )}
            </button>

            {/* Comments */}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="flex flex-col items-center gap-1 text-white"
              aria-label="Comments"
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  transition
                  hover:scale-105
                "
              >
                <MessageCircle size={19} />
              </span>
            </button>

            {/* Save */}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsSaved((value) => !value);
              }}
              className="flex flex-col items-center gap-1 text-white"
              aria-label={
                isSaved ? "Unsave" : "Save"
              }
            >
              <span
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  transition
                  hover:scale-105
                  ${
                    isSaved
                      ? "text-[#0B8F86]"
                      : "text-white"
                  }
                `}
              >
                <Bookmark
                  size={19}
                  fill={
                    isSaved
                      ? "currentColor"
                      : "none"
                  }
                />
              </span>
            </button>

            {/* Share */}

            <button
              type="button"
              onClick={handleShare}
              className="flex flex-col items-center gap-1 text-white"
              aria-label="Share"
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  transition
                  hover:scale-105
                "
              >
                <Share2 size={18} />
              </span>
            </button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Product information                                              */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-10
              p-4
              pr-16
            "
          >
            {/* Seller */}

            <div className="mb-2 flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-xs
                  font-bold
                  text-[#0B4F5C]
                "
              >
                {sellerName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate text-xs font-semibold text-white">
                    {sellerName}
                  </span>

                  {item.isVerified && (
                    <CheckCircle2
                      size={13}
                      className="shrink-0 text-[#21D4C5]"
                      fill="currentColor"
                    />
                  )}
                </div>

                {item.location && (
                  <p className="truncate text-[10px] text-white/70">
                    {item.location}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}

            <h3
              className="
                line-clamp-2
                text-sm
                font-semibold
                leading-5
                text-white
              "
            >
              {item.title}
            </h3>

            {/* Price */}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {formatPrice(item.price)}
              </span>

              {item.originalPrice &&
                Number(item.originalPrice) >
                  Number(item.price) && (
                  <span className="text-xs text-white/55 line-through">
                    {formatPrice(
                      item.originalPrice
                    )}
                  </span>
                )}
            </div>

            {/* Rating / Views */}

            <div className="mt-1 flex items-center gap-3 text-[10px] text-white/75">
              {item.rating !== undefined &&
                item.rating !== null && (
                  <span className="flex items-center gap-1">
                    <Star
                      size={11}
                      fill="currentColor"
                      className="text-yellow-400"
                    />

                    {Number(item.rating).toFixed(
                      1
                    )}

                    {item.reviewCount !==
                      undefined && (
                      <span>
                        ({item.reviewCount})
                      </span>
                    )}
                  </span>
                )}

              {views && (
                <span className="flex items-center gap-1">
                  <Eye size={11} />
                  {views}
                </span>
              )}
            </div>

            {/* View Product */}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setShowShopLayer(true);
              }}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0B8F86]
                px-4
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                transition
                hover:bg-[#087A73]
                active:scale-[0.98]
              "
            >
              View Product
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Condition badge                                                  */}
          {/* ---------------------------------------------------------------- */}

          {conditionLabel && (
            <div className="absolute bottom-3 left-3 z-20">
              <div
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  bg-black/45
                  px-2.5
                  py-1.5
                  text-white
                  backdrop-blur-md
                "
              >
                <Tag size={11} />

                <span className="text-[10px] font-bold">
                  {conditionLabel}
                </span>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* ------------------------------------------------------------------ */}
      {/* Shop Layer                                                         */}
      {/* ------------------------------------------------------------------ */}

      {showShopLayer && (
        <ShopLayer
          item={item}
          onClose={() =>
            setShowShopLayer(false)
          }
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Shop Layer                                                                 */
/* -------------------------------------------------------------------------- */

function ShopLayer({
  item,
  onClose,
}: ShopLayerProps) {
  const [quantity, setQuantity] = useState(1);

  const image = getImage(item);
  const video = getVideo(item);
  const sellerName = getSellerName(item);
  const discount = getDiscountPercent(item);
  const conditionLabel = getConditionLabel(
    item.condition
  );

  const price = Number(item.price) || 0;
  const total = price * quantity;

  /* ---------------------------------------------------------------------- */
  /* Lock background scroll                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Escape key                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  /* ---------------------------------------------------------------------- */
  /* Continue                                                               */
  /* ---------------------------------------------------------------------- */

  const handleContinue = () => {
    const id = item._id || item.id;

    if (!id) return;

    window.location.href = `/listings/${id}`;
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-end
        justify-center
        bg-black/60
        backdrop-blur-sm
        overscroll-none
      "
      role="dialog"
      aria-modal="true"
      aria-label="Product details"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          flex
          w-full
          max-w-2xl
          min-h-0
          max-h-[92dvh]
          flex-col
          overflow-hidden
          rounded-t-[28px]
          bg-white
          shadow-2xl
          sm:max-h-[90dvh]
          sm:rounded-[28px]
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Handle */}

        <div
          className="
            flex
            shrink-0
            justify-center
            bg-white
            pt-2
            pb-1
          "
        >
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        {/* Close */}

        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-black/55
            text-white
            backdrop-blur-md
            transition
            hover:bg-black/70
          "
        >
          <X size={19} />
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Scrollable content                                                */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            [-webkit-overflow-scrolling:touch]
          "
        >
          {/* Product media */}

          <div
            className="
              relative
              h-[190px]
              w-full
              overflow-hidden
              bg-gray-100
              min-[375px]:h-[220px]
              sm:h-[280px]
              md:h-[320px]
            "
          >
            {video ? (
              <video
                src={video}
                poster={image || undefined}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            ) : image ? (
              <img
                src={image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No product image
              </div>
            )}

            {discount > 0 && (
              <div
                className="
                  absolute
                  left-4
                  top-4
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-gray-900
                  shadow-lg
                "
              >
                {discount}% off
              </div>
            )}
          </div>

          {/* Details */}

          <div className="space-y-5 p-4 sm:p-6">
            {/* Heading */}

            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#0B8F86]">
                    {item.category ||
                      "Fashion"}
                  </p>

                  <h2
                    className="
                      text-xl
                      font-bold
                      leading-tight
                      text-gray-900
                      sm:text-2xl
                    "
                  >
                    {item.title}
                  </h2>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {formatPrice(item.price)}
                  </p>

                  {item.originalPrice &&
                    Number(item.originalPrice) >
                      Number(item.price) && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatPrice(
                          item.originalPrice
                        )}
                      </p>
                    )}
                </div>
              </div>

              {/* Rating */}

              {(item.rating !== undefined ||
                item.reviewCount !== undefined) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {item.rating !== undefined &&
                    item.rating !== null && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        {Number(
                          item.rating
                        ).toFixed(1)}
                      </span>
                    )}

                  {item.reviewCount !==
                    undefined && (
                    <span className="text-xs text-gray-500">
                      {item.reviewCount}{" "}
                      {item.reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  )}
                </div>
              )}

              {/* Condition */}

              {conditionLabel && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  <Tag size={13} />
                  {conditionLabel}
                </div>
              )}
            </div>

            {/* Description */}

            {item.description && (
              <div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">
                  About this product
                </h3>

                <p className="text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            )}

            {/* Seller */}

            <div
              className="
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
                p-4
              "
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Seller
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0B4F5C]
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {sellerName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {sellerName}
                    </p>

                    {item.isVerified && (
                      <CheckCircle2
                        size={14}
                        className="shrink-0 text-[#0B8F86]"
                        fill="currentColor"
                      />
                    )}
                  </div>

                  {item.location && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {item.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery / protection */}

            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-100
                  p-4
                "
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F5] text-[#0B8F86]">
                  <Truck size={17} />
                </div>

                <h3 className="text-sm font-semibold text-gray-900">
                  Delivery
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Delivery details are shown before you complete your purchase.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-gray-100
                  p-4
                "
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F5] text-[#0B8F86]">
                  <ShieldCheck size={17} />
                </div>

                <h3 className="text-sm font-semibold text-gray-900">
                  Secure shopping
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Review the seller and product details before ordering.
                </p>
              </div>
            </div>

            {/* Quantity */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Quantity
                </h3>

                <span className="text-xs text-gray-500">
                  {formatPrice(total)} total
                </span>
              </div>

              <div
                className="
                  flex
                  w-fit
                  items-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                "
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => {
                    setQuantity((value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                    );
                  }}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  <Minus size={16} />
                </button>

                <span
                  className="
                    flex
                    h-11
                    min-w-10
                    items-center
                    justify-center
                    border-x
                    border-gray-200
                    px-3
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    setQuantity((value) =>
                      Math.min(
                        99,
                        value + 1
                      )
                    );
                  }}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="h-2" />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Sticky Continue button                                           */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            shrink-0
            border-t
            border-gray-100
            bg-white
            px-4
            pt-3
            pb-[calc(12px+env(safe-area-inset-bottom))]
            sm:px-6
            sm:pt-4
          "
        >
          <button
            type="button"
            onClick={handleContinue}
            className="
              flex
              min-h-[50px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[#0B8F86]
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-[#0B8F86]/20
              transition
              hover:bg-[#087A73]
              active:scale-[0.99]
            "
          >
            Continue
            <ArrowRight size={17} />
          </button>

          <p className="mt-2 text-center text-[10px] text-gray-400">
            Review product details and complete your purchase
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Fashion Section                                                       */
/* -------------------------------------------------------------------------- */

export default function FashionDealsVideo() {
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch(
          "/public/listings?category=Fashion&limit=12"
        );

        if (!mounted) return;

        let data: any[] = [];

        if (
          res?.success &&
          Array.isArray(res.data)
        ) {
          data = res.data;
        } else if (
          Array.isArray(res?.data)
        ) {
          data = res.data;
        } else if (Array.isArray(res)) {
          data = res;
        }

        const mapped: FashionItem[] =
          data
            .map((p: any) => {
              const price =
                p?.price ??
                p?.amount ??
                0;

              const originalPrice =
                p?.originalPrice ??
                p?.listPrice;

              let discountPercent =
                p?.discountPercent;

              if (
                (!discountPercent ||
                  discountPercent <= 0) &&
                Number(originalPrice) >
                  Number(price)
              ) {
                discountPercent =
                  Math.round(
                    ((Number(
                      originalPrice
                    ) -
                      Number(price)) /
                      Number(
                        originalPrice
                      )) *
                      100
                  );
              }

              const rawImages =
                p?.imageUrls ??
                p?.images ??
                (p?.image
                  ? [p.image]
                  : []);

              return {
                ...p,

                _id:
                  p?._id ||
                  p?.id ||
                  "",

                id: p?.id,

                title:
                  p?.title ||
                  p?.name ||
                  "Fresh fashion find",

                price,

                originalPrice,

                sellerName:
                  p?.sellerName ||
                  p?.seller?.name ||
                  p?.seller?.username,

                imageUrls:
                  Array.isArray(
                    rawImages
                  )
                    ? rawImages.filter(
                        Boolean
                      )
                    : [],

                videoUrl:
                  p?.videoUrl ||
                  p?.video ||
                  undefined,

                isNewArrival:
                  Boolean(
                    p?.isNewArrival ||
                      p?.newArrival
                  ),

                isVerified:
                  Boolean(
                    p?.isVerified ||
                      p?.verified
                  ),

                discountPercent,

                likes:
                  typeof p?.likes ===
                  "number"
                    ? p.likes
                    : undefined,

                views:
                  typeof p?.views ===
                  "number"
                    ? p.views
                    : undefined,

                rating:
                  p?.rating,

                reviewCount:
                  p?.reviewCount,

                condition:
                  p?.condition,

                description:
                  p?.description,

                location:
                  p?.location ||
                  p?.seller?.location,

                category:
                  p?.category ||
                  "Fashion",
              };
            })
            .filter(
              (item: FashionItem) =>
                Boolean(item._id)
            );

        setItems(mapped);
      } catch (err) {
        console.error(
          "Error loading fashion listings:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load fashion products right now."
          );

          setItems([]);
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
      className="w-full py-8 sm:py-12"
      style={{
        background: "var(--bg)",
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0B8F86]">
              Koombo Fashion
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Fashion Picks
            </h2>

            <p className="mt-1 max-w-xl text-sm text-gray-500">
              Discover fashion through videos and shop directly from sellers.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                             */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div
            className="
              mb-6
              rounded-2xl
              border
              border-red-100
              bg-red-50
              p-5
              text-center
            "
          >
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Grid                                                              */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:gap-4
            lg:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-5
          "
        >
          {loading &&
            Array.from({ length: 8 }).map(
              (_, index) => (
                <CardSkeleton
                  key={index}
                />
              )
            )}

          {!loading &&
            items.map((item) => (
              <VideoFashionCard
                key={
                  item._id ||
                  item.id
                }
                item={item}
              />
            ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Empty                                                             */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          items.length === 0 &&
          !error && (
            <div
              className="
                rounded-3xl
                border
                border-gray-100
                bg-gray-50
                px-6
                py-14
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[#0B8F86]
                  shadow-sm
                "
              >
                <ShoppingBag size={22} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Nothing to discover yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                New fashion products and videos will appear here as sellers start sharing on Koombo.
              </p>
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* See all                                                           */}
        {/* ---------------------------------------------------------------- */}

        {!loading &&
          items.length > 0 && (
            <div className="mt-8 flex justify-center sm:mt-10">
              <Link
                href="/search?category=Fashion"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-gray-900
                  transition
                  duration-300
                  hover:border-[#0B8F86]
                  hover:text-[#0B8F86]
                  hover:shadow-xl
                "
              >
                See all Fashion

                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          )}
      </div>
    </section>
  );
}
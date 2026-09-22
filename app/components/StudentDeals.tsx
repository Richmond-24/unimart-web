"use client";

import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

import { apiFetch } from "@/lib/apiClient";

interface DealItem {
  _id: string;
  id?: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;

  sellerName?: string;
  seller?: string;

  imageUrls?: string[];
  videoUrl?: string;

  rating?: number | string;
  reviewCount?: number;

  isVerified?: boolean;
  discountPercent?: number;

  likes?: number;
  views?: number;

  description?: string;
  location?: string;
  category?: string;
}

interface SocialProductCardProps {
  item: DealItem;
  index: number;
}

interface ShopLayerProps {
  item: DealItem;
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

function getDiscountPercent(item: DealItem) {
  if (item.discountPercent && item.discountPercent > 0) {
    return Math.round(item.discountPercent);
  }

  const price = Number(item.price);
  const originalPrice = Number(item.originalPrice);

  if (
    Number.isFinite(price) &&
    Number.isFinite(originalPrice) &&
    originalPrice > price
  ) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return 0;
}

function getImage(item: DealItem) {
  if (item.imageUrls?.length) {
    return item.imageUrls[0];
  }

  return "";
}

function getSellerName(item: DealItem) {
  return (
    item.sellerName ||
    item.seller ||
    "Koombo Seller"
  );
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

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white">
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
/* Social Product Card                                                        */
/* -------------------------------------------------------------------------- */

function SocialProductCard({
  item,
  index,
}: SocialProductCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShopLayer, setShowShopLayer] = useState(false);

  const image = getImage(item);
  const sellerName = getSellerName(item);
  const discount = getDiscountPercent(item);

  const likes = formatCompactNumber(item.likes);
  const views = formatCompactNumber(item.views);

  /* ---------------------------------------------------------------------- */
  /* Video observer                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !item.videoUrl) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              setIsPlaying(false);
            });
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: 0.55,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [item.videoUrl]);

  /* ---------------------------------------------------------------------- */
  /* Video controls                                                         */
  /* ---------------------------------------------------------------------- */

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  /* ---------------------------------------------------------------------- */
  /* Share                                                                   */
  /* ---------------------------------------------------------------------- */

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/listings/${item._id || item.id}`
        : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: `Check out ${item.title} on Koombo`,
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // User cancelled share.
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
          {item.videoUrl ? (
            <video
              ref={videoRef}
              src={item.videoUrl}
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
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
              No media
            </div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Dark gradient                                                   */}
          {/* -------------------------------------------------------------- */}

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

          {/* -------------------------------------------------------------- */}
          {/* Discount                                                        */}
          {/* -------------------------------------------------------------- */}

          {discount > 0 && (
            <div
              className="
                absolute
                left-3
                top-3
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

          {/* -------------------------------------------------------------- */}
          {/* Play button                                                     */}
          {/* -------------------------------------------------------------- */}

          {item.videoUrl && !isPlaying && (
            <button
              type="button"
              aria-label="Play video"
              onClick={(event) => {
                event.stopPropagation();
                togglePlay();
              }}
              className="
                absolute
                left-1/2
                top-1/2
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

          {/* -------------------------------------------------------------- */}
          {/* Mute                                                            */}
          {/* -------------------------------------------------------------- */}

          {item.videoUrl && (
            <button
              type="button"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              onClick={(event) => {
                event.stopPropagation();
                toggleMute();
              }}
              className="
                absolute
                right-3
                top-3
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

          {/* -------------------------------------------------------------- */}
          {/* Social actions                                                   */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              absolute
              bottom-[130px]
              right-3
              z-10
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
                event.stopPropagation();
                setIsLiked((value) => !value);
              }}
              className="flex flex-col items-center gap-1 text-white"
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
                  fill={isLiked ? "currentColor" : "none"}
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
                event.stopPropagation();
              }}
              className="flex flex-col items-center gap-1 text-white"
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
                event.stopPropagation();
                setIsSaved((value) => !value);
              }}
              className="flex flex-col items-center gap-1 text-white"
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
                  fill={isSaved ? "currentColor" : "none"}
                />
              </span>
            </button>

            {/* Share */}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleShare();
              }}
              className="flex flex-col items-center gap-1 text-white"
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

          {/* -------------------------------------------------------------- */}
          {/* Product information                                              */}
          {/* -------------------------------------------------------------- */}

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
                {sellerName.charAt(0).toUpperCase()}
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
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
            </div>

            {/* Rating / views */}

            <div className="mt-1 flex items-center gap-3 text-[10px] text-white/75">
              {item.rating !== undefined &&
                item.rating !== null && (
                  <span className="flex items-center gap-1">
                    <Star
                      size={11}
                      fill="currentColor"
                      className="text-yellow-400"
                    />

                    {Number(item.rating).toFixed(1)}

                    {item.reviewCount !== undefined && (
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

            {/* View product */}

            <button
              type="button"
              onClick={(event) => {
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
        </div>
      </article>

      {/* Shop Layer */}

      {showShopLayer && (
        <ShopLayer
          item={item}
          onClose={() => setShowShopLayer(false)}
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
  const sellerName = getSellerName(item);
  const discount = getDiscountPercent(item);

  const price = Number(item.price) || 0;
  const total = price * quantity;

  /* ---------------------------------------------------------------------- */
  /* Lock body scroll                                                       */
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
    const handleKeyDown = (event: KeyboardEvent) => {
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
        if (event.target === event.currentTarget) {
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
        {/* -------------------------------------------------------------- */}
        {/* Handle                                                           */}
        {/* -------------------------------------------------------------- */}

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

        {/* -------------------------------------------------------------- */}
        {/* Close                                                            */}
        {/* -------------------------------------------------------------- */}

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

        {/* -------------------------------------------------------------- */}
        {/* Scrollable content                                               */}
        {/* -------------------------------------------------------------- */}

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
            {item.videoUrl ? (
              <video
                src={item.videoUrl}
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

          {/* Main details */}

          <div className="space-y-5 p-4 sm:p-6">
            {/* Product heading */}

            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#0B8F86]">
                    {item.category || "Product"}
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
                        {formatPrice(item.originalPrice)}
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
                        {Number(item.rating).toFixed(1)}
                      </span>
                    )}

                  {item.reviewCount !== undefined && (
                    <span className="text-xs text-gray-500">
                      {item.reviewCount}{" "}
                      {item.reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  )}
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
                  {sellerName.charAt(0).toUpperCase()}
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

            {/* Delivery + protection */}

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
                      Math.max(1, value - 1)
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

                <span className="flex h-11 min-w-10 items-center justify-center border-x border-gray-200 px-3 text-sm font-bold text-gray-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    setQuantity((value) =>
                      Math.min(99, value + 1)
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

            {/* Bottom spacing */}

            <div className="h-2" />
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Sticky bottom action                                             */}
        {/* -------------------------------------------------------------- */}

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
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function StudentDealsVideo() {
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          "/public/services?limit=12";

        const res = await apiFetch(endpoint, {
          suppressErrorLog: true,
        });

        if (!mounted) return;

        const rawProducts = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.services)
          ? res.services
          : [];

        const mappedProducts: DealItem[] =
          rawProducts
            .map((p: any) => {
              const price =
                p?.price ??
                p?.amount ??
                0;

              const originalPrice =
                p?.originalPrice ??
                p?.listPrice;

              const rawImages =
                p?.imageUrls ??
                p?.images ??
                (p?.image
                  ? [p.image]
                  : []);

              const imageUrls = Array.isArray(
                rawImages
              )
                ? rawImages.filter(
                    Boolean
                  )
                : [];

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
                    ((Number(originalPrice) -
                      Number(price)) /
                      Number(originalPrice)) *
                      100
                  );
              }

              return {
                _id:
                  p?._id ||
                  p?.id ||
                  "",
                id: p?.id,

                title:
                  p?.title ||
                  p?.name ||
                  "Untitled product",

                price,

                originalPrice,

                sellerName:
                  p?.sellerName ||
                  p?.seller?.name ||
                  p?.seller?.username,

                seller:
                  p?.seller,

                imageUrls,

                videoUrl:
                  p?.videoUrl ||
                  p?.video,

                rating:
                  p?.rating,

                reviewCount:
                  p?.reviewCount,

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

                description:
                  p?.description,

                location:
                  p?.location ||
                  p?.seller?.location,

                category:
                  p?.category,
              };
            })
            .filter(
              (item: DealItem) =>
                Boolean(item._id)
            );

        setItems(mappedProducts);
      } catch (err) {
        console.error(
          "Failed to load Koombo products:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load products right now."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Loading state                                                           */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <section className="w-full">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>

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
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <CardSkeleton
                key={index}
              />
            )
          )}
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Error state                                                             */
  /* ---------------------------------------------------------------------- */

  if (error) {
    return (
      <section className="w-full">
        <div
          className="
            rounded-2xl
            border
            border-red-100
            bg-red-50
            p-6
            text-center
          "
        >
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="
              mt-4
              rounded-xl
              bg-[#0B8F86]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#087A73]
            "
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Empty state                                                             */
  /* ---------------------------------------------------------------------- */

  if (!items.length) {
    return (
      <section className="w-full">
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
            <Play size={22} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Nothing to discover yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            New products and videos will appear here as sellers start sharing on Koombo.
          </p>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main feed                                                               */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="w-full">
      {/* Header */}

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0B8F86]">
            Koombo
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Discover
          </h2>

          <p className="mt-1 max-w-xl text-sm text-gray-500">
            Watch products, discover sellers and shop without leaving the experience.
          </p>
        </div>
      </div>

      {/* Product feed */}

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
        {items.map((item, index) => (
          <SocialProductCard
            key={item._id || item.id || index}
            item={item}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
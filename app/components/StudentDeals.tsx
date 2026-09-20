"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  Star,
  Heart,
  ShoppingCart,
  CheckCircle2,
  Zap,
  TrendingUp,
  ArrowRight,
  Eye,
} from "lucide-react";

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
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  discountPercent?: number;
  likes?: number;
  views?: number;
}

interface SocialProductCardProps {
  item: DealItem;
}

function SocialProductCard({ item }: SocialProductCardProps) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const hasVideo = Boolean(item.videoUrl);
  const image = item.imageUrls?.[0];
  const id = item._id || item.id;

  const price =
    typeof item.price === "number"
      ? `GH₵${item.price.toLocaleString()}`
      : item.price;

  const originalPrice =
    item.originalPrice !== undefined
      ? typeof item.originalPrice === "number"
        ? `GH₵${item.originalPrice.toLocaleString()}`
        : item.originalPrice
      : null;

  // Auto-play logic when in viewport
  useEffect(() => {
    if (!hasVideo || !mediaRef.current || !cardRef.current) return;

    const video = mediaRef.current;
    
    // Initial state setup
    video.muted = isMuted;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          // Only auto-play if user hasn't explicitly paused it via UI interaction recently
          // For this demo, we'll allow auto-play but keep it muted
          video.play().then(() => {
            setIsPlaying(true);
            setShowPlayOverlay(false);
          }).catch(() => {
            // Autoplay blocked or failed
            setIsPlaying(false);
            setShowPlayOverlay(true);
          });
        } else {
          video.pause();
          setIsPlaying(false);
          setShowPlayOverlay(true);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasVideo, isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mediaRef.current) return;

    if (mediaRef.current.paused) {
      mediaRef.current.play().then(() => {
        setIsPlaying(true);
        setShowPlayOverlay(false);
      }).catch(err => console.error("Play error:", err));
    } else {
      mediaRef.current.pause();
      setIsPlaying(false);
      setShowPlayOverlay(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mediaRef.current) return;

    const newMutedState = !isMuted;
    mediaRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => !prev);
  };

  return (
    <Link href={`/listings/${id}`} className="group block h-full">
      <div
        ref={cardRef}
        className="
          relative
          h-full
          flex flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          border border-gray-100
          shadow-sm
          transition-all
          duration-500
          hover:-translate-y-2
          hover:shadow-2xl
          hover:border-gray-200
        "
      >
        {/* =========================================================
            MEDIA CONTAINER
        ========================================================== */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
          
          {/* Video or Image */}
          {hasVideo ? (
            <video
              ref={mediaRef}
              src={item.videoUrl}
              poster={image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay} // Tap anywhere on video to toggle play
            />
          ) : image ? (
            <img
              src={image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ShoppingCart className="text-gray-300" size={48} />
            </div>
          )}

          {/* Gradients for text readability */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* =========================================================
              TOP BADGES & ACTIONS
          ========================================================== */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 max-w-[80%]">
            {item.discountPercent && item.discountPercent > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg animate-pulse-slow">
                -{item.discountPercent}% OFF
              </span>
            )}
            
            {item.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                <CheckCircle2 size={10} fill="currentColor" />
                Verified
              </span>
            )}
          </div>

          {/* =========================================================
              VIDEO INTERACTION CONTROLS
          ========================================================== */}
          {hasVideo && (
            <>
              {/* Central Play/Pause Overlay (Visible when paused or initial load) */}
              {showPlayOverlay && (
                <button
                  onClick={togglePlay}
                  className="
                    absolute
                    inset-0
                    m-auto
                    z-30
                    w-16
                    h-16
                    rounded-full
                    bg-white/20
                    backdrop-blur-md
                    border border-white/40
                    flex
                    items-center
                    justify-center
                    text-white
                    hover:bg-white/30
                    hover:scale-110
                    transition-all
                    duration-300
                    shadow-xl
                  "
                  aria-label="Play video"
                >
                  <Play size={32} fill="white" className="ml-1" />
                </button>
              )}

              {/* Small Play Indicator when playing (Optional, can be removed if clean look preferred) */}
              {!showPlayOverlay && (
                 <div className="absolute top-4 right-4 z-20 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-bold flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                   LIVE PREVIEW
                 </div>
              )}

              {/* Mute Toggle - Bottom Left of Media */}
              <button
                onClick={toggleMute}
                className="
                  absolute
                  bottom-4
                  left-4
                  z-20
                  w-9
                  h-9
                  rounded-full
                  bg-black/40
                  backdrop-blur-md
                  border border-white/10
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:bg-black/60
                  transition
                "
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </>
          )}

          {/* =========================================================
              SOCIAL ACTIONS (RIGHT SIDE) - CLEANED UP
          ========================================================== */}
          <div className="absolute right-3 bottom-32 z-20 flex flex-col gap-3">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="group/btn flex flex-col items-center gap-1"
              aria-label={liked ? "Unlike" : "Like"}
            >
              <div
                className={`
                  w-10 h-10
                  rounded-full
                  backdrop-blur-md
                  border border-white/10
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  ${
                    liked
                      ? "bg-red-500 border-red-500 shadow-red-500/30 shadow-lg"
                      : "bg-black/40 hover:bg-black/60"
                  }
                `}
              >
                <Heart
                  size={18}
                  className={`transition-colors duration-300 ${liked ? "text-white" : "text-white"}`}
                  fill={liked ? "white" : "none"}
                />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {(item.likes || 0).toLocaleString()}
              </span>
            </button>

            {/* View Count (Replaced Share/Message with Views for Social Proof) */}
            {item.views && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                  <Eye size={18} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {(item.views / 1000).toFixed(1)}k
                </span>
              </div>
            )}
          </div>

          {/* =========================================================
              BOTTOM MEDIA INFO
          ========================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pr-12">
            {/* Seller Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 text-xs font-bold shadow-sm border border-white/20">
                {(item.sellerName || item.seller || "S")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/90 text-xs font-medium truncate drop-shadow-sm">
                  {item.sellerName || item.seller || "Verified Seller"}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-base font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">
              {item.title}
            </h3>
            
            {/* Rating Mini */}
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star size={10} className="text-yellow-400" fill="currentColor" />
                <span className="text-white/80 text-[10px] font-medium">{item.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            FOOTER / PRICE ACTION
        ========================================================== */}
        <div className="p-4 flex items-center justify-between bg-white mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium mb-0.5">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                {price}
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to cart logic here
            }}
            className="
              shrink-0
              w-10 h-10
              rounded-xl
              bg-gray-900
              text-white
              flex items-center justify-center
              hover:bg-gray-800
              hover:scale-105
              active:scale-95
              transition-all
              shadow-lg shadow-gray-900/20
            "
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ================================================================
   SKELETON LOADER
================================================================ */
function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="aspect-[4/5] bg-gray-100 animate-pulse relative">
        <div className="absolute top-4 left-4 w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="p-4 space-y-3 flex-1">
        <div className="h-4 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
        <div className="flex justify-between items-end mt-auto pt-2">
          <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN SECTION COMPONENT
================================================================ */
export default function StudentDealsVideo() {
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Using the same endpoint structure as provided
        const endpoint = "/public/services?limit=8"; 
        const res = await apiFetch(endpoint, { suppressErrorLog: true });

        let data: any[] = [];
        if (res?.success && Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res?.data)) data = res.data;
        else if (Array.isArray(res)) data = res;

        if (!mounted) return;

        const mapped = data.map((p: any) => ({
          ...p,
          _id: p._id || p.id,
          title: p.title || p.name || "Campus Deal",
          price: p.price ?? p.amount ?? 0,
          originalPrice: p.originalPrice ?? p.listPrice ?? undefined,
          sellerName: p.sellerName || p.seller?.name || p.seller?.username || "Seller",
          imageUrls: p.imageUrls || p.images || (p.image ? [p.image] : []),
          videoUrl: p.videoUrl || p.video || undefined,
          isVerified: p.isVerified ?? p.verified ?? true,
          discountPercent: p.discountPercent || (p.originalPrice && p.price ? Math.round((1 - Number(p.price) / Number(p.originalPrice)) * 100) : 0),
          likes: Number(p.likes || 0),
          views: Number(p.views || Math.floor(Math.random() * 5000)), // Mock views if missing
          rating: p.rating || (Math.random() * 2 + 3).toFixed(1), // Mock rating if missing
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Error loading deals", err);
        if (mounted) {
          setLoadError("Failed to load deals");
          setItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-12 bg-[#FAFAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Simplified */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/20 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Zap size={24} className="text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Trending Now
              </h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <TrendingUp size={16} className="text-green-500" />
                Hot deals from campus sellers
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading && Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          
          {!loading && loadError && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-900 font-semibold text-lg">{loadError}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition">
                Try Again
              </button>
            </div>
          )}

          {!loading && !loadError && items.length === 0 && (
             <div className="col-span-full py-20 text-center">
               <p className="text-gray-500">No trending deals found.</p>
             </div>
          )}

          {!loading && items.map((item) => (
            <SocialProductCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* Footer Action */}
        {items.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              href="/marketplace"
              className="
                group
                inline-flex
                items-center
                gap-3
                px-8
                py-3.5
                rounded-full
                bg-white
                border border-gray-200
                text-sm
                font-bold
                text-gray-900
                hover:border-gray-900
                hover:shadow-xl
                hover:shadow-gray-900/10
                transition-all
                duration-300
              "
            >
              Explore All Marketplace
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </section>
  );
}
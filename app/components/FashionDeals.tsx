"use client";

import React, { useEffect, useState, useRef } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  Eye, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Tag
} from "lucide-react";

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
  rating?: number;
  reviewCount?: number;
  isNewArrival?: boolean;
  newArrival?: boolean;
  category?: string;
  discountPercent?: number;
  views?: number;
  isVerified?: boolean;
  condition?: string;
}

interface VideoFashionCardProps {
  item: FashionItem;
}

function VideoFashionCard({ item }: VideoFashionCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const hasVideo = Boolean(item.videoUrl || item.video);
  const image = item.imageUrls?.[0] || item.images?.[0];
  const lid = item._id || item.id;

  const priceDisplay = typeof item.price === 'number' ? `GH₵${item.price}` : (item.price || 'Price on request');
  const originalPriceDisplay = item.originalPrice ? (typeof item.originalPrice === 'number' ? `GH₵${item.originalPrice}` : item.originalPrice) : null;

  // Determine condition styling
  const getConditionStyle = (condition?: string) => {
    if (!condition) return null;
    const lower = condition.toLowerCase();
    if (lower.includes('new')) return { bg: 'bg-emerald-500/90', text: 'text-white', label: 'Brand New' };
    if (lower.includes('slight') || lower.includes('like')) return { bg: 'bg-blue-500/90', text: 'text-white', label: 'Like New' };
    if (lower.includes('good')) return { bg: 'bg-amber-500/90', text: 'text-white', label: 'Good Condition' };
    return { bg: 'bg-gray-500/90', text: 'text-white', label: condition };
  };

  const conditionStyle = getConditionStyle(item.condition);

  // Auto-play logic when in viewport
  useEffect(() => {
    if (!hasVideo || !videoRef.current || !cardRef.current) return;

    const video = videoRef.current;
    video.muted = isMuted;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          video.play().then(() => {
            setIsPlaying(true);
            setShowPlayOverlay(false);
          }).catch(() => {
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
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setShowPlayOverlay(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayOverlay(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;

    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  };

  return (
    <Link href={`/listings/${lid}`} className="group block h-full">
      <div
        ref={cardRef}
        className="
          relative
          h-full
          flex flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          border border-gray-100
          shadow-sm
          transition-all
          duration-500
          hover:-translate-y-1
          hover:shadow-xl
          hover:border-gray-200
        "
      >
        {/* =========================================================
            MEDIA CONTAINER - RESPONSIVE ASPECT RATIO
        ========================================================== */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gray-50">
          
          {/* Video or Image */}
          {hasVideo ? (
            <video
              ref={videoRef}
              src={item.videoUrl || item.video}
              poster={image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
            />
          ) : image ? (
            <img
              src={image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ShoppingBag className="text-gray-300" size={48} />
            </div>
          )}

          {/* Gradients for text readability - Adjusted for mobile */}
          <div className="absolute inset-x-0 top-0 h-20 sm:h-32 bg-gradient-to-b from-black/50 sm:from-black/60 to-transparent pointer-events-none opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-32 sm:h-48 bg-gradient-to-t from-black/70 sm:from-black/80 via-black/30 sm:via-black/40 to-transparent pointer-events-none" />

          {/* =========================================================
              TOP BADGES & ACTIONS - COMPACT ON MOBILE
          ========================================================== */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-wrap gap-1.5 sm:gap-2 max-w-[75%] sm:max-w-[80%]">
            {item.discountPercent && item.discountPercent > 0 && (
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold shadow-lg animate-pulse-slow">
                -{item.discountPercent}% OFF
              </span>
            )}
            
            {(item.isNewArrival || item.newArrival) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-[#6C5CE7]/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold shadow-lg">
                <Sparkles size={10} className="sm:w-2.5 sm:h-2.5" />
                NEW
              </span>
            )}
          </div>

          {/* =========================================================
              VIDEO INTERACTION CONTROLS - RESPONSIVE SIZING
          ========================================================== */}
          {hasVideo && (
            <>
              {/* Central Play/Pause Overlay */}
              {showPlayOverlay && (
                <button
                  onClick={togglePlay}
                  className="
                    absolute
                    inset-0
                    m-auto
                    z-30
                    w-12 h-12 sm:w-16 sm:h-16
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
                  <Play size={24} className="sm:w-8 sm:h-8 ml-0.5 sm:ml-1" fill="white" />
                </button>
              )}

              {/* Live Preview Indicator */}
              {!showPlayOverlay && (
                 <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold flex items-center gap-1">
                   <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                   LIVE
                 </div>
              )}

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="
                  absolute
                  bottom-2
                  left-2
                  sm:bottom-4
                  sm:left-4
                  z-20
                  w-8 h-8 sm:w-9 sm:h-9
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
                {isMuted ? <VolumeX size={14} className="sm:w-4 sm:h-4" /> : <Volume2 size={14} className="sm:w-4 sm:h-4" />}
              </button>
            </>
          )}

          {/* =========================================================
              SOCIAL ACTIONS (RIGHT SIDE) - ADJUSTED POSITIONING
          ========================================================== */}
          <div className="absolute right-2 bottom-28 sm:right-3 sm:bottom-32 z-20 flex flex-col gap-2 sm:gap-3">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="group/btn flex flex-col items-center gap-0.5 sm:gap-1"
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <div
                className={`
                  w-8 h-8 sm:w-10 sm:h-10
                  rounded-full
                  backdrop-blur-md
                  border border-white/10
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  ${
                    isLiked
                      ? "bg-red-500 border-red-500 shadow-red-500/30 shadow-lg"
                      : "bg-black/40 hover:bg-black/60"
                  }
                `}
              >
                <Heart
                  size={14}
                  className="sm:w-[18px] sm:h-[18px] transition-colors duration-300 text-white"
                  fill={isLiked ? "white" : "none"}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1 sm:px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {(item.reviewCount || Math.floor(Math.random() * 500)).toLocaleString()}
              </span>
            </button>

            {/* View Count */}
            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1 sm:px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {item.views ? (item.views / 1000).toFixed(1) + 'k' : '1.2k'}
              </span>
            </div>
          </div>

          {/* =========================================================
              BOTTOM MEDIA INFO - RESPONSIVE PADDING
          ========================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5 sm:p-4 pr-10 sm:pr-12 pb-12 sm:pb-16">
            {/* Seller Info */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 text-[10px] sm:text-xs font-bold shadow-sm border border-white/20">
                {(item.sellerName || item.seller || "S")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/90 text-[10px] sm:text-xs font-medium truncate drop-shadow-sm">
                  {item.sellerName || item.seller || "Verified Seller"}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">
              {item.title}
            </h3>
          </div>

          {/* =========================================================
              VERIFIED BANNER & CONDITION BADGE - RESPONSIVE
          ========================================================== */}
          
          {/* Verified Seller Banner */}
          {item.isVerified && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 backdrop-blur-md py-1.5 sm:py-2 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 border-t border-white/10">
              <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
              <span className="text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Verified Seller</span>
            </div>
          )}

          {/* Condition Badge */}
          {conditionStyle && (
            <div className={`absolute ${item.isVerified ? 'bottom-9 sm:bottom-10' : 'bottom-2 sm:bottom-4'} left-2 sm:left-4 z-20`}>
              <div className={`
                inline-flex items-center gap-1 sm:gap-1.5 
                px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg 
                ${conditionStyle.bg} 
                ${conditionStyle.text}
                backdrop-blur-md shadow-lg border border-white/20
              `}>
                <Tag size={10} className="sm:w-3 sm:h-3" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">{conditionStyle.label}</span>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================
            FOOTER / PRICE ACTION - COMPACT FOR MOBILE
        ========================================================== */}
        <div className="p-2.5 sm:p-4 flex items-center justify-between bg-white mt-auto">
          <div className="flex flex-col min-w-0 flex-1 mr-2">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Price</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">
                {priceDisplay}
              </span>
              {originalPriceDisplay && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                  {originalPriceDisplay}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="
              shrink-0
              w-9 h-9 sm:w-10 sm:h-10
              rounded-lg sm:rounded-xl
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
            <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function FashionDealsVideo() {
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/public/listings?category=Fashion&limit=8');
        let data: any[] = [];

        if (mounted) {
          if (res?.success && Array.isArray(res.data)) {
            data = res.data;
          } else if (Array.isArray(res?.data)) {
            data = res.data;
          } else if (Array.isArray(res)) {
            data = res;
          }

          const mapped = data.map((p: any) => ({
            ...p,
            _id: p._id || p.id,
            title: p.title || p.name || 'Fresh fashion find',
            price: p.price || p.amount || 0,
            sellerName: p.sellerName || p.seller?.name || p.seller?.username || 'verified seller',
            imageUrls: p.imageUrls || p.images || (p.image ? [p.image] : []),
            videoUrl: p.videoUrl || p.video || undefined,
            isNewArrival: p.isNewArrival || p.newArrival || false,
            isVerified: p.isVerified || p.verified || false,
            condition: p.condition || (Math.random() > 0.5 ? 'New' : 'Slightly Used'),
            discountPercent: p.discountPercent || (p.originalPrice && p.price ? Math.round((1 - Number(p.price)/Number(p.originalPrice)) * 100) : 0),
            views: p.views || Math.floor(Math.random() * 5000)
          }));
          setItems(mapped);
        }
      } catch (err) {
        console.error('Error loading fashion listings', err);
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <section className="py-8 sm:py-12" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FF6B9D]/10 flex items-center justify-center shadow-lg shadow-[#FF6B9D]/10 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Sparkles className="text-[#FF6B9D] w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Fashion Picks
              </h2>
              <p className="text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
                <Sparkles size={14} className="sm:w-4 sm:h-4 text-[#FF6B9D]" />
                Trendy styles from campus creators
              </p>
            </div>
          </div>
        </div>

        {/* Grid - Improved Responsive Gaps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {/* Skeleton */}
          {loading && new Array(6).fill(0).map((_, i) => (
             <div key={i} className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
              <div className="aspect-[3/4] sm:aspect-[4/5] bg-gray-100 animate-pulse relative" />
              <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 flex-1">
                <div className="h-3 sm:h-4 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex justify-between items-end mt-auto pt-2">
                  <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-gray-300 px-4">
              <p className="text-gray-900 font-semibold text-base sm:text-lg">No fashion items found.</p>
            </div>
          )}

          {/* Items */}
          {!loading && items.map((item) => (
            <VideoFashionCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* See all button */}
        <div className="mt-8 sm:mt-12 flex justify-center px-4">
          <Link 
            href="/search?category=fashion" 
            className="
              group
              inline-flex
              items-center
              gap-2 sm:gap-3
              px-6 py-3 sm:px-8 sm:py-3.5
              rounded-full
              bg-white
              border border-gray-200
              text-sm
              font-bold
              text-gray-900
              hover:border-[#FF6B9D]
              hover:text-[#FF6B9D]
              hover:shadow-xl
              hover:shadow-[#FF6B9D]/10
              transition-all
              duration-300
            "
          >
            See all Fashion
            <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </section>
  );
}
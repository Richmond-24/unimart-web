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
  condition?: string; // Added condition field
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
            
            {(item.isNewArrival || item.newArrival) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#6C5CE7]/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                <Sparkles size={10} />
                NEW
              </span>
            )}
          </div>

          {/* =========================================================
              VIDEO INTERACTION CONTROLS
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

              {/* Live Preview Indicator */}
              {!showPlayOverlay && (
                 <div className="absolute top-4 right-4 z-20 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-bold flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                   LIVE PREVIEW
                 </div>
              )}

              {/* Mute Toggle */}
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
              SOCIAL ACTIONS (RIGHT SIDE)
          ========================================================== */}
          <div className="absolute right-3 bottom-32 z-20 flex flex-col gap-3">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className="group/btn flex flex-col items-center gap-1"
              aria-label={isLiked ? "Unlike" : "Like"}
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
                    isLiked
                      ? "bg-red-500 border-red-500 shadow-red-500/30 shadow-lg"
                      : "bg-black/40 hover:bg-black/60"
                  }
                `}
              >
                <Heart
                  size={18}
                  className={`transition-colors duration-300 ${isLiked ? "text-white" : "text-white"}`}
                  fill={isLiked ? "white" : "none"}
                />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {(item.reviewCount || Math.floor(Math.random() * 500)).toLocaleString()}
              </span>
            </button>

            {/* View Count */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                <Eye size={18} />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {item.views ? (item.views / 1000).toFixed(1) + 'k' : '1.2k'}
              </span>
            </div>
          </div>

          {/* =========================================================
              BOTTOM MEDIA INFO
          ========================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pr-12 pb-16">
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
          </div>

          {/* =========================================================
              VERIFIED BANNER & CONDITION BADGE
          ========================================================== */}
          
          {/* Verified Seller Banner */}
          {item.isVerified && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 backdrop-blur-md py-2 px-4 flex items-center justify-center gap-2 border-t border-white/10">
              <ShieldCheck size={14} className="text-white" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Verified Seller</span>
            </div>
          )}

          {/* Condition Badge (Floating above banner or bottom if no banner) */}
          {conditionStyle && (
            <div className={`absolute ${item.isVerified ? 'bottom-10' : 'bottom-4'} left-4 z-20`}>
              <div className={`
                inline-flex items-center gap-1.5 
                px-3 py-1.5 rounded-lg 
                ${conditionStyle.bg} 
                ${conditionStyle.text}
                backdrop-blur-md shadow-lg border border-white/20
              `}>
                <Tag size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wide">{conditionStyle.label}</span>
              </div>
            </div>
          )}

        </div>

        {/* =========================================================
            FOOTER / PRICE ACTION
        ========================================================== */}
        <div className="p-4 flex items-center justify-between bg-white mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium mb-0.5">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-gray-900 tracking-tight">
                {priceDisplay}
              </span>
              {originalPriceDisplay && (
                <span className="text-xs text-gray-400 line-through font-medium">
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
            <ShoppingBag size={18} />
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
            condition: p.condition || (Math.random() > 0.5 ? 'New' : 'Slightly Used'), // Mock condition if missing
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
    <section className="py-12 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B9D]/10 flex items-center justify-center shadow-lg shadow-[#FF6B9D]/10 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Sparkles className="text-[#FF6B9D]" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Fashion Picks
              </h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <Sparkles size={16} className="text-[#FF6B9D]" />
                Trendy styles from campus creators
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Skeleton */}
          {loading && new Array(5).fill(0).map((_, i) => (
             <div key={i} className="rounded-3xl bg-white border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
              <div className="aspect-[4/5] bg-gray-100 animate-pulse relative" />
              <div className="p-4 space-y-3 flex-1">
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex justify-between items-end mt-auto pt-2">
                  <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-900 font-semibold text-lg">No fashion items found.</p>
            </div>
          )}

          {/* Items */}
          {!loading && items.map((item) => (
            <VideoFashionCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* See all button */}
        <div className="mt-12 flex justify-center">
          <Link 
            href="/search?category=fashion" 
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
              hover:border-[#FF6B9D]
              hover:text-[#FF6B9D]
              hover:shadow-xl
              hover:shadow-[#FF6B9D]/10
              transition-all
              duration-300
            "
          >
            See all Fashion
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
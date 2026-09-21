"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  Star,
  Heart,
  ShoppingCart,
  CheckCircle2,
  Eye,
  Zap,
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

export default function ProductCard({ item }: { item: DealItem }) {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const hasVideo = Boolean(item.videoUrl);
  const image = item.imageUrls?.[0];
  const id = item._id || item.id;

  const price = typeof item.price === "number" ? `GH₵${item.price.toLocaleString()}` : item.price;
  const originalPrice = item.originalPrice !== undefined ? (typeof item.originalPrice === "number" ? `GH₵${item.originalPrice.toLocaleString()}` : item.originalPrice) : null;

  useEffect(() => {
    if (!hasVideo || !mediaRef.current || !cardRef.current) return;
    const video = mediaRef.current;
    video.muted = isMuted;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        video.play().then(() => setShowPlayOverlay(false)).catch(() => setShowPlayOverlay(true));
      } else {
        video.pause();
        setShowPlayOverlay(true);
      }
    }, { threshold: 0.6 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasVideo, isMuted]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play().then(() => setShowPlayOverlay(false)).catch(() => {});
    } else {
      mediaRef.current.pause();
      setShowPlayOverlay(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mediaRef.current) return;
    const newMuted = !isMuted;
    mediaRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((s) => !s);
  };

  return (
    <Link href={`/listings/${id}`} className="group block h-full">
      <div
        ref={cardRef}
        className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-gray-200"
      >
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gray-50">
          {hasVideo ? (
            <video ref={mediaRef} src={item.videoUrl} poster={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loop muted playsInline preload="metadata" onClick={togglePlay} />
          ) : image ? (
            <img src={image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><ShoppingCart className="text-gray-300" size={48} /></div>
          )}

          <div className="absolute inset-x-0 top-0 h-20 sm:h-32 bg-gradient-to-b from-black/50 sm:from-black/60 to-transparent pointer-events-none opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-32 sm:h-48 bg-gradient-to-t from-black/70 sm:from-black/80 via-black/30 sm:via-black/40 to-transparent pointer-events-none" />

          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex flex-wrap gap-1.5 sm:gap-2 max-w-[75%] sm:max-w-[80%]">
            {item.discountPercent && item.discountPercent > 0 && (
              <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold shadow-lg animate-pulse-slow">-{item.discountPercent}% OFF</span>
            )}
            {item.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold shadow-lg"><CheckCircle2 size={8} className="sm:w-2.5 sm:h-2.5" fill="currentColor" /> Verified</span>
            )}
          </div>

          {hasVideo && showPlayOverlay && (
            <button onClick={togglePlay} className="absolute inset-0 m-auto z-30 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 shadow-xl" aria-label="Play video">
              <Play size={24} className="sm:w-8 sm:h-8 ml-0.5 sm:ml-1" fill="white" />
            </button>
          )}

          {hasVideo && (
            <button onClick={toggleMute} className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition" aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX size={14} className="sm:w-4 sm:h-4" /> : <Volume2 size={14} className="sm:w-4 sm:h-4" />}
            </button>
          )}

          <div className="absolute right-2 bottom-24 sm:right-3 sm:bottom-32 z-20 flex flex-col gap-2 sm:gap-3">
            <button onClick={toggleLike} className="group/btn flex flex-col items-center gap-0.5 sm:gap-1" aria-label={liked ? "Unlike" : "Like"}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 ${liked ? 'bg-red-500 border-red-500 shadow-red-500/30 shadow-lg' : 'bg-black/40 hover:bg-black/60'}`}>
                <Heart size={14} className="sm:w-[18px] sm:h-[18px] transition-colors duration-300 text-white" fill={liked ? 'white' : 'none'} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1 sm:px-1.5 py-0.5 rounded-md backdrop-blur-sm">{(item.likes || 0).toLocaleString()}</span>
            </button>
            {item.views && (
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"><Eye size={14} className="sm:w-[18px] sm:h-[18px]" /></div>
                <span className="text-[9px] sm:text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1 sm:px-1.5 py-0.5 rounded-md backdrop-blur-sm">{item.views >= 1000 ? `${(item.views/1000).toFixed(1)}k` : item.views}</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5 sm:p-4 pr-10 sm:pr-12">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 text-[10px] sm:text-xs font-bold shadow-sm border border-white/20">{(item.sellerName || item.seller || 'S')[0].toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="text-white/90 text-[10px] sm:text-xs font-medium truncate drop-shadow-sm">{item.sellerName || item.seller || 'Verified Seller'}</p>
              </div>
            </div>
            <h3 className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">{item.title}</h3>
            {item.rating && (<div className="flex items-center gap-1"><Star size={8} className="sm:w-2.5 sm:h-2.5 text-yellow-400" fill="currentColor" /><span className="text-white/80 text-[9px] sm:text-[10px] font-medium">{item.rating}</span></div>)}
          </div>
        </div>

        <div className="p-2.5 sm:p-4 flex items-center justify-between bg-white mt-auto">
          <div className="flex flex-col min-w-0 flex-1 mr-2">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5">Price</span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight truncate">{price}</span>
              {originalPrice && (<span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">{originalPrice}</span>)}
            </div>
          </div>

          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/20" aria-label="Add to cart">
            <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </Link>
  );
}

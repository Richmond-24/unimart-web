"use client";

import React, { useEffect, useState, useRef } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Heart, ShoppingBag, Sparkles } from "lucide-react";

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
}

interface VideoFashionCardProps {
  item: FashionItem;
}

function VideoFashionCard({ item }: VideoFashionCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-play on hover
  useEffect(() => {
    if (isHovered && videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!isHovered && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered]);

  const lid = item._id || item.id;
  const priceDisplay = typeof item.price === 'number' ? `GH₵${item.price}` : (item.price || 'Price on request');
  const originalPriceDisplay = item.originalPrice ? (typeof item.originalPrice === 'number' ? `GH₵${item.originalPrice}` : item.originalPrice) : null;

  return (
    <Link 
      href={`/listings/${lid}`}
      className="relative block group aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={item.videoUrl || item.video}
        poster={(item.imageUrls?.[0] || item.images?.[0] || "")}
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* New Arrival Badge */}
      {item.isNewArrival && (
        <div className="absolute top-2 left-2 bg-[#6C5CE7] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <Sparkles size={10} />
          NEW
        </div>
      )}

      {/* Discount Badge */}
      {originalPriceDisplay && (
        <div className="absolute top-2 right-2 bg-[#FF6B9D] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
          SALE
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className={`absolute top-12 right-2 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition z-10 ${
          isLiked ? 'bg-[#FF6B9D] text-white' : 'bg-black/30 text-white hover:bg-black/50'
        }`}
      >
        <Heart size={16} fill={isLiked ? "white" : "none"} />
      </button>

      {/* Play/Pause Control */}
      <button
        onClick={togglePlay}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
      </button>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-xs font-semibold truncate">@{item.sellerName || item.seller || 'verified seller'}</span>
          {item.rating && (
            <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full">
              <span className="text-white text-[10px] font-medium">★ {item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 mb-2 drop-shadow-md min-h-[2.5em]">
          {item.title}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-lg">{priceDisplay}</span>
          {originalPriceDisplay && (
            <span className="text-white/60 text-xs line-through">{originalPriceDisplay}</span>
          )}
        </div>

        {/* Quick Add Button */}
        <button 
          className="mt-2 w-full bg-white/90 backdrop-blur-md text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white transition opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          onClick={(e) => e.preventDefault()}
        >
          <ShoppingBag size={14} />
          Quick View
        </button>
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
        const res = await apiFetch('/public/listings?category=Fashion&limit=6');
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
            discountPercent: p.discountPercent || (p.originalPrice && p.price ? Math.round((1 - Number(p.price)/Number(p.originalPrice)) * 100) : 0)
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
    <section className="py-8 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B9D]/10 flex items-center justify-center">
              <Sparkles className="text-[#FF6B9D]" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">Fashion Picks</h2>
              <p className="text-sm text-gray-500">Trendy styles from campus creators</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Skeleton */}
          {loading && new Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse" />
          ))}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No fashion items found.
            </div>
          )}

          {/* Items */}
          {!loading && items.map((item) => (
            <VideoFashionCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* See all button */}
        <div className="mt-8 flex justify-center">
          <Link 
            href="/search?category=fashion" 
            className="px-6 py-2.5 text-sm font-semibold text-[#FF6B9D] bg-[#FF6B9D]/10 border border-[#FF6B9D]/20 rounded-xl hover:bg-[#FF6B9D]/20 transition-colors"
          >
            See all Fashion →
          </Link>
        </div>
      </div>
    </section>
  );
}

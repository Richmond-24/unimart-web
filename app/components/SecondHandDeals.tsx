"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Recycle, Heart, ShoppingBag, Star } from "lucide-react";

interface SecondHandItem {
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
  condition?: string;
  category?: string;
}

interface VideoSecondHandCardProps {
  item: SecondHandItem;
}

function VideoSecondHandCard({ item }: VideoSecondHandCardProps) {
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
      className="relative block group aspect-[3/4] rounded-xl overflow-hidden bg-black shadow-sm hover:shadow-md transition-all duration-300"
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 pointer-events-none" />

      {/* Condition Badge */}
      <div className="absolute top-1.5 left-1.5 bg-[#00D9A3]/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
        <Recycle size={8} />
        {item.condition || 'Pre-loved'}
      </div>

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition z-10 ${
          isLiked ? 'bg-[#FF6B9D] text-white' : 'bg-black/30 text-white hover:bg-black/50'
        }`}
      >
        <Heart size={14} fill={isLiked ? "white" : "none"} />
      </button>

      {/* Play/Pause Control */}
      <button
        onClick={togglePlay}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
      </button>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-12 right-1.5 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
      </button>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-[10px] font-semibold truncate max-w-[70%]">@{item.sellerName || item.seller}</span>
          {item.rating && (
            <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-sm px-1 py-0.5 rounded-full">
              <Star size={8} className="text-[#FFB88C]" fill="#FFB88C" />
              <span className="text-white text-[9px] font-medium">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1.5 drop-shadow-md min-h-[2.4em]">
          {item.title}
        </h3>

        <div className="flex items-baseline gap-1.5">
          <span className="text-white font-bold text-sm">{priceDisplay}</span>
          {originalPriceDisplay && (
            <span className="text-white/60 text-[10px] line-through">{originalPriceDisplay}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SecondHandDealsVideo() {
  const [items, setItems] = useState<SecondHandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = '/public/second-hand?limit=6';
        console.log(`📡 [SecondHandDeals] Fetching from: ${endpoint}`);
        
        const res = await apiFetch(endpoint, { suppressErrorLog: false });
        
        if (mounted) {
          let data: any[] = [];
          if (res?.success && Array.isArray(res.data)) {
            data = res.data;
          } else if (Array.isArray(res)) {
            data = res;
          } else if (res?.data && Array.isArray(res.data)) {
            data = res.data;
          } else if (res?.items && Array.isArray(res.items)) {
            data = res.items;
          }
          
          const mapped = data.map((p: any) => ({
            ...p,
            _id: p._id || p.id,
            title: p.title || p.name || 'Great second-hand find',
            price: p.price || p.amount || 0,
            sellerName: p.sellerName || p.seller?.name || p.seller?.username || 'verified seller',
            imageUrls: p.imageUrls || p.images || (p.image ? [p.image] : []),
            videoUrl: p.videoUrl || p.video || undefined,
            condition: p.condition || p.itemCondition || 'Pre-loved'
          }));
          
          setItems(mapped);
          console.log(`✅ [SecondHandDeals] Loaded ${mapped.length} items`);
        }
      } catch (err: any) {
        console.error('❌ [SecondHandDeals] Error:', err);
        setError(err.message || 'Failed to load second-hand items');
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <section className="py-6 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D9A3]/10 flex items-center justify-center">
              <Recycle className="text-[#00D9A3]" size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Second-hand Picks</h2>
              <p className="text-xs text-gray-500">Sustainably sourced & budget-friendly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {loading && new Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 rounded-xl animate-pulse" />
          ))}

          {!loading && error && items.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1.5 bg-[#00D9A3] text-white text-xs rounded-lg hover:bg-[#00b88a] transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
              No second-hand items are available right now.
            </div>
          )}

          {!loading && items.map((item) => (
            <VideoSecondHandCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* See all button */}
        <div className="mt-6 flex justify-center">
          <Link 
            href="/search?category=second-hand" 
            className="px-4 py-2 text-xs font-semibold text-[#00D9A3] bg-[#00D9A3]/10 border border-[#00D9A3]/20 rounded-lg hover:bg-[#00D9A3]/20 transition-colors"
          >
            See all Second-hand →
          </Link>
        </div>
      </div>
    </section>
  );
}

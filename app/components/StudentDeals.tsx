"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, Star, Zap, CheckCircle2 } from "lucide-react";

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
}

// Fallback data with video content
const FALLBACK_DEALS: DealItem[] = [
  {
    _id: '1',
    title: 'Photography Workshop',
    price: 50,
    originalPrice: 100,
    sellerName: 'Creative Studio',
    videoUrl: '/videos/service1.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop'],
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    discountPercent: 50
  },
  {
    _id: '2',
    title: 'Resume Review Pro',
    price: 25,
    sellerName: 'Career Hub',
    videoUrl: '/videos/service2.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop'],
    rating: 4.9,
    reviewCount: 89,
    isVerified: true,
    discountPercent: 0
  },
  {
    _id: '3',
    title: 'Gym Pass Monthly',
    price: 40,
    originalPrice: 60,
    sellerName: 'FitCampus',
    videoUrl: '/videos/service3.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop'],
    rating: 4.7,
    reviewCount: 210,
    isVerified: true,
    discountPercent: 33
  },
  {
    _id: '4',
    title: 'Coding Tutor 1-on-1',
    price: 30,
    sellerName: 'CodeMentor',
    videoUrl: '/videos/service4.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop'],
    rating: 5.0,
    reviewCount: 56,
    isVerified: true,
    discountPercent: 0
  },
  {
    _id: '5',
    title: 'Laundry Service',
    price: 15,
    sellerName: 'CleanQuick',
    videoUrl: '/videos/service5.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1545173168-9f1947eebb8f?w=400&h=400&fit=crop'],
    rating: 4.6,
    reviewCount: 340,
    isVerified: true,
    discountPercent: 0
  },
  {
    _id: '6',
    title: 'Meal Prep Weekly',
    price: 80,
    originalPrice: 120,
    sellerName: 'HealthyEats',
    videoUrl: '/videos/service6.mp4',
    imageUrls: ['https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&h=400&fit=crop'],
    rating: 4.8,
    reviewCount: 175,
    isVerified: true,
    discountPercent: 33
  }
];

interface VideoCardProps {
  item: DealItem;
}

function VideoDealCard({ item }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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
  const priceDisplay = typeof item.price === 'number' ? `GH₵${item.price}` : item.price;
  const originalPriceDisplay = item.originalPrice ? (typeof item.originalPrice === 'number' ? `GH₵${item.originalPrice}` : item.originalPrice) : null;

  return (
    <Link 
      href={`/listings/${lid}`}
      className="relative block group aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-sm hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        poster={item.imageUrls?.[0]}
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

      {/* Verified Badge */}
      {item.isVerified && (
        <div className="absolute top-2 left-2 bg-[#00D9A3]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <CheckCircle2 size={10} fill="white" />
          VERIFIED
        </div>
      )}

      {/* Discount Badge */}
      {item.discountPercent && item.discountPercent > 0 && (
        <div className="absolute top-2 right-2 bg-[#FF6B9D] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
          -{item.discountPercent}%
        </div>
      )}

      {/* Play/Pause Control */}
      <button
        onClick={togglePlay}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
      </button>

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-xs font-semibold truncate">{item.sellerName || item.seller}</span>
          {(item.rating || item.reviewCount) && (
            <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full">
              <Star size={10} className="text-[#FFB88C]" fill="#FFB88C" />
              <span className="text-white text-[10px] font-medium">{item.rating?.toFixed(1) || '4.5'}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 mb-2 drop-shadow-md">
          {item.title}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-white font-bold text-lg">{priceDisplay}</span>
          {originalPriceDisplay && (
            <span className="text-white/60 text-xs line-through">{originalPriceDisplay}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function StudentDealsVideo() {
  const [items, setItems] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const endpoint = "/public/services";
        console.log(`📡 [StudentDeals] Fetching from: ${endpoint}`);
        
        const res = await apiFetch(endpoint, { suppressErrorLog: true });
        
        if (mounted && res && res.data) {
          // Map API data to include video fields if available
          const mapped = res.data.map((p: any) => ({
            ...p,
            videoUrl: p.videoUrl || p.video || undefined,
            isVerified: p.isVerified || p.verified || true,
            discountPercent: p.discountPercent || (p.originalPrice && p.price ? Math.round((1 - Number(p.price)/Number(p.originalPrice)) * 100) : 0)
          }));
          setItems(mapped);
          console.log(`✅ [StudentDeals] Loaded ${mapped.length} items`);
        } else if (mounted && res && Array.isArray(res)) {
          setItems(res);
          console.log(`✅ [StudentDeals] Loaded ${res.length} items`);
        } else {
          console.log('ℹ️ [StudentDeals] No data received, using fallback');
          setItems(FALLBACK_DEALS);
        }
      } catch (err) {
        console.error('Error loading student services', err);
        setLoadError('Failed to load student deals');
        setItems(FALLBACK_DEALS); // Use fallback on error instead of empty
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
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center">
              <Zap className="text-[#6C5CE7]" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">Student Deals</h2>
              <p className="text-sm text-gray-500">Exclusive services & savings for campus</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Skeleton */}
          {loading && new Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-200 rounded-2xl animate-pulse" />
          ))}

          {/* Error state */}
          {!loading && loadError && items.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500 mb-2">{loadError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5a4bd6] transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Items */}
          {!loading && items.map((item) => (
            <VideoDealCard key={item._id || item.id} item={item} />
          ))}
        </div>

        {/* See all button */}
        {items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link 
              href="/category/student-deals" 
              className="px-6 py-2.5 text-sm font-semibold text-[#6C5CE7] bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 rounded-xl hover:bg-[#6C5CE7]/20 transition-colors"
            >
              See all Student Deals →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";
import { Play, Pause, Volume2, VolumeX, Clock, Zap, ShoppingBag, Heart } from "lucide-react";

type Deal = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  img?: string;
  videoUrl?: string;
  slug?: string;
  endsAt: number; // timestamp
  sellerName?: string;
  sellerAvatar?: string;
  views?: number;
};

// Fallback deals with video content
const FALLBACK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Student Discount Pack',
    price: 'GH₵29.99',
    originalPrice: 'GH₵59.99',
    img: '/images/placeholder.png',
    videoUrl: '/videos/deal1.mp4',
    sellerName: 'campus_store',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
    views: 1200,
    endsAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours
  },
  {
    id: '2',
    title: 'Tech Gadget Flash Sale',
    price: 'GH₵49.99',
    originalPrice: 'GH₵99.99',
    img: '/images/placeholder.png',
    videoUrl: '/videos/deal2.mp4',
    sellerName: 'tech_deals_gh',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
    views: 890,
    endsAt: Date.now() + 1000 * 60 * 60 * 5, // 5 hours
  },
  {
    id: '3',
    title: 'Book Bundle Deal',
    price: 'GH₵19.99',
    originalPrice: 'GH₵39.99',
    img: '/images/placeholder.png',
    videoUrl: '/videos/deal3.mp4',
    sellerName: 'books_by_kojo',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
    views: 450,
    endsAt: Date.now() + 1000 * 60 * 30, // 30 minutes
  },
];

function formatRemaining(ms: number) {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

interface VideoDealCardProps {
  deal: Deal;
  now: number;
}

function VideoDealCard({ deal, now }: VideoDealCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const remaining = deal.endsAt - now;
  const isExpired = remaining <= 0;
  const urgencyLevel = remaining > 0 ? (remaining < 1000 * 60 * 30 ? 'high' : remaining < 1000 * 60 * 60 ? 'medium' : 'low') : 'none';

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

  useEffect(() => {
    if (isHovered && videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (!isHovered && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered]);

  return (
    <Link 
      href={`/listings/${deal.slug || deal.id}`}
      className="relative flex-none w-[280px] h-[480px] rounded-2xl overflow-hidden bg-black group snap-start"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        src={deal.videoUrl}
        poster={deal.img}
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        {/* Urgency Timer */}
        {!isExpired && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-md text-xs font-bold ${
            urgencyLevel === 'high' ? 'bg-red-500/90 text-white animate-pulse' :
            urgencyLevel === 'medium' ? 'bg-orange-500/90 text-white' :
            'bg-black/40 text-white'
          }`}>
            <Clock size={12} />
            {formatRemaining(remaining)}
          </div>
        )}
        
        {isExpired && (
          <div className="px-2.5 py-1.5 rounded-full bg-gray-500/90 text-white text-xs font-bold backdrop-blur-md">
            Ended
          </div>
        )}

        {/* Flash Badge */}
        <div className="px-2.5 py-1.5 rounded-full bg-[#FF6B9D] text-white text-xs font-bold backdrop-blur-md flex items-center gap-1 shadow-lg">
          <Zap size={12} fill="white" />
          FLASH
        </div>
      </div>

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
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition z-10 opacity-0 group-hover:opacity-100"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={deal.sellerAvatar} 
            alt={deal.sellerName} 
            className="w-8 h-8 rounded-full border border-white/50"
          />
          <span className="text-white text-sm font-semibold">@{deal.sellerName}</span>
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-md">
          {deal.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white font-bold text-xl">{deal.price}</span>
          {deal.originalPrice && (
            <span className="text-white/60 text-sm line-through">{deal.originalPrice}</span>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full bg-white text-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition shadow-lg">
          <ShoppingBag size={18} />
          Grab Deal
        </button>
      </div>

      {/* Views Counter */}
      <div className="absolute bottom-24 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
        <Play size={10} className="text-white" fill="white" />
        <span className="text-white text-xs font-medium">{deal.views?.toLocaleString() || '0'}</span>
      </div>
    </Link>
  );
}

export default function FlashDealsVideo() {
  const [now, setNow] = useState(Date.now());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Timer for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load deals
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setUsingFallback(false);
      
      try {
        let flashRes: any = null;
        try {
          flashRes = await apiFetch('/public/flash-deals', { suppressErrorLog: true });
        } catch (err) {
          flashRes = null;
        }

        if (!mounted) return;

        let flashItems: any[] = [];
        if (flashRes?.data && Array.isArray(flashRes.data)) {
          flashItems = flashRes.data;
        } else if (Array.isArray(flashRes)) {
          flashItems = flashRes;
        }

        let featuredItems: any[] = [];
        try {
          const featuredRes = await apiFetch('/home/featured', { suppressErrorLog: true });
          if (featuredRes?.data && Array.isArray(featuredRes.data)) {
            featuredItems = featuredRes.data;
          } else if (Array.isArray(featuredRes)) {
            featuredItems = featuredRes;
          }
        } catch (err) {
          // Ignore
        }

        const combined = [...flashItems, ...featuredItems];
        const seen = new Set();
        const unique = [] as any[];
        
        for (const p of combined) {
          const id = p._id || p.id;
          if (!id) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          unique.push(p);
        }

        if (unique.length > 0) {
          const mapped: Deal[] = unique.map((p: any) => {
            const id = p._id || p.id;
            const title = p.title || p.name || 'Untitled';
            
            let price = 'GH₵0';
            const priceVal = p.price ?? p.priceAmount ?? p.productPrice ?? null;
            if (typeof priceVal === 'number') {
              price = `GH₵${priceVal}`;
            } else if (priceVal) {
              price = String(priceVal);
            }
            
            let originalPrice = undefined;
            const originalVal = p.originalPrice ?? p.listPrice ?? p.mrp ?? null;
            if (typeof originalVal === 'number') {
              originalPrice = `GH₵${originalVal}`;
            } else if (originalVal) {
              originalPrice = String(originalVal);
            }
            
            const img = (p.images && p.images[0]) || p.image || (p.imageUrls && p.imageUrls[0]) || undefined;
            const videoUrl = p.videoUrl || p.video || undefined;
            
            let endsAt = Date.now() + 1000 * 60 * 60 * 2;
            if (p.flashDealExpiry) endsAt = new Date(p.flashDealExpiry).getTime();
            else if (p.expiresAt) endsAt = new Date(p.expiresAt).getTime();
            else if (p.flashDeal?.endsAt) endsAt = new Date(p.flashDeal.endsAt).getTime();
            
            const slug = p.slug || p.permalink || p.handle || id;
            
            return { 
              id, 
              title, 
              price, 
              originalPrice, 
              img, 
              videoUrl,
              endsAt, 
              slug,
              sellerName: p.sellerName || p.seller?.name || 'seller',
              sellerAvatar: p.sellerAvatar || p.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
              views: p.views || Math.floor(Math.random() * 5000)
            };
          });

          setDeals(mapped);
          setUsingFallback(false);
        } else {
          setUsingFallback(true);
          setDeals(FALLBACK_DEALS);
        }
        
      } catch (err) {
        if (mounted) {
          setUsingFallback(true);
          setDeals(FALLBACK_DEALS);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section id="flash-deals-video" className="py-8 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B9D]/10 flex items-center justify-center">
              <Zap className="text-[#FF6B9D]" size={20} fill="#FF6B9D" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">Flash Deals</h2>
              <p className="text-sm text-gray-500">Limited time offers • Live now</p>
            </div>
          </div>
          
          {!loading && deals.length > 0 && (
            <Link 
              href="/search?category=flash-deals" 
              className="text-sm font-semibold text-[#6C5CE7] hover:text-[#5a4bd6] transition flex items-center gap-1"
            >
              See all <span className="text-lg">→</span>
            </Link>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {loading && (
            <>
              {[1, 2, 3].map(s => (
                <div key={s} className="snap-start flex-none w-[280px] h-[480px] bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </>
          )}

          {!loading && deals.length === 0 && (
            <div className="flex-none w-full py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-600 font-medium">No flash deals right now</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for exciting offers!</p>
            </div>
          )}

          {deals.map(deal => (
            <VideoDealCard key={deal.id} deal={deal} now={now} />
          ))}
        </div>
      </div>
    </section>
  );
}

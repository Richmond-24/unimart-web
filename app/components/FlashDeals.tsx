"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Zap, 
  ShoppingBag, 
  Heart, 
  Eye, 
  CheckCircle2,
  Tag,
  ArrowRight
} from "lucide-react";

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
  isVerified?: boolean;
};

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
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const remaining = deal.endsAt - now;
  const isExpired = remaining <= 0;
  
  // Determine urgency styling
  const getUrgencyStyle = () => {
    if (isExpired) return { bg: 'bg-gray-500/90', text: 'text-white', label: 'Ended', pulse: false };
    if (remaining < 1000 * 60 * 30) return { bg: 'bg-red-500/90', text: 'text-white', label: formatRemaining(remaining), pulse: true }; // < 30 mins
    if (remaining < 1000 * 60 * 60) return { bg: 'bg-orange-500/90', text: 'text-white', label: formatRemaining(remaining), pulse: false }; // < 1 hour
    return { bg: 'bg-black/40', text: 'text-white', label: formatRemaining(remaining), pulse: false };
  };

  const urgencyStyle = getUrgencyStyle();

  // Auto-play logic when in viewport
  useEffect(() => {
    if (!deal.videoUrl || !videoRef.current || !cardRef.current) return;

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
  }, [deal.videoUrl, isMuted]);

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
    <Link href={`/listings/${deal.slug || deal.id}`} className="group block h-full w-[280px] flex-none snap-start">
      <div
        ref={cardRef}
        className="
          relative
          h-[480px]
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
          {deal.videoUrl ? (
            <video
              ref={videoRef}
              src={deal.videoUrl}
              poster={deal.img}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
            />
          ) : deal.img ? (
            <img
              src={deal.img}
              alt={deal.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Zap className="text-gray-300" size={48} />
            </div>
          )}

          {/* Gradients for text readability */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* =========================================================
              TOP BADGES & ACTIONS
          ========================================================== */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 max-w-[80%]">
            {/* Urgency Timer */}
            <div className={`
              inline-flex items-center gap-1.5 
              px-3 py-1.5 rounded-full 
              backdrop-blur-md shadow-lg
              ${urgencyStyle.bg} ${urgencyStyle.text}
              ${urgencyStyle.pulse ? 'animate-pulse' : ''}
            `}>
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wide">{urgencyStyle.label}</span>
            </div>
            
            {/* Flash Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FF6B9D]/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
              <Zap size={10} fill="white" />
              FLASH
            </div>
          </div>

          {/* =========================================================
              VIDEO INTERACTION CONTROLS
          ========================================================== */}
          {deal.videoUrl && (
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
                {(Math.floor(Math.random() * 500) + 50).toLocaleString()}
              </span>
            </button>

            {/* View Count */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                <Eye size={18} />
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {deal.views ? (deal.views / 1000).toFixed(1) + 'k' : '1.2k'}
              </span>
            </div>
          </div>

          {/* =========================================================
              BOTTOM MEDIA INFO
          ========================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pr-12 pb-16">
            {/* Seller Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 text-xs font-bold shadow-sm border border-white/20 overflow-hidden">
                 {deal.sellerAvatar ? (
                   <img src={deal.sellerAvatar} alt={deal.sellerName} className="w-full h-full object-cover" />
                 ) : (
                   (deal.sellerName || "S")[0].toUpperCase()
                 )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/90 text-xs font-medium truncate drop-shadow-sm">
                  {deal.sellerName || "Verified Seller"}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-base font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">
              {deal.title}
            </h3>
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
                {deal.price}
              </span>
              {deal.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  {deal.originalPrice}
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

export default function FlashDealsVideo() {
  const [now, setNow] = useState(Date.now());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
              sellerAvatar: p.sellerAvatar || p.seller?.avatar,
              views: p.views || Math.floor(Math.random() * 5000),
              isVerified: p.isVerified || p.verified
            };
          });

          setDeals(mapped);
        } else {
          setDeals([]);
        }
        
      } catch (err) {
        if (mounted) {
          setDeals([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section id="flash-deals-video" className="py-12" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B9D]/10 flex items-center justify-center shadow-lg shadow-[#FF6B9D]/10 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Zap className="text-[#FF6B9D]" size={24} fill="#FF6B9D" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Flash Deals
              </h2>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
                <Clock size={16} className="text-[#FF6B9D]" />
                Limited time offers • Live now
              </p>
            </div>
          </div>
          
          {!loading && deals.length > 0 && (
            <Link 
              href="/search?category=flash-deals" 
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
              See all Deals
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory mask-linear-fade">
          {loading && (
            <>
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="snap-start flex-none w-[280px] h-[480px] bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="aspect-[4/5] bg-gray-100 animate-pulse relative" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="flex justify-between items-end mt-auto pt-2">
                      <div className="h-6 w-20 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && deals.length === 0 && (
            <div className="flex-none w-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-900 font-semibold text-lg">No flash deals right now</p>
              <p className="text-gray-500 text-sm mt-1">Check back soon for exciting offers!</p>
            </div>
          )}

          {deals.map(deal => (
            <VideoDealCard key={deal.id} deal={deal} now={now} />
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
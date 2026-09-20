"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Eye, 
  ShoppingBag, 
  CheckCircle2,
  Tag,
  MapPin
} from "lucide-react";

interface Product {
  _id: string;
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  sellerName?: string;
  seller?: string;
  imageUrls?: string[];
  videoUrl?: string;
  views?: number;
  sales?: number;
  category?: string;
  condition?: string;
  location?: string;
  isVerified?: boolean;
}

interface ProductGridProps {
  horizontal?: boolean;
  title?: string;
  limit?: number;
  endpoint?: string;
}

export default function ProductGrid({ 
  horizontal = false,
  title = "Trending near you",
  limit = 8,
  endpoint = "/public/trending"
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Track which video is currently playing to prevent multiple videos playing at once
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setLoadError(null);
      
      try {
        const res = await apiFetch(endpoint);
        
        if (!mounted) return;
        
        let productData: Product[] = [];
        
        if (res?.data && Array.isArray(res.data)) {
          productData = res.data;
        } else if (Array.isArray(res)) {
          productData = res;
        } else if (res?.products && Array.isArray(res.products)) {
          productData = res.products;
        } else if (res?.listings && Array.isArray(res.listings)) {
          productData = res.listings;
        }
        
        if (productData.length > 0) {
          if (limit && productData.length > limit) {
            productData = productData.slice(0, limit);
          }
          setProducts(productData);
          setLoadError(null);
        } else {
          setProducts([]);
        }
        
      } catch (error: any) {
        if (mounted) {
          setProducts([]);
          setLoadError(error?.message || 'Failed to load products');
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
  }, [endpoint, limit]);

  // Loading state
  if (loading) {
    return (
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array(limit || 5).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-white border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="aspect-[4/5] bg-gray-100 relative" />
              <div className="p-4 space-y-3 flex-1">
                <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
                <div className="flex justify-between items-end mt-auto pt-2">
                  <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (loadError) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-red-600 font-semibold mb-3">⚠️ {loadError}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-lg font-medium">No products found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
          {products.length} items
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => {
          const id = product._id || product.id;
          if (!id) return null;

          const img = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;
          const hasVideo = !!product.videoUrl;
          const isPlaying = playingVideoId === id;
          
          const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price || 0);
          const discountPercent = hasDiscount ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100) : 0;

          // Condition styling helper
          const getConditionStyle = (condition?: string) => {
            if (!condition) return null;
            const lower = condition.toLowerCase();
            if (lower.includes('new')) return { bg: 'bg-emerald-500/90', label: 'New' };
            if (lower.includes('like')) return { bg: 'bg-blue-500/90', label: 'Like New' };
            if (lower.includes('good')) return { bg: 'bg-amber-500/90', label: 'Good' };
            return { bg: 'bg-gray-500/90', label: condition };
          };
          const conditionStyle = getConditionStyle(product.condition);

          return (
            <ProductCard 
              key={id}
              product={product}
              id={id}
              img={img}
              hasVideo={hasVideo}
              isPlaying={isPlaying}
              discountPercent={discountPercent}
              conditionStyle={conditionStyle}
              setPlayingVideoId={setPlayingVideoId}
            />
          );
        })}
      </div>
    </section>
  );
}

// Extracted Card Component for cleaner code and video handling
function ProductCard({ 
  product, 
  id, 
  img, 
  hasVideo, 
  isPlaying, 
  discountPercent, 
  conditionStyle,
  setPlayingVideoId
}: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // Handle Video Play/Pause based on Hover and Viewport
  useEffect(() => {
    if (!hasVideo || !videoRef.current) return;

    if (isHovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, hasVideo]);

  // Intersection Observer for auto-playing when scrolled into view (optional, mimics social feed)
  useEffect(() => {
    if (!hasVideo || !cardRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
           // Only auto-play if not hovered (hover takes precedence) and we want ambient play
           // For this design, we'll stick to hover-to-play to save bandwidth, 
           // but you can enable auto-play here by calling videoRef.current.play()
        }
      },
      { threshold: 0.6 }
    );
    
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasVideo]);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const priceDisplay = `₵${product.price}`;
  const originalPriceDisplay = product.originalPrice ? `₵${product.originalPrice}` : null;

  return (
    <Link 
      href={`/listings/${id}`} 
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
              src={product.videoUrl}
              poster={img}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
            />
          ) : img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
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
              TOP BADGES
          ========================================================== */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 max-w-[80%]">
            {discountPercent > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                -{discountPercent}%
              </span>
            )}
            
            {product.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                <CheckCircle2 size={10} fill="currentColor" />
                Verified
              </span>
            )}
          </div>

          {/* =========================================================
              VIDEO CONTROLS
          ========================================================== */}
          {hasVideo && (
            <>
              {/* Play Overlay (Only show if paused) */}
              {!isPlaying && !isHovered && (
                 <div className="absolute top-4 right-4 z-20 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-bold flex items-center gap-1">
                   <Play size={10} fill="white" />
                   VIDEO
                 </div>
              )}

              {/* Mute Toggle */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLiked(!isLiked);
                // Dispatch custom event if needed
                window.dispatchEvent(new CustomEvent('unimart:toggleFavorite', { detail: { id } }));
              }}
              className="group/btn flex flex-col items-center gap-1"
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
                {(product.likes || Math.floor(Math.random() * 200)).toLocaleString()}
              </span>
            </button>

            {/* View Count */}
            {product.views && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                  <Eye size={18} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {(product.views / 1000).toFixed(1)}k
                </span>
              </div>
            )}
          </div>

          {/* =========================================================
              BOTTOM MEDIA INFO (OVERLAY)
          ========================================================== */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pr-12 pb-16">
            {/* Seller Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-900 text-xs font-bold shadow-sm border border-white/20">
                {(product.sellerName || product.seller || "S")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/90 text-xs font-medium truncate drop-shadow-sm">
                  {product.sellerName || product.seller || "Seller"}
                </p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-base font-bold leading-snug line-clamp-2 drop-shadow-md mb-1">
              {product.title}
            </h3>
            
            {/* Location */}
            {product.location && (
               <div className="flex items-center gap-1 text-white/70 text-[10px] mt-1">
                 <MapPin size={10} />
                 <span className="truncate">{product.location}</span>
               </div>
            )}
          </div>

          {/* Condition Badge (Floating) */}
          {conditionStyle && (
            <div className="absolute bottom-20 left-4 z-20">
              <div className={`
                inline-flex items-center gap-1.5 
                px-3 py-1.5 rounded-lg 
                ${conditionStyle.bg} 
                text-white
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
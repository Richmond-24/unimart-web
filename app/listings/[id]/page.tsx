"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  ChevronLeft,
  ShoppingBag,
  MessageCircle,
  Star,
  Copy,
  ShoppingCart,
  Shield,
  Zap,
  Heart,
  Home,
} from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import apiFetch from "../../../lib/apiClient";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import CommentsSection from "../../../app/components/CommentsSection";
import ShareModal from "../../../app/components/ShareModal";

// ================== Main Component ==================
export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [listing, setListing] = useState<any | null>(null);
  const [nowTime, setNowTime] = useState(Date.now());
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [autoSlide, setAutoSlide] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [otherProducts, setOtherProducts] = useState<any[]>([]);
  const [loadingOthers, setLoadingOthers] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);

  // --- Fixed header height tracking (so content is offset correctly) ---
  const [headerHeight, setHeaderHeight] = useState(56); // sensible fallback
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // --- data derived from listing ---
  const images: string[] = listing?.imageUrls?.length ? listing.imageUrls : [];
  const discountPct =
    listing?.originalPrice && listing?.price
      ? Math.round((1 - listing.price / listing.originalPrice) * 100)
      : null;

  // --- auto-slide control functions ---
  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) stopAutoSlide();
    if (!autoSlide || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % images.length);
    }, 4000);
  }, [autoSlide, images.length, stopAutoSlide]);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  useEffect(() => {
    const t = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // --- Load other products by same seller ---
  useEffect(() => {
    const loadOtherProducts = async () => {
      if (!listing?.sellerId) return;
      setLoadingOthers(true);
      try {
        const res = await apiFetch(`/api/public/listings?sellerId=${listing.sellerId}&limit=6`);
        if (res?.data) {
          setOtherProducts(res.data.filter((p: any) => p._id !== listing._id));
        }
      } catch (e) {
        console.error("Failed to load other products", e);
      } finally {
        setLoadingOthers(false);
      }
    };
    loadOtherProducts();
  }, [listing]);

  // --- Share functions ---
  const shareLinks = [
    { name: "Facebook", icon: FaFacebook, color: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
    { name: "Twitter", icon: FaTwitter, color: "#000000", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(listing?.title || '')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
    { name: "WhatsApp", icon: FaWhatsapp, color: "#25D366", url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${listing?.title || ''} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}` },
    { name: "Instagram", icon: FaInstagram, color: "#E4405F", url: `https://www.instagram.com/` },
    { name: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
  ];

  const handleShare = (url: string) => {
    window.open(url, "_blank", "width=600,height=500");
    setShowShareMenu(false);
  };

  const shareProduct = async () => {
    // Try Web Share API first (with image when available)
    try {
      if (navigator && (navigator as any).share) {
        const shareData: any = {
          title: listing?.title || 'Uni-Mart product',
          text: listing?.title || '',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        };

        // attempt to include image as file if supported
        if (listing?.imageUrls && listing.imageUrls[0] && (navigator as any).canShare) {
          try {
            const imgUrl = listing.imageUrls[0];
            const res = await fetch(imgUrl);
            const blob = await res.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });
            if ((navigator as any).canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (e) {
            // ignore image fetch errors and continue with url only
            console.debug('Could not fetch image for share', e);
          }
        }

        await (navigator as any).share(shareData);
        setShowShareMenu(false);
        return;
      }
    } catch (e) {
      console.debug('Web Share failed', e);
    }

    // Fallback: open share modal
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (e) {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
    }
    setShowShareMenu(false);
  };

  // --- Add to cart ---
  const handleAddCart = async (redirectTo: string = '/cart') => {
    if (!listing) return;
    setCartAdded(true);

    const productId = listing._id || listing.id;
    const item = {
      id: productId,
      title: listing.title,
      price: listing.price,
      qty: 1,
      image: listing.imageUrls && listing.imageUrls[0],
    };

    try {
      const key = 'unimart:cart';
      const cur = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = cur.findIndex((c: any) => c.id === item.id);
      if (idx >= 0) cur[idx].qty = (cur[idx].qty || 1) + 1;
      else cur.push(item);
      localStorage.setItem(key, JSON.stringify(cur));
    } catch (e) {
      console.warn('Failed to update local cart fallback:', e);
    }

    try { window.dispatchEvent(new Event('unimart:cartUpdated')); } catch (e) {}

    const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
    const hasBackendProduct = !!listing?.productId || !!listing?.backendProductId || !!listing?.product?._id;
    const backendSave = token && hasBackendProduct
      ? apiFetch('/cart/add', {
          method: 'POST',
          body: { productId, quantity: 1 },
        }).catch((err) => {
          console.error('Add to cart backend failed:', err);
        })
      : Promise.resolve();

    try {
      await backendSave;
      await router.push(redirectTo);
    } catch (e) {
      console.error('Navigation to cart failed:', e);
    }

    setTimeout(() => setCartAdded(false), 1200);
  };

  // --- Contact seller ---
  const contactSeller = async () => {
    if (!id) return;
    try {
      await router.push(`/listings/${id}/chat`);
    } catch (err) {
      console.error('Navigation to chat failed:', err);
    }
  };

  // --- Rate product ---
  const handleRate = async (value: number) => {
    try {
      setUserRating(value);
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      const payload: any = { targetType: 'product', targetId: listing._id || listing.id, rating: value, comment: '' };
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (!token) {
        try {
          const key = 'unimart:guestRatings';
          const cur = JSON.parse(localStorage.getItem(key) || '{}');
          cur[listing._id || listing.id] = value;
          localStorage.setItem(key, JSON.stringify(cur));
        } catch (e) {}
      }

      if (token) {
        try {
          await apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(payload), headers });
        } catch (e) {}
      }

      const curRating = Number(listing.rating) || 2;
      const curCount = Number(listing.reviewCount) || 0;
      const newCount = curCount + 1;
      const newRating = ((curRating * curCount) + value) / newCount;
      setListing({ ...listing, rating: Number(newRating.toFixed(1)), reviewCount: newCount });

      try {
        const refreshed = await apiFetch(`/api/public/listings/${listing._id || listing.id}`);
        if (refreshed?.data) setListing(refreshed.data);
      } catch (e) {}
    } catch (err) {
      console.error('Failed to submit rating', err);
    }
  };

  // --- Fetch listing data ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/api/public/listings/${id}`);
        if (mounted && res?.data) setListing(res.data);
      } catch (err) {
        console.error("Error loading listing", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      stopAutoSlide();
    };
  }, [id, stopAutoSlide]);

  // --- Keyboard navigation ---
  useEffect(() => {
    if (!showPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPreview(false);
      else if (e.key === 'ArrowRight') setPreviewIndex((i) => (i + 1) % images.length);
      else if (e.key === 'ArrowLeft') setPreviewIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPreview, images.length]);

  // --- Auth prompt ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('unimart:token');
    const guest = localStorage.getItem('unimart:guest');
    if (!token && !guest) setShowAuthPrompt(true);
    else setShowAuthPrompt(false);
  }, []);

  // --- Click outside share menu ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size={48} />
    </div>
  );
  if (!listing) return <NotFound router={router} />;

  if (showAuthPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="fixed inset-0 bg-black/50 z-50" />
        <div className="relative z-60 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Please sign in to view this product</h2>
          <p className="text-sm text-gray-600 mb-4">Create an account or continue as guest.</p>
          <div className="flex gap-3">
            <button onClick={() => router.push('/auth')} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold">Sign In / Sign Up</button>
            <button onClick={() => {
              try { localStorage.setItem('unimart:guest', '1'); } catch (e) {}
              try { window.dispatchEvent(new Event('unimart:guestStarted')); } catch (e) {}
              setShowAuthPrompt(false);
            }} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-medium">Guest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans pb-[calc(5.5rem+env(safe-area-inset-bottom))]">

      {/* ===== Fixed page header (opaque, always pinned — no translucent scroll gap) ===== */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm"
      >
        <div
          className="max-w-3xl mx-auto px-3 flex items-center justify-between"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))", paddingBottom: "0.625rem" }}
        >
          <Link
            href="/"
            aria-label="Back to home"
            className="flex items-center gap-1.5 -ml-1.5 px-2 py-1.5 rounded-full text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[45%]">Product details</span>
          <div className="w-16 shrink-0" aria-hidden="true" />
        </div>
      </header>

      {/* Spacer so the fixed header doesn't overlap content below it */}
      <div style={{ height: headerHeight }} aria-hidden="true" />

      {/* ===== Image hero — normal flow, NOT sticky ===== */}
      <div className="relative bg-white">
        {/* Overlay top bar */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 pb-2"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))", background: "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, transparent 100%)" }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              ref={shareButtonRef}
              onClick={shareProduct}
              aria-label="Share product"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/cart")}
              aria-label="View cart"
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showShareMenu && (
          <div ref={shareMenuRef} className="absolute right-3 top-14 z-30 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-56 fade-in">
            <div className="grid grid-cols-3 gap-2">
              {shareLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleShare(item.url)}
                    className="p-2 rounded-xl hover:bg-gray-50 transition flex flex-col items-center gap-1"
                    title={item.name}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                    <span className="text-[10px] text-gray-500">{item.name}</span>
                  </button>
                );
              })}
              {/* Copy action removed from share menu per UX request */}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-14 left-3 z-10 flex flex-col gap-2">
          {listing.condition === "new" && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">NEW</span>
          )}
          {discountPct && (
            <span className="bg-[#ff3b30] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">{discountPct}% OFF</span>
          )}
        </div>

        {images.length > 0 ? (
          <div className="relative overflow-hidden bg-[#fafafa]">
            <div
              style={{
                display: "flex",
                transform: `translateX(-${activeImg * 100}%)`,
                transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform",
              }}
            >
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${listing.title} ${idx + 1}`}
                  style={{ height: "min(72vw, 460px)", minHeight: "220px", flexShrink: 0, width: "100%" }}
                  className="object-contain cursor-pointer bg-[#fafafa]"
                  onClick={() => { setPreviewIndex(idx); setShowPreview(true); }}
                />
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((activeImg - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImg((activeImg + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeImg + 1}/{images.length}
                </div>
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`h-1 rounded-full transition-all ${activeImg === idx ? "w-5 bg-[#fb6f20]" : "w-1 bg-white/70"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="w-full bg-gray-100 flex items-center justify-center text-gray-400"
            style={{ height: "min(72vw, 460px)", minHeight: "220px" }}
          >
            No image available
          </div>
        )}

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-3 py-2 scrollbar-hide bg-white border-b border-gray-100">
            {images.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${activeImg === idx ? "border-[#fb6f20]" : "border-transparent"}`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-0">
        <div className="space-y-2">
          {/* Flash deal strip */}
          {(() => {
            const endsAt =
              (listing.flashDealExpiry && new Date(listing.flashDealExpiry).getTime()) ||
              (listing.expiresAt && new Date(listing.expiresAt).getTime()) ||
              (listing.flashDeal?.endsAt && new Date(listing.flashDeal.endsAt).getTime()) ||
              null;
            if (!endsAt) return null;
            const remaining = endsAt - nowTime;
            return (
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)", borderBottom: "1px solid #fed7aa" }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#fb6f20]" fill="#fb6f20" />
                  <span className="text-sm font-bold text-[#c2410c]">Flash deal</span>
                </div>
                <span className="text-sm font-mono font-bold text-[#ff3b30]">{formatRemaining(remaining)}</span>
              </div>
            );
          })()}

          {/* Price & title card */}
          <div className="bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-extrabold text-[#fb6f20] tracking-tight">₵{listing.price}</span>
                  {listing.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">₵{listing.originalPrice}</span>
                  )}
                  {discountPct && (
                    <span className="text-xs font-bold text-white bg-[#ff3b30] px-1.5 py-0.5 rounded">-{discountPct}%</span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Free campus delivery · Uni-Mart verified
                </p>
              </div>
              <button aria-label="Save to favorites" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-200 transition shrink-0">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <h1 className="mt-3 text-[15px] sm:text-base font-medium text-gray-900 leading-snug line-clamp-3">{listing.title}</h1>

            {listing.rating && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-0.5 bg-[#fb6f20] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {Number(listing.rating).toFixed(1)} <Star className="w-3 h-3 fill-white" />
                </div>
                {listing.reviewCount ? (
                  <span className="text-xs text-gray-500">{listing.reviewCount} reviews</span>
                ) : null}
                <div className="flex items-center gap-0.5 ml-auto">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < Math.round(userRating ?? listing?.rating ?? 0);
                    return (
                      <button key={i} onClick={() => handleRate(i + 1)} aria-label={`Rate ${i + 1} stars`} className="p-0.5">
                        <Star className={`w-3.5 h-3.5 ${filled ? "text-[#fb6f20] fill-[#fb6f20]" : "text-gray-200"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust pills */}
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[
                { icon: Shield, label: "Buyer protection" },
                { icon: Truck, label: "2–3 day delivery" },
                { icon: CheckCircle, label: "Verified seller" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 shrink-0 text-[11px] text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                  <Icon className="w-3 h-3 text-teal-600" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-white px-4 py-3 border-t border-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Delivers to <strong>{listing.location || "your campus"}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Order within 2hrs for same-day delivery
            </div>
          </div>

          {/* Seller */}
          <div className="bg-white px-4 py-4 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-50 overflow-hidden shrink-0 border border-teal-100">
                {listing.sellerImage ? (
                  <img src={listing.sellerImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-700 font-bold text-sm">
                    {(listing.sellerName || "S").charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Sold by</p>
                <p className="font-semibold text-gray-900 truncate">{listing.sellerName || listing.seller || "Uni-Mart Seller"}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <button
                onClick={contactSeller}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100 hover:bg-teal-100 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
            </div>
            {listing.stock !== undefined && (
              <p className="mt-2 text-xs text-gray-500"><span className="text-[#fb6f20] font-bold">{listing.stock}</span> items left in stock</p>
            )}
          </div>

          {/* Highlights & description */}
          {listing.description && (
            <div className="bg-white px-4 py-4 border-t border-gray-50">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Product details</h3>
              <ul className="space-y-1.5 mb-3">
                {listing.description.split(/\.\s+/).filter(Boolean).slice(0, 3).map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-[#fb6f20]">•</span>
                    {point.replace(/\.$/, "")}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* More from seller */}
          <div className="bg-white px-4 py-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">More from this seller</h3>
              <Link href={`/seller/${listing.sellerId}`} className="text-xs text-[#fb6f20] font-semibold">See all</Link>
            </div>
            {loadingOthers ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : otherProducts.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {otherProducts.map((product) => (
                  <Link key={product._id} href={`/listings/${product._id}`} className="flex-shrink-0 w-[132px]">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      {product.imageUrls?.[0] && (
                        <img src={product.imageUrls[0]} alt={product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="text-xs text-gray-800 mt-1.5 line-clamp-2 leading-tight">{product.title}</p>
                    <p className="text-sm font-bold text-[#fb6f20] mt-0.5">₵{product.price}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No other products from this seller</p>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white px-4 py-4 border-t border-gray-50 mb-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Reviews</h3>
            <CommentsSection listingId={listing._id || listing.id} />
          </div>
        </div>
      </div>

      {/* Floating chat FAB */}
      <button
        onClick={contactSeller}
        aria-label="Chat with seller"
        className="fixed right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(5.5rem+env(safe-area-inset-bottom)+1.25rem)]"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div
          className="max-w-3xl mx-auto px-3 pt-2.5 flex items-center gap-2"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={contactSeller}
            aria-label="Chat"
            className="flex flex-col items-center justify-center w-12 shrink-0 text-gray-600 hover:text-teal-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Chat</span>
          </button>
          <button
            onClick={() => handleAddCart()}
            className={`flex-1 py-3 rounded-full font-bold text-sm transition flex items-center justify-center gap-1.5 border-2 ${
              cartAdded
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "bg-white border-[#fb6f20] text-[#fb6f20] hover:bg-orange-50"
            }`}
          >
            {cartAdded ? <CheckCircle className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {cartAdded ? "Added" : "Add to cart"}
          </button>
          <button
            onClick={async () => { await handleAddCart('/checkout'); }}
            className="flex-[1.15] py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#fb6f20] to-[#e85d0a] hover:brightness-105 shadow-md shadow-orange-500/30 transition flex items-center justify-center gap-1.5"
          >
            Buy now
          </button>
        </div>
      </div>

      {/* Image preview lightbox */}
      {showPreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPreview(false)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/10 text-white">✕</button>
            <button onClick={() => setPreviewIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 p-2 rounded-full bg-white/10 text-white">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img src={images[previewIndex]} alt="" className="max-h-[85vh] max-w-full object-contain" />
            <button onClick={() => setPreviewIndex((i) => (i + 1) % images.length)} className="absolute right-2 p-2 rounded-full bg-white/10 text-white">
              <ChevronLeft className="w-6 h-6 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal listing={listing} open={showShareModal} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}

// ================== Helper Components ==================
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function NotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Listing not found</h2>
      <button onClick={() => router.back()} className="text-teal-600 font-medium hover:underline">
        ← Back
      </button>
    </div>
  );
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
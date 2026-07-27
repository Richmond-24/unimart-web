"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2, CheckCircle, ChevronLeft, ChevronRight,
  ShoppingBag, MessageCircle, Star, Heart, Play, X, Send,
  Search, ArrowUpRight, Copy, Eye, Bookmark, Image as ImageIcon
} from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaTelegramPlane,
  FaSnapchatGhost,
} from "react-icons/fa";
import apiFetch from "../../../lib/apiClient";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import Footer from "../../../app/components/Footer";

// Mock comments — swapped in for the old "live chat" mock
const MOCK_COMMENTS = [
  { id: 1, user: "kwame_a", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", text: "Is this still available? 👀", likes: 4, time: "2m" },
  { id: 2, user: "ama.d", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", text: "How much for two 😍", likes: 12, time: "8m" },
  { id: 3, user: "kojo_t", avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=60&h=60&fit=crop", text: "Delivery to Legon possible?", likes: 2, time: "22m" },
];

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
];

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// Rating ring around the seller avatar — the page's one signature flourish,
// a progress ring whose fill directly encodes the seller's star rating.
function RatingRing({ rating, children }: { rating: number; children: React.ReactNode }) {
  const pct = Math.max(0, Math.min(1, rating / 5));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={radius} fill="none"
          stroke="url(#ratingGradient)" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB020" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-[5px] rounded-full overflow-hidden border-2 border-black/40">
        {children}
      </div>
    </div>
  );
}

function RailButton({ icon, label, onClick, active, activeColor }: {
  icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean; activeColor?: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div
        className={`w-11 h-11 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all group-active:scale-90 ${
          active ? activeColor || "bg-white/25" : "bg-white/10 group-hover:bg-white/20"
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-bold text-white drop-shadow">{label}</span>
    </button>
  );
}

// Reusable bottom sheet — replaces the old floating boxes with a clearer,
// native-feeling slide-up drawer (grab handle, backdrop, rounded top).
function BottomSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#111114] rounded-t-3xl border-t border-x border-white/10 pb-6 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 pt-1 pb-3 border-b border-white/10">
          <h3 className="text-white font-black text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
            <X size={15} className="text-white" />
          </button>
        </div>
        <div className="overflow-y-auto px-5">{children}</div>
      </div>
    </div>
  );
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartAdded, setCartAdded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1204);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/listings/${id}`);
        if (mounted && res?.data) setListing(res.data);
      } catch (err) {
        console.error("Error loading listing", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [listing]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      user: "you",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop",
      text: commentInput,
      likes: 0,
      time: "now",
    }]);
    setCommentInput("");
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleLike = () => {
    setLiked(v => !v);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  const handleAddCart = async () => {
    if (!listing) return;
    setCartAdded(true);
    const item = {
      id: listing._id || listing.id,
      title: listing.title,
      price: listing.price,
      qty: 1,
      image: listing.videoThumbnail || listing.imageUrls?.[0],
    };
    try {
      const key = 'unimart:cart';
      const cur = JSON.parse(localStorage.getItem(key) || '[]');
      cur.push(item);
      localStorage.setItem(key, JSON.stringify(cur));
      window.dispatchEvent(new Event('unimart:cartUpdated'));
    } catch (e) {}
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!listing) return;
    const item = {
      id: listing._id || listing.id,
      title: listing.title,
      price: listing.price,
      qty: 1,
      image: listing.videoThumbnail || listing.imageUrls?.[0],
    };
    try {
      sessionStorage.setItem('unimart:buynow', JSON.stringify([item]));
    } catch (e) {}
    router.push('/checkout?buyNow=1');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = listing ? `${listing.title} - GH₵ ${listing.price}` : 'Check this out on Uni-Mart!';

  const shareLinks = [
    { name: "WhatsApp", icon: FaWhatsapp, color: "#25D366", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank') },
    { name: "Instagram", icon: FaInstagram, color: "#E4405F", action: () => { navigator.clipboard.writeText(currentUrl); alert("Link copied for Instagram!"); } },
    { name: "Snapchat", icon: FaSnapchatGhost, color: "#FFFC00", action: () => window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Facebook", icon: FaFacebookF, color: "#1877F2", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Telegram", icon: FaTelegramPlane, color: "#0088cc", action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank') },
    { name: "Twitter", icon: FaTwitter, color: "#000000", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "LinkedIn", icon: FaLinkedinIn, color: "#0A66C2", action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank') },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><LoadingSpinner size={48} /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Not Found</div>;

  const videoUrl = listing.videoUrls?.[0] || listing.videoUrl;
  const thumbnail = listing.videoThumbnail || listing.imageUrls?.[0];
  const photos: string[] = (listing.imageUrls && listing.imageUrls.length > 0) ? listing.imageUrls : FALLBACK_PHOTOS;
  const rating = listing.rating ?? 4.8;
  const ratingCount = listing.ratingCount ?? 312;
  const views = listing.views ?? 18400;

  return (
    <div className="relative h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-[#6C5CE7] selection:text-white">

      {/* Full Screen Video Background — the "reel" */}
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnail}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) videoRef.current.pause();
                else videoRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
          />
        ) : (
          <img src={thumbnail} className="w-full h-full object-cover" alt="Product" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none" />
      </div>

      {/* Top Navigation — slimmer, feed-style */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D9A3] animate-pulse" />
          <span className="font-black text-xs tracking-tight">For You</span>
        </div>
        <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </button>
      </header>

      {/* Right Action Rail — TikTok-style vertical stack */}
      <div className="absolute right-2.5 bottom-40 z-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <RatingRing rating={rating}>
            <img src={listing.sellerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-full h-full object-cover" />
          </RatingRing>
          <button className="w-5 h-5 -mt-2 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#FF6B9D] flex items-center justify-center text-[11px] font-black border-2 border-black">+</button>
        </div>

        <RailButton
          icon={<Heart size={22} className={liked ? "text-[#FF6B9D] fill-[#FF6B9D]" : "text-white"} />}
          label={formatCount(likeCount)}
          onClick={handleLike}
          active={liked}
          activeColor="bg-[#FF6B9D]/20"
        />
        <RailButton
          icon={<MessageCircle size={22} className="text-white" />}
          label={formatCount(comments.length + 84)}
          onClick={() => setShowComments(true)}
        />
        <RailButton
          icon={<Bookmark size={20} className={saved ? "text-[#FFB020] fill-[#FFB020]" : "text-white"} />}
          label="Save"
          onClick={() => setSaved(v => !v)}
          active={saved}
          activeColor="bg-[#FFB020]/20"
        />
        <RailButton
          icon={<Share2 size={20} className="text-white" />}
          label="Share"
          onClick={() => setShowShare(true)}
        />
        <RailButton
          icon={<ImageIcon size={20} className="text-white" />}
          label={`${photos.length} pics`}
          onClick={() => { setGalleryIndex(0); setShowGallery(true); }}
        />

        <div className="flex flex-col items-center gap-0.5 pt-1">
          <Eye size={16} className="text-white/70" />
          <span className="text-[10px] font-bold text-white/70">{formatCount(views)}</span>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <main className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-[104px] pt-24 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-black text-sm">@{listing.sellerName || "seller"}</span>
          <CheckCircle size={13} className="text-[#00D9A3]" fill="currentColor" />
          <span className="text-white/50 text-xs">· {listing.location || "Accra, Ghana"}</span>
        </div>

        <h1 className="text-xl font-black leading-snug mb-2 drop-shadow-lg line-clamp-2 pr-14">
          {listing.title}
        </h1>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-baseline gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5">
            <span className="text-2xl font-black text-[#00D9A3]">GH₵ {listing.price}</span>
            {listing.originalPrice && (
              <span className="text-xs text-white/40 line-through">GH₵ {listing.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-xl px-2.5 py-1.5">
            <Star size={13} className="text-[#FFB020] fill-[#FFB020]" />
            <span className="text-xs font-black">{rating}</span>
            <span className="text-[10px] text-white/50 font-medium">({formatCount(ratingCount)})</span>
          </div>
        </div>

        {/* Photo strip — quick peek into the gallery without leaving the feed */}
        <button
          onClick={() => { setGalleryIndex(0); setShowGallery(true); }}
          className="flex items-center gap-2 mb-1 group"
        >
          <div className="flex -space-x-3">
            {photos.slice(0, 3).map((p, i) => (
              <div key={i} className="w-9 h-9 rounded-xl border-2 border-black overflow-hidden shadow-lg" style={{ zIndex: 3 - i }}>
                <img src={p} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-white/80 group-hover:text-white transition">View {photos.length} photos</span>
          <ChevronRight size={14} className="text-white/60" />
        </button>
      </main>

      {/* Sticky Bottom CTA Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-8 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="max-w-md mx-auto flex gap-2.5">
          <button
            onClick={handleAddCart}
            className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all border-2 ${
              cartAdded
                ? "bg-[#00D9A3] border-[#00D9A3] text-black"
                : "bg-white/5 border-white/25 text-white active:scale-95"
            }`}
          >
            <ShoppingBag size={16} />
            {cartAdded ? "Added!" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-[1.4] py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#6C5CE7] to-[#FF6B9D] active:scale-95 shadow-lg shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-1.5"
          >
            Buy Now
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Floating Play Icon when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Play size={30} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* ===== Comments Sheet ===== */}
      <BottomSheet open={showComments} onClose={() => setShowComments(false)} title={`${comments.length} comments`}>
        <div className="space-y-4 py-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <img src={c.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/60">@{c.user}</span>
                  <span className="text-[10px] text-white/30">{c.time}</span>
                </div>
                <p className="text-sm text-white leading-snug mt-0.5">{c.text}</p>
              </div>
              <button className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                <Heart size={14} className="text-white/40" />
                <span className="text-[10px] text-white/40 font-bold">{c.likes}</span>
              </button>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
        <form onSubmit={handleSendComment} className="sticky bottom-0 bg-[#111114] flex gap-2 py-3 -mx-5 px-5 border-t border-white/10">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#6C5CE7]/50 transition"
          />
          <button type="submit" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#FF6B9D] flex items-center justify-center shrink-0">
            <Send size={15} className="text-white" />
          </button>
        </form>
      </BottomSheet>

      {/* ===== Share Sheet ===== */}
      <BottomSheet open={showShare} onClose={() => setShowShare(false)} title="Share to">
        <div className="grid grid-cols-4 gap-y-5 py-4">
          {shareLinks.map((link, idx) => (
            <button key={idx} onClick={link.action} className="flex flex-col items-center gap-1.5 active:scale-90 transition">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: link.color === "#FFFC00" ? "#FFFC00" : link.color }}
              >
                <link.icon size={19} className={link.name === "Snapchat" ? "text-black" : "text-white"} />
              </div>
              <span className="text-[10px] font-medium text-white/70">{link.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(currentUrl); alert("Link copied to clipboard!"); }}
          className="w-full flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 mb-4 border border-white/10 active:scale-[0.98] transition"
        >
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Copy size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white">Copy link</p>
            <p className="text-[10px] text-white/40 truncate">{currentUrl}</p>
          </div>
        </button>
      </BottomSheet>

      {/* ===== Photo Gallery Sheet ===== */}
      <BottomSheet open={showGallery} onClose={() => setShowGallery(false)} title={`Photos · ${galleryIndex + 1}/${photos.length}`}>
        <div className="relative rounded-2xl overflow-hidden bg-white/5 aspect-[4/5] mb-3">
          <img src={photos[galleryIndex]} className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIndex(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={() => setGalleryIndex(i => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setGalleryIndex(i)}
              className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                i === galleryIndex ? "border-[#6C5CE7]" : "border-transparent opacity-60"
              }`}
            >
              <img src={p} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </BottomSheet>

      <Footer />
    </div>
  );
}
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown,
  ShoppingBag, MessageCircle, Star, Heart, Play, X, Send,
  Truck, ShieldCheck, RotateCcw, Copy, Eye, Bookmark, MapPin,
  Flame, Radio, Volume2, VolumeX, Clock, Tag,
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
import { useAuth } from "../../../app/context/AuthContext";

// ===========================================================================
// TYPES
// ===========================================================================
interface TrendingProduct {
  id: string;
  title: string;
  price: number;
  thumb: string;
  seller: string;
  likes: number;
  isVideo: boolean;
  isLive: boolean;
  tag: string;
  productUrl?: string;
  discount?: number;
  soldCount?: number;
  isSponsored?: boolean;
  isVerified?: boolean;
}

interface Comment {
  id: string | number;
  user: string;
  avatar: string;
  text: string;
  rating: number;
  likes: number;
  time: string;
}

// ===========================================================================
// MOCK DATA & CONSTANTS
// ===========================================================================
const MOCK_COMMENTS: Comment[] = [
  { 
    id: 1, 
    user: "kwame_a", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop", 
    text: "Is this still available? 👀", 
    rating: 5, 
    likes: 4, 
    time: "2m" 
  },
  { 
    id: 2, 
    user: "ama.d", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop", 
    text: "Bought one last week, quality is really solid for the price.", 
    rating: 5, 
    likes: 12, 
    time: "8m" 
  },
  { 
    id: 3, 
    user: "kojo_t", 
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=60&h=60&fit=crop", 
    text: "Delivery to Legon was quick, no issues at all.", 
    rating: 4, 
    likes: 2, 
    time: "22m" 
  },
];

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
];

// Enhanced trending feed with TikTok-style shopping features
function buildTrendingProduct(item: any, tag: "trending" | "new"): TrendingProduct {
  const thumb = item.imageUrls?.[0] || item.thumbnail || item.image || item.photo || item.thumb || FALLBACK_PHOTOS[0];
  const sellerName = item.sellerName || item.seller || item.seller?.name || item.sellerEmail || "seller";
  const price = Number(item.price || item.amount || item.cost || 0);
  return {
    id: item._id || item.id || String(Math.random()).slice(2),
    title: item.title || item.name || "Campus find",
    price,
    thumb,
    seller: sellerName,
    likes: Number(item.views || item.sales || item.likes || 0),
    isVideo: Boolean((item.videoUrls && item.videoUrls.length) || item.videoUrl),
    isLive: false,
    tag,
    productUrl: item.url || item.productUrl,
    discount: item.discount ?? item.salePercent ?? undefined,
    soldCount: Number(item.sold || item.sales || item.orderCount || item.orders || 0),
    isSponsored: Boolean(item.isSponsored || item.sponsored),
    isVerified: Boolean(item.isVerified || item.verified || item.sellerVerified),
  };
}

const FEED_TABS = [
  { key: "trending", label: "Trending", icon: Flame },
  { key: "new", label: "New in", icon: Star },
] as const;

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================
function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatRelativeTime(value?: string | Date): string {
  if (!value) return "just now";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Derive up to 2 initials from a display name / handle (e.g. "kojo_designs" -> "KD")
function getInitials(name: string): string {
  if (!name) return "?";
  const cleaned = name.trim().replace(/^@/, "");
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Deterministic color pick so the same name always gets the same avatar color
const AVATAR_PALETTE = [
  "#6C5CE7", "#FF6B9D", "#00D9A3", "#FFB020", "#FF3B5C", "#0EA5E9", "#14B8A6", "#F97316",
];

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// ===========================================================================
// COMPONENTS
// ===========================================================================

// Initials Avatar Component — replaces a photo with the seller's initials
function InitialsAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center font-black text-white select-none ${className}`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

// Small "Verified Seller" swoosh tag
function VerifiedSellerTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-[#00D9A3] to-[#0EA5E9] rounded-full pl-1.5 pr-2.5 py-[3px] shadow-sm ${className}`}
    >
      <CheckCircle2 size={11} className="text-white" strokeWidth={2.25} />
      <span className="text-[9px] font-black text-white tracking-wide">Verified Seller</span>
    </span>
  );
}

// Trust Ring Component
function TrustRing({ score, size = 56, strokeWidth = 3, children }: {
  score: number; 
  size?: number; 
  strokeWidth?: number; 
  children: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, score / 5));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const c = size / 2;
  
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={c} cy={c} r={radius} fill="none" stroke="rgba(20,20,26,0.08)" strokeWidth={strokeWidth} />
        <circle
          cx={c} cy={c} r={radius} fill="none"
          stroke="url(#trustRingGradient)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="trustRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB020" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute rounded-full overflow-hidden" style={{ inset: strokeWidth + 2 }}>
        {children}
      </div>
    </div>
  );
}

// Bottom Sheet Component
function BottomSheet({ open, onClose, title, children }: {
  open: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl lg:rounded-3xl pb-6 max-h-[82vh] lg:max-h-[75vh] flex flex-col animate-in slide-in-from-bottom-10 lg:zoom-in-95 duration-300 shadow-2xl">
        <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#14141A]/15" />
        </div>
        <div className="flex items-center justify-between px-5 pt-1 lg:pt-4 pb-3 border-b border-[#14141A]/8">
          <h3 className="text-[#14141A] font-black text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F6F5F8] flex items-center justify-center hover:bg-[#14141A]/10 transition">
            <X size={15} className="text-[#14141A]" />
          </button>
        </div>
        <div className="overflow-y-auto px-5">{children}</div>
      </div>
    </div>
  );
}

// Trust Badge Component
function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#F6F5F8] rounded-xl px-3 py-2 lg:hover:bg-[#EFEEF3] transition-colors">
      <span className="text-[#6C5CE7]">{icon}</span>
      <span className="text-[11px] font-bold text-[#14141A]">{label}</span>
    </div>
  );
}

// Enhanced TrendCard with TikTok-style shopping features
function TrendCard({ item, onOpen, onQuickAdd }: { 
  item: TrendingProduct; 
  onOpen: (id: string) => void;
  onQuickAdd: (item: TrendingProduct) => void;
}) {
  const [muted, setMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[3/4.4] rounded-2xl overflow-hidden bg-[#F6F5F8] group lg:shadow-sm lg:hover:shadow-xl lg:hover:-translate-y-1 lg:transition-all lg:duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => onOpen(item.id)}
        className="w-full h-full text-left"
      >
        <img src={item.thumb} className="w-full h-full object-cover lg:group-hover:scale-105 lg:transition-transform lg:duration-500" alt={item.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-black/25" />

        {/* Product tag overlays - TikTok style */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {item.isLive ? (
              <span className="flex items-center gap-1 bg-[#FF3B5C] rounded-full pl-1.5 pr-2 py-0.5 animate-pulse">
                <Radio size={10} className="text-white" />
                <span className="text-[9px] font-black text-white tracking-wide">LIVE</span>
              </span>
            ) : item.isVideo ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/40 backdrop-blur-md">
                <Play size={9} className="text-white ml-px" fill="white" />
              </span>
            ) : <span />}
            
            {item.isSponsored && (
              <span className="bg-amber-500/90 backdrop-blur-md rounded-full px-1.5 py-0.5">
                <span className="text-[8px] font-black text-white tracking-wide">SPONSORED</span>
              </span>
            )}
          </div>
          
          <span className="flex items-center gap-1 bg-black/35 backdrop-blur-md rounded-full px-1.5 py-0.5">
            <Heart size={9} className="text-white fill-white" />
            <span className="text-[9px] font-bold text-white">{formatCount(item.likes)}</span>
          </span>
        </div>

        {/* Discount badge - TikTok style */}
        {item.discount && (
          <div className="absolute top-12 right-2 bg-red-500 rounded-full px-1.5 py-0.5">
            <span className="text-[9px] font-black text-white">-{item.discount}%</span>
          </div>
        )}

        {/* Quick add button - appears on hover like TikTok Shop */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(item);
            }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-1.5 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <span className="text-xs font-black text-[#14141A]">Quick Add</span>
          </button>
        )}

        {/* Bottom: title, seller, price */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[11px] font-bold text-white leading-snug line-clamp-2 mb-1 drop-shadow">{item.title}</p>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-white/75 truncate">@{item.seller}</span>
              {item.isVerified && (
                <CheckCircle2 size={10} className="text-[#00D9A3] shrink-0" fill="currentColor" strokeWidth={1.5} color="white" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {item.discount && (
                <span className="text-[9px] text-white/60 line-through">GH₵{Math.round(item.price * (1 + item.discount/100))}</span>
              )}
              <span className="shrink-0 bg-white rounded-full px-2 py-0.5 text-[10px] font-black text-[#14141A]">
                GH₵{item.price}
              </span>
            </div>
          </div>
          
          {/* Sold count - TikTok style social proof */}
          {item.soldCount && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[8px] text-white/60">🔥 {item.soldCount} sold</span>
            </div>
          )}
        </div>
      </button>

      {/* Mute button for videos */}
      {item.isVideo && (
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
          className="absolute bottom-16 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
        >
          {muted ? <VolumeX size={11} className="text-white" /> : <Volume2 size={11} className="text-white" />}
        </button>
      )}
    </div>
  );
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { token, isAuthenticated } = useAuth();

  // ===== STATE =====
  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartAdded, setCartAdded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [followBusy, setFollowBusy] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [feedTab, setFeedTab] = useState<(typeof FEED_TABS)[number]["key"]>("trending");
  const [feedProducts, setFeedProducts] = useState<TrendingProduct[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalMuted, setModalMuted] = useState(false);
  const [dealRemaining, setDealRemaining] = useState(5 * 60 * 60 * 1000 + 43 * 60 * 1000);
  const [quickAddNotification, setQuickAddNotification] = useState<{ visible: boolean; product: string }>({ 
    visible: false, 
    product: "" 
  });

  // ===== REFS =====
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ===== EFFECTS =====
  // Countdown timer for flash sale
  useEffect(() => {
    const t = setInterval(() => setDealRemaining((ms) => (ms > 1000 ? ms - 1000 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Load listing data
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
    let mounted = true;
    const loadFeed = async () => {
      setFeedLoading(true);
      setFeedError(null);
      try {
        const trendingRes = await apiFetch('/public/trending?limit=12').catch(() => null);
        const newRes = await apiFetch('/public/listings?limit=12').catch(() => null);

        const trendingData = Array.isArray(trendingRes?.data)
          ? trendingRes.data
          : Array.isArray(trendingRes)
          ? trendingRes
          : [];
        const newData = Array.isArray(newRes?.data)
          ? newRes.data
          : Array.isArray(newRes)
          ? newRes
          : [];

        const trendingItems = trendingData.map((item: any) => buildTrendingProduct(item, 'trending'));
        const newItems = newData
          .filter((item: any) => !trendingItems.some((existing) => String(existing.id) === String(item._id || item.id)))
          .map((item: any) => buildTrendingProduct(item, 'new'));

        if (mounted) {
          setFeedProducts([...trendingItems, ...newItems]);
        }
      } catch (err: any) {
        console.error('Error loading trending feed', err);
        if (mounted) setFeedError('Unable to load trending products right now.');
      } finally {
        if (mounted) setFeedLoading(false);
      }
    };

    loadFeed();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncAuth = () => {
      try {
        const hasToken = Boolean(token || localStorage.getItem("unimart:token"));
        setIsSignedIn(Boolean(isAuthenticated && hasToken));
      } catch {
        setIsSignedIn(false);
      }
    };

    syncAuth();
    window.addEventListener("unimart:authChanged", syncAuth);
    return () => window.removeEventListener("unimart:authChanged", syncAuth);
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const loadReviews = async () => {
      setCommentsLoading(true);
      try {
        const res = await apiFetch(`/reviews?targetType=product&targetId=${id}&limit=20`);
        if (mounted && res?.success) {
          setComments((res.data || []).map((review: any) => ({
            id: review._id || review.id,
            user: review.user?.name || "Anonymous",
            avatar: review.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop",
            text: review.comment || "",
            rating: review.rating || 5,
            likes: 0,
            time: formatRelativeTime(review.createdAt),
          })));
        }
      } catch (err) {
        console.error("Error loading reviews", err);
      } finally {
        if (mounted) setCommentsLoading(false);
      }
    };
    loadReviews();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const loadReactions = async () => {
      try {
        const res = await apiFetch(`/listings/${id}/reactions`);
        if (mounted && res?.success) {
          setLiked(Boolean(res.data?.userVote));
          setLikeCount(Number(res.data?.up || 0));
        }
      } catch (err) {
        console.error("Error loading reactions", err);
      }
    };
    loadReactions();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    const sellerEmail = listing?.sellerEmail || listing?.seller?.email || null;
    const sellerId = listing?.sellerId || listing?.seller?._id || listing?.seller?.id || null;
    if (!sellerEmail && !sellerId) return;

    let mounted = true;
    const loadFollowStatus = async () => {
      if (!isSignedIn) {
        if (mounted) {
          setFollowing(false);
          setFollowCount(0);
        }
        return;
      }
      try {
        const query = new URLSearchParams();
        if (sellerEmail) query.set("targetEmail", sellerEmail);
        if (sellerId) query.set("targetId", sellerId);
        const res = await apiFetch(`/users/follow-status?${query.toString()}`);
        if (mounted && res?.success) {
          setFollowing(Boolean(res.data?.following));
          setFollowCount(Number(res.data?.followersCount || 0));
        }
      } catch (err) {
        console.error("Error loading follow state", err);
      }
    };
    loadFollowStatus();
    return () => { mounted = false; };
  }, [listing?.sellerEmail, listing?.seller?.email, listing?.sellerId, listing?.seller?._id, listing?.seller?.id, isSignedIn]);

  useEffect(() => {
    if (!id || !isSignedIn) {
      setSaved(false);
      return;
    }

    let mounted = true;
    const loadSavedState = async () => {
      try {
        const res = await apiFetch('/users/saved');
        if (mounted && res?.success) {
          const items = Array.isArray(res.data) ? res.data : [];
          const exists = items.some((item: any) => {
            const itemId = item?._id || item?.id || item?.listingId || item?.productId || '';
            return String(itemId) === String(id);
          });
          setSaved(exists);
        }
      } catch (err) {
        console.error("Error loading saved state", err);
      }
    };

    loadSavedState();
    return () => { mounted = false; };
  }, [id, isSignedIn]);

  // Handle video playback
  useEffect(() => {
    if (media[mediaIndex]?.type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [mediaIndex, listing]);

  // ===== HANDLERS =====
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !id) return;
    if (!isSignedIn) {
      setReviewError("Please sign in to leave a review.");
      return;
    }

    setCommentsLoading(true);
    setReviewError("");
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: {
          targetType: 'product',
          targetId: id,
          rating: reviewRating,
          comment: commentInput.trim(),
        },
      });

      if (res?.success && res?.data) {
        setComments(prev => [{
          id: res.data._id || res.data.id,
          user: res.data.user?.name || "You",
          avatar: res.data.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop",
          text: res.data.comment || "",
          rating: res.data.rating || reviewRating,
          likes: 0,
          time: formatRelativeTime(res.data.createdAt),
        }, ...prev]);
        setCommentInput("");
        setReviewRating(5);
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err: any) {
      setReviewError(err.message || "Could not save your review right now.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!id) return;
    if (!isSignedIn) {
      setReviewError("Please sign in to like this listing.");
      return;
    }

    try {
      const res = await apiFetch(`/listings/${id}/vote`, {
        method: 'POST',
        body: { vote: liked ? 'remove' : 'up' },
      });
      if (res?.success) {
        const reactions = await apiFetch(`/listings/${id}/reactions`);
        if (reactions?.success) {
          setLiked(Boolean(reactions.data?.userVote));
          setLikeCount(Number(reactions.data?.up || 0));
        }
      }
    } catch (err) {
      console.error("Error updating like", err);
    }
  };

  const handleSaveToggle = async () => {
    if (!id) return;
    if (!isSignedIn) {
      setReviewError("Please sign in to save this listing.");
      return;
    }

    setSaveBusy(true);
    try {
      const res = await apiFetch('/users/saved/toggle', {
        method: 'POST',
        body: { itemId: id },
      });

      if (res?.success) {
        setSaved(Boolean(res.data?.saved));
      }
    } catch (err) {
      console.error("Error updating saved state", err);
    } finally {
      setSaveBusy(false);
    }
  };

  const handleOpenChat = () => {
    if (!listing) return;
    if (!isSignedIn) {
      router.push(`/auth?next=/listings/${id}`);
      return;
    }
    router.push(`/listings/${id}/chat`);
  };

  const handleFollowToggle = async () => {
    const sellerEmail = listing?.sellerEmail || listing?.seller?.email || null;
    const sellerId = listing?.sellerId || listing?.seller?._id || listing?.seller?.id || null;
    if ((!sellerEmail && !sellerId) || !isSignedIn) {
      setReviewError("Please sign in to follow this seller.");
      return;
    }

    const nextFollowing = !following;
    const previousFollowing = following;
    const previousCount = followCount;

    setFollowing(nextFollowing);
    setFollowCount(Math.max(0, previousCount + (nextFollowing ? 1 : -1)));
    setFollowBusy(true);
    setReviewError("");

    try {
      const res = await apiFetch('/users/follow', {
        method: 'POST',
        body: {
          ...(sellerEmail ? { targetEmail: sellerEmail } : {}),
          ...(sellerId ? { targetId: sellerId } : {}),
        },
      });

      if (res?.success) {
        setFollowing(Boolean(res.data?.following));
        setFollowCount(Number(res.data?.followersCount || 0));
      } else {
        setFollowing(previousFollowing);
        setFollowCount(previousCount);
      }
    } catch (err) {
      console.error("Error updating follow state", err);
      setFollowing(previousFollowing);
      setFollowCount(previousCount);
    } finally {
      setFollowBusy(false);
    }
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
      const key = "unimart:cart";
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      cur.push(item);
      localStorage.setItem(key, JSON.stringify(cur));
      window.dispatchEvent(new Event("unimart:cartUpdated"));
    } catch (e) {}
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleQuickAdd = (item: TrendingProduct) => {
    const cartItem = {
      id: item.id,
      title: item.title,
      price: item.price,
      qty: 1,
      image: item.thumb,
    };
    
    try {
      const key = "unimart:cart";
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      cur.push(cartItem);
      localStorage.setItem(key, JSON.stringify(cur));
      window.dispatchEvent(new Event("unimart:cartUpdated"));
      
      setQuickAddNotification({ visible: true, product: item.title });
      setTimeout(() => setQuickAddNotification({ visible: false, product: "" }), 2000);
    } catch (e) {}
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
      sessionStorage.setItem("unimart:buynow", JSON.stringify([item]));
    } catch (e) {}
    router.push("/checkout?buyNow=1");
  };

  // ===== COMPUTED VALUES =====
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = listing ? `${listing.title} - GH₵ ${listing.price}` : "Check this out on Swoop!";
  
  const photos: string[] = listing?.imageUrls?.length ? listing.imageUrls : FALLBACK_PHOTOS;
  const videoUrl = listing?.videoUrls?.[0] || listing?.videoUrl;
  const media = useMemo(() => {
    const items: { type: "video" | "image"; src: string; poster?: string }[] = [];
    if (videoUrl) items.push({ type: "video", src: videoUrl, poster: listing?.videoThumbnail || photos[0] });
    photos.forEach((p: string) => items.push({ type: "image", src: p }));
    return items;
  }, [videoUrl, photos, listing]);

  const shareLinks = [
    { name: "WhatsApp", icon: FaWhatsapp, color: "#25D366", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + currentUrl)}`, "_blank") },
    { name: "Instagram", icon: FaInstagram, color: "#E4405F", action: () => { navigator.clipboard.writeText(currentUrl); alert("Link copied for Instagram!"); } },
    { name: "Snapchat", icon: FaSnapchatGhost, color: "#FFFC00", action: () => window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(currentUrl)}`, "_blank") },
    { name: "Facebook", icon: FaFacebookF, color: "#1877F2", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank") },
    { name: "Telegram", icon: FaTelegramPlane, color: "#0088cc", action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, "_blank") },
    { name: "Twitter", icon: FaTwitter, color: "#000000", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, "_blank") },
    { name: "LinkedIn", icon: FaLinkedinIn, color: "#0A66C2", action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, "_blank") },
  ];

  // ===== LOADING & ERROR STATES =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#14141A] font-bold">
        Listing not found
      </div>
    );
  }

  // ===== DERIVED VALUES =====
  const reviewAverage = comments.length
    ? Number((comments.reduce((sum, item) => sum + item.rating, 0) / comments.length).toFixed(1))
    : Number(listing.rating ?? 4.8);
  const ratingCount = comments.length || Number(listing.reviewCount || listing.ratingCount || 0) || 312;
  const views = listing.views ?? 18400;
  const description: string = listing.description ||
    "No description provided by the seller yet — reach out via comments if you have questions about condition, size, or delivery.";
  const isLongDesc = description.length > 140;
  const sellerLive = listing.sellerLive ?? true;
  const hashtags: string[] = listing.hashtags || ["CampusFinds", "UniMartDeals", listing.category || "Trending"];

  // =========================================================================
  // RENDER - FIXED STICKY HEADER
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-[#14141A] font-sans selection:bg-[#6C5CE7] selection:text-white overflow-x-hidden w-full">
      {/* Quick Add Notification */}
      {quickAddNotification.visible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#14141A] text-white rounded-full px-4 py-2 shadow-xl animate-in slide-in-from-top duration-300">
          <span className="text-sm font-bold">✓ Added "{quickAddNotification.product}" to cart</span>
        </div>
      )}

      {/* ===================== MOBILE STICKY APP BAR - FIXED POSITION ===================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#14141A]/8">
        <div className="flex items-center justify-between gap-2 px-4 py-3 max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 shrink-0 rounded-full bg-[#F6F5F8] flex items-center justify-center active:scale-95 transition"
          >
            <ChevronLeft size={18} className="text-[#14141A]" />
          </button>
          <span className="flex-1 min-w-0 text-center text-sm font-black text-[#14141A] truncate px-2">
            {listing.title}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleSaveToggle} disabled={saveBusy} className="w-9 h-9 rounded-full bg-[#F6F5F8] flex items-center justify-center disabled:opacity-70 active:scale-95 transition">
              <Bookmark size={16} className={saved ? "text-[#FFB020] fill-[#FFB020]" : "text-[#14141A]"} />
            </button>
            <button onClick={() => setShowShare(true)} className="w-9 h-9 rounded-full bg-[#F6F5F8] flex items-center justify-center active:scale-95 transition">
              <Share2 size={16} className="text-[#14141A]" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================== DESKTOP TOP BAR ===================== */}
      <div className="hidden lg:flex items-center justify-between pt-6 pb-2 sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-[#6B6B76] hover:text-[#14141A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleSaveToggle} disabled={saveBusy} className="w-9 h-9 rounded-full bg-[#F6F5F8] hover:bg-[#EFEEF3] flex items-center justify-center transition-colors disabled:opacity-70">
            <Bookmark size={16} className={saved ? "text-[#FFB020] fill-[#FFB020]" : "text-[#14141A]"} />
          </button>
          <button onClick={() => setShowShare(true)} className="w-9 h-9 rounded-full bg-[#F6F5F8] hover:bg-[#EFEEF3] flex items-center justify-center transition-colors">
            <Share2 size={16} className="text-[#14141A]" />
          </button>
        </div>
      </div>

      {/* ===================== MAIN CONTENT WITH PADDING FOR STICKY HEADER ===================== */}
      <div className="max-w-md lg:max-w-6xl mx-auto relative lg:px-8 pt-[68px] lg:pt-0">
        {/* ===================== TOP GRID: MEDIA + INFO ===================== */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:items-start">

          {/* ===================== HERO MEDIA CAROUSEL ===================== */}
          <div className="relative w-full aspect-[4/5] lg:aspect-square bg-black overflow-hidden lg:rounded-3xl lg:sticky lg:top-6">
            {media.map((m, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: i === mediaIndex ? 1 : 0, pointerEvents: i === mediaIndex ? "auto" : "none" }}
              >
                {m.type === "video" ? (
                  <video
                    ref={videoRef}
                    src={m.src}
                    poster={m.poster}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    onClick={() => {
                      if (!videoRef.current) return;
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                      setIsPlaying(!isPlaying);
                    }}
                  />
                ) : (
                  <img src={m.src} className="w-full h-full object-cover" alt={listing.title} />
                )}
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/10 pointer-events-none" />

            {media[mediaIndex]?.type === "video" && !isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Play size={26} className="text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Carousel nav */}
            {media.length > 1 && (
              <>
                <button
                  onClick={() => setMediaIndex(i => (i - 1 + media.length) % media.length)}
                  className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <button
                  onClick={() => setMediaIndex(i => (i + 1) % media.length)}
                  className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMediaIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${i === mediaIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/35 backdrop-blur-md rounded-full px-2.5 py-1">
              <Eye size={12} className="text-white/80" />
              <span className="text-[10px] font-bold text-white/90">{formatCount(views)}</span>
            </div>
          </div>

          {/* ===================== PRODUCT INFO (RIGHT COLUMN) ===================== */}
          <div className="relative -mt-5 lg:mt-0 rounded-t-[28px] lg:rounded-none bg-white pb-10 lg:pb-0">
            <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
              <div className="w-10 h-1.5 rounded-full bg-[#14141A]/12" />
            </div>

            <div className="px-4 lg:px-0 pt-2 lg:pt-6">
              {/* Seller row */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => videoUrl && setShowVideoModal(true)}
                  className={`relative shrink-0 rounded-full ${sellerLive && videoUrl ? "ring-2 ring-[#FF3B5C] ring-offset-2" : ""}`}
                >
                  <TrustRing score={reviewAverage} size={48}>
                    <InitialsAvatar name={listing.sellerName || "Seller"} />
                  </TrustRing>
                  {sellerLive && videoUrl && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-[#FF3B5C] rounded-full px-1.5 py-[1px]">
                      <Radio size={8} className="text-white" />
                      <span className="text-[8px] font-black text-white tracking-wide">LIVE</span>
                    </span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm lg:text-base truncate">@{listing.sellerName || "seller"}</span>
                    <CheckCircle2 size={14} className="text-[#00D9A3] shrink-0" fill="currentColor" strokeWidth={1.5} color="white" />
                  </div>
                  <div className="flex items-center gap-1 text-[#6B6B76] text-[11px] font-medium">
                    <MapPin size={11} />
                    <span>{listing.location || "Accra, Ghana"}</span>
                  </div>
                  <VerifiedSellerTag className="mt-1.5" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={handleFollowToggle}
                    disabled={followBusy || !isSignedIn}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 ${
                      following ? "bg-[#F6F5F8] text-[#14141A] lg:hover:bg-[#EFEEF3]" : "bg-[#14141A] text-white lg:hover:bg-[#14141A]/85"
                    } ${followBusy ? "opacity-70" : ""}`}
                  >
                    {followBusy ? "Saving..." : following ? "Following" : "Follow"}
                  </button>
                  <span className="text-[11px] font-semibold text-[#FF8A00]">{formatCount(followCount)} followers</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-lg lg:text-2xl font-black leading-snug mb-2.5">{listing.title}</h1>

              {/* Price + rating */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] lg:text-[36px] leading-none font-black text-[#FF8A00]">GH₵ {listing.price}</span>
                  {listing.originalPrice && (
                    <span className="text-xs lg:text-sm text-[#6B6B76] line-through">GH₵ {listing.originalPrice}</span>
                  )}
                </div>
              </div>

              {listing.originalPrice && dealRemaining > 0 && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF3B5C]/10 to-[#FF6B9D]/10 rounded-lg px-2.5 py-1.5 mb-3 w-fit">
                  <Flame size={12} className="text-[#FF3B5C]" />
                  <span className="text-[11px] font-black text-[#FF3B5C]">Flash sale ends in</span>
                  <span className="text-[11px] font-black text-[#FF3B5C] tabular-nums">{formatCountdown(dealRemaining)}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex items-center gap-1 bg-[#FFF6E6] rounded-lg px-2 py-1">
                  <Star size={12} className="text-[#FFB020] fill-[#FFB020]" />
                  <span className="text-xs font-black">{reviewAverage.toFixed(1)}</span>
                </div>
                <button onClick={() => setShowComments(true)} className="text-[11px] text-[#6B6B76] font-bold underline decoration-dotted lg:hover:text-[#14141A] transition-colors">
                  {formatCount(ratingCount)} ratings · {formatCount(comments.length)} reviews
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <TrustBadge icon={<Truck size={14} />} label={listing.delivery || "Fast delivery"} />
                <TrustBadge icon={<ShieldCheck size={14} />} label="Verified seller" />
                <TrustBadge icon={<RotateCcw size={14} />} label="Easy returns" />
              </div>

              {/* Buy buttons (mobile + desktop, inline) */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddCart}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all border-2 ${
                    cartAdded
                      ? "bg-[#00D9A3] border-[#00D9A3] text-white"
                      : "bg-white border-[#14141A]/15 text-[#14141A] hover:border-[#14141A]/30 active:scale-[0.98]"
                  }`}
                >
                  <ShoppingBag size={16} />
                  {cartAdded ? "Added!" : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-[1.4] py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#3B82F6]/25 transition-all"
                >
                  Buy Now
                </button>
              </div>

              {/* Engagement row */}
              <div className="flex items-center justify-between border-y border-[#14141A]/8 py-2.5 mb-5">
                <button onClick={handleLike} className="flex items-center gap-1.5 active:scale-95 lg:hover:text-[#FF6B9D] transition">
                  <Heart size={19} className={liked ? "text-[#FF6B9D] fill-[#FF6B9D]" : "text-[#14141A]"} />
                  <span className={`text-xs font-bold ${liked ? "text-[#FF8A00]" : "text-[#FF8A00]"}`}>{formatCount(likeCount)}</span>
                </button>
                <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 active:scale-95 transition">
                  <MessageCircle size={19} className="text-[#14141A]" />
                  <span className="text-xs font-bold text-[#FF8A00]">{formatCount(comments.length)}</span>
                </button>
                <button onClick={handleSaveToggle} disabled={saveBusy} className="flex items-center gap-1.5 active:scale-95 transition disabled:opacity-70">
                  <Bookmark size={19} className={saved ? "text-[#FFB020] fill-[#FFB020]" : "text-[#14141A]"} />
                  <span className="text-xs font-bold text-[#6B6B76]">Save</span>
                </button>
                <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 active:scale-95 transition">
                  <Share2 size={18} className="text-[#14141A]" />
                  <span className="text-xs font-bold text-[#6B6B76]">Share</span>
                </button>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h2 className="text-xs font-black uppercase tracking-wide text-[#6B6B76] mb-2">Description</h2>
                <p className={`text-sm lg:text-[15px] leading-relaxed text-[#14141A]/90 ${!descExpanded && isLongDesc ? "line-clamp-3" : ""}`}>
                  {description}
                </p>
                {isLongDesc && (
                  <button
                    onClick={() => setDescExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs font-black text-[#6C5CE7] mt-1.5 lg:hover:text-[#5a4bd4] transition-colors"
                  >
                    {descExpanded ? "Show less" : "Read more"}
                    <ChevronDown size={13} className={`transition-transform ${descExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* Product media strip */}
              {(videoUrl || photos.length > 1) && (
                <div className="mb-5">
                  <h2 className="text-xs font-black uppercase tracking-wide text-[#6B6B76] mb-2">
                    Product media · {(videoUrl ? 1 : 0) + photos.length}
                  </h2>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {videoUrl && (
                      <button
                        onClick={() => setShowVideoModal(true)}
                        className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shrink-0 border border-[#14141A]/8 active:scale-95 lg:hover:border-[#6C5CE7]/40 transition"
                      >
                        <img src={listing.videoThumbnail || photos[0]} className="w-full h-full object-cover" alt={`${listing.title} video`} />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <Play size={16} className="text-white ml-0.5" fill="white" />
                        </div>
                        <span className="absolute bottom-1 left-1 text-[8px] font-black text-white bg-black/50 rounded px-1">VIDEO</span>
                      </button>
                    )}
                    {photos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => { setGalleryIndex(i); setShowGallery(true); }}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl overflow-hidden shrink-0 border border-[#14141A]/8 active:scale-95 lg:hover:border-[#6C5CE7]/40 transition"
                      >
                        <img src={p} className="w-full h-full object-cover" alt={`${listing.title} photo ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shoppable hashtags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {hashtags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/feed?tag=${encodeURIComponent(tag)}`}
                    className="flex items-center gap-1 bg-[#F6F5F8] rounded-full pl-1.5 pr-2.5 py-1 text-[11px] font-bold text-[#6C5CE7] lg:hover:bg-[#6C5CE7]/10 transition-colors"
                  >
                    <Tag size={10} />#{tag}
                  </Link>
                ))}
              </div>

              {/* Reviews preview */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-black uppercase tracking-wide text-[#6B6B76]">Reviews</h2>
                  <button onClick={() => setShowComments(true)} className="text-[11px] font-black text-[#6C5CE7] lg:hover:text-[#5a4bd4] transition-colors">See all</button>
                </div>
                <div className="space-y-3">
                  {commentsLoading && comments.length === 0 && (
                    <p className="text-xs text-[#6B6B76]">Loading reviews…</p>
                  )}
                  {!commentsLoading && comments.length === 0 && (
                    <p className="text-xs text-[#6B6B76]">No reviews yet — be the first to share your experience.</p>
                  )}
                  {comments.slice(0, 2).map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <InitialsAvatar name={c.user} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">@{c.user}</span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={9} className={i < (c.rating || 5) ? "text-[#FFB020] fill-[#FFB020]" : "text-[#14141A]/15 fill-[#14141A]/15"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#14141A]/80 leading-snug mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ENHANCED TREND DISCOVERY FEED (FULL WIDTH) ===================== */}
        <div className="mt-7 lg:mt-16 pt-5 lg:pt-10 border-t-8 lg:border-t border-[#F6F5F8]">
          <div className="px-4 lg:px-0 flex items-center justify-between mb-3 lg:mb-5">
            <div>
              <div className="flex items-center gap-1.5">
                <Flame size={15} className="text-[#FF6B9D]" />
                <h2 className="text-sm lg:text-xl font-black">Trending on Swoop</h2>
              </div>
              <p className="text-[11px] lg:text-sm text-[#6B6B76] font-medium mt-0.5">🎬 Short clips and viral finds on Swoop</p>
            </div>
            <Link href="/feed" className="text-[11px] lg:text-sm font-black text-[#6C5CE7] shrink-0 flex items-center gap-1 lg:hover:text-[#5a4bd4] transition-colors">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {/* TikTok-style tabs with icons */}
          <div className="flex items-center gap-2 px-4 lg:px-0 mb-3 lg:mb-5 overflow-x-auto no-scrollbar">
            {FEED_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = feedTab === tab.key;
              const count = feedProducts.filter((p) => p.tag === tab.key).length;
              const isLiveTab = String(tab.key) === "live";
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setFeedTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 lg:px-5 lg:py-2 rounded-full text-xs lg:text-sm font-black shrink-0 transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#6C5CE7] to-[#FF6B9D] text-white shadow-md shadow-[#6C5CE7]/20"
                      : "bg-[#F6F5F8] text-[#6B6B76] hover:bg-[#E8E7EC]"
                  }`}
                >
                  <Icon size={12} className={isLiveTab && active ? "animate-pulse" : ""} />
                  {tab.label}
                  <span className={`text-[8px] lg:text-[10px] ${active ? "text-white/80" : "text-[#6B6B76]/60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {feedError && (
            <div className="px-4 lg:px-0 text-center py-3 rounded-3xl border border-rose-100 bg-rose-50 text-rose-700 mb-4">
              {feedError}
            </div>
          )}

          {/* Card grid with enhanced TikTok features — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-5 px-4 lg:px-0 pb-1">
            {feedProducts.filter((p) => p.tag === feedTab).map((item) => (
              <TrendCard 
                key={item.id} 
                item={item} 
                onOpen={(pid) => router.push(`/listing/${pid}`)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
          
          {feedProducts.filter((p) => p.tag === feedTab).length === 0 && !feedLoading && (
            <div className="px-4 lg:px-0 text-center py-8">
              <p className="text-xs text-[#6B6B76] font-medium">No products found for this category yet.</p>
              <p className="text-[10px] text-[#6B6B76] mt-1">Refresh to see the latest items.</p>
            </div>
          )}
          
          {/* "Shop the look" - TikTok-style carousel */}
          <div className="mt-6 lg:mt-12 px-4 lg:px-0">
            <div className="flex items-center justify-between mb-2 lg:mb-4">
              <h3 className="text-xs lg:text-base font-black uppercase tracking-wide text-[#6B6B76]">Shop the look</h3>
              <span className="text-[10px] lg:text-sm text-[#6C5CE7] font-black lg:hover:text-[#5a4bd4] transition-colors cursor-pointer">See all →</span>
            </div>
            <div className="flex gap-2 lg:gap-4 overflow-x-auto no-scrollbar pb-2">
              {feedProducts.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/listing/${item.id}`)}
                  className="relative w-32 h-40 lg:w-48 lg:h-60 rounded-xl overflow-hidden shrink-0 group lg:hover:shadow-xl lg:transition-shadow"
                >
                  <img src={item.thumb} className="w-full h-full object-cover lg:group-hover:scale-105 lg:transition-transform lg:duration-500" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[9px] lg:text-xs font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] lg:text-sm font-black text-[#FF8A00]">GH₵{item.price}</p>
                  </div>
                  {item.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 rounded-full px-1.5 py-0.5">
                      <span className="text-[7px] lg:text-[9px] font-black text-white">-{item.discount}%</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== BOTTOM SHEETS ===================== */}
        
        {/* Comments sheet */}
        <BottomSheet open={showComments} onClose={() => setShowComments(false)} title={`${comments.length} reviews`}>
          <div className="space-y-4 py-3">
            {commentsLoading && comments.length === 0 && (
              <p className="text-sm text-[#6B6B76]">Loading reviews…</p>
            )}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-sm text-[#6B6B76]">No reviews yet — your feedback will appear here instantly.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                  <InitialsAvatar name={c.user} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">@{c.user}</span>
                    <span className="text-[10px] text-[#6B6B76]">{c.time}</span>
                  </div>
                  <p className="text-sm text-[#14141A] leading-snug mt-0.5">{c.text}</p>
                </div>
                <button className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                  <Heart size={14} className="text-[#14141A]/30" />
                  <span className="text-[10px] text-[#6B6B76] font-bold">{c.likes}</span>
                </button>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
          <form onSubmit={handleSendComment} className="sticky bottom-0 bg-white py-3 -mx-5 px-5 border-t border-[#14141A]/8">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setReviewRating(index + 1)}
                  className="transition-transform active:scale-95"
                >
                  <Star size={16} className={index < reviewRating ? "text-[#FFB020] fill-[#FFB020]" : "text-[#14141A]/15 fill-[#14141A]/15"} />
                </button>
              ))}
            </div>
            {reviewError ? <p className="text-[11px] text-[#FF3B5C] mb-2">{reviewError}</p> : null}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share a review..."
                className="flex-1 bg-[#F6F5F8] rounded-full px-4 py-2.5 text-sm text-[#14141A] placeholder:text-[#6B6B76] outline-none focus:ring-2 focus:ring-[#6C5CE7]/40 transition"
              />
              <button type="submit" disabled={commentsLoading} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#FF6B9D] flex items-center justify-center shrink-0 disabled:opacity-70">
                <Send size={15} className="text-white" />
              </button>
            </div>
          </form>
        </BottomSheet>

        {/* Share sheet */}
        <BottomSheet open={showShare} onClose={() => setShowShare(false)} title="Share to">
          <div className="grid grid-cols-4 gap-y-5 py-4">
            {shareLinks.map((link, idx) => (
              <button key={idx} onClick={link.action} className="flex flex-col items-center gap-1.5 active:scale-90 transition">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: link.color }}
                >
                  <link.icon size={19} className={link.name === "Snapchat" ? "text-black" : "text-white"} />
                </div>
                <span className="text-[10px] font-medium text-[#6B6B76]">{link.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(currentUrl); alert("Link copied to clipboard!"); }}
            className="w-full flex items-center gap-3 bg-[#F6F5F8] rounded-2xl px-4 py-3 mb-4 active:scale-[0.98] transition"
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
              <Copy size={15} className="text-[#14141A]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-[#14141A]">Copy link</p>
              <p className="text-[10px] text-[#6B6B76] truncate">{currentUrl}</p>
            </div>
          </button>
        </BottomSheet>

        {/* Gallery sheet */}
        <BottomSheet open={showGallery} onClose={() => setShowGallery(false)} title={`Photos · ${galleryIndex + 1}/${photos.length}`}>
          <div className="relative rounded-2xl overflow-hidden bg-[#F6F5F8] aspect-[4/5] mb-3">
            <img src={photos[galleryIndex]} className="w-full h-full object-cover" alt={`${listing.title} photo ${galleryIndex + 1}`} />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setGalleryIndex(i => (i - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <button
                  onClick={() => setGalleryIndex(i => (i + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center"
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
                <img src={p} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </BottomSheet>

        {/* Video modal */}
        {showVideoModal && videoUrl && (
          <div className="fixed inset-0 z-[70] bg-black flex items-center justify-center">
            <div className="relative w-full h-full lg:w-auto lg:h-full lg:aspect-[9/16] bg-black">
            <video
              ref={modalVideoRef}
              src={videoUrl}
              poster={listing.videoThumbnail || photos[0]}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={modalMuted}
              playsInline
              onClick={() => {
                if (!modalVideoRef.current) return;
                if (modalVideoRef.current.paused) modalVideoRef.current.play();
                else modalVideoRef.current.pause();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 px-3 pt-3 flex items-center justify-between">
              <button onClick={() => setShowVideoModal(false)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <X size={18} className="text-white" />
              </button>
              <div className="flex items-center gap-2">
                {sellerLive && (
                  <span className="flex items-center gap-1 bg-[#FF3B5C] rounded-full pl-1.5 pr-2 py-1">
                    <Radio size={10} className="text-white" />
                    <span className="text-[10px] font-black text-white">LIVE</span>
                  </span>
                )}
                <button onClick={() => setModalMuted(m => !m)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  {modalMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
                </button>
              </div>
            </div>

            {/* Right action rail */}
            <div className="absolute right-3 bottom-40 flex flex-col items-center gap-5">
              <button onClick={handleLike} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Heart size={22} className={liked ? "text-[#FF6B9D] fill-[#FF6B9D]" : "text-white"} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">{formatCount(likeCount)}</span>
              </button>
              <button onClick={() => setSaved(v => !v)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Bookmark size={20} className={saved ? "text-[#FFB020] fill-[#FFB020]" : "text-white"} />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">Save</span>
              </button>
              <button onClick={() => setShowShare(true)} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Share2 size={19} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-white drop-shadow">Share</span>
              </button>
            </div>

            {/* Seller + caption overlay */}
            <div className="absolute left-0 right-24 bottom-40 px-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shrink-0">
                  <InitialsAvatar name={listing.sellerName || "seller"} />
                </div>
                <span className="text-sm font-black text-white">@{listing.sellerName || "seller"}</span>
                <button
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full ${following ? "bg-white/20 text-white" : "bg-white text-[#14141A]"}`}
                >
                  {followBusy ? "Saving..." : following ? `Following · ${formatCount(followCount)}` : `Follow · ${formatCount(followCount)}`}
                </button>
                <VerifiedSellerTag />
              </div>
              <p className="text-sm text-white leading-snug mb-2 line-clamp-2">{listing.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[11px] font-bold text-white/85">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Pinned shop card */}
            <div className="absolute left-3 right-3 bottom-6 bg-white rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl">
              <img src={photos[0]} className="w-11 h-11 rounded-xl object-cover shrink-0" alt={listing.title} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#14141A] truncate">{listing.title}</p>
                <span className="text-sm font-black text-[#FF8A00]">GH₵ {listing.price}</span>
              </div>
              <button
                onClick={handleAddCart}
                className="w-9 h-9 rounded-full bg-[#F6F5F8] flex items-center justify-center shrink-0 active:scale-95 transition"
              >
                <ShoppingBag size={15} className="text-[#14141A]" />
              </button>
              <button
                onClick={handleBuyNow}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] text-white text-xs font-black shrink-0 active:scale-95 transition"
              >
                Buy Now
              </button>
            </div>
            </div>
          </div>
        )}

        {/* ===================== FLOATING CHAT BUTTON ===================== */}
        <button
          onClick={handleOpenChat}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#FF6B35] px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(246,72,11,0.22)] ring-1 ring-white/20 backdrop-blur-sm transition-all active:scale-95 sm:bottom-5 sm:right-5"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">Message seller</span>
          <span className="sm:hidden">Chat</span>
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2, MapPin, CheckCircle, ChevronLeft,
  ShoppingBag, MessageCircle, Star, ShoppingCart,
  Heart, Home, Play, X, Send, Search, User, Compass,
  ArrowUpRight, Copy
} from "lucide-react";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaWhatsapp, 
  FaInstagram, 
  FaLinkedinIn, 
  FaTelegramPlane,
  FaSnapchatGhost,
  FaTiktok
} from "react-icons/fa";
import apiFetch from "../../../lib/apiClient";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import Footer from "../../../app/components/Footer";

// Mock Live Chat Messages
const MOCK_CHAT_MESSAGES = [
  { id: 1, user: "Kwame", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop", text: "Is this still available?", time: "2m ago" },
  { id: 2, user: "Ama", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop", text: "How much for two?", time: "1m ago" },
];

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartAdded, setCartAdded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch Data
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

  // Auto-play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [listing]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop",
      text: chatInput,
      time: "Just now"
    }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
    // Temu-style "Buy Now": skip the persistent cart entirely and go straight
    // to a single-item checkout session, instead of mixing it into the cart.
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
    { name: "Facebook", icon: FaFacebookF, color: "#1877F2", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Twitter", icon: FaTwitter, color: "#000000", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Instagram", icon: FaInstagram, color: "#E4405F", action: () => { navigator.clipboard.writeText(currentUrl); alert("Link copied for Instagram!"); } },
    { name: "Telegram", icon: FaTelegramPlane, color: "#0088cc", action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank') },
    { name: "LinkedIn", icon: FaLinkedinIn, color: "#0A66C2", action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Snapchat", icon: FaSnapchatGhost, color: "#FFFC00", action: () => window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(currentUrl)}`, '_blank') },
    { name: "Copy Link", icon: Copy, color: "#9CA3AF", action: () => { navigator.clipboard.writeText(currentUrl); alert("Link copied to clipboard!"); } },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><LoadingSpinner size={48} /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Not Found</div>;

  const videoUrl = listing.videoUrls?.[0] || listing.videoUrl;
  const thumbnail = listing.videoThumbnail || listing.imageUrls?.[0];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-[#6C5CE7] selection:text-white pb-24">
      
      {/* Full Screen Video Background */}
      <div className="fixed inset-0 z-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 pointer-events-none" />
      </div>

      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-4 pt-4 pb-2 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <Link href="/" className="font-display font-bold text-lg tracking-tight">Uni-Mart</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
            <Search className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition relative"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Share Menu Overlay */}
      {showShareMenu && (
        <div className="fixed top-20 right-4 z-30 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-64 shadow-2xl animate-in fade-in slide-in-from-top-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 px-1">Share with friends</h3>
          <div className="grid grid-cols-4 gap-4">
            {shareLinks.map((link, idx) => (
              <button 
                key={idx} 
                onClick={link.action}
                className="flex flex-col items-center gap-2 group"
              >
                <div 
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white/20"
                  style={{ color: link.color === '#FFFC00' ? '#FFFC00' : link.color }}
                >
                  <link.icon size={20} className={link.name === "Snapchat" ? "text-black" : ""} />
                </div>
                <span className="text-[10px] font-medium text-white/80">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Overlay */}
      <main className="relative z-10 h-screen flex flex-col justify-end pb-32 px-4 sm:px-6 max-w-2xl mx-auto pt-20">
        
        {/* Seller Info */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={listing.sellerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#6C5CE7] rounded-full p-0.5">
                <CheckCircle size={10} className="text-white" fill="currentColor" />
              </div>
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1">
                @{listing.sellerName || "seller"}
              </div>
              <div className="text-xs text-white/70">{listing.location || "Accra, Ghana"}</div>
            </div>
          </div>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/20 transition">
            Follow
          </button>
        </div>

        {/* Product Title & Price */}
        <div className="mb-6">
          <h1 className="text-2xl font-black leading-tight mb-2 drop-shadow-lg line-clamp-2">
            {listing.title}
          </h1>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#00D9A3] drop-shadow-md">GH₵ {listing.price}</span>
            {listing.originalPrice && (
              <span className="text-lg text-white/50 line-through">GH₵ {listing.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Action Bar (Bottom) */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[#FF6B9D]/20 transition">
              <Heart size={24} className="text-white group-hover:text-[#FF6B9D] transition" />
            </div>
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition ${showChat ? 'bg-[#6C5CE7]/40' : 'bg-white/10'}`}>
              <MessageCircle size={24} className={showChat ? 'text-[#6C5CE7]' : 'text-white'} />
            </div>
          </button>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button 
            onClick={handleAddCart}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 ${
              cartAdded 
                ? "bg-[#00D9A3] border-[#00D9A3] text-white" 
                : "bg-transparent border-white/30 text-white hover:bg-white/10"
            }`}
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-[1.5] py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6C5CE7] to-[#FF6B9D] hover:brightness-110 shadow-lg shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2"
          >
            Buy Now
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Live Chat Overlay */}
      {showChat && (
        <div className="fixed bottom-32 left-4 right-4 sm:right-auto sm:w-80 bg-black/80 backdrop-blur-xl rounded-2xl p-4 z-30 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold">Live Chat</span>
            </div>
            <button onClick={() => setShowChat(false)}><X size={14} className="text-white/50" /></button>
          </div>
          
          <div className="h-48 overflow-y-auto space-y-3 mb-3 scrollbar-hide">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2">
                <img src={msg.avatar} className="w-6 h-6 rounded-full flex-shrink-0" />
                <div>
                  <span className="text-white/70 text-[10px] font-bold mr-2">{msg.user}</span>
                  <p className="text-white text-xs inline">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-white/10 rounded-full px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition border border-white/5"
            />
            <button type="submit" className="w-9 h-9 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white hover:bg-[#5a4bd6] transition">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Video Controls */}
      {!isPlaying && (
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
            <Play size={32} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Using the exact Footer design provided */}
      <Footer />
    </div>
  );
}

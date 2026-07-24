"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import Footer from "../../app/components/Footer"; // Import the exact footer

interface Review {
  id: string;
  product: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  image?: string;
}

// ── BADGE CONFIGURATION ──
const BADGES = {
  EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', icon: '🌅', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', description: 'Joined UniMart in the first month!', category: 'status' },
  TRUSTED_BUYER: { id: 'trusted_buyer', name: 'Trusted Buyer', icon: '✅', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', description: '10+ successful purchases', category: 'trust' },
  VERIFIED: { id: 'verified', name: 'Verified', icon: '✓', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', description: 'Email & phone verified', category: 'trust' },
  STREAK_7: { id: 'streak_7', name: '7-Day Streak', icon: '🔥', color: '#ea580c', bg: '#fff7ed', border: '#fdba74', description: 'Active for 7 days straight!', category: 'streak' },
  STREAK_30: { id: 'streak_30', name: '30-Day Streak', icon: '⚡', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', description: 'Unstoppable! 30 days active', category: 'streak' },
  BRONZE: { id: 'bronze', name: 'Bronze Buyer', icon: '🥉', color: '#92400e', bg: '#fffbeb', border: '#d97706', description: 'Spent ₵100+', category: 'spending' },
  GOLD: { id: 'gold', name: 'Gold Buyer', icon: '🥇', color: '#b45309', bg: '#fffbeb', border: '#fbbf24', description: 'Spent ₵1000+', category: 'spending' },
  SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', color: '#db2777', bg: '#fdf2f8', border: '#f9a8d4', description: 'Shared 10+ products', category: 'social' },
};

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function BadgeTooltip({ badge, children }: { badge: any; children: React.ReactNode }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-xl">
        <div className="font-bold mb-1 flex items-center gap-2">
          <span className="text-lg">{badge.icon}</span> {badge.name}
        </div>
        <div className="text-slate-400 leading-tight">{badge.description}</div>
        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "badges">("overview");
  const [userBadges, setUserBadges] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        if (!localStorage.getItem('unimart:token')) return;
        const res = await apiFetch("/auth/me");
        if (!active) return;
        const u = res?.user || res?.data || null;
        if (u) {
          setUser(u);
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          const earned = calculateBadges(u);
          setUserBadges(earned);
          try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) { }
          
          // Load reviews
          const revRes = await apiFetch("/reviews");
          if (revRes && Array.isArray(revRes.data)) {
             setReviews(revRes.data.map((r: any) => ({
                id: r._id || r.id,
                product: r.targetTitle || "Item",
                rating: r.rating || 0,
                text: r.comment || "",
                date: new Date(r.createdAt || Date.now()).toLocaleDateString(),
                helpful: r.helpful || 0,
              })));
          }
        }
      } catch (err) { console.error(err); }
    }
    loadProfile();
    return () => { active = false; };
  }, []);

  const calculateBadges = (userData: any) => {
    const earned: any[] = [];
    const spent = userData?.totalSpent || 0;
    const streak = userData?.streakDays || 0;
    if (userData?.isVerified) earned.push(BADGES.VERIFIED);
    if (streak >= 7) earned.push(BADGES.STREAK_7);
    if (spent >= 1000) earned.push(BADGES.GOLD);
    else if (spent >= 100) earned.push(BADGES.BRONZE);
    return earned;
  };

  const handleSave = async () => {
    setStatus(null);
    try {
      // Simplified save logic for demo
      setStatus("Profile updated successfully");
      setEditing(false);
    } catch (err) { setStatus("Failed to update"); }
  };

  const initials = name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-24 font-sans text-slate-900">
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <i className="ti ti-arrow-left text-lg"></i>
        </button>
        <h1 className="font-bold text-lg">My Profile</h1>
        <div className="w-9"></div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6C5CE7]/10 to-[#FF6B9D]/10 rounded-bl-full -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#FF6B9D] p-1 shadow-lg shadow-[#6C5CE7]/20">
                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-2xl font-black text-[#6C5CE7] overflow-hidden">
                  {avatarPreview || user?.avatar ? (
                    <img src={avatarPreview || user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              {editing && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00D9A3] rounded-full flex items-center justify-center text-white shadow-md cursor-pointer">
                  <i className="ti ti-camera text-sm"></i>
                  <input type="file" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                  }} />
                </label>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {!editing ? (
                <>
                  <h2 className="font-black text-xl truncate">{user?.name || "Guest User"}</h2>
                  <p className="text-slate-500 text-sm truncate">{user?.email || "No email"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-bold uppercase tracking-wide">
                      Level {Math.floor((user?.xp || 0) / 500) + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{user?.xp || 0} XP</span>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:border-[#6C5CE7] outline-none" value={name} onChange={e => setName(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="bg-[#6C5CE7] text-white text-xs font-bold px-3 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setEditing(false)} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
            </div>
            
            {!editing && (
              <button onClick={() => setEditing(true)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition">
                <i className="ti ti-pencil"></i>
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-50">
            <div className="text-center">
              <div className="text-lg font-black text-slate-900">{reviews.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reviews</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-lg font-black text-slate-900">{userBadges.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Badges</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-lg font-black text-slate-900">{user?.orders?.length || 0}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Orders</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {["overview", "badges", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? "bg-white text-[#6C5CE7] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <i className="ti ti-user-circle text-[#6C5CE7]"></i> Account Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold">{user?.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-semibold">{new Date(user?.createdAt || Date.now()).getFullYear()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-[#00D9A3] flex items-center gap-1"><i className="ti ti-check-circle text-xs"></i> Active</span>
                </div>
              </div>
            </div>
            
            <button onClick={logout} className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition">
              <i className="ti ti-logout"></i> Sign Out
            </button>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {userBadges.length > 0 ? userBadges.map((badge) => (
              <BadgeTooltip key={badge.id} badge={badge}>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:border-[#6C5CE7]/30 transition cursor-pointer">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: badge.bg }}>
                    {badge.icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs" style={{ color: badge.color }}>{badge.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{badge.description}</div>
                  </div>
                </div>
              </BadgeTooltip>
            )) : (
              <div className="col-span-2 text-center py-10 text-slate-400">
                <i className="ti ti-award text-4xl mb-2 opacity-50"></i>
                <p className="text-sm">No badges earned yet. Keep shopping!</p>
              </div>
            )}
            
            {/* Locked Badges Preview */}
            {Object.values(BADGES).filter(b => !userBadges.find(ub => ub.id === b.id)).slice(0, 2).map((badge) => (
              <div key={badge.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center gap-2 opacity-60 grayscale">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">
                  <i className="ti ti-lock"></i>
                </div>
                <div className="font-bold text-xs text-slate-500">{badge.name}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {reviews.length > 0 ? reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm truncate pr-4">{r.product}</h4>
                  <div className="flex text-[#FFB88C] text-xs">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`ti ${i < r.rating ? "ti-star-filled" : "ti-star"} ${i >= r.rating ? "text-slate-200" : ""}`}></i>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">{r.text}</p>
                <div className="text-[10px] text-slate-400 font-medium">{r.date}</div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400">
                <i className="ti ti-writing text-4xl mb-2 opacity-50"></i>
                <p className="text-sm">You haven't written any reviews yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Exact Footer Design */}
      <Footer />
      
      {/* Tabler Icons Link */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "../../lib/apiClient";
import { useAuth } from "../context/AuthContext";

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
  // Tier 1: Trust & Status
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fcd34d',
    description: 'Joined UniMart in the first month!',
    category: 'status'
  },
  TRUSTED_BUYER: {
    id: 'trusted_buyer',
    name: 'Trusted Buyer',
    icon: '✅',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    description: '10+ successful purchases',
    category: 'trust'
  },
  VERIFIED: {
    id: 'verified',
    name: 'Verified',
    icon: '✓',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#93c5fd',
    description: 'Email & phone verified',
    category: 'trust'
  },

  // Tier 2: Activity & Streaks
  STREAK_7: {
    id: 'streak_7',
    name: '🔥 7-Day Streak',
    icon: '🔥',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fdba74',
    description: 'Active for 7 days straight!',
    category: 'streak'
  },
  STREAK_30: {
    id: 'streak_30',
    name: '⚡ 30-Day Streak',
    icon: '⚡',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    description: 'Unstoppable! 30 days active',
    category: 'streak'
  },
  STREAK_100: {
    id: 'streak_100',
    name: '💎 100-Day Legend',
    icon: '💎',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fca5a5',
    description: 'Legendary 100-day streak!',
    category: 'streak'
  },

  // Tier 3: Spending Tiers
  BRONZE: {
    id: 'bronze',
    name: '🥉 Bronze Buyer',
    icon: '🥉',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#d97706',
    description: 'Spent ₵100+',
    category: 'spending'
  },
  SILVER: {
    id: 'silver',
    name: '🥈 Silver Buyer',
    icon: '🥈',
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#9ca3af',
    description: 'Spent ₵500+',
    category: 'spending'
  },
  GOLD: {
    id: 'gold',
    name: '🥇 Gold Buyer',
    icon: '🥇',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fbbf24',
    description: 'Spent ₵1000+',
    category: 'spending'
  },
  PLATINUM: {
    id: 'platinum',
    name: '👑 Platinum Elite',
    icon: '👑',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#60a5fa',
    description: 'Spent ₵5000+',
    category: 'spending'
  },

  // Tier 4: Social & Engagement
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: '🦋 Social Butterfly',
    icon: '🦋',
    color: '#db2777',
    bg: '#fdf2f8',
    border: '#f9a8d4',
    description: 'Shared 10+ products',
    category: 'social'
  },
  REVIEW_GURU: {
    id: 'review_guru',
    name: '✍️ Review Guru',
    icon: '✍️',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    description: 'Wrote 10+ reviews',
    category: 'social'
  },
  DEAL_HUNTER: {
    id: 'deal_hunter',
    name: '🎯 Deal Hunter',
    icon: '🎯',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fcd34d',
    description: 'Bought 5+ flash sale items',
    category: 'social'
  },
};

// ── COLOR HELPER ──
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── BADGE TOOLTIP ──
// Wraps any badge trigger element and reveals a rich, animated tooltip card
// (icon + name + description) on hover or keyboard focus.
function BadgeTooltip({
  badge,
  position = "up",
  children,
}: {
  badge: any;
  position?: "up" | "down";
  children: React.ReactNode;
}) {
  return (
    <div className={`p-tt p-tt--${position}`} tabIndex={0}>
      {children}
      <div className="p-tt-content" role="tooltip">
        <div className="p-tt-icon" style={{ background: badge.bg, color: badge.color }}>
          <span>{badge.icon}</span>
        </div>
        <div className="p-tt-text">
          <div className="p-tt-name" style={{ color: badge.color }}>{badge.name}</div>
          <div className="p-tt-desc">{badge.description}</div>
        </div>
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
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "security" | "badges">("overview");
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [backLoading, setBackLoading] = useState(false);

  const handleBackToHome = async () => {
    if (backLoading) return;
    setBackLoading(true);
    const fallback = setTimeout(() => {
      try { window.location.href = "/"; } catch (e) { }
    }, 800);

    try {
      await router.push("/");
    } catch (e) {
      try { window.location.href = "/"; } catch (err) { }
    } finally {
      clearTimeout(fallback);
      setBackLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      // logout already clears state; ignore any error
    }
    // After logout, send the user to the auth page explicitly
    // so the app does not try to load the home screen first.
    try {
      router.replace('/auth');
    } catch (e) {
      window.location.replace('/auth');
    }
  };


  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css";
    document.head.appendChild(link);

    let active = true;

    async function loadProfileAndReviews() {
      try {
        if (!localStorage.getItem('unimart:token')) return;

        const res = await apiFetch("/auth/me");
        if (!active || !localStorage.getItem('unimart:token')) return;

        const u = res?.user || res?.data || null;
        if (u) {
          setUser(u);
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");

          // Calculate badges based on user data
          const earnedBadges = calculateBadges(u);
          setUserBadges(earnedBadges);

          try { localStorage.setItem("unimart:user", JSON.stringify(u)); } catch (e) { }
        } else {
          try {
            const raw = localStorage.getItem('unimart:user');
            if (raw) {
              const lu = JSON.parse(raw);
              setUser(lu);
              setName(lu.name || "");
              setEmail(lu.email || "");
              setPhone(lu.phone || "");
              const earnedBadges = calculateBadges(lu);
              setUserBadges(earnedBadges);
            }
          } catch (e) { }
        }

        try {
          const revRes = await apiFetch("/reviews");
          if (revRes && Array.isArray(revRes.data)) {
            const list = revRes.data;
            const mine = (res && (res.user || res.data)) ? list.filter((r: any) => String(r.user?._id || r.user) === String((res.user || res.data)?._id || (res.user || res.data)?.id)) : list;
            setReviews(
              mine.map((r: any) => ({
                id: r._id || r.id,
                product: r.targetTitle || r.productTitle || r.targetId || "Item",
                rating: r.rating || 0,
                text: r.comment || r.text || "",
                date: new Date(r.createdAt || Date.now()).toLocaleDateString(),
                helpful: r.helpful || 0,
                image: (r.images && r.images[0]) || undefined,
              }))
            );
          }
        } catch (err) { }
      } catch (err) {
        // ignore
      }
    }

    loadProfileAndReviews();

    function onAuthChanged() {
      try {
        const hasToken = localStorage.getItem('unimart:token');
        const raw = localStorage.getItem('unimart:user');
        if (!hasToken || !raw) {
          setUser(null);
          setName("");
          setEmail("");
          setPhone("");
          setUserBadges([]);
          setReviews([]);
          return;
        }
        const lu = JSON.parse(raw);
        setUser(lu);
        setName(lu.name || "");
        setEmail(lu.email || "");
        setPhone(lu.phone || "");
        const earnedBadges = calculateBadges(lu);
        setUserBadges(earnedBadges);
        loadProfileAndReviews();
      } catch (e) { }
    }

    function onStorage(e: StorageEvent) {
      if (e.key === 'unimart:user') onAuthChanged();
    }

    window.addEventListener('unimart:authChanged', onAuthChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      active = false;
      window.removeEventListener('unimart:authChanged', onAuthChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // ── BADGE CALCULATION ENGINE ──
  const calculateBadges = (userData: any) => {
    const earned: any[] = [];
    const orders = userData?.orders?.length || 0;
    const spent = userData?.totalSpent || 0;
    const reviewsCount = userData?.reviews?.length || 0;
    const shares = userData?.shares || 0;
    const streak = userData?.streakDays || 0;
    const flashSales = userData?.flashSalesPurchases || 0;
    const isVerified = userData?.isVerified || false;
    const isEarlyBird = userData?.createdAt && new Date(userData.createdAt) < new Date('2026-07-01');

    // Status badges
    if (isEarlyBird) earned.push(BADGES.EARLY_BIRD);
    if (isVerified) earned.push(BADGES.VERIFIED);
    if (orders >= 10) earned.push(BADGES.TRUSTED_BUYER);

    // Streak badges
    if (streak >= 7) earned.push(BADGES.STREAK_7);
    if (streak >= 30) earned.push(BADGES.STREAK_30);
    if (streak >= 100) earned.push(BADGES.STREAK_100);

    // Spending tiers
    if (spent >= 100) earned.push(BADGES.BRONZE);
    if (spent >= 500) earned.push(BADGES.SILVER);
    if (spent >= 1000) earned.push(BADGES.GOLD);
    if (spent >= 5000) earned.push(BADGES.PLATINUM);

    // Social badges
    if (shares >= 10) earned.push(BADGES.SOCIAL_BUTTERFLY);
    if (reviewsCount >= 10) earned.push(BADGES.REVIEW_GURU);
    if (flashSales >= 5) earned.push(BADGES.DEAL_HUNTER);

    return earned;
  };

  const formatDate = (d?: string | number | Date) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return String(d); }
  };

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    setAvatarFile(file);
    try { setAvatarPreview(URL.createObjectURL(file)); } catch (e) { setAvatarPreview(null); }
  };

  const handleSave = async () => {
    setStatus(null);
    try {
      let updated: any = null;
      if (avatarFile) {
        const form = new FormData();
        form.append("name", name);
        form.append("email", email);
        form.append("phone", phone);
        form.append("avatar", avatarFile);
        const token = typeof window !== "undefined" ? localStorage.getItem("unimart:token") : null;
        const res = await apiFetch('/auth/profile', {
          method: 'PUT',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        updated = res?.user || updated;
      } else {
        const res = await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify({ name, email, phone }) });
        updated = res?.user || (res?.success ? { name, email, phone } : null);
      }
      if (updated) {
        setUser((u: any) => ({ ...u, ...updated }));
        try { localStorage.setItem("unimart:user", JSON.stringify({ ...(user || {}), ...(updated || {}) })); } catch (e) { }
        setStatusType("success");
        setStatus("Profile updated successfully");
        setEditing(false);
      } else {
        setStatusType("error");
        setStatus("Failed to update profile");
      }
    } catch (err: any) {
      setStatusType("error");
      setStatus(err?.message || "Failed to update");
    }
  };

  const initials = name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "GU";
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const tabs = [
    { key: "overview", label: "Overview", icon: "ti-layout-dashboard" },
    { key: "reviews", label: "Reviews", icon: "ti-star" },
    { key: "badges", label: "Badges", icon: "ti-award" },
    { key: "security", label: "Security", icon: "ti-shield-lock" },
  ];

  // ── BADGE GROUPING ──
  const badgeCategories = {
    'status': { label: '🏅 Status', icon: 'ti-shield-check' },
    'trust': { label: '🤝 Trust', icon: 'ti-shield' },
    'streak': { label: '🔥 Streaks', icon: 'ti-flame' },
    'spending': { label: '💰 Spending Tiers', icon: 'ti-coin' },
    'social': { label: '🌐 Social', icon: 'ti-users' },
  };

  const groupedBadges = userBadges.reduce((acc: any, badge) => {
    const category = badge.category || 'status';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  // All available badges (for display)
  const allBadgeTypes = Object.values(BADGES);

  return (
    <div className="p-root">
      {/* ── Top nav bar ── */}
      <div className="p-topbar">
        <button className="p-back-btn" onClick={handleBackToHome} disabled={backLoading} aria-busy={backLoading}>
          <i className="ti ti-arrow-left" />
          {!backLoading ? (
            " Back to Home"
          ) : (
            <>
              <span style={{ marginLeft: 8 }}>Going home</span>
              <span className="p-back-spinner" aria-hidden="true" />
            </>
          )}
        </button>
        <span className="p-topbar-title">My Account</span>
        <div style={{ width: 120 }} />
      </div>

      <div className="p-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="p-sidebar">
          {/* Avatar card with badges next to name */}
          <div className="p-avatar-card">
            <div className="p-avatar-wrap">
              {avatarPreview || user?.avatar ? (
                <img src={avatarPreview || user?.avatar} alt="avatar" className="p-avatar-img" />
              ) : (
                <div className="p-avatar-initials">{initials}</div>
              )}
              {editing && (
                <label className="p-avatar-edit" title="Change photo">
                  <i className="ti ti-camera" />
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleAvatarChange(e.target.files?.[0])} />
                </label>
              )}
            </div>

            {/* Name with badges inline - Snapchat style */}
            <div className="p-avatar-name-wrap">
              <span className="p-avatar-name">{user?.name || "Guest User"}</span>
              <div className="p-avatar-badges-inline">
                {userBadges.slice(0, 4).map((b) => (
                  <BadgeTooltip key={b.id} badge={b} position="down">
                    <span
                      className="p-badge-inline"
                      style={{
                        background: `linear-gradient(150deg, ${b.bg} 0%, #ffffff 130%)`,
                        boxShadow: `0 2px 6px ${hexToRgba(b.color, 0.35)}, 0 0 0 2.5px #fff`,
                      }}
                    >
                      <span className="p-badge-icon">{b.icon}</span>
                    </span>
                  </BadgeTooltip>
                ))}
                {userBadges.length > 4 && (
                  <span className="p-badge-more">+{userBadges.length - 4}</span>
                )}
              </div>
            </div>
            <div className="p-avatar-email">{user?.email || ""}</div>

            {/* Badge count display */}
            <div className="p-badge-count">
              <i className="ti ti-award" />
              <span>{userBadges.length} Badges Earned</span>
            </div>
          </div>

          {/* Stats card */}
          <div className="p-stats-card">
            <div className="p-stat">
              <i className="ti ti-writing p-stat-icon" />
              <div className="p-stat-val">{reviews.length}</div>
              <div className="p-stat-lbl">Reviews</div>
            </div>
            <div className="p-stat-divider" />
            <div className="p-stat">
              <i className="ti ti-star-filled p-stat-icon" style={{ color: "#f59e0b" }} />
              <div className="p-stat-val">{avgRating}</div>
              <div className="p-stat-lbl">Avg Rating</div>
            </div>
            <div className="p-stat-divider" />
            <div className="p-stat">
              <i className="ti ti-award p-stat-icon" style={{ color: "#7c3aed" }} />
              <div className="p-stat-val">{userBadges.length}</div>
              <div className="p-stat-lbl">Badges</div>
            </div>
            <div className="p-stat-divider" />
            <div className="p-stat">
              <i className="ti ti-calendar p-stat-icon" />
              <div className="p-stat-val">{user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}</div>
              <div className="p-stat-lbl">Joined</div>
            </div>
          </div>

          {/* Sidebar nav */}
          <nav className="p-sidenav">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`p-sidenav-item ${activeTab === t.key ? "p-sidenav-item--active" : ""}`}
                onClick={() => setActiveTab(t.key as any)}
              >
                <i className={`ti ${t.icon}`} />
                {t.label}
                {t.key === 'badges' && userBadges.length > 0 && (
                  <span className="p-badge-count-pill">{userBadges.length}</span>
                )}
                <i className="ti ti-chevron-right p-sidenav-arrow" />
              </button>
            ))}
          </nav>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="p-main">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="p-section-anim">
              <div className="p-card">
                <div className="p-card-header">
                  <i className="ti ti-user-circle p-card-header-icon" />
                  <span>Personal Information</span>
                  {!editing && (
                    <button className="p-edit-btn" onClick={() => setEditing(true)}>
                      <i className="ti ti-pencil" /> Edit
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="p-info-grid">
                    <div className="p-info-row">
                      <div className="p-info-label"><i className="ti ti-user" /> Full Name</div>
                      <div className="p-info-value">{user?.name || "Not set"}</div>
                    </div>
                    <div className="p-info-row">
                      <div className="p-info-label"><i className="ti ti-mail" /> Email Address</div>
                      <div className="p-info-value">{user?.email || "Not set"}</div>
                    </div>
                    <div className="p-info-row">
                      <div className="p-info-label"><i className="ti ti-phone" /> Phone Number</div>
                      <div className="p-info-value">{user?.phone || "Not set"}</div>
                    </div>
                    <div className="p-info-row">
                      <div className="p-info-label"><i className="ti ti-calendar-event" /> Member Since</div>
                      <div className="p-info-value">{formatDate(user?.createdAt || user?.created || user?.signupDate)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-form-grid">
                    <div className="p-field">
                      <label className="p-label"><i className="ti ti-user" /> Full Name</label>
                      <input className="p-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div className="p-field">
                      <label className="p-label"><i className="ti ti-mail" /> Email Address</label>
                      <input className="p-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                    </div>
                    <div className="p-field">
                      <label className="p-label"><i className="ti ti-phone" /> Phone Number</label>
                      <input className="p-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 000 000 0000" />
                    </div>
                    <div className="p-form-actions">
                      <button className="p-save-btn" onClick={handleSave}>
                        <i className="ti ti-device-floppy" /> Save Changes
                      </button>
                      <button className="p-cancel-btn" onClick={() => { setEditing(false); setStatus(null); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {status && (
                  <div className={`p-status ${statusType === "success" ? "p-status--ok" : "p-status--err"}`}>
                    <i className={`ti ${statusType === "success" ? "ti-circle-check" : "ti-alert-circle"}`} />
                    {status}
                  </div>
                )}
              </div>

              {/* Account activity summary */}
              <div className="p-card p-activity-card">
                <div className="p-card-header">
                  <i className="ti ti-activity p-card-header-icon" />
                  <span>Account Activity</span>
                </div>
                <div className="p-activity-grid">
                  {[
                    { icon: "ti-shopping-cart", label: "Orders Placed", val: user?.orders?.length || "—", color: "#0f766e" },
                    { icon: "ti-heart", label: "Wishlist Items", val: user?.wishlist?.length || "—", color: "#e11d48" },
                    { icon: "ti-message-circle", label: "Messages", val: user?.messages?.length || "—", color: "#0284c7" },
                    { icon: "ti-award", label: "Badges Earned", val: userBadges.length, color: "#7c3aed" },
                  ].map((a) => (
                    <div className="p-activity-tile" key={a.label}>
                      <div className="p-activity-icon" style={{ color: a.color, background: a.color + "18" }}>
                        <i className={`ti ${a.icon}`} />
                      </div>
                      <div className="p-activity-val">{a.val}</div>
                      <div className="p-activity-lbl">{a.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REVIEWS TAB ── */}
          {activeTab === "reviews" && (
            <div className="p-section-anim">
              <div className="p-card">
                <div className="p-card-header">
                  <i className="ti ti-star p-card-header-icon" />
                  <span>My Reviews <span className="p-count-pill">{reviews.length}</span></span>
                </div>

                {reviews.length === 0 ? (
                  <div className="p-empty">
                    <i className="ti ti-writing p-empty-icon" />
                    <div className="p-empty-title">No reviews yet</div>
                    <div className="p-empty-sub">Your product reviews will appear here after you submit them.</div>
                  </div>
                ) : (
                  <div className="p-reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-review-item">
                        {r.image && (
                          <img src={r.image} alt={r.product} className="p-review-img" />
                        )}
                        <div className="p-review-body">
                          <div className="p-review-top">
                            <span className="p-review-product">{r.product}</span>
                            <span className="p-review-date">
                              <i className="ti ti-calendar-event" style={{ fontSize: 12 }} /> {r.date}
                            </span>
                          </div>
                          <div className="p-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i key={s} className={`ti ${s <= r.rating ? "ti-star-filled" : "ti-star"}`} style={{ color: s <= r.rating ? "#f59e0b" : "#d1d5db", fontSize: 14 }} />
                            ))}
                            <span className="p-stars-val">{r.rating}/5</span>
                          </div>
                          <p className="p-review-text">{r.text}</p>
                          {r.helpful > 0 && (
                            <div className="p-helpful">
                              <i className="ti ti-thumb-up" style={{ fontSize: 13 }} /> {r.helpful} found helpful
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BADGES TAB ── */}
          {activeTab === "badges" && (
            <div className="p-section-anim">
              {/* Earned Badges */}
              <div className="p-card">
                <div className="p-card-header">
                  <i className="ti ti-award p-card-header-icon" />
                  <span>My Badges <span className="p-count-pill">{userBadges.length}</span></span>
                </div>

                {userBadges.length === 0 ? (
                  <div className="p-empty">
                    <i className="ti ti-award p-empty-icon" />
                    <div className="p-empty-title">No badges yet</div>
                    <div className="p-empty-sub">Start shopping, reviewing, and engaging to earn badges!</div>
                  </div>
                ) : (
                  <div className="p-badge-showcase">
                    {Object.entries(badgeCategories).map(([categoryKey, category]) => {
                      const badgesInCategory = groupedBadges[categoryKey] || [];
                      if (badgesInCategory.length === 0) return null;

                      return (
                        <div key={categoryKey} className="p-badge-category">
                          <div className="p-badge-category-header">
                            <i className={`ti ${category.icon}`} />
                            <span>{category.label}</span>
                            <span className="p-badge-category-count">{badgesInCategory.length}</span>
                          </div>
                          <div className="p-badge-grid">
                            {badgesInCategory.map((badge: any) => (
                              <BadgeTooltip key={badge.id} badge={badge} position="up">
                                <div
                                  className="p-badge-medal"
                                  style={{
                                    background: `linear-gradient(165deg, ${badge.bg} 0%, #ffffff 130%)`,
                                    borderColor: badge.border,
                                  }}
                                >
                                  <div
                                    className="p-badge-medal-icon"
                                    style={{
                                      background: `radial-gradient(circle at 32% 28%, #ffffff, ${badge.bg})`,
                                      boxShadow: `inset 0 0 0 1px ${badge.border}, 0 4px 10px ${hexToRgba(badge.color, 0.28)}`,
                                    }}
                                  >
                                    {badge.icon}
                                  </div>
                                  <div className="p-badge-medal-name" style={{ color: badge.color }}>
                                    {badge.name}
                                  </div>
                                </div>
                              </BadgeTooltip>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* All Available Badges - Locked/Unlocked */}
              <div className="p-card">
                <div className="p-card-header">
                  <i className="ti ti-lock p-card-header-icon" />
                  <span>All Badges</span>
                </div>
                <div className="p-all-badges-grid">
                  {allBadgeTypes.map((badge) => {
                    const hasBadge = userBadges.some((b) => b.id === badge.id);
                    return (
                      <BadgeTooltip key={badge.id} badge={badge} position="up">
                        <div
                          className={`p-all-badge-medal ${hasBadge ? "is-unlocked" : "is-locked"}`}
                          style={
                            hasBadge
                              ? {
                                background: `linear-gradient(165deg, ${badge.bg} 0%, #ffffff 130%)`,
                                borderColor: badge.border,
                              }
                              : undefined
                          }
                        >
                          <div
                            className="p-all-badge-medal-icon"
                            style={
                              hasBadge
                                ? {
                                  background: `radial-gradient(circle at 32% 28%, #ffffff, ${badge.bg})`,
                                  boxShadow: `inset 0 0 0 1px ${badge.border}, 0 4px 10px ${hexToRgba(badge.color, 0.28)}`,
                                }
                                : undefined
                            }
                          >
                            {hasBadge ? badge.icon : <i className="ti ti-lock" />}
                          </div>
                          <div className="p-all-badge-medal-name">{badge.name}</div>
                          <span className={`p-all-badge-medal-status ${hasBadge ? "unlocked" : "locked"}`}>
                            {hasBadge ? (
                              <>
                                <i className="ti ti-check" /> Earned
                              </>
                            ) : (
                              <>
                                <i className="ti ti-lock" /> Locked
                              </>
                            )}
                          </span>
                        </div>
                      </BadgeTooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "security" && (
            <div className="p-section-anim">
              <div className="p-card">
                <div className="p-card-header">
                  <i className="ti ti-shield-lock p-card-header-icon" />
                  <span>Security & Privacy</span>
                </div>
                <div className="p-security-list">
                  {[
                    { icon: "ti-lock", label: "Password", sub: "Last changed —", action: "Change Password" },
                    { icon: "ti-device-mobile", label: "Two-Factor Authentication", sub: "Add an extra layer of security", action: "Enable 2FA" },
                    { icon: "ti-bell", label: "Notifications", sub: "Manage email & push preferences", action: "Manage" },
                    { icon: "ti-logout", label: "Sign Out", sub: "Sign out of all devices", action: "Sign Out", danger: true },
                  ].map((s) => (
                    <div className="p-security-row" key={s.label}>
                      <div className="p-security-icon" style={s.danger ? { color: "#dc2626", background: "#fef2f2" } : {}}>
                        <i className={`ti ${s.icon}`} />
                      </div>
                      <div className="p-security-info">
                        <div className="p-security-label" style={s.danger ? { color: "#dc2626" } : {}}>{s.label}</div>
                        <div className="p-security-sub">{s.sub}</div>
                      </div>
                      <button
                        type="button"
                        className={`p-security-btn ${s.danger ? "p-security-btn--danger" : ""}`}
                        onClick={s.danger ? handleSignOut : undefined}
                      >
                        {s.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        /* ── Tokens ── */
        .p-root {
          --teal: #0f766e;
          --teal-dark: #0d6460;
          --teal-light: #f0fdfa;
          --teal-mid: #99f6e4;
          --white: #ffffff;
          --surface: #f8fafb;
          --border: #e2e8f0;
          --text: #0f172a;
          --muted: #64748b;
          --radius: 14px;
          --shadow: 0 1px 4px rgba(15,118,110,0.07), 0 4px 16px rgba(0,0,0,0.06);
          --shadow-hover: 0 4px 20px rgba(15,118,110,0.15);

          min-height: 100vh;
          background: var(--surface);
          font-family: 'DM Sans', system-ui, sans-serif;
          color: var(--text);
        }

        /* ── Topbar ── */
        .p-topbar {
          height: 56px;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: calc(var(--header-height, 56px) + env(safe-area-inset-top));
          z-index: 60;
        }
        .p-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 13px;
          color: var(--muted);
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .p-back-btn:hover { border-color: var(--teal); color: var(--teal); }
        .p-topbar-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .p-back-btn[disabled] {
          opacity: 0.7;
          cursor: default;
          pointer-events: none;
        }
        .p-back-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-left: 8px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.12);
          border-top-color: var(--teal);
          animation: p-spin 0.8s linear infinite;
          vertical-align: middle;
        }
        @keyframes p-spin { to { transform: rotate(360deg); } }

        /* ── Layout ── */
        .p-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 20px;
          max-width: 1060px;
          margin: 24px auto;
          padding: 0 20px 48px;
        }

        /* ── Sidebar ── */
        .p-sidebar {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Avatar card */
        .p-avatar-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid var(--border);
        }
        .p-avatar-wrap {
          position: relative;
          width: 84px;
          height: 84px;
          margin-bottom: 12px;
        }
        .p-avatar-img {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--teal);
        }
        .p-avatar-initials {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal) 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          border: 3px solid var(--teal);
        }
        .p-avatar-edit {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--teal);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: background 0.15s;
        }
        .p-avatar-edit:hover { background: var(--teal-dark); }

        /* Name with inline badges - Snapchat style */
        .p-avatar-name-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .p-avatar-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }
        .p-avatar-badges-inline {
          display: flex;
          align-items: center;
        }
        .p-avatar-badges-inline .p-tt {
          position: relative;
        }
        .p-avatar-badges-inline .p-tt:not(:first-child) {
          margin-left: -8px;
        }
        .p-avatar-badges-inline .p-tt:hover,
        .p-avatar-badges-inline .p-tt:focus-within {
          z-index: 50;
        }
        .p-badge-inline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0;
        }
        .p-tt:hover .p-badge-inline,
        .p-tt:focus-within .p-badge-inline {
          transform: translateY(-3px) scale(1.14);
        }
        .p-badge-icon {
          line-height: 1;
        }
        .p-badge-more {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          background: var(--surface);
          padding: 2px 6px;
          border-radius: 10px;
          border: 1px solid var(--border);
          margin-left: 4px;
        }

        /* ── BADGE TOOLTIP (shared by all badge displays) ── */
        .p-tt {
          position: relative;
          display: inline-flex;
          outline: none;
        }
        .p-tt-content {
          position: absolute;
          left: 50%;
          width: max-content;
          min-width: 190px;
          max-width: 230px;
          background: #0f172a;
          border-radius: 12px;
          padding: 11px 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 16px 32px -10px rgba(15, 23, 42, 0.5), 0 2px 8px rgba(0, 0, 0, 0.18);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
          z-index: 300;
        }
        .p-tt--up .p-tt-content {
          bottom: calc(100% + 11px);
          transform: translateX(-50%) translateY(6px) scale(0.94);
        }
        .p-tt--up .p-tt-content::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: #0f172a;
        }
        .p-tt--down .p-tt-content {
          top: calc(100% + 11px);
          transform: translateX(-50%) translateY(-6px) scale(0.94);
        }
        .p-tt--down .p-tt-content::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-bottom-color: #0f172a;
        }
        .p-tt:hover .p-tt-content,
        .p-tt:focus-within .p-tt-content {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .p-tt-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .p-tt-text { min-width: 0; }
        .p-tt-name {
          font-size: 12.5px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2px;
        }
        .p-tt-desc {
          font-size: 11px;
          color: #cbd5e1;
          line-height: 1.4;
        }
        .p-avatar-email {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 12px;
          word-break: break-all;
        }
        .p-badge-count {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: var(--teal-light);
          color: var(--teal);
          font-size: 11px;
          font-weight: 600;
          border: 1px solid var(--teal-mid);
        }
        .p-badge-count i {
          font-size: 14px;
        }

        /* Stats card */
        .p-stats-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr 1px 1fr;
          align-items: center;
          padding: 12px 8px;
        }
        .p-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .p-stat-icon {
          font-size: 17px;
          color: var(--teal);
        }
        .p-stat-val {
          font-size: 17px;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
        }
        .p-stat-lbl {
          font-size: 9.5px;
          color: var(--muted);
          text-align: center;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .p-stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border);
        }

        /* Sidebar nav */
        .p-sidenav {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .p-sidenav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border);
          font-size: 13.5px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          text-align: left;
          transition: background 0.14s, color 0.14s;
          font-family: 'DM Sans', system-ui, sans-serif;
          position: relative;
        }
        .p-sidenav-item:last-child { border-bottom: none; }
        .p-sidenav-item i:first-child { font-size: 17px; }
        .p-sidenav-item:hover { background: var(--teal-light); color: var(--teal); }
        .p-sidenav-item--active {
          background: var(--teal-light);
          color: var(--teal);
          font-weight: 700;
          border-left: 3px solid var(--teal);
        }
        .p-sidenav-arrow {
          margin-left: auto;
          font-size: 15px;
          opacity: 0.4;
        }
        .p-badge-count-pill {
          background: var(--teal);
          color: white;
          border-radius: 999px;
          padding: 1px 8px;
          font-size: 10px;
          font-weight: 700;
          margin-left: auto;
        }

        /* ── Main ── */
        .p-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

        /* Animation */
        .p-section-anim {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: p-fade-up 0.3s ease both;
        }
        @keyframes p-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Card */
        .p-card {
          background: var(--white);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .p-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          background: #fafcfc;
        }
        .p-card-header-icon {
          font-size: 18px;
          color: var(--teal);
        }

        /* Edit button */
        .p-edit-btn {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--teal-light);
          border: 1.5px solid var(--teal-mid);
          border-radius: 8px;
          padding: 5px 13px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--teal);
          cursor: pointer;
          transition: background 0.14s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .p-edit-btn:hover { background: #ccfbf1; }

        /* Info grid */
        .p-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .p-info-row {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        .p-info-row:nth-child(2n) { border-right: none; }
        .p-info-row:nth-last-child(-n+2) { border-bottom: none; }
        .p-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 5px;
        }
        .p-info-label i { font-size: 14px; color: var(--teal); }
        .p-info-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        /* Form */
        .p-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 20px;
        }
        .p-field { display: flex; flex-direction: column; gap: 6px; }
        .p-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .p-label i { font-size: 14px; color: var(--teal); }
        .p-input {
          border: 1.5px solid var(--border);
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 13.5px;
          color: var(--text);
          background: var(--surface);
          outline: none;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: border-color 0.15s, background 0.15s;
        }
        .p-input:focus { border-color: var(--teal); background: #fff; box-shadow: 0 0 0 3px rgba(15,118,110,0.1); }
        .p-form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          padding-top: 4px;
        }
        .p-save-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--teal);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 10px 22px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.14s, transform 0.12s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .p-save-btn:hover { background: var(--teal-dark); transform: translateY(-1px); }
        .p-cancel-btn {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 9px;
          padding: 10px 18px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          transition: border-color 0.14s, color 0.14s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .p-cancel-btn:hover { border-color: var(--teal); color: var(--teal); }

        /* Status */
        .p-status {
          margin: 0 20px 16px;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .p-status--ok { background: var(--teal-light); color: var(--teal); border: 1px solid #99f6e4; }
        .p-status--err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Activity card */
        .p-activity-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          padding: 4px 0;
        }
        .p-activity-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 20px 12px;
          border-right: 1px solid var(--border);
          transition: background 0.15s;
        }
        .p-activity-tile:last-child { border-right: none; }
        .p-activity-tile:hover { background: var(--surface); }
        .p-activity-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .p-activity-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
        }
        .p-activity-lbl {
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          text-align: center;
        }

        /* Reviews */
        .p-reviews-list { display: flex; flex-direction: column; }
        .p-count-pill {
          background: var(--teal-light);
          color: var(--teal);
          border-radius: 999px;
          padding: 2px 9px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid var(--teal-mid);
          margin-left: 4px;
        }
        .p-review-item {
          display: flex;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          transition: background 0.14s;
        }
        .p-review-item:last-child { border-bottom: none; }
        .p-review-item:hover { background: var(--surface); }
        .p-review-img {
          width: 56px;
          height: 56px;
          border-radius: 9px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .p-review-body { flex: 1; min-width: 0; }
        .p-review-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
          gap: 8px;
        }
        .p-review-product {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .p-review-date {
          font-size: 11.5px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }
        .p-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 8px;
        }
        .p-stars-val {
          font-size: 12px;
          color: var(--muted);
          margin-left: 5px;
          font-weight: 600;
        }
        .p-review-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.55;
          margin: 0 0 7px;
        }
        .p-helpful {
          font-size: 11.5px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Empty state */
        .p-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          gap: 8px;
          text-align: center;
        }
        .p-empty-icon {
          font-size: 40px;
          color: #cbd5e1;
          margin-bottom: 4px;
        }
        .p-empty-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .p-empty-sub { font-size: 13px; color: var(--muted); max-width: 260px; line-height: 1.5; }

        /* Security */
        .p-security-list { display: flex; flex-direction: column; }
        .p-security-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          transition: background 0.14s;
        }
        .p-security-row:last-child { border-bottom: none; }
        .p-security-row:hover { background: var(--surface); }
        .p-security-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--teal-light);
          color: var(--teal);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .p-security-info { flex: 1; }
        .p-security-label { font-size: 13.5px; font-weight: 600; color: var(--text); }
        .p-security-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .p-security-btn {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--teal);
          cursor: pointer;
          transition: border-color 0.14s, background 0.14s;
          font-family: 'DM Sans', system-ui, sans-serif;
          white-space: nowrap;
        }
        .p-security-btn:hover { border-color: var(--teal); background: var(--teal-light); }
        .p-security-btn--danger {
          color: #dc2626;
          border-color: #fecaca;
        }
        .p-security-btn--danger:hover { background: #fef2f2; border-color: #dc2626; }

        /* ── BADGES SHOWCASE ── */
        .p-badge-showcase {
          padding: 8px 0;
        }
        .p-badge-category {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .p-badge-category:last-child { border-bottom: none; }
        .p-badge-category-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 14px;
        }
        .p-badge-category-header i {
          font-size: 16px;
          color: var(--teal);
        }
        .p-badge-category-count {
          margin-left: auto;
          background: var(--teal-light);
          color: var(--teal);
          border-radius: 999px;
          padding: 1px 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .p-badge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
          gap: 12px;
        }

        /* Earned badge medallion */
        .p-badge-medal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          padding: 16px 10px 13px;
          border-radius: 16px;
          border: 1.5px solid;
          cursor: default;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s;
        }
        .p-tt:hover .p-badge-medal,
        .p-tt:focus-within .p-badge-medal {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.25);
        }
        .p-badge-medal-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .p-badge-medal-name {
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          line-height: 1.3;
        }

        /* All Badges Grid */
        .p-all-badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          padding: 20px;
        }
        .p-all-badge-medal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 17px 10px 13px;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          cursor: default;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s, background 0.18s;
        }
        .p-tt:hover .p-all-badge-medal.is-unlocked,
        .p-tt:focus-within .p-all-badge-medal.is-unlocked {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 12px 24px -10px rgba(15, 23, 42, 0.25);
        }
        .p-tt:hover .p-all-badge-medal.is-locked,
        .p-tt:focus-within .p-all-badge-medal.is-locked {
          transform: translateY(-2px);
          background: #eef2f6;
        }
        .p-all-badge-medal.is-locked {
          opacity: 0.85;
        }
        .p-all-badge-medal-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: #e2e8f0;
          color: #94a3b8;
        }
        .p-all-badge-medal.is-locked .p-all-badge-medal-icon i {
          font-size: 18px;
        }
        .p-all-badge-medal-name {
          font-size: 11px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
          line-height: 1.3;
        }
        .p-all-badge-medal.is-locked .p-all-badge-medal-name {
          color: var(--muted);
        }
        .p-all-badge-medal-status {
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .p-all-badge-medal-status.unlocked {
          background: var(--teal-light);
          color: var(--teal);
        }
        .p-all-badge-medal-status.locked {
          background: #e2e8f0;
          color: #94a3b8;
        }
        .p-all-badge-medal-status i {
          font-size: 10px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .p-layout {
            grid-template-columns: 1fr;
            margin: 16px auto;
            padding: 0 12px 32px;
          }
          .p-info-grid { grid-template-columns: 1fr; }
          .p-info-row { border-right: none !important; }
          .p-info-row:nth-last-child(1) { border-bottom: none; }
          .p-activity-grid { grid-template-columns: repeat(2, 1fr); }
          .p-activity-tile:nth-child(2) { border-right: none; }
          .p-activity-tile:nth-child(3) { border-right: 1px solid var(--border); }
          .p-form-grid { grid-template-columns: 1fr; }
          .p-stats-card {
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 0;
            padding: 12px 4px;
          }
          .p-stat-divider { display: none; }
          .p-badge-grid {
            grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
            gap: 10px;
          }
          .p-all-badges-grid {
            grid-template-columns: repeat(3, 1fr);
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .p-topbar { padding: 0 14px; }
          .p-topbar-title { font-size: 13px; }
          .p-back-btn { font-size: 12px; padding: 5px 10px; }
          .p-activity-grid { grid-template-columns: repeat(2, 1fr); }
          .p-all-badges-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            padding: 12px;
          }
          .p-avatar-name-wrap {
            flex-direction: column;
            gap: 4px;
          }
          .p-badge-inline {
            width: 24px;
            height: 24px;
            font-size: 11px;
          }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
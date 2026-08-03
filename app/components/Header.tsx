"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Search,
  Compass,
  Package,
  MessageCircle,
  User,
  Monitor,
  BookOpen,
  Shirt,
  Utensils,
  PenTool,
  Wrench,
  ChevronDown,
  Bell,
  Dumbbell,
  ShoppingCart,
  X,
} from "lucide-react";
import apiClient from "../../lib/apiClient";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

// Bottom tab bar — the primary way people get around on mobile
const TAB_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/profile", icon: User },
];

const CATEGORIES = [
  { label: "Electronics", href: "/search?category=electronics", icon: Monitor },
  { label: "Books & Notes", href: "/search?category=books", icon: BookOpen },
  { label: "Fashion", href: "/search?category=fashion", icon: Shirt },
  { label: "Food & Snacks", href: "/search?category=food", icon: Utensils },
  { label: "Stationery", href: "/search?category=stationery", icon: PenTool },
  { label: "Services", href: "/search?category=services", icon: Wrench },
  { label: "Accommodation", href: "/search?category=accommodation", icon: Home },
  { label: "Sports & Fitness", href: "/search?category=sports", icon: Dumbbell },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggRef = useRef<HTMLDivElement | null>(null);
  let suggDebounce = useRef<number | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showSignupNotificationPrompt, setShowSignupNotificationPrompt] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Hamburger menu state (desktop dropdown panel)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isListingDetailRoute = typeof pathname === "string" && /^\/listings\/[^/]+(?:\/.*)?$/.test(pathname);
  const hideHeader =
    (typeof pathname === "string" && pathname.startsWith("/seller")) ||
    (typeof pathname === "string" && /^\/listings\/[^/]+\/chat$/.test(pathname)) ||
    (isListingDetailRoute && isMobileView);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => setIsMobileView(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Close dropdown/menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggRef.current && !suggRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile search overlay is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSearchOpen]);

  async function detectLocation(onFirstLoad = false) {
    try {
      if (!navigator.geolocation) { await fallbackToIP(onFirstLoad); return; }
      try {
        // @ts-ignore
        const perm = navigator.permissions ? await navigator.permissions.query({ name: "geolocation" }) : null;
        if (perm && perm.state === "denied") { await fallbackToIP(onFirstLoad); return; }
      } catch (e) {}
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          if (onFirstLoad) localStorage.setItem("unimart:locationDetected", "1");
        },
        async () => { await fallbackToIP(onFirstLoad); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } catch (e) {}
  }

  async function fallbackToIP(onFirstLoad: boolean) {
    try {
      if (onFirstLoad) localStorage.setItem("unimart:locationDetected", "1");
    } catch {}
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => { if (suggDebounce.current) window.clearTimeout(suggDebounce.current); };
  }, []);

  // FIXED: Use apiClient as a function instead of .get()
  const fetchSuggestions = (q: string) => {
    if (suggDebounce.current) window.clearTimeout(suggDebounce.current);
    if (!q || q.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    suggDebounce.current = window.setTimeout(async () => {
      try {
        const res = await apiClient(`/search/suggestions?q=${encodeURIComponent(q)}`, { 
          method: 'GET' 
        });
        if (res?.success && Array.isArray(res.data)) { 
          setSuggestions(res.data.slice(0, 8)); 
          setShowSuggestions(true); 
          setActiveSuggestion(-1); 
        }
      } catch (e) { 
        setSuggestions([]); 
        setShowSuggestions(false); 
      }
    }, 250) as unknown as number;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = headerRef.current || document.querySelector('header[role="banner"]');
    if (!el) return;
    function updateHeight() {
      try { const h = Math.ceil((el as HTMLElement).offsetHeight || 0); document.documentElement.style.setProperty("--header-height", `${h}px`); } catch (e) {}
    }
    updateHeight();
    const ro = new ResizeObserver(() => updateHeight());
    ro.observe(el);
    const mo = new MutationObserver(() => updateHeight());
    mo.observe(el, { attributes: true, childList: true, subtree: true });
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      try { ro.disconnect(); } catch (e) {}
      try { mo.disconnect(); } catch (e) {}
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  // Load message count - using direct fetch to avoid apiClient error logging
  useEffect(() => {
    let mounted = true;

    const loadMessageCount = async () => {
      try {
        setIsLoadingMessages(true);
        
        // Check if user is logged in
        const token = localStorage.getItem('unimart:token');
        if (!token) {
          if (mounted) {
            setMessageCount(0);
            setIsLoadingMessages(false);
          }
          return;
        }

        // Get the API base URL from environment or use default
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';
        
        // Direct fetch - this won't trigger the apiClient error logging
        try {
          const response = await fetch(`${apiBase}/api/conversations`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!mounted) return;
          
          if (response.ok) {
            const data = await response.json();
            const convs = Array.isArray(data?.conversations ? data.conversations : data) ? (data?.conversations || data) : [];
            const total = convs.reduce((sum: number, conv: any) => {
              return (
                sum +
                Number(conv.unreadForBuyer || conv.unreadForUser || conv.unreadCount || 0)
              );
            }, 0);
            setMessageCount(total);
          } else {
            // Silently fail - don't log
            setMessageCount(0);
          }
        } catch (err) {
          // Silent fail - don't log
          if (mounted) {
            setMessageCount(0);
          }
        }
      } catch (e) {
        // Silent catch - don't log anything
        if (mounted) {
          setMessageCount(0);
        }
      } finally {
        if (mounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessageCount();

    // Listen for auth changes
    const onMessageUpdate = (e: any) => {
      if (!mounted) return;
      const detail = e?.detail || {};
      if (typeof detail.count === 'number') {
        setMessageCount(Number(detail.count));
      } else if (typeof detail.increment === 'number') {
        setMessageCount((prev) => prev + Number(detail.increment));
      }
      setIsLoadingMessages(false);
    };
    
    const onAuthChange = () => {
      loadMessageCount();
    };

    window.addEventListener("unimart:messageCount", onMessageUpdate as EventListener);
    window.addEventListener("unimart:authChanged", onAuthChange);
    window.addEventListener("storage", (e) => {
      if (e.key === 'unimart:token') {
        loadMessageCount();
      }
    });

    return () => { 
      mounted = false; 
      window.removeEventListener("unimart:messageCount", onMessageUpdate as EventListener);
      window.removeEventListener("unimart:authChanged", onAuthChange);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkSignupPrompt = () => {
      if (!mounted || typeof window === 'undefined') return;
      try {
        const promptFlag = sessionStorage.getItem('unimart:notificationPrompt');
        if (promptFlag) {
          setShowSignupNotificationPrompt(true);
          sessionStorage.removeItem('unimart:notificationPrompt');
          window.setTimeout(() => {
            if (mounted) setShowSignupNotificationPrompt(false);
          }, 8000);
        }
      } catch (e) {
        console.warn('Failed to read signup notification prompt flag', e);
      }
    };

      const clearSignupNotificationPrompt = () => {
      if (!mounted) return;
      try {
        sessionStorage.removeItem('unimart:notificationPrompt');
      } catch (e) {}
      setShowSignupNotificationPrompt(false);
    };

    const onNotification = (e: any) => {
      if (!mounted) return;
      const detail = e?.detail || {};
      if (typeof detail.increment === 'number') {
        setNotificationCount((prev) => prev + Number(detail.increment));
      } else {
        setNotificationCount(Number(detail.count || 0));
      }
    };

    const onNotificationOpened = () => {
      if (!mounted) return;
      setNotificationCount(0);
      setShowSignupNotificationPrompt(false);
      try {
        sessionStorage.removeItem('unimart:notificationPrompt');
      } catch (e) {}
    };

    const onMessageNotification = (e: any) => {
      if (!mounted) return;
      const detail = e?.detail || {};
      if (typeof detail.increment === 'number') {
        setMessageCount((prev) => prev + Number(detail.increment));
      } else if (typeof detail.count === 'number') {
        setMessageCount(Number(detail.count || 0));
      }
    };

    window.addEventListener("unimart:notificationCount", onNotification as EventListener);
    window.addEventListener("unimart:notificationOpened", onNotificationOpened as EventListener);
    window.addEventListener("unimart:messageCount", onMessageNotification as EventListener);
    window.addEventListener('unimart:authChanged', checkSignupPrompt);

    checkSignupPrompt();
    if (pathname === '/notifications') {
      onNotificationOpened();
    }

    async function loadNotificationCount() {
      try {
        let userId = null;
        try { 
          const raw = localStorage.getItem("unimart:user"); 
          if (raw) {
            const parsed = JSON.parse(raw);
            userId = parsed?._id || parsed?.id || null;
          }
        } catch (e) {}
        
        if (!userId) {
          if (mounted) setNotificationCount(0);
          return;
        }

        const token = localStorage.getItem('unimart:token');
        if (!token) {
          if (mounted) setNotificationCount(0);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';

        try {
          const response = await fetch(
            `${apiBase}/api/notifications?userId=${encodeURIComponent(userId)}&unreadOnly=true`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!mounted) return;
          
          if (response.ok) {
            const res = await response.json();
            if (res && typeof res.unreadCount === "number") {
              setNotificationCount(res.unreadCount || 0);
            } else {
              setNotificationCount(0);
            }
          } else {
            setNotificationCount(0);
          }
        } catch (err) {
          // Silently ignore
          if (mounted) {
            setNotificationCount(0);
          }
        }
      } catch (e) {
        if (mounted) setNotificationCount(0);
      }
    }
    
    loadNotificationCount();
    
    return () => {
      mounted = false;
      window.removeEventListener("unimart:notificationCount", onNotification as EventListener);
      window.removeEventListener("unimart:notificationOpened", onNotificationOpened as EventListener);
      window.removeEventListener('unimart:authChanged', checkSignupPrompt);
    };
  }, [pathname]);

  const submitSearch = (q: string) => {
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  if (hideHeader) return null;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .menu-animate {
          animation: slideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .overlay-animate {
          animation: fadeIn 0.2s ease forwards;
        }
        .drawer-animate {
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .sheet-animate {
          animation: slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .badge-pop {
          animation: popIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: white;
          border-radius: 2px;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
          transform-origin: center;
        }
        .hamburger-open .line-top    { transform: translateY(6px) rotate(45deg); }
        .hamburger-open .line-mid    { opacity: 0; transform: scaleX(0); }
        .hamburger-open .line-bot    { transform: translateY(-6px) rotate(-45deg); }
        .icon-hover {
          transition: all 0.2s ease;
        }
        .icon-hover:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .tab-bar-safe {
          padding-bottom: calc(env(safe-area-inset-bottom) + 6px);
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.045); }
        }
        .logo-animate {
          display: inline-block;
          animation: logoPulse 3s ease-in-out infinite;
          transform-origin: center;
          transition: filter 0.2s ease;
        }
        .logo-animate:hover {
          filter: drop-shadow(0 0 6px rgba(0, 212, 168, 0.55));
        }
        .logo-subtitle {
          font-size: 8px;
          letter-spacing: 0.03em;
          font-weight: 500;
          opacity: 0.72;
        }
        @media (min-width: 768px) {
          .logo-subtitle {
            font-size: 10.5px;
            letter-spacing: 0.04em;
          }
        }
      `}</style>

      <header
        ref={headerRef}
        data-unimart-header
        role="banner"
        className="fixed top-0 inset-x-0 z-50 bg-[#0B4F5C] shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ============================= MOBILE APP HEADER ============================= */}
          <div className="md:hidden bg-gradient-to-b from-[#0E6373] to-[#0B4F5C] -mx-4 px-4 pb-3">
            {/* Top bar: logo, messages, notifications */}
            <div className="flex items-center gap-1.5 pt-2.5 pb-2">
              <Link href="/" className="flex items-center gap-1.5 shrink-0">
                <img src="/swoop-logo.png" alt="Swoop" className="logo-animate h-5 w-auto object-contain" />
                <span className="logo-subtitle text-white leading-none whitespace-nowrap self-end pb-[2px]">
                  Marketplace
                </span>
              </Link>

              <div className="flex-1" />

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => router.push("/messages")}
                  className="relative p-1.5 rounded-full active:bg-white/15 transition shrink-0"
                  aria-label="Messages"
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                  {!isLoadingMessages && messageCount > 0 && (
                    <span className="badge-pop absolute top-0 right-0 bg-[#F97316] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 ring-2 ring-[#0B4F5C]">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    try {
                      sessionStorage.removeItem('unimart:notificationPrompt');
                    } catch (e) {}
                    setShowSignupNotificationPrompt(false);
                    setNotificationCount(0);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('unimart:notificationCount', { detail: { count: 0 } }));
                      window.dispatchEvent(new CustomEvent('unimart:notificationOpened', { detail: { count: 0 } }));
                    }
                    router.push("/notifications");
                  }}
                  className="relative p-1.5 rounded-full active:bg-white/15 transition shrink-0"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                  {showSignupNotificationPrompt && (
                    <span className="badge-pop absolute -top-0.5 -right-0.5 bg-white text-[#0B4F5C] text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 border border-orange-500">
                      +1
                    </span>
                  )}
                  {notificationCount > 0 && (
                    <span className="badge-pop absolute top-0 right-0 bg-[#F97316] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 ring-2 ring-[#0B4F5C]">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

          {showSignupNotificationPrompt && (
            <div className="fixed inset-x-4 top-[calc(var(--header-height)+1rem)] z-[1000] rounded-2xl border border-orange-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md text-sm font-semibold text-slate-900 ring-1 ring-orange-100 animate-popIn">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
                  +1
                </span>
                <div>
                  <div className="font-semibold text-slate-900">Verified badge unlocked</div>
                  <div className="text-xs text-slate-500">Tap the bell to open your new notification.</div>
                </div>
              </div>
            </div>
          )}

          {/* Search row — an elevated card, the focal element of the bar */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="w-full flex items-center gap-2.5 bg-white rounded-2xl py-2.5 pl-3 pr-4 text-left shadow-[0_2px_10px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"
            >
              <span className="flex items-center justify-center w-6.5 h-6.5 rounded-full bg-teal-50 shrink-0">
                <Search className="text-teal-600 w-3.5 h-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-[13px] text-slate-400 truncate">
                {searchQuery ? searchQuery : "Search products, brands, and more..."}
              </span>
            </button>

            {/* Category quick-scroll chips */}
            <div className="pt-2.5 -mx-4 px-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center gap-1.5 shrink-0 bg-white/12 ring-1 ring-white/10 active:bg-white/20 transition rounded-full py-[6px] pl-2 pr-3"
                    >
                      <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white/15">
                        <Icon className="w-[11px] h-[11px] text-white" strokeWidth={2.25} />
                      </span>
                      <span className="text-white text-[11px] font-medium whitespace-nowrap">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile full-screen search overlay (Temu-like) */}
          {mobileSearchOpen && (
            <div className="fixed inset-0 z-[60] bg-white md:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full bg-gray-100 active:bg-gray-200 transition shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-4.5 h-4.5 text-gray-600" strokeWidth={2.25} />
                </button>
                <div className="relative flex-1">
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-teal-50">
                    <Search className="text-teal-600 w-3.5 h-3.5" strokeWidth={2.5} />
                  </span>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onInput={(e) => fetchSuggestions((e.target as HTMLInputElement).value)}
                    className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 placeholder:opacity-100 focus:bg-white focus:border-teal-200 transition-colors"
                    placeholder="Search for products, brands, and more..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setMobileSearchOpen(false);
                        submitSearch(searchQuery.trim());
                      }
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 px-4 pb-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
                {suggestions.length > 0 ? (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-1.5">Suggestions</p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSearchQuery(s); setMobileSearchOpen(false); submitSearch(s); }}
                        className="w-full text-left px-2 py-2.5 rounded-xl active:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 shrink-0">
                          <Search className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                        </span>
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-1 mb-2">Browse categories</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            onClick={() => setMobileSearchOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-3 rounded-2xl bg-gray-50 active:bg-gray-100 text-sm font-medium text-gray-700 transition"
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm shrink-0">
                              <Icon className="w-4 h-4 text-teal-600" strokeWidth={2} />
                            </span>
                            <span className="truncate">{cat.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}


          {/* =========================== END MOBILE APP HEADER =========================== */}

          <div className="hidden md:flex flex-col">
            {/* ROW 1: Hamburger + Logo + Actions */}
            <div className="flex items-center justify-between py-3 border-b border-white/10 gap-3">

              {/* LEFT: Hamburger + Logo + Name */}
              <div className="flex items-center gap-3">
                {/* Hamburger */}
                <div className="relative hidden md:block" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    className={`flex flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/15 transition-colors duration-200 ${menuOpen ? "hamburger-open bg-white/15" : ""}`}
                    style={{ width: 40, height: 40 }}
                  >
                    <span className="hamburger-line line-top" />
                    <span className="hamburger-line line-mid" />
                    <span className="hamburger-line line-bot" />
                  </button>

                  {/* Dropdown panel */}
                  {menuOpen && (
                    <div
                      className="menu-animate absolute left-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      style={{ width: 300, minWidth: 280 }}
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#0B4F5C] to-[#083A44] px-5 py-4">
                        <img src="/swoop-logo.png" alt="Swoop" className="logo-animate h-6 w-auto object-contain" />
                      </div>

                      {/* Quick links */}
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Navigate</p>
                        <div className="grid grid-cols-2 gap-1">
                          {NAV_LINKS.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-teal-50 hover:text-teal-700 ${
                                  pathname === link.href ? "bg-teal-50 text-teal-700" : "text-gray-700"
                                }`}
                              >
                                <div className="relative">
                                  <Icon className="w-4 h-4 text-teal-600" strokeWidth={2} />
                                  {link.href === '/messages' && !isLoadingMessages && messageCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                                      {messageCount > 9 ? '9+' : messageCount}
                                    </span>
                                  )}
                                  {link.href === '/messages' && isLoadingMessages && (
                                    <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-[10px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center animate-pulse">
                                      ...
                                    </span>
                                  )}
                                  {link.href === '/notifications' && notificationCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                                      {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                  )}
                                </div>
                                <span>{link.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mx-4 my-2 border-t border-gray-100" />

                      {/* Categories */}
                      <div className="px-3 pb-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Categories</p>
                        <div className="flex flex-col gap-0.5">
                          {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <Link
                                key={cat.href}
                                href={cat.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-150"
                              >
                                <Icon className="w-4 h-4 text-teal-600" strokeWidth={2} />
                                <span>{cat.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Powered by Swoop</span>
                        <Link href="/seller" onClick={() => setMenuOpen(false)} className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                          Sell with us →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-2">
                  <img src="/swoop-logo.png" alt="Swoop" className="logo-animate h-8 w-auto object-contain" />
                  <span className="logo-subtitle text-white leading-none whitespace-nowrap self-end pb-[3px]">
                    Marketplace
                  </span>
                </Link>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <button
                  onClick={() => {
                    try {
                      sessionStorage.removeItem('unimart:notificationPrompt');
                    } catch (e) {}
                    setShowSignupNotificationPrompt(false);
                    setNotificationCount(0);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('unimart:notificationCount', { detail: { count: 0 } }));
                      window.dispatchEvent(new CustomEvent('unimart:notificationOpened', { detail: { count: 0 } }));
                    }
                    router.push("/notifications");
                  }}
                  className="relative p-2 rounded-full hover:bg-white/10 transition"
                >
                  <Bell className="w-5 h-5 text-white" strokeWidth={2} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ROW 2: Search + Location */}
            <div className="py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(searchQuery.trim());
                }}
                className="flex-1"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onInput={(e) => fetchSuggestions((e.target as HTMLInputElement).value)}
                    onFocus={() => {
                      if (suggestions.length) setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestion((s) => Math.min(s + 1, suggestions.length - 1)); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestion((s) => Math.max(s - 1, 0)); }
                      else if (e.key === "Enter") {
                        if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                          const q = suggestions[activeSuggestion];
                          setSearchQuery(q); setShowSuggestions(false); submitSearch(q); e.preventDefault();
                        }
                      } else if (e.key === "Escape") { setShowSuggestions(false); setActiveSuggestion(-1); }
                    }}
                    className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 placeholder:opacity-100 focus:border-teal-300 focus:ring-1 focus:ring-teal-300 transition"
                    placeholder="Search for products, brands, and more..."
                  />
                </div>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggRef} className="absolute left-0 right-0 mt-1 z-40 max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="menu-animate bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    {suggestions.map((s, idx) => (
                      <button
                        key={s}
                        onClick={() => { setSearchQuery(s); setShowSuggestions(false); submitSearch(s); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${idx === activeSuggestion ? "bg-gray-50" : ""}`}
                      >
                        <Search className="w-4 h-4 text-gray-400" strokeWidth={2} />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Overlay backdrop for desktop menu */}
        {menuOpen && (
          <div
            className="overlay-animate fixed inset-0 z-40 hidden md:block"
            style={{ background: "rgba(0,0,0,0.18)", top: "var(--header-height, 112px)" }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </header>

      {/* ============================= MOBILE BOTTOM TAB BAR ============================= */}
      <nav
        role="navigation"
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] tab-bar-safe"
      >
        <div className="grid grid-cols-5 pt-2">
          {TAB_LINKS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
            const showMsgBadge = tab.href === "/messages" && !isLoadingMessages && messageCount > 0;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center gap-1 pb-1.5"
              >
                <span
                  className={`relative flex items-center justify-center w-10 h-8 rounded-full transition-colors ${
                    active ? "bg-teal-50" : ""
                  }`}
                >
                  <Icon
                    className={active ? "w-[19px] h-[19px] text-[#0B4F5C]" : "w-[19px] h-[19px] text-gray-400"}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  {showMsgBadge && (
                    <span className="badge-pop absolute -top-1 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] leading-none ${active ? "text-[#0B4F5C] font-bold" : "text-gray-400 font-medium"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
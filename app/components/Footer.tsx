"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    key: "home",
    label: "Home",
    href: "/",
    match: (p: string) => p === "/" || p === "/home",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.75L12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"/>
      </svg>
    ),
  },
  {
    key: "cart",
    label: "Cart",
    href: "/cart",
    match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"),
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    key: "categories",
    label: "",
    href: "/explore",
    match: (p: string) => p.startsWith("/explore") || p.startsWith("/category"),
    raised: true,
    // Modern Explore Button Component
    icon: (_active: boolean) => (
      <motion.div 
        whileHover={{ y: -6, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group cursor-pointer"
      >
        {/* Animated Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        
        {/* Main Button Body */}
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#00c99f] via-[#00a884] to-[#008f6e] shadow-[0_8px_20px_-4px_rgba(0,168,132,0.4)] border border-white/20">
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          
          {/* Logo Container */}
          <div className="relative w-8 h-8 drop-shadow-md">
            <Image
              src="/logo.png"
              alt="Koombo"
              fill
              sizes="32px"
              className="object-contain select-none pointer-events-none"
              draggable={false}
              priority
            />
          </div>
        </div>
      </motion.div>
    ),
  },
  {
    key: "search",
    label: "Search",
    href: "/search",
    match: (p: string) => p.startsWith("/search"),
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round">
        <circle cx="11" cy="11" r="6.5"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    key: "profile",
    label: "You",
    href: "/profile",
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/orders") || p.startsWith("/messages"),
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.121 17.804A8.966 8.966 0 0 1 12 15c2.04 0 3.91.63 5.121 1.804"/>
        <circle cx="12" cy="10" r="3.5"/>
      </svg>
    ),
  },
];

const HIDDEN_PREFIXES = ["/auth", "/seller", "/login", "/signup", "/listings/"];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [cartCount, setCartCount] = React.useState(0);
  const navLockRef = React.useRef(false);

  React.useEffect(() => {
    function readCartCount() {
      try {
        const raw = localStorage.getItem("unimart:cart");
        const items = raw ? JSON.parse(raw) : [];
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setCartCount(0);
      }
    }
    readCartCount();
    window.addEventListener("storage", readCartCount);
    window.addEventListener("unimart:cartUpdated", readCartCount);
    return () => {
      window.removeEventListener("storage", readCartCount);
      window.removeEventListener("unimart:cartUpdated", readCartCount);
    };
  }, []);

  const handleNav = React.useCallback(
    (href: string) => {
      if (navLockRef.current) return;
      navLockRef.current = true;
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(8);
        } catch {
          // no-op
        }
      }
      router.push(href);
      window.setTimeout(() => {
        navLockRef.current = false;
      }, 350);
    },
    [router]
  );

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      data-unimart-footer
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-black/[0.04] dark:border-white/[0.05] md:hidden z-50 overscroll-contain"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between h-[72px] relative">
          {tabs.map((t) => {
            const active = t.match(pathname);
            const isMiddle = Boolean(t.raised);
            const showBadge = t.key === "cart" && cartCount > 0;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleNav(t.href)}
                aria-current={active ? "page" : undefined}
                aria-label={t.label || "Explore"}
                className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1 py-2 select-none touch-manipulation transition-all duration-200 ${
                  isMiddle ? "justify-end pb-2" : "active:scale-95"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isMiddle ? (
                  <div className="relative -top-4">{t.icon(active)}</div>
                ) : (
                  <>
                    <div className="relative w-12 h-10 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={active ? "active" : "inactive"}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className={`w-12 h-10 flex items-center justify-center rounded-xl transition-colors duration-300 ${
                            active 
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          }`}
                        >
                          {t.icon(active)}
                        </motion.div>
                      </AnimatePresence>
                      
                      {showBadge && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-2 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm"
                        >
                          {cartCount > 9 ? "9+" : cartCount}
                        </motion.span>
                      )}
                    </div>
                    <span className={`text-[10px] leading-none font-medium tracking-wide transition-colors duration-300 ${
                      active ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {t.key === "profile" && user?.name ? user.name.split(" ")[0] : t.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
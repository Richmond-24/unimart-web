"use client";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "../context/AuthContext";

const tabs = [
  {
    key: "home",
    label: "Home",
    href: "/",
    match: (p: string) => p === "/" || p === "/home",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.75L12 4l9 5.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z"/>
      </svg>
    ),
  },
  {
    key: "categories",
    label: "Shop",
    href: "/explore",
    match: (p: string) => p.startsWith("/explore") || p.startsWith("/category"),
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    key: "cart",
    label: "",
    href: "/cart",
    match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"),
    icon: (_active: boolean) => (
      <div className="relative w-[58px] h-[58px] rounded-[20px] flex items-center justify-center -translate-y-[10px]"
        style={{
          background: "linear-gradient(135deg, #00c99f 0%, #00a884 50%, #008f6e 100%)",
          boxShadow: "0 4px 16px rgba(0,168,132,0.45), 0 0 0 3px rgba(0,168,132,0.15)",
        }}>
        <div className="absolute inset-0 rounded-[20px]" style={{ border: "1.5px solid rgba(255,255,255,0.25)" }} />
        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
    ),
  },
  {
    key: "search",
    label: "Search",
    href: "/search",
    match: (p: string) => p.startsWith("/search"),
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
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
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
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

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <nav
      role="site-footer"
      data-unimart-footer
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/[0.06] md:hidden z-50"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.07)",
        borderRadius: "24px 24px 0 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-end justify-around h-[72px]">
          {tabs.map((t) => {
            const active = t.match(pathname);
            const isMiddle = t.key === "cart";

            return (
              <button
                key={t.key}
                onClick={() => router.push(t.href)}
                aria-current={active ? "page" : undefined}
                aria-label={t.label || "Cart"}
                className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-200 active:scale-95 ${isMiddle ? "justify-end pb-1" : ""}`}
              >
                {isMiddle ? (
                  <div className="relative">
                    {t.icon(active)}
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-[#ff3b30] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white translate-x-1 -translate-y-1">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`w-11 h-10 flex items-center justify-center rounded-[14px] transition-all duration-200 ${active ? "bg-[#00a884]/10 text-[#00a884]" : "text-stone-400 hover:text-stone-600"}`}>
                      {t.icon(active)}
                    </div>
                    <span className={`text-[10px] leading-none font-medium tracking-wide transition-colors ${active ? "text-[#00a884] font-bold" : "text-stone-400"}`}>
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

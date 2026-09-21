"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const TABS = [
  {
    key: "home",
    label: "Home",
    href: "/",
    match: (p: string) => p === "/" || p === "/home",
  },
  {
    key: "explore",
    label: "Explore",
    href: "/explore",
    match: (p: string) => p.startsWith("/explore"),
  },
  {
    key: "cart",
    label: "Cart",
    href: "/cart",
    match: (p: string) => p.startsWith("/cart"),
  },
  {
    key: "messages",
    label: "Messages",
    href: "/messages",
    match: (p: string) => p.startsWith("/messages"),
  },
  {
    key: "profile",
    label: "You",
    href: "/profile",
    match: (p: string) => p.startsWith("/profile"),
  },
];

const HIDDEN_PREFIXES = ["/auth", "/seller", "/login", "/signup"];

function sanitizeName(value?: string | null) {
  if (typeof value !== "string") return null;

  const v = value.trim();

  if (!v) return null;

  const ban = [
    "guest",
    "user",
    "new user",
    "unknown",
    "null",
    "undefined",
  ];

  if (ban.includes(v.toLowerCase())) return null;

  return v;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";

  return "Good night";
}

function extractNameFromUser(user: any) {
  const candidates = [
    user?.firstName,
    user?.displayName,
    user?.name,
    user?.fullName,
    user?.username,
  ];

  for (const c of candidates) {
    const s = sanitizeName(c);

    if (s) {
      return s.split(/\s+/)[0];
    }
  }

  if (typeof user?.email === "string" && user.email.includes("@")) {
    const lp = user.email.split("@")[0];
    const s = sanitizeName(lp);

    if (s) {
      return s.split(/\s+/)[0];
    }
  }

  return null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser } = useAuth();

  const headerRef = useRef<HTMLElement | null>(null);

  const [cartCount, setCartCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting());
  const [greetingName, setGreetingName] = useState<string | null>(null);

  const [searchFocused, setSearchFocused] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // --------------------------------------------------
  // Update greeting every minute
  // --------------------------------------------------

  useEffect(() => {
    const tick = () => {
      setTimeGreeting(getTimeGreeting());
    };

    const id = window.setInterval(tick, 60_000);

    tick();

    return () => window.clearInterval(id);
  }, []);

  // --------------------------------------------------
  // Resolve user name
  // --------------------------------------------------

  useEffect(() => {
    function resolve() {
      try {
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem("unimart:user")
            : null;

        const stored = raw ? JSON.parse(raw) : null;

        const user = authUser || stored;

        const name = extractNameFromUser(user);

        setGreetingName(name);
      } catch {
        setGreetingName(extractNameFromUser(authUser));
      }
    }

    resolve();

    const onAuth = () => resolve();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "unimart:user" ||
        e.key === "unimart:token"
      ) {
        resolve();
      }
    };

    window.addEventListener(
      "unimart:authChanged",
      onAuth
    );

    window.addEventListener(
      "storage",
      onStorage
    );

    return () => {
      window.removeEventListener(
        "unimart:authChanged",
        onAuth
      );

      window.removeEventListener(
        "storage",
        onStorage
      );
    };
  }, [authUser]);

  // --------------------------------------------------
  // Cart count
  // --------------------------------------------------

  useEffect(() => {
    function readCart() {
      try {
        const raw = localStorage.getItem("unimart:cart");
        const arr = raw ? JSON.parse(raw) : [];

        setCartCount(
          Array.isArray(arr) ? arr.length : 0
        );
      } catch {
        setCartCount(0);
      }
    }

    readCart();

    window.addEventListener(
      "storage",
      readCart
    );

    window.addEventListener(
      "unimart:cartUpdated",
      readCart as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        readCart
      );

      window.removeEventListener(
        "unimart:cartUpdated",
        readCart as EventListener
      );
    };
  }, []);

  // --------------------------------------------------
  // Scroll animation
  // --------------------------------------------------

  useEffect(() => {
    const COLLAPSE_DISTANCE = 80;

    function onScroll() {
      const y = window.scrollY || 0;

      const progress = Math.min(
        1,
        y / COLLAPSE_DISTANCE
      );

      setScrollProgress(progress);
      setScrolled(y > 4);
    }

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    const setHeaderHeight = () => {
      try {
        const el = headerRef.current;

        if (!el) return;

        document.documentElement.style.setProperty(
          "--header-height",
          `${Math.round(el.offsetHeight)}px`
        );
      } catch {
        // Ignore
      }
    };

    setHeaderHeight();

    const ro = new ResizeObserver(() => {
      setHeaderHeight();
    });

    if (headerRef.current) {
      ro.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );

      try {
        ro.disconnect();
      } catch {
        // Ignore
      }
    };
  }, []);

  // --------------------------------------------------
  // Hide header on auth/seller pages
  // --------------------------------------------------

  if (
    HIDDEN_PREFIXES.some((p) =>
      pathname?.startsWith(p)
    )
  ) {
    return null;
  }

  const greeting = greetingName
    ? `${timeGreeting}, ${greetingName}`
    : timeGreeting;

  return (
    <>
      {/* ==================================================
          MAIN HEADER
          ================================================== */}

      <header
        role="banner"
        ref={headerRef}
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-shadow duration-300 ${
          scrolled
            ? "shadow-xl"
            : "shadow-sm"
        }`}
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
          background:
            "var(--header-bg)",
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">

          {/* ==================================================
              TOP ROW
              ================================================== */}

          <div
            className="flex items-center gap-3 transition-all duration-300 ease-out"
            style={{
              paddingTop: `${16 - scrollProgress * 6}px`,
              paddingBottom: `${16 - scrollProgress * 6}px`,
            }}
          >

            {/* ==================================================
                LARGER LOGO
                ================================================== */}

            <LinkLogo
              scrollProgress={scrollProgress}
            />

            {/* ==================================================
                DESKTOP SEARCH
                ================================================== */}

            <div className="hidden md:flex flex-1 items-center justify-center">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push("/search");
                }}
                className="w-full max-w-2xl"
              >

                <div
                  className={`relative flex items-center bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 transition-shadow duration-200 ${
                    searchFocused
                      ? "shadow-lg ring-2 ring-teal-500/40"
                      : ""
                  }`}
                >

                  {/* Search icon */}
                  <svg
                    className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    placeholder="Where are you headed? Search Koombo"
                    onFocus={() =>
                      setSearchFocused(true)
                    }
                    onBlur={() =>
                      setSearchFocused(false)
                    }
                    className="w-full bg-transparent text-base text-gray-800 dark:text-gray-100 placeholder-teal-600 dark:placeholder-teal-400 font-medium focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="ml-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-full hidden sm:inline-flex transition-colors"
                  >
                    Search
                  </button>

                </div>

              </form>

            </div>

            {/* ==================================================
                MOBILE SEARCH
                ================================================== */}

            <div className="md:hidden flex-1 min-w-0">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  router.push("/search");
                }}
              >

                <div
                  className={`relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full transition-all duration-200 ${
                    searchFocused
                      ? "ring-2 ring-teal-500/50 shadow-lg"
                      : ""
                  }`}
                >

                  <svg
                    className="absolute left-4 w-5 h-5 text-teal-500 dark:text-teal-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    placeholder="Search on Koombo"
                    onFocus={() =>
                      setSearchFocused(true)
                    }
                    onBlur={() =>
                      setSearchFocused(false)
                    }
                    className="w-full bg-transparent py-3 pl-11 pr-4 text-base text-gray-800 dark:text-gray-100 placeholder-teal-500 dark:placeholder-teal-400 font-medium focus:outline-none"
                    aria-label="Search"
                  />

                </div>

              </form>

            </div>

            {/* ==================================================
                ACTION ICONS
                ================================================== */}

            <div className="flex items-center gap-1 flex-shrink-0">

              {/* ==================================================
                  MESSAGES
                  Mobile + Desktop
                  ================================================== */}

              <button
                onClick={() =>
                  router.push("/messages")
                }
                aria-label="Messages"
                className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150"
              >

                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-gray-700 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>

                {messageCount > 0 && (
                  <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {messageCount > 9
                      ? "9+"
                      : messageCount}
                  </span>
                )}

              </button>

              {/* ==================================================
                  CART
                  Mobile + Desktop
                  ================================================== */}

              <button
                onClick={() =>
                  router.push("/cart")
                }
                aria-label="Cart"
                className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all duration-150"
              >

                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-gray-700 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />

                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-teal-600 text-white text-[11px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
                    {cartCount > 9
                      ? "9+"
                      : cartCount}
                  </span>
                )}

              </button>

              {/* ==================================================
                  DESKTOP ONLY:
                  HOME + PROFILE
                  
                  hidden md:flex means these NEVER appear
                  inside the mobile header.
                  ================================================== */}

              <div className="hidden md:flex items-center gap-2 ml-2">

                {/* Desktop Home */}
                <button
                  onClick={() =>
                    router.push("/")
                  }
                  aria-label="Home"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >

                  <svg
                    className="w-6 h-6 text-teal-600 dark:text-teal-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>

                </button>

                {/* Desktop Profile */}
                <button
                  onClick={() =>
                    router.push("/profile")
                  }
                  aria-label="Profile"
                  className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent transition-colors"
                >

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm overflow-hidden border border-teal-100">

                    {authUser?.avatar ? (
                      <Image
                        src={authUser.avatar}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-teal-700 bg-teal-50">
                        {greetingName
                          ? greetingName
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </div>
                    )}

                  </div>

                  {/* User Name */}
                  <span className="hidden lg:inline text-sm font-semibold text-teal-600 dark:text-teal-400">
                    {greetingName || "You"}
                  </span>

                </button>

              </div>

            </div>

          </div>

          {/* ==================================================
              PERSONALIZED GREETING
              ================================================== */}

          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: `${(1 - scrollProgress) * 76}px`,
              opacity: 1 - scrollProgress,
              transform: `translateY(${
                -scrollProgress * 8
              }px)`,
            }}
          >

            <div className="pb-3 pt-1">

              <div className="flex items-center justify-between">

                {/* User greeting */}
                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  <button
                    onClick={() =>
                      router.push("/profile")
                    }
                    className="flex-shrink-0"
                  >

                    <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-gray-800 flex items-center justify-center shadow-sm border-2 border-teal-100 dark:border-gray-700">

                      <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">
                        {greetingName
                          ? greetingName
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </span>

                    </div>

                  </button>

                  {/* Greeting */}
                  <div className="flex flex-col">

                    <h2 className="text-gray-900 dark:text-white font-semibold text-base leading-tight">
                      {greeting} 👋
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                      Ready to shop amazing deals?
                    </p>

                  </div>

                </div>

                {/* Notifications */}
                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      router.push(
                        "/notifications"
                      )
                    }
                    aria-label="Notifications"
                    className="relative p-2.5 rounded-full bg-teal-50 dark:bg-gray-800 hover:bg-teal-100 dark:hover:bg-gray-700 active:scale-90 transition-all duration-150"
                  >

                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 text-teal-600 dark:text-teal-400"
                      fill="currentColor"
                      strokeWidth={0}
                    >
                      <path d="M12 2a6 6 0 0 0-6 6v2.586c0 .464-.184.909-.513 1.237L4.05 13.26A1 1 0 0 0 4.757 15H19.24a1 1 0 0 0 .707-1.707l-1.437-1.436A1.75 1.75 0 0 1 18 10.586V8a6 6 0 0 0-6-6z" />

                      <path d="M9.5 17a2.5 2.5 0 0 0 5 0h-5z" />
                    </svg>

                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {notificationCount > 9
                          ? "9+"
                          : notificationCount}
                      </span>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      </header>

      {/* ==================================================
          MOBILE BOTTOM TAB BAR
          ================================================== */}

      <nav
        role="navigation"
        aria-label="Primary"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 dark:border-gray-800 shadow-xl"
        style={{
          paddingBottom:
            "env(safe-area-inset-bottom)",
          background:
            "var(--header-bg)",
        }}
      >

        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-around h-[64px] px-1">

            {TABS.map((t) => {

              const active = t.match(
                pathname || ""
              );

              const IconComponent =
                getTabIcon(t.key);

              return (
                <button
                  key={t.key}
                  onClick={() =>
                    router.push(t.href)
                  }
                  className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 transition-all duration-200 relative ${
                    active
                      ? "text-teal-600"
                      : "text-gray-400"
                  }`}
                >

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-600 rounded-full" />
                  )}

                  {/* Icon */}
                  <div className="relative mb-0.5">

                    <IconComponent
                      className={`w-6 h-6 ${
                        active
                          ? "scale-110"
                          : ""
                      } transition-transform duration-200`}
                    />

                    {/* Cart badge */}
                    {t.key === "cart" &&
                      cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-md border-2 border-white">
                          {cartCount > 9
                            ? "9+"
                            : cartCount}
                        </span>
                      )}

                    {/* Messages badge */}
                    {t.key === "messages" &&
                      messageCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-md border-2 border-white">
                          {messageCount > 9
                            ? "9+"
                            : messageCount}
                        </span>
                      )}

                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-medium ${
                      active
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {t.label}
                  </span>

                </button>
              );
            })}

          </div>
        </div>
      </nav>
    </>
  );
}

// ==================================================
// TAB ICONS
// ==================================================

function getTabIcon(key: string) {
  const icons: Record<
    string,
    React.FC<{ className?: string }>
  > = {

    home: ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),

    explore: ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),

    cart: ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),

    messages: ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),

    profile: ({ className }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };

  return icons[key] || icons.home;
}

// ==================================================
// LARGER LOGO
// ==================================================

function LinkLogo({
  scrollProgress,
}: {
  scrollProgress: number;
}) {
  /*
   * Increased from 64x64 to approximately 78x78.
   *
   * The logo gently reduces as the user scrolls so the
   * header still collapses smoothly.
   */

  const logoSize =
    78 - scrollProgress * 10;

  return (
    <a
      href="/"
      className="flex-shrink-0 flex items-center justify-center"
      aria-label="Koombo home"
      style={{
        width: `${logoSize}px`,
        height: `${logoSize}px`,
        minWidth: `${logoSize}px`,
        transition:
          "width 300ms ease-out, height 300ms ease-out, min-width 300ms ease-out",
      }}
    >
      <Image
        src="/swoop-logo.png"
        alt="Koombo"
        width={78}
        height={78}
        className="w-full h-full object-contain"
        priority
      />
    </a>
  );
}


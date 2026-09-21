"use client";

import { useEffect, useState, useRef } from "react";

type BotpressApi = {
  init: (config: {
    botId: string;
    clientId: string;
    configuration?: {
      composerPlaceholder?: string;
      botName?: string;
      botDescription?: string;
      color?: string;
      variant?: string;
      themeMode?: string;
      fontFamily?: string;
    };
  }) => void;
  open?: () => void;
  close?: () => void;
  on?: (event: string, cb: (evt?: unknown) => void) => void;
  sendEvent?: (evt: { type?: string; payload?: unknown }) => void;
  toggle?: () => void;
};

declare global {
  interface Window {
    botpress?: BotpressApi;
    botpressWebChat?: BotpressApi;
    UNIMART_API_URL?: string;
  }
}

const getBotpressApi = (): BotpressApi | undefined => {
  if (typeof window === "undefined") return undefined;
  const api = window.botpressWebChat ?? window.botpress;
  if (api && !window.botpress) {
    // normalise global for older codepaths
    window.botpress = api;
  }
  return api;
};

const openBotpressChat = (): boolean => {
  const botpress = getBotpressApi();
  if (!botpress) return false;
  if (typeof botpress.open === "function") {
    botpress.open();
    return true;
  }
  if (typeof botpress.sendEvent === "function") {
    botpress.sendEvent({ type: "show" });
    return true;
  }
  if (typeof botpress.toggle === "function") {
    botpress.toggle();
    return true;
  }
  return false;
};

const closeBotpressChat = (): boolean => {
  const botpress = getBotpressApi();
  if (!botpress) return false;
  if (typeof botpress.close === "function") {
    botpress.close();
    return true;
  }
  if (typeof botpress.sendEvent === "function") {
    botpress.sendEvent({ type: "hide" });
    return true;
  }
  if (typeof botpress.toggle === "function") {
    botpress.toggle();
    return true;
  }
  return false;
};

// Fallback to the production Botpress ID if env var is missing in deployment
const DEFAULT_BOTPRESS_CLIENT_ID = "907b0daa-a442-49ca-a209-bb3f4ada8047";

/*
|--------------------------------------------------------------------------
| Botpress positioning & responsive styles
|--------------------------------------------------------------------------
*/

function injectBotpressStyles() {
  if (typeof document === "undefined") return;

  const STYLE_ID = "koombo-botpress-positioning";
  const existing = document.getElementById(STYLE_ID);

  if (existing) {
    existing.remove();
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /*
    ================================================================
    HIDE BOTPRESS DEFAULT FAB (Use custom UniMart launcher)
    ================================================================
    */
    .bpFab,
    .bpFabContainer,
    .bpFabWrapper,
    [class*="bpFab"],
    .bpCustomToggleWebchat {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /*
    ================================================================
    PRESERVE CLOSED STATE (Ensure no click interception when closed)
    ================================================================
    */
    .bpWebchat.bpClose,
    .bpWebchat[class*="bpClose"] {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(80px) !important;
    }

    /*
    ================================================================
    MOBILE CHAT WINDOW (Open State)
    ================================================================
    */
    @media (max-width: 640px) {
      .bpWebchat:not(.bpClose) {
        position: fixed !important;
        top: auto !important;
        left: auto !important;
        right: 10px !important;
        bottom: calc(85px + env(safe-area-inset-bottom, 0px)) !important;
        width: calc(100vw - 20px) !important;
        max-width: 380px !important;
        height: min(64vh, 520px) !important;
        max-height: 520px !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        z-index: 9998 !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
      }

      .bpWebchat iframe {
        max-width: 100% !important;
        max-height: 100% !important;
      }
    }

    /*
    ================================================================
    SMALL PHONES
    ================================================================
    */
    @media (max-width: 380px) {
      .bpWebchat:not(.bpClose) {
        right: 8px !important;
        width: calc(100vw - 16px) !important;
        bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
        height: 60vh !important;
        max-height: 470px !important;
      }
    }

    /*
    ================================================================
    DESKTOP CHAT WINDOW (Open State)
    ================================================================
    */
    @media (min-width: 641px) {
      .bpWebchat:not(.bpClose) {
        position: fixed !important;
        right: 24px !important;
        bottom: 96px !important;
        max-width: 420px !important;
        max-height: 680px !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        z-index: 9998 !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
      }
    }
  `;

  document.head.appendChild(style);
}

/*
|--------------------------------------------------------------------------
| Swoop / UniMart AI Chatbot Component
|--------------------------------------------------------------------------
*/

export default function SwoopChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pendingOpenRef = useRef(false);

  useEffect(() => {
    // Only initialize Botpress on allowed routes (home, listing details, profile)
    if (typeof window === 'undefined') return;
    // Do not initialize while app is in non-ready stage (splash/onboard/auth)
    const appStage = document.documentElement.getAttribute('data-app-stage');
    if (appStage && appStage !== 'ready') return;

    const pathname = window.location.pathname || '/';
    const allowed = (
      pathname === '/' ||
      pathname === '/profile' ||
      pathname.startsWith('/listings') ||
      pathname.startsWith('/listings/')
    );
    if (!allowed) return; // do not load botpress on disallowed pages

    const clientId =
      process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID || DEFAULT_BOTPRESS_CLIENT_ID;

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://unimart-backend-6pld.onrender.com";

    try {
      window.UNIMART_API_URL = API_URL;
    } catch {
      // Ignore
    }

    injectBotpressStyles();

    const configureBotpress = () => {
      const botpress = getBotpressApi();
      if (!botpress) return;

      try {
        botpress.init({
          botId: clientId,
          clientId: clientId,
          configuration: {
            composerPlaceholder: "What are you looking for?",
            botName: "RIRI.ai",
            botDescription: "Your AI shopping assistant",
            color: "#0d9488",
            variant: "solid",
            themeMode: "light",
            fontFamily: "Inter",
          },
        });

        injectBotpressStyles();

        if (botpress.on) {
          botpress.on("webchat:opened", () => {
            setIsOpen(true);
            injectBotpressStyles();
          });

          botpress.on("webchat:closed", () => {
            setIsOpen(false);
          });
        }

        setReady(true);
        setIsLoading(false);

        if (pendingOpenRef.current) {
          pendingOpenRef.current = false;
          openBotpressChat();
          setIsOpen(true);
        }
      } catch (err) {
        console.warn("Botpress initialization error", err);
        setReady(true);
        setIsLoading(false);
      }
    };

    // If Botpress global is already present
    if (getBotpressApi()) {
      configureBotpress();
      return;
    }

    // Check if script element already exists in DOM
    const existingScript = document.getElementById("botpress-webchat-script") as HTMLScriptElement | null;
    if (existingScript) {
      if (window.botpress) {
        configureBotpress();
      } else {
        existingScript.addEventListener("load", configureBotpress);
      }
      return;
    }

    // Create and append the Botpress script
    const script = document.createElement("script");
    script.id = "botpress-webchat-script";
    script.src = "https://cdn.botpress.cloud/webchat/v3.3/inject.js";
    script.async = true;

    script.onload = () => {
      configureBotpress();
    };

    script.onerror = () => {
      console.warn("Unable to load Botpress Webchat script.");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Retain script in DOM across fast re-renders to prevent re-fetch
    };
  }, []);

  const toggleChat = () => {
    const botpress = getBotpressApi();

    if (!botpress || !ready) {
      pendingOpenRef.current = true;
      setIsLoading(true);
      injectBotpressStyles();
      return;
    }

    if (isOpen) {
      try {
        closeBotpressChat();
      } catch {
        // Ignore
      }
      setIsOpen(false);
    } else {
      try {
        openBotpressChat();
      } catch {
        // Ignore
      }
      setIsOpen(true);
      injectBotpressStyles();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="
          group
          fixed
            z-9999
          flex
          items-center
          justify-center
          rounded-full
          text-white
          shadow-lg
          transition-all
          duration-300
          ease-out
          hover:scale-105
          hover:shadow-xl
          hover:bg-teal-500
          active:scale-95
        "
        style={{
          width: "56px",
          height: "56px",
          background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
          bottom: "90px",
          right: "16px",
        }}
      >
        {/* PULSE ANIMATION (Active when closed) */}
        {!isOpen && !isLoading && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "#0d9488",
              animation: "koomboBotPulse 2.4s ease-out infinite",
            }}
          />
        )}

        {/* LOADING SPINNER IF PENDING OPEN */}
        {isLoading && (
          <span
            className="absolute inset-0 rounded-full border-2 border-white/40 border-t-white animate-spin pointer-events-none"
          />
        )}

        {/* ICONS */}
        <span className="relative flex h-6 w-6 items-center justify-center">
          {/* MODERN AI BOT ICON */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute h-6 w-6 transition-all duration-200"
            style={{
              opacity: isOpen ? 0 : 1,
              transform: isOpen ? "rotate(-45deg) scale(0.6)" : "rotate(0deg) scale(1)",
            }}
          >
            {/* Antenna */}
            <path d="M12 2v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="2" r="1" fill="white" />
            
            {/* Head */}
            <rect x="5" y="6" width="14" height="12" rx="4" stroke="white" strokeWidth="2" />
            
            {/* Eyes */}
            <circle cx="9.5" cy="12" r="1.5" fill="white" />
            <circle cx="14.5" cy="12" r="1.5" fill="white" />
            
            {/* Mouth/Chin detail */}
            <path d="M9 15h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* CLOSE ICON */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute h-6 w-6 transition-all duration-200"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "rotate(0deg) scale(1)" : "rotate(45deg) scale(0.6)",
            }}
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* RESPONSIVE LAUNCHER POSITION & ANIMATIONS */}
      <style jsx global>{`
        @keyframes koomboBotPulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        /* DESKTOP - Larger size */
        @media (min-width: 641px) {
          button[aria-label="Open chat"],
          button[aria-label="Close chat"] {
            bottom: 24px !important;
            right: 24px !important;
            width: 64px !important;
            height: 64px !important;
          }
          
          button[aria-label="Open chat"] span,
          button[aria-label="Close chat"] span {
            width: 28px !important;
            height: 28px !important;
          }
        }

        /* MOBILE - Sits directly above bottom navigation bar */
        @media (max-width: 640px) {
          button[aria-label="Open chat"],
          button[aria-label="Close chat"] {
            bottom: calc(90px + env(safe-area-inset-bottom, 0px)) !important;
            right: 16px !important;
            width: 56px !important;
            height: 56px !important;
          }
          
          button[aria-label="Open chat"] span,
          button[aria-label="Close chat"] span {
            width: 24px !important;
            height: 24px !important;
          }
        }

        /* SMALL PHONES */
        @media (max-width: 380px) {
          button[aria-label="Open chat"],
          button[aria-label="Close chat"] {
            bottom: calc(85px + env(safe-area-inset-bottom, 0px)) !important;
            right: 12px !important;
            width: 52px !important;
            height: 52px !important;
          }
          
          button[aria-label="Open chat"] span,
          button[aria-label="Close chat"] span {
            width: 22px !important;
            height: 22px !important;
          }
        }
      `}</style>
    </>
  );
}
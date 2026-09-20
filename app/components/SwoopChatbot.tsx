"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    botpress?: {
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
      on?: (
        event: string,
        callback: (evt?: unknown) => void
      ) => void;
    };

    UNIMART_API_URL?: string;
  }
}

/*
|--------------------------------------------------------------------------
| Botpress positioning
|--------------------------------------------------------------------------
*/

function injectBotpressStyles() {
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
    HIDE BOTPRESS DEFAULT FAB
    ================================================================
    */

    .bpFab {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }


    /*
    ================================================================
    MOBILE
    ================================================================
    */

    @media (max-width: 640px) {

      /*
      --------------------------------------------------------------
      BOTPRESS CHAT WINDOW
      --------------------------------------------------------------
      Adjusted bottom offset to accommodate new larger launcher position
      */

      .bpWebchat {
        position: fixed !important;

        top: auto !important;
        left: auto !important;

        right: 10px !important;

        bottom: 145px !important;

        width: calc(100vw - 20px) !important;
        max-width: 380px !important;

        height: min(64vh, 520px) !important;
        max-height: 520px !important;

        border-radius: 20px !important;

        overflow: hidden !important;

        z-index: 9998 !important;

        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.25) !important;
      }


      /*
      --------------------------------------------------------------
      BOTPRESS INTERNAL CONTAINERS
      --------------------------------------------------------------
      */

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

      .bpWebchat {
        right: 8px !important;

        width: calc(100vw - 16px) !important;

        bottom: 140px !important;

        height: 60vh !important;

        max-height: 470px !important;
      }
    }


    /*
    ================================================================
    VERY SHORT MOBILE SCREENS
    ================================================================
    */

    @media (max-width: 640px) and (max-height: 650px) {

      .bpWebchat {
        bottom: 130px !important;

        height: 56vh !important;

        max-height: 400px !important;
      }
    }


    /*
    ================================================================
    DESKTOP
    ================================================================
    */

    @media (min-width: 641px) {

      .bpWebchat {
        position: fixed !important;

        right: 24px !important;

        bottom: 96px !important;

        max-width: 420px !important;

        max-height: 680px !important;

        border-radius: 20px !important;

        overflow: hidden !important;

        z-index: 9998 !important;

        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.25) !important;
      }
    }
  `;

  document.head.appendChild(style);
}


/*
|--------------------------------------------------------------------------
| Koombo Chatbot
|--------------------------------------------------------------------------
*/

export default function KoomboChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /*
    ------------------------------------------------------------------
    ENVIRONMENT VARIABLES
    ------------------------------------------------------------------
    */

    const clientId =
      process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID;

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://unimart-backend-f4ss.onrender.com";


    /*
    ------------------------------------------------------------------
    MAKE BACKEND URL AVAILABLE TO THE APP
    ------------------------------------------------------------------
    */

    try {
      window.UNIMART_API_URL = API_URL;
    } catch {
      // Ignore.
    }


    /*
    ------------------------------------------------------------------
    BOT ID CHECK
    ------------------------------------------------------------------
    */

    if (!clientId) {
      console.warn(
        "NEXT_PUBLIC_BOTPRESS_CLIENT_ID is not configured."
      );

      return;
    }


    /*
    ------------------------------------------------------------------
    APPLY POSITIONING IMMEDIATELY
    ------------------------------------------------------------------
    */

    injectBotpressStyles();


    /*
    ------------------------------------------------------------------
    PREVENT DUPLICATE BOTpress SCRIPT
    ------------------------------------------------------------------
    */

    const existingScript =
      document.getElementById(
        "botpress-webchat-script"
      );

    if (existingScript) {
      injectBotpressStyles();
      setReady(true);
      return;
    }


    /*
    ------------------------------------------------------------------
    LOAD BOTPRESS
    ------------------------------------------------------------------
    */

    const script =
      document.createElement("script");

    script.id =
      "botpress-webchat-script";

    script.src =
      "https://cdn.botpress.cloud/webchat/v3.3/inject.js";

    script.async = true;


    /*
    ------------------------------------------------------------------
    SCRIPT LOADED
    ------------------------------------------------------------------
    */

    script.onload = () => {
      if (!window.botpress) {
        console.error(
          "Botpress Webchat failed to initialize."
        );

        return;
      }


      /*
      --------------------------------------------------------------
      INITIALIZE BOTPRESS
      --------------------------------------------------------------
      */

      window.botpress.init({
        botId: clientId,

        clientId: clientId,

        configuration: {
          composerPlaceholder:
            "What are you looking for?",

          botName:
            "RIRI.ai",

          botDescription:
            "Your AI shopping assistant",

          color:
            "#0d9488",

          variant:
            "solid",

          themeMode:
            "light",

          fontFamily:
            "Inter",
        },
      });


      /*
      --------------------------------------------------------------
      APPLY POSITIONING AGAIN
      --------------------------------------------------------------
      */

      injectBotpressStyles();


      /*
      --------------------------------------------------------------
      BOTPRESS EVENTS
      --------------------------------------------------------------
      */

      try {
        if (window.botpress?.on) {

          window.botpress.on(
            "message:sent",
            (evt: unknown) => {
              console.debug(
                "botpress message:sent",
                evt
              );
            }
          );

          window.botpress.on(
            "webchat:opened",
            () => {
              setIsOpen(true);
              injectBotpressStyles();
            }
          );

          window.botpress.on(
            "webchat:closed",
            () => {
              setIsOpen(false);
            }
          );
        }
      } catch {
        // Ignore event listener errors.
      }

      setReady(true);
    };


    /*
    ------------------------------------------------------------------
    SCRIPT ERROR
    ------------------------------------------------------------------
    */

    script.onerror = () => {
      console.error(
        "Unable to load Botpress Webchat."
      );
    };


    /*
    ------------------------------------------------------------------
    ADD SCRIPT
    ------------------------------------------------------------------
    */

    document.body.appendChild(script);

    return () => {};
  }, []);


  /*
  |--------------------------------------------------------------------------
  | OPEN / CLOSE CHAT
  |--------------------------------------------------------------------------
  */

  const toggleChat = () => {
    if (!window.botpress) return;

    if (isOpen) {
      window.botpress.close?.();
      setIsOpen(false);
    } else {
      window.botpress.open?.();
      setIsOpen(true);
      injectBotpressStyles();
    }
  };


  /*
  |--------------------------------------------------------------------------
  | DON'T RENDER LAUNCHER UNTIL BOTPRESS IS READY
  |--------------------------------------------------------------------------
  */

  if (!ready) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | CUSTOM KOOMBO LAUNCHER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label={
          isOpen
            ? "Close chat"
            : "Open chat"
        }

        className="
          group
          fixed
          z-[9999]

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

        {/* PULSE ANIMATION */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "#0d9488",
              animation: "koomboBotPulse 2.4s ease-out infinite",
            }}
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

        /* MOBILE - Increased size but kept low */
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
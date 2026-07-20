"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShoppingBag, Sparkles, X, Gift } from "lucide-react";

// Only shown once, right after the first successful login / signup
const SHOWN_KEY = "unimart:earlyBirdShown";

function isEarlyBird(createdAt?: string | null): boolean {
  if (!createdAt) return true; // assume early-bird when no date available
  try {
    return new Date(createdAt) < new Date("2026-07-01");
  } catch {
    return false;
  }
}

export default function WelcomeBadgeModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function tryOpen() {
      // Only show if not already shown and we're in the "ready" stage
      if (localStorage.getItem(SHOWN_KEY)) return;

      const stage = document.documentElement.getAttribute("data-app-stage");
      if (stage !== "ready") return;

      const token = localStorage.getItem("unimart:token");
      if (!token) return; // guests don't get the early-bird popup

      // Check if this is the very first login (flag set by AuthFlow on success)
      const justLoggedIn = sessionStorage.getItem("unimart:justLoggedIn");
      if (!justLoggedIn) return;

      // Read user info
      let createdAt: string | null = null;
      let name: string | null = null;
      try {
        const raw = localStorage.getItem("unimart:user");
        if (raw) {
          const u = JSON.parse(raw);
          name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
          createdAt = u?.createdAt ?? null;
        }
      } catch {
        /* ignore */
      }

      if (!isEarlyBird(createdAt)) return;

      if (name) setFirstName(name);
      // Mark as shown so it never re-appears
      localStorage.setItem(SHOWN_KEY, "1");
      sessionStorage.removeItem("unimart:justLoggedIn");
      setOpen(true);
    }

    // Try immediately and also after AuthFlow fires the authChanged event
    const timer = setTimeout(tryOpen, 600);

    const onAuth = () => setTimeout(tryOpen, 700);
    window.addEventListener("unimart:authChanged", onAuth);

    // Also observe data-app-stage attribute changes
    const observer = new MutationObserver(() => setTimeout(tryOpen, 500));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-app-stage"],
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("unimart:authChanged", onAuth);
      observer.disconnect();
    };
  }, []);

  function dismiss() {
    setOpen(false);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="early-bird-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {/* Teal gradient header */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#134e4a]" />

            {/* Floating sparkle dots */}
            <div className="absolute inset-x-0 top-0 h-36 overflow-hidden pointer-events-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
                  style={{ left: `${6 + i * 7}%`, top: `${10 + (i % 4) * 16}%` }}
                  animate={{ y: [0, -10, 0], opacity: [0.2, 0.7, 0.2] }}
                  transition={{ duration: 2.2 + i * 0.15, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 px-6 pt-8 pb-2 text-center">
              {/* Badge icon */}
              <motion.div
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.18, stiffness: 280 }}
                className="mx-auto mb-4 w-24 h-24 rounded-[22px] bg-white shadow-xl flex items-center justify-center border-4 border-teal-200"
              >
                <span className="text-5xl" role="img" aria-label="Early Bird">🌅</span>
              </motion.div>

              {/* Teal pill badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-3 border border-teal-200">
                <Award size={13} />
                Early Bird Badge Unlocked
              </div>

              <h2 id="early-bird-title" className="text-2xl font-black text-slate-900 tracking-tight">
                Thank you for signing up{firstName ? `, ${firstName}` : ""}! 🎉
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Welcome to Uni-Mart! You&apos;re one of our first campus shoppers — your&nbsp;
                <span className="text-teal-700 font-semibold">Early Bird</span> badge
                is now on your profile.
              </p>

              {/* Perk list */}
              <div className="mt-5 grid grid-cols-1 gap-2 text-left">
                {[
                  { icon: Gift, text: "Exclusive first-month perks on campus deals" },
                  { icon: ShoppingBag, text: "Priority access to flash sales & trending items" },
                  { icon: Sparkles, text: "Badge visible on your Uni-Mart profile forever" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl bg-teal-50 border border-teal-100 px-3 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={dismiss}
                  className="order-2 sm:order-1 flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Maybe later
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="order-1 sm:order-2 flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d9488] to-[#0f766e] text-white font-bold text-sm shadow-lg shadow-teal-600/25 hover:brightness-105 active:scale-[0.98] transition"
                >
                  Start exploring 🚀
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShoppingBag, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

const SHOWN_KEY = "unimart:verifiedWelcomeShown";

export default function WelcomeBadgeModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function tryOpen() {
      if (localStorage.getItem(SHOWN_KEY)) return;
      const stage = document.documentElement.getAttribute("data-app-stage");
      if (stage !== "ready") return;

      const token = localStorage.getItem("unimart:token");
      if (!token) return;

      const justLoggedIn = sessionStorage.getItem("unimart:justLoggedIn");
      if (!justLoggedIn) return;

      try {
        const raw = localStorage.getItem("unimart:user");
        if (!raw) return;
        const u = JSON.parse(raw);
        const name = u?.firstName || (u?.name ? String(u.name).split(" ")[0] : null);
        setFirstName(name || null);
        setIsVerified(Boolean(u?.isVerified ?? true));
      } catch {
        setFirstName(null);
        setIsVerified(true);
      }

      localStorage.setItem(SHOWN_KEY, "1");
      sessionStorage.removeItem("unimart:justLoggedIn");
      setOpen(true);
    }

    const timer = window.setTimeout(tryOpen, 600);
    const onAuth = () => window.setTimeout(tryOpen, 700);
    window.addEventListener("unimart:authChanged", onAuth);

    const observer = new MutationObserver(() => window.setTimeout(tryOpen, 500));
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

  const dismiss = () => setOpen(false);
  const goToProfile = () => {
    setOpen(false);
    router.push("/profile");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="verified-welcome-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />

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

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 px-6 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0.6, rotate: -18 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.16, stiffness: 260 }}
                className="mx-auto mb-4 w-24 h-24 rounded-[22px] bg-white shadow-xl flex items-center justify-center border-4 border-orange-200"
              >
                <span className="text-5xl">✅</span>
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold mb-3 border border-orange-100">
                <Award size={13} /> Verified account unlocked
              </div>

              <h2 id="verified-welcome-title" className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome to Uni-Mart{firstName ? `, ${firstName}` : ""}!
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Your account is now {isVerified ? "verified" : "ready"}. Visit your profile to claim your badges and gifts.
              </p>

              <div className="mt-5 grid gap-3 text-left">
                {[
                  { icon: ShoppingBag, text: "Exclusive verified shopper perks" },
                  { icon: Sparkles, text: "Badges appear on your Profile page" },
                  { icon: Award, text: "Claim rewards and gifts from Uni-Mart" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-100 px-3 py-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <span className="text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={dismiss}
                  className="order-2 sm:order-1 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Maybe later
                </button>
                <button
                  type="button"
                  onClick={goToProfile}
                  className="order-1 sm:order-2 flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:brightness-105 transition"
                >
                  Open profile
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

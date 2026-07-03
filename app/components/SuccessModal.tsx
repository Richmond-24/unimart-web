"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Zap } from "lucide-react";

type SuccessModalProps = {
  userName: string;
  message: string;
  type: "signup" | "login";
  isOpen: boolean;
  onClose?: () => void;
};

export default function SuccessModal({
  userName,
  message,
  type,
  isOpen,
  onClose,
}: SuccessModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Generate confetti particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.2,
    }));
    setConfetti(particles);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Confetti particles */}
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="success-confetti absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: ["#0D9488", "#059669", "#00A3FF", "#FFD700"][Math.floor(Math.random() * 4)],
              animation: `confetti-fall 2.5s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {/* Modal Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          {/* Gradient header background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-500 to-teal-400 opacity-10" />

          {/* Content */}
          <div className="relative px-6 py-12 sm:px-8 sm:py-16 text-center">
            {/* Success icon with animation */}
            <div className="flex justify-center mb-6">
              <div className="success-badge relative w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
                <div className="success-pulse absolute inset-0 rounded-full border-2 border-teal-500 opacity-0" />
              </div>
            </div>

            {/* Main title */}
            <div className="mb-3 flex items-center justify-center gap-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Congratulations{" "}
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {userName}!
                </span>
              </h2>
            </div>

            {/* Message */}
            <p className="text-gray-600 text-base sm:text-lg mb-4">
              {type === "signup"
                ? "Your account has been created successfully"
                : "You've been logged in successfully"}
            </p>

            {/* Status message */}
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-teal-100">
              <Sparkles className="w-4 h-4" />
              {message}
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: "🛍️", label: "Browse" },
                { icon: "💬", label: "Connect" },
                { icon: "⚡", label: "Deals" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors"
                >
                  <div className="text-2xl mb-1">{feature.icon}</div>
                  <div className="text-xs font-medium text-gray-600">{feature.label}</div>
                </div>
              ))}
            </div>

            {/* Redirecting text */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Redirecting you now...</span>
            </div>

            {/* Loading animation */}
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-teal-500"
                  style={{
                    animation: `pulse 1.4s infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .success-badge {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-pulse {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ShoppingBag, Users, Zap } from "lucide-react";

interface OnboardingSlide {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  bgGradient: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 0,
    icon: <ShoppingBag className="w-20 h-20" />,
    title: "Shop Smart",
    subtitle: "Discover Amazing Deals",
    description: "Browse thousands of products from verified campus sellers. Save up to 90% on textbooks, fashion, tech, and more.",
    accentColor: "from-orange-400 to-orange-600",
    bgGradient: "from-orange-50 to-amber-50",
  },
  {
    id: 1,
    icon: <Users className="w-20 h-20" />,
    title: "Connect",
    subtitle: "Join Your Campus Community",
    description: "Follow your favorite sellers, get instant notifications on new drops, and build your trusted campus network.",
    accentColor: "from-emerald-400 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
  },
  {
    id: 2,
    icon: <Zap className="w-20 h-20" />,
    title: "Earn Cash",
    subtitle: "Turn Items Into Money",
    description: "List unused items in seconds and reach thousands of buyers. Get paid fast through secure transactions.",
    accentColor: "from-violet-400 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
  },
];

export default function AnimatedOnboarding({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = slides[current];

  const clearAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const startAuto = () => {
    clearAuto();
    autoRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const handleNext = () => {
    setDirection("left");
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection("right");
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDot = (index: number) => {
    setDirection(index > current ? "left" : "right");
    setCurrent(index);
  };

  useEffect(() => {
    startAuto();
    return clearAuto;
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    setProgress(0);
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval!);
          return 100;
        }
        return prev + (100 / 50); // 5 second animation (50 * 100ms)
      });
    }, 100);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [current]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-white">
      {/* Background gradient based on current slide */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-all duration-700`}
      />

      {/* Floating animated elements background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: `linear-gradient(135deg, var(--accent-start), var(--accent-end))`,
              top: `${-20 + i * 30}%`,
              left: `${-10 + i * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 py-12 sm:px-8">
        {/* Header with skip button */}
        <div className="flex w-full justify-between items-center">
          <div className="w-16" /> {/* Placeholder for balance */}
          <div className="text-sm font-semibold text-gray-600">
            {current + 1} / {slides.length}
          </div>
          <button
            onClick={onComplete}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Progress indicator */}
        <div className="w-full max-w-xs h-1 bg-gray-200 rounded-full overflow-hidden mt-6">
          <div
            className={`h-full bg-gradient-to-r ${slide.accentColor} transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Centered icon and text container */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md">
          {/* Animated icon container */}
          <div
            className="relative"
            style={{
              animation:
                direction === "left"
                  ? "slideInFromLeft 0.6s cubic-bezier(0.34,1.56,0.64,1) both"
                  : "slideInFromRight 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.accentColor} flex items-center justify-center text-white shadow-xl`}
            >
              {slide.icon}
            </div>
            {/* Decorative background circle */}
            <div
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.accentColor} opacity-20 animate-pulse blur-xl`}
            />
          </div>

          {/* Text content */}
          <div
            className="text-center space-y-3"
            style={{
              animation:
                direction === "left"
                  ? "slideInFromLeftDelay 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both"
                  : "slideInFromRightDelay 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
            }}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {slide.subtitle}
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                {slide.title}
              </h2>
            </div>
            <p className="text-base text-gray-600 leading-relaxed pt-2">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Bottom section with navigation */}
        <div className="w-full flex flex-col items-center gap-6">
          {/* Dot indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDot(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? `h-3 w-8 bg-gradient-to-r ${slide.accentColor}`
                    : "h-3 w-3 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="w-full max-w-xs flex gap-3">
            {current > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all active:scale-95"
              >
                Back
              </button>
            )}
            <button
              onClick={current === slides.length - 1 ? onComplete : handleNext}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r ${slide.accentColor} hover:shadow-lg`}
            >
              {current === slides.length - 1 ? (
                <>
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Legal text */}
          <p className="text-xs text-gray-500 text-center max-w-xs">
            By continuing, you agree to our Terms & Conditions
          </p>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideInFromLeftDelay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromRightDelay {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

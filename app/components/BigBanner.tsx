"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, ArrowRight, Zap, TrendingUp } from "lucide-react";

export default function BigBanner() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const node = bannerRef.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setIsVisible(true);
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          const timer = setTimeout(() => setHasEntered(true), 700);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Parallax effect for background blobs
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = bannerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    }
  };

  return (
    <div
      ref={bannerRef}
      onMouseMove={handleMouseMove}
      className={`w-full rounded-3xl overflow-hidden relative transition-all duration-1000 ease-out group ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{
        background: "#6C5CE7",
        boxShadow: "0 20px 40px -10px rgba(108, 92, 231, 0.3)"
      }}
    >
      {/* Animated Noise Texture */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Dynamic Gradient Blobs with Parallax */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      />
      
      {/* Floating Geometric Shapes */}
      <div className="absolute top-4 left-1/4 w-8 h-8 border-2 border-white/20 rounded-lg rotate-12 animate-float-slow" />
      <div className="absolute bottom-8 right-1/3 w-4 h-4 bg-white/20 rounded-full animate-float-fast" />
      <div className="absolute top-1/2 right-10 w-6 h-6 bg-white/20 rounded-md rotate-45 animate-float-med" />

      {/* Shimmer Sweep */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] animate-shimmer" />

      <div className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
        
        {/* Left Content */}
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
              <Zap size={10} fill="white" />
              Live Flash Sale
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.1] mb-2 drop-shadow-sm">
            Dorm Essentials, <br/>
            <span className="text-white/80">picked by your community.</span>
          </h2>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-[10px] font-bold text-white backdrop-blur-sm">
                  {String.fromCharCode(64+i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                +128
              </div>
            </div>
            <p className="text-sm text-white/90 font-medium flex items-center gap-1.5">
              <TrendingUp size={14} />
              Trending near you • Up to 50% off
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <Link
          href="/search?category=flash-deals"
          className="group relative z-10 flex-shrink-0"
        >
          <div className="absolute inset-0 bg-white rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          <div className="relative bg-white text-[#6C5CE7] px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center group-hover:bg-[#6C5CE7] group-hover:text-white transition-colors">
              <ShoppingBag size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shop Now</span>
              <span className="text-sm font-black text-gray-900 flex items-center gap-1">
                View Deals 
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(15deg); }
        }
        @keyframes floatMed {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-8px) rotate(50deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-shimmer {
          animation: shimmer 4s infinite linear;
        }
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        .animate-float-med {
          animation: floatMed 5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: floatFast 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer, .animate-float-slow, .animate-float-med, .animate-float-fast {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
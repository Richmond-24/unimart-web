
"use client";

import React, { useEffect, useRef } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finishedRef.current) return;
    const timer = setTimeout(() => {
      finishedRef.current = true;
      onFinish();
    }, 1606);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#111b21", overflow: "hidden" }}
    >
      {/* Subtle background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Center content */}
      <div
        style={{
          animation: "fadeScaleIn 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Logo image — no box, just the image */}
        <div
          style={{
            position: "relative",
            animation: "logoPulse 3s ease-in-out 1.2s infinite",
          }}
        >
          {/* Soft glow ring behind logo */}
          <div
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,168,132,0.18) 0%, transparent 70%)",
              animation: "glowBreath 3s ease-in-out 1s infinite",
            }}
          />
          <img
            src="/logo.png"
            alt="Uni-Mart"
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              borderRadius: 22,
              display: "block",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>

        {/* App name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.65s both",
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#e9edef",
              letterSpacing: -0.5,
            }}
          >
            Uni
            <span
              style={{
                background: "linear-gradient(90deg, #00a884, #00d4a8, #00a884)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 3s ease infinite 1s",
              }}
            >
              ‑Mart
            </span>
          </span>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#8696a0",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Shop Smarter, Spend Less
          </span>
        </div>
      </div>

      {/* Bottom: progress bar + attribution */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          animation: "fadeUp 0.5s ease 0.8s both",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 150,
            height: 3,
            background: "#2a3942",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #00a884, #00d4a8)",
              borderRadius: 99,
              animation: "loadBar 1.8s cubic-bezier(0.4,0,0.2,1) 0.8s forwards",
              width: 0,
              boxShadow: "0 0 8px rgba(0,212,168,0.5)",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            color: "#8696a0",
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          by Axiom
        </span>
      </div>

      <style jsx>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
        @keyframes glowBreath {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes loadBar {
          0%   { width: 0%; }
          40%  { width: 55%; }
          70%  { width: 75%; }
          90%  { width: 90%; }
          100% { width: 100%; }
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.14;
          animation: blobFloat 7s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #00a884, transparent);
          top: -100px; left: -80px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, #00d4a8, transparent);
          bottom: -80px; right: -60px;
          animation-delay: 2s;
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(18px, 28px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
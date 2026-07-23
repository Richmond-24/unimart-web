"use client";

import React, { useEffect, useState } from "react";

type SuccessModalProps = {
  userName: string;
  message: string;
  type: "signup" | "login";
  isOpen: boolean;
  onClose: () => void;
  userRole?: "buyer" | "seller";
  /** ms until auto-close; must match the caller's own setTimeout. Only drives the visual progress bar. */
  autoCloseMs?: number;
};

const CONFETTI = [
  { x: -64, y: -58, rot: -30, delay: 0.05, shape: "rect",   color: "var(--sm-amber)" },
  { x: 60,  y: -64, rot: 18,  delay: 0.10, shape: "circle", color: "var(--sm-teal)" },
  { x: -78, y: 6,   rot: 50,  delay: 0.02, shape: "tri",    color: "var(--sm-coral)" },
  { x: 76,  y: 2,   rot: -40, delay: 0.14, shape: "rect",   color: "var(--sm-teal-light)" },
  { x: -46, y: -86, rot: 8,   delay: 0.18, shape: "circle", color: "var(--sm-coral)" },
  { x: 46,  y: -84, rot: -12, delay: 0.06, shape: "tri",    color: "var(--sm-amber)" },
  { x: -20, y: 90,  rot: 22,  delay: 0.12, shape: "circle", color: "var(--sm-teal)" },
  { x: 22,  y: 92,  rot: -18, delay: 0.08, shape: "rect",   color: "var(--sm-coral)" },
  { x: -92, y: -20, rot: 34,  delay: 0.16, shape: "circle", color: "var(--sm-amber)" },
  { x: 92,  y: -18, rot: -34, delay: 0.04, shape: "tri",    color: "var(--sm-teal-light)" },
];

function ConfettiPiece({ x, y, rot, delay, shape, color }: (typeof CONFETTI)[number]) {
  const style: React.CSSProperties = {
    ['--sm-x' as any]: `${x}px`,
    ['--sm-y' as any]: `${y}px`,
    ['--sm-rot' as any]: `${rot}deg`,
    animationDelay: `${delay}s`,
    color,
  };
  if (shape === "circle") {
    return <span className="sm-confetti sm-confetti--circle" style={style} />;
  }
  if (shape === "tri") {
    return <span className="sm-confetti sm-confetti--tri" style={style} />;
  }
  return <span className="sm-confetti sm-confetti--rect" style={style} />;
}

function CelebrationIcon({ type }: { type: "signup" | "login" }) {
  return (
    <div className="sm-icon-stage">
      <span className="sm-ring sm-ring--1" />
      <span className="sm-ring sm-ring--2" />
      <span className="sm-ring sm-ring--3" />

      {type === "signup" && (
        <div className="sm-confetti-layer">
          {CONFETTI.map((c, i) => <ConfettiPiece key={i} {...c} />)}
        </div>
      )}

      <svg className="sm-badge" width="88" height="88" viewBox="0 0 88 88" fill="none">
        <defs>
          <linearGradient id="sm-badge-grad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--sm-teal)" />
            <stop offset="100%" stopColor="var(--sm-teal-dark)" />
          </linearGradient>
        </defs>
        <circle className="sm-badge-circle" cx="44" cy="44" r="40" fill="url(#sm-badge-grad)" />
        <polyline
          className="sm-badge-check"
          points="27,45 39,57 62,32"
          fill="none"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {[0, 1, 2, 3].map(i => <span key={i} className={`sm-sparkle sm-sparkle--${i}`} />)}
    </div>
  );
}

export default function SuccessModal({ userName, message, type, isOpen, onClose, userRole, autoCloseMs = 2500 }: SuccessModalProps) {
  const [render, setRender] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setClosing(false);
    } else if (render) {
      setClosing(true);
      const t = setTimeout(() => setRender(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!render) return null;

  const heading = type === "signup" ? `You're in, ${userName}!` : `Welcome back, ${userName}!`;
  const roleNote =
    type === "signup" && userRole
      ? userRole === "seller"
        ? "Your shop is ready — start listing items whenever you like."
        : "Your account is ready — start browsing the campus marketplace."
      : null;

  return (
    <div className={`sm-overlay ${closing ? "sm-overlay--out" : ""}`} role="dialog" aria-modal="true" aria-label={heading}>
      <div className={`sm-card ${closing ? "sm-card--out" : ""}`}>
        <button type="button" className="sm-close" onClick={onClose} aria-label="Close">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <CelebrationIcon type={type} />

        <h2 className="sm-title">{heading}</h2>
        <p className="sm-message">{message}</p>
        {roleNote && <p className="sm-role-note">{roleNote}</p>}

        <div className="sm-progress-track">
          <div className="sm-progress-fill" style={{ animationDuration: `${autoCloseMs}ms` }} />
        </div>
      </div>

      <style jsx>{`
        :global(:root) {
          --sm-teal: #0d9488;
          --sm-teal-dark: #0f766e;
          --sm-teal-light: #5eead4;
          --sm-amber: #f59e0b;
          --sm-coral: #fb7185;
        }

        @keyframes sm-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sm-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes sm-card-in {
          0%   { opacity: 0; transform: scale(.82) translateY(18px); }
          60%  { opacity: 1; transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sm-card-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(.92) translateY(8px); } }

        @keyframes sm-badge-pop {
          0%   { transform: scale(0); }
          55%  { transform: scale(1.14); }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes sm-check-draw { from { stroke-dashoffset: 46; } to { stroke-dashoffset: 0; } }
        @keyframes sm-ring-pulse {
          0%   { transform: scale(0.5); opacity: 0.55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes sm-confetti-burst {
          0%   { transform: translate(0, 0) rotate(0deg) scale(0.4); opacity: 0; }
          18%  { opacity: 1; }
          100% { transform: translate(var(--sm-x), var(--sm-y)) rotate(var(--sm-rot)) scale(1); opacity: 0; }
        }
        @keyframes sm-sparkle-twinkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50%      { transform: scale(1) rotate(45deg); opacity: 1; }
        }
        @keyframes sm-progress-shrink { from { width: 100%; } to { width: 0%; } }

        .sm-overlay {
          position: fixed; inset: 0; z-index: 10010;
          background: rgba(10, 20, 40, 0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: sm-fade-in 0.22s ease both;
          font-family: 'Inter', sans-serif;
        }
        .sm-overlay--out { animation: sm-fade-out 0.2s ease both; }

        .sm-card {
          position: relative;
          width: 100%; max-width: 320px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 28px 26px;
          text-align: center;
          box-shadow: 0 24px 60px rgba(15, 30, 30, 0.28);
          animation: sm-card-in 0.5s cubic-bezier(.24, 1.3, .4, 1) both;
        }
        .sm-card--out { animation: sm-card-out 0.2s ease both; }

        .sm-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #F7F8FA; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #9999AA; transition: background .15s, color .15s, transform .15s;
        }
        .sm-close:hover { background: #E2E4EA; color: #555566; }
        .sm-close:active { transform: scale(0.9); }

        .sm-icon-stage {
          position: relative;
          width: 120px; height: 120px;
          margin: 4px auto 18px;
          display: flex; align-items: center; justify-content: center;
        }

        .sm-ring {
          position: absolute;
          width: 88px; height: 88px;
          border-radius: 50%;
          border: 2px solid var(--sm-teal);
          animation: sm-ring-pulse 1.8s cubic-bezier(.22,.8,.32,1) infinite;
        }
        .sm-ring--1 { animation-delay: 0s; }
        .sm-ring--2 { animation-delay: 0.5s; }
        .sm-ring--3 { animation-delay: 1s; }

        .sm-badge { position: relative; z-index: 2; animation: sm-badge-pop 0.6s cubic-bezier(.24,1.4,.4,1) 0.08s both; }
        .sm-badge-circle { filter: drop-shadow(0 8px 18px rgba(13,148,136,0.35)); }
        .sm-badge-check {
          stroke-dasharray: 46;
          stroke-dashoffset: 46;
          animation: sm-check-draw 0.45s ease 0.42s forwards;
        }

        .sm-confetti-layer {
          position: absolute; inset: 0;
          pointer-events: none;
        }
        .sm-confetti {
          position: absolute; top: 50%; left: 50%;
          display: block;
          animation: sm-confetti-burst 0.95s cubic-bezier(.19,.87,.32,1.15) both;
        }
        .sm-confetti--rect {
          width: 8px; height: 8px; margin: -4px 0 0 -4px;
          background: currentColor; border-radius: 2px;
        }
        .sm-confetti--circle {
          width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px;
          background: currentColor; border-radius: 50%;
        }
        .sm-confetti--tri {
          width: 0; height: 0; margin: -4px 0 0 -4px;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 8px solid currentColor;
        }

        .sm-sparkle {
          position: absolute;
          width: 8px; height: 8px;
          background: var(--sm-amber);
          clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
          animation: sm-sparkle-twinkle 2.2s ease-in-out infinite;
        }
        .sm-sparkle--0 { top: 4px; left: 10px; animation-delay: 0.2s; }
        .sm-sparkle--1 { top: 14px; right: 2px; background: var(--sm-coral); animation-delay: 0.9s; }
        .sm-sparkle--2 { bottom: 8px; left: 0; background: var(--sm-teal-light); animation-delay: 1.4s; }
        .sm-sparkle--3 { bottom: 2px; right: 12px; animation-delay: 0.55s; }

        .sm-title {
          font-size: 19px; font-weight: 700; color: #1A1A2E;
          margin: 0 0 8px; letter-spacing: -0.2px;
          animation: sm-fade-in 0.4s ease 0.5s both;
        }
        .sm-message {
          font-size: 13.5px; color: #555566;
          margin: 0; line-height: 1.55;
          animation: sm-fade-in 0.4s ease 0.56s both;
        }
        .sm-role-note {
          font-size: 12.5px; color: var(--sm-teal-dark);
          background: #f0fdfa;
          border-radius: 8px;
          padding: 8px 10px;
          margin: 12px 0 0;
          line-height: 1.5;
          animation: sm-fade-in 0.4s ease 0.62s both;
        }

        .sm-progress-track {
          margin-top: 20px;
          height: 3px; border-radius: 3px;
          background: #E2E4EA;
          overflow: hidden;
          animation: sm-fade-in 0.4s ease 0.7s both;
        }
        .sm-progress-fill {
          height: 100%;
          background: var(--sm-teal);
          border-radius: 3px;
          animation-name: sm-progress-shrink;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .sm-overlay, .sm-card, .sm-badge, .sm-badge-check, .sm-ring,
          .sm-confetti, .sm-sparkle, .sm-title, .sm-message, .sm-role-note, .sm-progress-track {
            animation: none !important;
          }
          .sm-badge-check { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
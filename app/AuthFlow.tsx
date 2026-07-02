
"use client";

import React, { useEffect, useState, memo } from "react";
import { useRouter } from 'next/navigation';
import ReactDOM from "react-dom";
import { useAuth } from "./context/AuthContext";
import TermsModal from "./components/TermsModal";
import apiFetch from "../lib/apiClient";
import detectUserLocation from "../lib/location";
import { persistAuthToken } from "../lib/authCookie";

type Screen = "welcome" | "login" | "signup";

const UNIVERSITY_OPTIONS = [
  { label: "University of Ghana (UG)", value: "UG" },
  { label: "Kwame Nkrumah University of Science & Technology (KNUST)", value: "KNUST" },
  { label: "University of Cape Coast (UCC)", value: "UCC" },
  { label: "University for Development Studies (UDS)", value: "UDS" },
  { label: "University of Education Winneba (UEW)", value: "UEW" },
  { label: "University of Professional Studies Accra (UPSA)", value: "UPSA" },
  { label: "University of Energy and Natural Resources (UENR)", value: "UENR" },
  { label: "Not a student", value: "NOT_A_STUDENT" },
];

// ─── FLOATING GLASSMORPHIC E-COMMERCE ICONS ───────────────────────────────────
// FIXED: Moved outside AuthFlow so it never remounts on parent state changes.
const ICONS = [
  { path: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>, size: 48, top: "8%", left: "5%", delay: "0s", duration: "14s" },
  { path: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>, size: 36, top: "15%", left: "82%", delay: "2s", duration: "18s" },
  { path: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, size: 44, top: "60%", left: "3%", delay: "4s", duration: "16s" },
  { path: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>, size: 42, top: "75%", left: "88%", delay: "1s", duration: "20s" },
  { path: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></>, size: 38, top: "35%", left: "90%", delay: "3s", duration: "22s" },
  { path: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, size: 32, top: "85%", left: "18%", delay: "5s", duration: "17s" },
  { path: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, size: 50, top: "48%", left: "93%", delay: "6s", duration: "19s" },
  { path: <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>, size: 34, top: "92%", left: "60%", delay: "1.5s", duration: "15s" },
  { path: <><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></>, size: 40, top: "22%", left: "10%", delay: "7s", duration: "21s" },
  { path: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>, size: 30, top: "5%", left: "50%", delay: "8s", duration: "23s" },
  { path: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>, size: 36, top: "55%", left: "8%", delay: "9s", duration: "16s" },
  { path: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>, size: 38, top: "40%", left: "-2%", delay: "2.5s", duration: "18s" },
];

// FIXED: memo ensures FloatingIcons never re-renders unless its own props change (it has none).
const FloatingIcons = memo(function FloatingIcons() {
  return (
    <div className="um-float-layer">
      {ICONS.map((icon, i) => (
        <div
          key={i}
          className="um-float-icon"
          style={{
            top: icon.top,
            left: icon.left,
            animationDelay: icon.delay,
            animationDuration: icon.duration,
          }}
        >
          <svg
            width={icon.size}
            height={icon.size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon.path}
          </svg>
        </div>
      ))}
    </div>
  );
});

// ─── WELCOME SCREEN ──────────────────────────────────────────────────────────
// FIXED: Defined outside AuthFlow so it never gets a new identity on each render.
type WelcomeScreenProps = {
  onSignup: () => void;
  onLogin: () => void;
  onTerms: () => void;
};
const WelcomeScreen = memo(function WelcomeScreen({ onSignup, onLogin, onTerms }: WelcomeScreenProps) {
  return (
    <div className="um-screen um-welcome">
      <FloatingIcons />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", flex: 1, width: "100%" }}>
        <div className="um-logo-wrap">
          <img src="/logo.png" alt="Uni-Mart" className="um-logo-img" />
        </div>

        <div className="um-app-name">Uni-Mart</div>
        <p className="um-app-sub">Campus marketplace</p>

        <div className="um-trust-row">
          {[
            { icon: <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>, icon2: <polyline points="22 4 12 14.01 9 11.01"/>, label: "Verified" },
            { icon: <rect x="3" y="11" width="18" height="11" rx="2"/>, icon2: <path d="M7 11V7a5 5 0 0110 0v4"/>, label: "Secure" },
            { icon: <circle cx="12" cy="12" r="10"/>, icon2: <polyline points="12 6 12 12 16 14"/>, label: "Fast" },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="um-trust-div" />}
              <div className="um-trust-item">
                <div className="um-trust-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {item.icon}{item.icon2}
                  </svg>
                </div>
                <span className="um-trust-label">{item.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="um-cta-stack">
          <button type="button" className="um-btn-primary" onClick={onSignup}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Sign up free
          </button>
          <button type="button" className="um-btn-secondary" onClick={onLogin}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Log in
          </button>
        </div>

        <p className="um-legal">
          By continuing, you agree to our{" "}
          <button type="button" className="um-legal-link" onClick={onTerms}>Terms &amp; Conditions</button>
        </p>
      </div>
    </div>
  );
});

// ─── FORM SCREEN ─────────────────────────────────────────────────────────────
// FIXED: Defined outside AuthFlow. All state values passed as props — no closures
// over parent state that would cause the component to get a new identity on each render.
type FormScreenProps = {
  mode: "login" | "signup";
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  passwordConfirm: string; setPasswordConfirm: (v: string) => void;
  pwVisible: boolean; setPwVisible: (v: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onTerms: () => void;
  onSwitchMode: () => void;
  role: 'buyer'|'seller';
  setRole: (v: 'buyer'|'seller') => void;
  university: string;
  setUniversity: (v: string) => void;
  storeName: string;
  setStoreName: (v: string) => void;
  storeBio: string;
  setStoreBio: (v: string) => void;
};

const FormScreen = memo(function FormScreen({
  mode, name, setName, phone, setPhone,
  email, setEmail, password, setPassword,
  passwordConfirm, setPasswordConfirm,
  pwVisible, setPwVisible,
  error, isLoading,
  onBack, onSubmit, onTerms, onSwitchMode,
  role, setRole,
  university, setUniversity,
  storeName, setStoreName,
  storeBio, setStoreBio,
}: FormScreenProps) {
  return (
    <div className="um-screen um-form-screen">
      <FloatingIcons />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="um-form-header">
          <button className="um-back-btn" onClick={onBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="um-form-title">{mode === "signup" ? "Create account" : "Welcome back"}</span>
        </div>

        <div className="um-form-body">
          {mode === "signup" && (
            <div className="um-input-group">
              <label className="um-input-label">Full name</label>
              <div className="um-input-wrap">
                <span className="um-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  className="um-field-input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="um-input-group">
              <label className="um-input-label">I am a</label>
              <div className="flex gap-3 mt-2" role="tablist" aria-label="Role selection">
                <button
                  type="button"
                  aria-pressed={role === 'buyer'}
                  onClick={() => setRole('buyer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${role === 'buyer' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  aria-pressed={role === 'seller'}
                  onClick={() => setRole('seller')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${role === 'seller' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  Seller
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && role === 'buyer' && (
            <div className="um-input-group">
              <label className="um-input-label">University</label>
              <div className="um-input-wrap">
                <select
                  className="um-field-input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                >
                  <option value="">Select your university</option>
                  {UNIVERSITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {mode === "signup" && role === 'seller' && (
            <div className="um-input-group">
              <label className="um-input-label">Shop / Store name</label>
              <div className="um-input-wrap">
                <input
                  className="um-field-input"
                  type="text"
                  placeholder="Your shop or store name"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <label className="um-input-label">Shop Bio (optional)</label>
                <textarea
                  className="um-field-input"
                  placeholder="A short description about your shop"
                  value={storeBio}
                  onChange={e => setStoreBio(e.target.value)}
                  rows={3}
                  style={{ padding: '10px', height: 'auto' }}
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="um-input-group">
              <label className="um-input-label">Phone (optional)</label>
              <div className="um-input-wrap">
                <span className="um-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.07.78 3.03a2 2 0 0 1-.45 2.11L8.09 10.91a14.05 14.05 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.4 1.98.66 3.03.78A2 2 0 0 1 22 16.92z"/></svg>
                </span>
                <input
                  className="um-field-input"
                  type="tel"
                  placeholder="e.g. +2348012345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          <div className="um-input-group">
            <label className="um-input-label">Email</label>
            <div className="um-input-wrap">
              <span className="um-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input
                className="um-field-input"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="um-input-group">
            <div className="um-label-row">
              <label className="um-input-label">Password</label>
              {mode === "login" && <button className="um-forgot-link" type="button">Forgot password?</button>}
            </div>
            <div className="um-input-wrap">
              <span className="um-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </span>
              <input
                className="um-field-input"
                type={pwVisible ? "text" : "password"}
                placeholder={mode === "signup" ? "Create a password" : "Your password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button className="um-pw-btn" type="button" onClick={() => setPwVisible(!pwVisible)} aria-label="Toggle password">
                {pwVisible
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="um-input-group">
              <label className="um-input-label">Confirm password</label>
              <div className="um-input-wrap">
                <span className="um-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </span>
                <input
                  className="um-field-input"
                  type={pwVisible ? "text" : "password"}
                  placeholder="Confirm password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="um-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button className="um-btn-primary" type="button" onClick={onSubmit} disabled={isLoading} style={{ marginTop: 4 }}>
            {isLoading ? <span className="um-spinner" /> : mode === "login" ? "Log in" : "Create account"}
          </button>

          <div className="um-divider-row"><span className="um-divider-txt">or</span></div>

          {mode === "signup" && (
            <p className="um-legal">By signing up, you agree to our <button type="button" className="um-legal-link" onClick={onTerms}>Terms &amp; Conditions</button></p>
          )}
        </div>

        <div className="um-mode-switch">
          <span>{mode === "login" ? "New to Uni-Mart?" : "Already have an account?"}</span>
          <button type="button" className="um-mode-switch-btn" onClick={onSwitchMode}>
            {mode === "login" ? "Sign up free" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── DESKTOP LAYOUT ───────────────────────────────────────────────────────────
// FIXED: Defined outside AuthFlow for the same reason.
type DesktopLayoutProps = {
  screen: Screen;
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  passwordConfirm: string; setPasswordConfirm: (v: string) => void;
  pwVisible: boolean; setPwVisible: (v: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onLogin: () => void;
  onSignup: () => void;
  onSubmit: () => void;
  onTerms: () => void;
  role: 'buyer'|'seller';
  setRole: (v: 'buyer'|'seller') => void;
  university: string;
  setUniversity: (v: string) => void;
  storeName: string;
  setStoreName: (v: string) => void;
  storeBio: string;
  setStoreBio: (v: string) => void;
};

const DesktopLayout = memo(function DesktopLayout({
  screen, name, setName, phone, setPhone, email, setEmail,
  password, setPassword, passwordConfirm, setPasswordConfirm, pwVisible, setPwVisible,
  error, isLoading,
  onLogin, onSignup, onSubmit, onTerms,
  role, setRole,
  university, setUniversity,
  storeName, setStoreName,
  storeBio, setStoreBio,
}: DesktopLayoutProps) {
  return (
    <div className="um-desktop-overlay">
      <div className="um-desktop-card um-anim-pop">
        <div className="um-desktop-left" style={{ position: "relative", overflow: "hidden" }}>
          <FloatingIcons />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="um-dl-logo-wrap">
              <img src="/logo.png" alt="Uni-Mart" className="um-dl-logo-img" />
            </div>
            <div className="um-dl-wordmark">Uni-Mart</div>
            <p className="um-dl-tagline">Your campus. Your marketplace.</p>
            <p className="um-dl-desc">Buy, sell, and discover deals within your university community. Student-verified, safe, and free.</p>
            <div className="um-dl-features">
              {["Student-verified sellers","Free campus delivery","Secure payments","In-app messaging"].map((f,i)=>(
                <div key={i} className="um-dl-feat">
                  <div className="um-dl-feat-dot">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <p className="um-dl-foot">Trusted by 12,000+ students</p>
          </div>
        </div>

        <div className="um-desktop-right">
          <div className="um-dr-tabs">
            <button type="button" className={`um-dr-tab ${screen === "login" ? "active" : ""}`} onClick={onLogin}>Log in</button>
            <button type="button" className={`um-dr-tab ${screen === "signup" ? "active" : ""}`} onClick={onSignup}>Sign up</button>
          </div>
          <div className="um-dr-form">
            {screen === "signup" && (
              <div className="um-input-group">
                <label className="um-input-label">Full name</label>
                <div className="um-input-wrap">
                  <span className="um-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input className="um-field-input" type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                </div>
              </div>
            )}
            {screen === "signup" && (
              <div className="um-input-group">
                <label className="um-input-label">I am a</label>
                <div className="flex gap-3 mt-2" role="tablist" aria-label="Role selection">
                  <button
                    type="button"
                    aria-pressed={role === 'buyer'}
                    onClick={() => setRole('buyer')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${role === 'buyer' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    aria-pressed={role === 'seller'}
                    onClick={() => setRole('seller')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${role === 'seller' ? 'bg-teal-700 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    Seller
                  </button>
                </div>
              </div>
            )}
            {screen === "signup" && role === 'buyer' && (
              <div className="um-input-group">
                <label className="um-input-label">University</label>
                <div className="um-input-wrap">
                  <select
                    className="um-field-input"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="">Select your university</option>
                    {UNIVERSITY_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {screen === "signup" && role === 'seller' && (
              <div className="um-input-group">
                <label className="um-input-label">Shop / Store name</label>
                <div className="um-input-wrap">
                  <input className="um-field-input" type="text" placeholder="Your shop or store name" value={storeName} onChange={e => setStoreName(e.target.value)} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label className="um-input-label">Shop Bio (optional)</label>
                  <textarea
                    className="um-field-input"
                    placeholder="A short description about your shop"
                    value={storeBio}
                    onChange={e => setStoreBio(e.target.value)}
                    rows={3}
                    style={{ padding: '10px', height: 'auto' }}
                  />
                </div>
              </div>
            )}
            {screen === "signup" && (
              <div className="um-input-group">
                <label className="um-input-label">Phone (optional)</label>
                <div className="um-input-wrap">
                  <span className="um-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.07.78 3.03a2 2 0 0 1-.45 2.11L8.09 10.91a14.05 14.05 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.4 1.98.66 3.03.78A2 2 0 0 1 22 16.92z"/></svg></span>
                  <input className="um-field-input" type="tel" placeholder="e.g. +2348012345678" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                </div>
              </div>
            )}
            <div className="um-input-group">
              <label className="um-input-label">Email</label>
              <div className="um-input-wrap">
                <span className="um-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input className="um-field-input" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="um-input-group">
              <div className="um-label-row">
                <label className="um-input-label">Password</label>
                {screen === "login" && <button type="button" className="um-forgot-link">Forgot password?</button>}
              </div>
              <div className="um-input-wrap">
                <span className="um-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                <input
                  className="um-field-input"
                  type={pwVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={screen === "signup" ? "new-password" : "current-password"}
                />
                <button type="button" className="um-pw-btn" onClick={() => setPwVisible(!pwVisible)} aria-label="Toggle password">
                  {pwVisible
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            {screen === "signup" && (
              <div className="um-input-group">
                <label className="um-input-label">Confirm password</label>
                <div className="um-input-wrap">
                  <span className="um-input-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                  <input
                    className="um-field-input"
                    type={pwVisible ? "text" : "password"}
                    placeholder="Confirm password"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
            {error && <div className="um-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            <button type="button" className="um-btn-primary" onClick={onSubmit} disabled={isLoading}>
              {isLoading ? <span className="um-spinner" /> : screen === "login" ? "Log in" : "Create account"}
            </button>
            <div className="um-divider-row"><span className="um-divider-txt">or</span></div>
            <p className="um-legal" style={{ marginTop: "auto", paddingTop: 8 }}>
              By continuing, you agree to our <button type="button" className="um-legal-link" onClick={onTerms}>Terms &amp; Conditions</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── AUTH FLOW (state only) ───────────────────────────────────────────────────
export default function AuthFlow({ onDone }: { onDone?: (role?: 'buyer'|'seller'|'guest') => void }) {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<'buyer'|'seller'>('buyer');
  const [university, setUniversity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = React.useRef(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeBio, setStoreBio] = useState("");

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function goTo(s: Screen) {
    setScreen(s);
    setPwVisible(false);
    setError(null);
    setSuccessMessage("");
  }

  async function handleSignup() {
    // Prevent concurrent submissions
    if (isSubmittingRef.current) return;
    setError(null);

    // Validate name
    if (!name || name.trim() === "") {
      setError("Please enter your full name");
      return;
    }

    // Validate email format
    if (!email || email.trim() === "") {
      setError("Please enter your email address");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password || password.trim() === "") {
      setError("Please create a password (at least 8 characters)");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Validate password confirmation
    if (!passwordConfirm || passwordConfirm.trim() === "") {
      setError("Please confirm your password");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    // Validate phone if provided
    if (phone && phone.trim() !== "") {
      if (!/^\+?[0-9\s\-]{7,15}$/.test(phone)) {
        setError("Please enter a valid phone number (7-15 digits)");
        return;
      }
    }

    if (role === 'buyer' && (!university || university.trim() === "")) {
      setError("Please select your university");
      return;
    }

    // mark submitting after validations so failed validations don't lock the flow
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      // Step 1: Try to detect user location while the request is prepared.
      // Keep signup fast by not waiting longer than one second.
      const locationPromise = detectUserLocation(1000).catch(() => null);

      // Step 2: Notify Zapier of new signup (best-effort, non-blocking)
      // Step 3: Continue with the registration request and attach location data if available.
      let locPayload: any = {};
      try {
        const loc = await Promise.race([locationPromise, new Promise(resolve => setTimeout(() => resolve(null), 1000))]);
        if (loc && typeof loc === 'object' && (loc as any).display) {
          const location = loc as any;
          locPayload.location = location.display;
          if (location.lat != null && location.lon != null) locPayload.locationCoords = { lat: location.lat, lon: location.lon };
          try { localStorage.setItem('unimart:locationDetected', '1'); } catch (e) {}
        }
      } catch (e) {
        // ignore detection errors
      }

      // Step 4: Register user
      console.debug("Registering user with email:", email.substring(0, 3) + "***");
      const res = await apiFetch('/auth/register', { 
        method: 'POST', 
        body: { 
          name: name.trim(), 
          fullName: name.trim(),
          email: email.trim().toLowerCase(), 
          password, 
          passwordConfirm,
          phone: phone ? phone.trim() : '',
          phoneNumber: phone ? phone.trim() : '',
          role,
          university: role === 'buyer'
            ? (university.trim() === 'NOT_A_STUDENT' ? 'Not a student' : university.trim())
            : '',
          shopName: role === 'seller' && storeName ? storeName.trim() : undefined,
          shopBio: role === 'seller' && storeBio ? storeBio.trim() : undefined,
          ...locPayload 
        } 
      });
      
      if (!res || !res.success) {
        const errorMsg = res?.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        return;
      }
      
      // Success: Save credentials
      if (!res.token) {
        setError("Registration successful but authentication failed. Please log in.");
        return;
      }

      // Update auth context (persists to localStorage + cookie via context effects)
      try { persistAuthToken(res.token); } catch (e) { console.warn('Could not persist token:', e); }
      try { setToken(res.token); } catch (e) { console.warn('Could not set token in context:', e); }
      try { setUser(res.user ? { ...res.user } : null); } catch (e) { console.warn('Could not set user in context:', e); }
      try { localStorage.removeItem('unimart:guest'); } catch (e) {}
      try {
        const savedUser = res.user ? { ...res.user } : {};
        if (!savedUser.role) savedUser.role = role;
        if (!savedUser.university && role === 'buyer' && university) {
          savedUser.university = university.trim() === 'NOT_A_STUDENT' ? 'Not a student' : university.trim();
        }
        if (!savedUser.shopName && role === 'seller' && storeName) savedUser.shopName = storeName;
        if (!savedUser.shopBio && role === 'seller' && storeBio) savedUser.shopBio = storeBio;
        if (!savedUser.createdAt) savedUser.createdAt = new Date().toISOString();
        localStorage.setItem('unimart:user', JSON.stringify(savedUser));
      } catch (e) { console.warn('Could not save user:', e); }
      try { localStorage.setItem('unimart:university', role === 'buyer' ? university : ''); } catch (e) {}
      try { localStorage.setItem('unimart:onboarded', '1'); } catch (e) {}
      
      // Show success UI
      setIsLoading(false);
      setSuccessName(name.split(" ")[0]);
      setSuccessMessage('Account created successfully. Redirecting...');
      setShowSuccess(true);

      // Trigger auth change event and navigate based on role
      setTimeout(() => {
        setShowSuccess(false);
        try { window.dispatchEvent(new Event('unimart:authChanged')); } catch (e) {}
        const userRole = res?.user?.role === 'seller' ? 'seller' : 'buyer';
        if (onDone) onDone(userRole);
        router.replace('/');
      }, 900);
      
    } catch (err: any) { 
      const backendMsg = err?.payload?.message || err?.message || 'Network error';
      const displayError = backendMsg.includes('Cannot reach backend') || backendMsg.includes('Failed to fetch')
        ? 'Cannot connect to server. Please check your connection and try again.'
        : backendMsg;
      setError(displayError);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  }

  async function handleLogin() {
    setError(null);
    
    // Validate email format
    if (!email || email.trim() === "") {
      setError("Please enter your email address");
      return;
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Validate password
    if (!password || password.trim() === "") {
      setError("Please enter your password");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      console.debug("Attempting login with email:", email.substring(0, 3) + "***");
      
      const res = await apiFetch('/auth/login', { 
        method: 'POST', 
        body: { 
          email: email.trim().toLowerCase(), 
          password 
        } 
      });
      
      // Handle response
      if (!res) {
        setError("No response from server. Please check your connection and try again.");
        setIsLoading(false);
        return;
      }
      
      if (!res.success) {
        // Show specific error message from backend, or generic default
        const errorMsg = res.message || 'Login failed. Please check your email and password.';
        setError(errorMsg);
        console.debug("Login failed:", errorMsg);
        setIsLoading(false);
        return;
      }

      // Success: Save credentials
      if (!res.token) {
        setError("Authentication failed. No token received.");
        setIsLoading(false);
        return;
      }

      // Update auth context so AppInitializer sees the change immediately
      try { persistAuthToken(res.token); } catch (e) { console.warn('Could not persist token:', e); }
      try { setToken(res.token); } catch (e) { console.warn('Could not set token in context:', e); }
      try { setUser(res.user ? { ...res.user } : null); } catch (e) { console.warn('Could not set user in context:', e); }
      try { localStorage.removeItem('unimart:guest'); } catch (e) {}
      try {
        const saved = res.user ? { ...res.user } : {};
        if (!saved.role) saved.role = (res.user && res.user.role) || 'buyer';
        if (saved.university) {
          try { localStorage.setItem('unimart:university', saved.university); } catch (e) {}
        }
        // If server did not provide creation date, try to infer from token iat
        if (!saved.createdAt) {
          try {
            const tok = res.token || (typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null);
            if (tok) {
              const parts = tok.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (payload && payload.iat) saved.createdAt = new Date(payload.iat * 1000).toISOString();
              }
            }
          } catch (e) {
            // ignore
          }
        }
        if (!saved.createdAt) saved.createdAt = new Date().toISOString();
        localStorage.setItem('unimart:user', JSON.stringify(saved));
        try { localStorage.setItem('unimart:onboarded', '1'); } catch (e) {}
        if (!saved.university) {
          const existing = localStorage.getItem('unimart:university');
          if (existing) {
            try { localStorage.setItem('unimart:university', existing); } catch (e) {}
          }
        }
      } catch (e) { console.warn('Could not save user:', e); }
      
      // Show success UI
      setIsLoading(false);
      setSuccessName(res.user?.name ? res.user.name.split(" ")[0] : "Welcome");
      setSuccessMessage('Logged in successfully. Redirecting...');
      setShowSuccess(true);

      // Trigger auth change event and navigate based on role
      setTimeout(() => {
        setShowSuccess(false);
        try { window.dispatchEvent(new Event('unimart:authChanged')); } catch (e) {}
        const userRole = res?.user?.role === 'seller' ? 'seller' : 'buyer';
        if (onDone) onDone(userRole);
        router.replace('/');
      }, 900);
      
    } catch (err: any) { 
      const backendMsg = err?.payload?.message || err?.message || 'Network error';
      const displayError = backendMsg.includes('Cannot reach backend') || backendMsg.includes('Failed to fetch')
        ? 'Cannot connect to server. Please check your connection and try again.'
        : backendMsg;
      setError(displayError);
      console.error("Login error:", err);
      setIsLoading(false); 
    }
  }

  if (!mounted) return null;

  const authContent = (
    <>
      {/* MOBILE */}
      <div className="um-mobile-root">
        {screen === "welcome" && (
          <WelcomeScreen
            onSignup={() => goTo("signup")}
            onLogin={() => goTo("login")}
            onTerms={() => setShowTerms(true)}
          />
        )}
        {(screen === "signup" || screen === "login") && (
          <FormScreen
            mode={screen}
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
            pwVisible={pwVisible} setPwVisible={setPwVisible}
            error={error}
            isLoading={isLoading}
            onBack={() => goTo("welcome")}
            onSubmit={screen === "login" ? handleLogin : handleSignup}
            onTerms={() => setShowTerms(true)}
            onSwitchMode={() => goTo(screen === "login" ? "signup" : "login")}
            role={role}
            setRole={setRole}
            university={university}
            setUniversity={setUniversity}
            storeName={storeName}
            setStoreName={setStoreName}
            storeBio={storeBio}
            setStoreBio={setStoreBio}
          />
        )}
      </div>

      {/* DESKTOP */}
      <div className="um-desktop-root">
        <DesktopLayout
          screen={screen}
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
          pwVisible={pwVisible} setPwVisible={setPwVisible}
          error={error}
          isLoading={isLoading}
          onLogin={() => goTo("login")}
          onSignup={() => goTo("signup")}
          onSubmit={screen === "login" ? handleLogin : handleSignup}
          onTerms={() => setShowTerms(true)}
          role={role}
          setRole={setRole}
          university={university}
          setUniversity={setUniversity}
          storeName={storeName}
          setStoreName={setStoreName}
          storeBio={storeBio}
          setStoreBio={setStoreBio}
        />
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showSuccess && (
        <div className="um-success-overlay">
          <div className="um-success-card">
            <div className="um-success-check">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="um-success-title">{successName ? `Welcome, ${successName}!` : "Welcome back!"}</h3>
            <p className="um-success-sub">{successMessage || "You're now signed in to Uni-Mart"}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --um-teal:        #0d9488;
          --um-teal-dark:   #0f766e;
          --um-teal-light:  #ccfbf1;
          --um-teal-bg:     #f0fdfa;
          --um-white:       #FFFFFF;
          --um-bg:          #F7F8FA;
          --um-text:        #1A1A2E;
          --um-text-2:      #555566;
          --um-text-3:      #9999AA;
          --um-border:      #E2E4EA;
          --um-red:         #DC2626;
          --um-red-bg:      #FEF2F2;
          --um-red-border:  #FECACA;
        }

        @keyframes um-float {
          0%   { transform: translateY(0px) rotate(0deg); }
          33%  { transform: translateY(-12px) rotate(3deg); }
          66%  { transform: translateY(6px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .um-float-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .um-float-icon {
          position: absolute;
          color: rgba(13, 148, 136, 0.12);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(13,148,136,0.08);
          border-radius: 16px;
          padding: 10px;
          animation: um-float var(--dur, 18s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        @keyframes um-slide-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes um-screen-in  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes um-pop        { 0%{opacity:0;transform:scale(0.9)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
        @keyframes um-check-pop  { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes um-shake      { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        @keyframes um-spin       { to{transform:rotate(360deg)} }
        @keyframes um-fade-in    { from{opacity:0} to{opacity:1} }

        .um-mobile-root {
          position: fixed; inset: 0; z-index: 10001;
          font-family: 'Inter', sans-serif;
          background: var(--um-white);
        }
        .um-desktop-root {
          display: none;
          position: fixed; inset: 0; z-index: 10001;
        }
        @media (min-width: 640px) {
          .um-mobile-root  { display: none; }
          .um-desktop-root { display: block; }
        }

        .um-screen {
          display: flex; flex-direction: column;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
          animation: um-screen-in 0.28s ease both;
        }

        .um-welcome {
          background: var(--um-white);
          padding: max(36px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom));
          align-items: center; text-align: center;
        }
        .um-logo-wrap {
          width: 96px; height: 96px; border-radius: 20px;
          background: var(--um-teal);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          animation: um-slide-up .4s ease both;
        }
        .um-logo-img { width: 80px; height: 80px; object-fit: contain; display: block; }
        .um-app-name {
          font-size: 26px; font-weight: 700; color: var(--um-text);
          letter-spacing: -0.5px; margin-bottom: 8px;
          animation: um-slide-up .4s .05s ease both;
        }
        .um-app-sub {
          font-size: 14px; color: var(--um-text-2);
          line-height: 1.5; margin-bottom: 28px;
          animation: um-slide-up .4s .1s ease both;
        }
        .um-trust-row {
          display: flex; align-items: center; justify-content: center; gap: 24px;
          margin-bottom: 48px;
          animation: um-slide-up .4s .15s ease both;
        }
        .um-trust-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .um-trust-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--um-teal-bg);
          display: flex; align-items: center; justify-content: center;
          color: var(--um-teal);
        }
        .um-trust-label { font-size: 11px; color: var(--um-text-3); font-weight: 500; }
        .um-trust-div   { width: 1px; height: 36px; background: var(--um-border); }
        .um-cta-stack {
          width: 100%; display: flex; flex-direction: column; gap: 12px;
          animation: um-slide-up .4s .2s ease both;
        }

        .um-btn-primary {
          width: 100%; height: 50px;
          background: var(--um-teal); color: var(--um-white);
          border: none; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; letter-spacing: 0.1px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s, transform .1s;
        }
        .um-btn-primary:hover:not(:disabled) { background: var(--um-teal-dark); }
        .um-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .um-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .um-btn-secondary {
          width: 100%; height: 50px;
          background: var(--um-white); color: var(--um-teal);
          border: 1.5px solid var(--um-teal); border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s, transform .1s;
        }
        .um-btn-secondary:hover { background: var(--um-teal-bg); }
        .um-btn-secondary:active { transform: scale(0.97); }

        .um-btn-ghost {
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 14px; color: var(--um-text-3);
          padding: 4px; width: 100%; text-align: center;
          transition: color .15s;
        }
        .um-btn-ghost:hover { color: var(--um-text-2); }

        /* small guest button used in welcome/login/signup to reduce visual weight */

        .um-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: um-spin .65s linear infinite;
        }

        .um-legal {
          font-size: 11.5px; color: var(--um-text-3);
          text-align: center; line-height: 1.6; margin: 16px 0 0;
          animation: um-slide-up .4s .25s ease both;
        }
        .um-legal-link {
          background: none; border: none; cursor: pointer;
          font-size: 11.5px; color: var(--um-text-2);
          text-decoration: underline; padding: 0;
        }
        .um-legal-link:hover { color: var(--um-teal); }

        .um-form-screen { background: var(--um-white); }
        .um-form-header {
          display: flex; align-items: center; gap: 14px;
          padding: max(52px, env(safe-area-inset-top)) 24px 18px;
          border-bottom: 1px solid var(--um-border);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
        }
        .um-back-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--um-bg); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--um-text-2); flex-shrink: 0;
          transition: background .15s;
        }
        .um-back-btn:hover { background: var(--um-border); }
        .um-form-title { font-size: 18px; font-weight: 700; color: var(--um-text); }

        .um-form-body {
          padding: 20px 18px 16px;
          display: flex; flex-direction: column; gap: 12px; flex: 1;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          /* Make the form body scrollable so inputs and submit stay visible */
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          /* Give room at the bottom so the submit button isn't hidden behind keyboard */
          padding-bottom: 88px;
          max-height: calc(100dvh - 140px);
        }

        .um-input-group { display: flex; flex-direction: column; gap: 6px; }
        .um-input-label {
          font-size: 12px; font-weight: 600; color: var(--um-text-2);
          letter-spacing: 0.4px; text-transform: uppercase;
        }
        .um-label-row { display: flex; justify-content: space-between; align-items: center; }
        .um-input-wrap { position: relative; display: flex; align-items: center; }
        .um-input-icon {
          position: absolute; left: 14px; color: var(--um-text-3);
          pointer-events: none; display: flex;
        }
        .um-field-input {
          width: 100%; height: 50px;
          background: var(--um-bg); border: 1.5px solid var(--um-border);
          border-radius: 10px; padding: 0 44px 0 44px;
          font-family: 'Inter', sans-serif; font-size: 15px; color: var(--um-text);
          outline: none; transition: border-color .18s, box-shadow .18s, background .18s;
          /* Prevent mobile zoom on focus */
          font-size: max(16px, 15px);
        }
        .um-field-input::placeholder { color: var(--um-text-3); }
        .um-field-input:focus {
          border-color: var(--um-teal);
          box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
          background: var(--um-white);
        }
        .um-pw-btn {
          position: absolute; right: 13px;
          background: none; border: none; cursor: pointer;
          color: var(--um-text-3); display: flex; align-items: center; padding: 4px;
          transition: color .15s;
        }
        .um-pw-btn:hover { color: var(--um-text-2); }

        .um-forgot-link {
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px; color: var(--um-teal);
          padding: 0; transition: color .15s;
        }
        .um-forgot-link:hover { color: var(--um-teal-dark); text-decoration: underline; }

        .um-error {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 14px;
          background: var(--um-red-bg); border: 1px solid var(--um-red-border);
          border-radius: 9px; font-size: 13px; color: var(--um-red);
          animation: um-shake .3s ease;
        }

        .um-divider-row {
          display: flex; align-items: center; gap: 12px;
        }
        .um-divider-row::before, .um-divider-row::after {
          content: ''; flex: 1; height: 1px; background: var(--um-border);
        }
        .um-divider-txt { font-size: 12px; color: var(--um-text-3); font-weight: 500; }

        .um-mode-switch {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 12px 16px;
          border-top: 1px solid var(--um-border);
          margin-top: 0; /* removed auto so footer is not pushed off-screen */
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(6px);
          /* Keep footer visible when the form scrolls (sticky inside viewport)
             so the submit/action buttons remain accessible on mobile keyboard */
          position: sticky;
          bottom: env(safe-area-inset-bottom, 0);
          z-index: 30;
        }
        .um-mode-switch span { font-size: 13.5px; color: var(--um-text-2); }
        .um-mode-switch-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13.5px;
          color: var(--um-teal); font-weight: 600; padding: 0;
          transition: color .15s;
        }
        .um-mode-switch-btn:hover { color: var(--um-teal-dark); text-decoration: underline; }

        .um-success-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: um-fade-in .2s ease;
        }
        .um-success-card {
          background: var(--um-white); border-radius: 18px;
          padding: 40px 28px; text-align: center;
          max-width: 300px; width: 100%;
          animation: um-pop .4s cubic-bezier(.34,1.4,.64,1) both;
        }
        .um-success-check {
          width: 68px; height: 68px; border-radius: 50%;
          background: var(--um-teal);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          animation: um-check-pop .4s cubic-bezier(.34,1.5,.64,1) both;
        }
        .um-success-title { font-size: 20px; font-weight: 700; color: var(--um-text); margin: 0 0 8px; }
        .um-success-sub { font-size: 14px; color: var(--um-text-2); margin: 0; }

        .um-anim-pop { animation: um-pop .45s cubic-bezier(.34,1.4,.64,1) both; }
        .um-desktop-overlay {
          position: fixed; inset: 0; z-index: 10002;
          background: rgba(10,20,40,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .um-desktop-card {
          width: 100%; max-width: 900px; min-height: 560px;
          display: flex; border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          max-height: calc(100vh - 48px);
          overflow: hidden;
        }
        .um-desktop-left {
          flex: 0 0 360px;
          background: var(--um-teal);
          padding: 44px 36px;
          display: flex; flex-direction: column;
          color: white;
        }
        .um-dl-logo-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
        }
        .um-dl-logo-img { width: 28px; height: 28px; object-fit: contain; display: block; border-radius: 8px; }
        .um-dl-wordmark { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 8px; }
        .um-dl-tagline { font-size: 22px; font-weight: 700; line-height: 1.25; margin: 0 0 14px; letter-spacing: -0.3px; }
        .um-dl-desc { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 32px; line-height: 1.65; }
        .um-dl-features { display: flex; flex-direction: column; gap: 14px; flex: 1; }
        .um-dl-feat { display: flex; align-items: center; gap: 12px; font-size: 13.5px; color: rgba(255,255,255,0.88); }
        .um-dl-feat-dot {
          width: 22px; height: 22px; flex-shrink: 0;
          background: rgba(255,255,255,0.18); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .um-dl-foot { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; padding-top: 24px; }
        .um-desktop-right {
          flex: 1; background: var(--um-white);
          padding: 44px 44px 36px;
          display: flex; flex-direction: column;
          font-family: 'Inter', sans-serif;
          overflow: auto;
        }
        .um-dr-tabs {
          display: flex; gap: 0; margin-bottom: 32px;
          border-bottom: 1.5px solid var(--um-border);
        }
        .um-dr-tab {
          flex: 1; height: 40px;
          background: none; border: none; border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px; font-weight: 500;
          color: var(--um-text-3); cursor: pointer;
          position: relative; transition: color .15s;
        }
        .um-dr-tab:hover { color: var(--um-text); }
        .um-dr-tab.active { color: var(--um-teal); font-weight: 700; }
        .um-dr-tab.active::after {
          content: ''; position: absolute;
          bottom: -1.5px; left: 0; right: 0; height: 2.5px;
          background: var(--um-teal); border-radius: 2px;
        }
        .um-dr-form { display: flex; flex-direction: column; gap: 16px; flex: 1; }

        .um-desktop-left .um-float-icon {
          color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </>
  );

  return ReactDOM.createPortal(authContent, document.body);
}
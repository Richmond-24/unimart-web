"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import SplashScreen from "./SplashScreen";
import AuthFlow from "../AuthFlow";

const AuthFlowComponent = AuthFlow as React.ComponentType<{ onDone: () => void }>;

export default function AppInitializer() {
  const router = useRouter();
  const { isLoading, isAuthenticated, token } = useAuth();
  const [stage, setStage] = useState<'splash' | 'auth' | 'ready'>('splash');
  const [splashFinished, setSplashFinished] = useState(false);

  // Decide app stage based on auth state and splash finished state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isLoading && splashFinished) {
      if (isAuthenticated && token) {
        setStage('ready');
      } else {
        setStage('auth');
      }
    }
  }, [isLoading, splashFinished, isAuthenticated, token]);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-app-stage', stage);
    return () => el.removeAttribute('data-app-stage');
  }, [stage]);

  // Listen for global auth changes (dispatched by AuthFlow after login/signup OR by logout)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      try {
        // Check actual auth state from localStorage to determine correct stage
        const hasToken = !!localStorage.getItem('unimart:token');
        if (hasToken) {
          setStage('ready');
        } else {
          // Logged out — go back to auth screen
          setStage('auth');
        }
      } catch (e) {
        console.warn('AppInitializer authChanged handler error', e);
      }
    };
    window.addEventListener('unimart:authChanged', handler);
    return () => window.removeEventListener('unimart:authChanged', handler);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeout: number | null = null;

    function doSetOffsets() {
      try {
        const doc = document.documentElement;
        const header = document.querySelector('header[data-unimart-header]') || document.querySelector('header');
        const footer = document.querySelector('nav[role="site-footer"]') || document.querySelector('nav[data-unimart-footer]') || document.querySelector('nav');
        const h = header ? Math.ceil((header as HTMLElement).offsetHeight) : 96;
        const f = footer ? Math.ceil((footer as HTMLElement).offsetHeight) : 92;
        doc.style.setProperty('--header-height', `${h}px`);
        doc.style.setProperty('--footer-height', `${f}px`);
      } catch (e) {
        // ignore
      }
    }

    function setOffsetsDebounced() {
      if (timeout) window.clearTimeout(timeout as any);
      timeout = window.setTimeout(() => {
        doSetOffsets();
        timeout = null;
      }, 100) as unknown as number;
    }

    setOffsetsDebounced();
    doSetOffsets();

    window.addEventListener('resize', setOffsetsDebounced);
    window.addEventListener('orientationchange', setOffsetsDebounced);

    const observer = new MutationObserver(setOffsetsDebounced);
    const headerEl = document.querySelector('header[data-unimart-header]') || document.querySelector('header');
    const footerEl = document.querySelector('nav[role="site-footer"]') || document.querySelector('nav[data-unimart-footer]') || document.querySelector('nav');
    if (headerEl) observer.observe(headerEl, { attributes: true, childList: true, subtree: true });
    if (footerEl) observer.observe(footerEl, { attributes: true, childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', setOffsetsDebounced);
      window.removeEventListener('orientationchange', setOffsetsDebounced);
      if (timeout) window.clearTimeout(timeout as any);
      observer.disconnect();
    };
  }, []);

  // Show nothing while checking auth or while in auth/splash flow
  if (stage !== 'ready') {
    return (
      <div
        className={`fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden transition-colors duration-300 ${stage === 'splash' ? 'bg-[#111b21]' : 'bg-white'
          }`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
      >
        {stage === 'splash' && (
          <SplashScreen onFinish={() => setSplashFinished(true)} />
        )}

        {stage === 'auth' && (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <AuthFlowComponent onDone={(role?: 'buyer' | 'seller' | 'guest') => {
              try {
                if (role === 'seller') router.replace('/seller/dashboard');
                else router.replace('/');
              } catch (e) {
                console.warn('Navigation error:', e);
              }
              setStage('ready');
            }} />
          </div>
        )}
      </div>
    );
  }

  // When ready, render nothing and let main content show
  return null;
}

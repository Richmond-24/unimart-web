"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function RiriButton() {
  const pathname = usePathname();

  // Show only on home page
  if (pathname !== '/') return null;

  const openRiri = () => {
    try {
      window.dispatchEvent(new CustomEvent('unimart:openRiri', { detail: {} }));
    } catch (e) {
      // fallback for older browsers
      const ev = document.createEvent('CustomEvent');
      // @ts-ignore
      ev.initCustomEvent('unimart:openRiri', true, true, {});
      window.dispatchEvent(ev);
    }
  };

  return (
    <button
      onClick={openRiri}
      aria-label="Open RIRI assistant"
      className="fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full bg-teal-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transform transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

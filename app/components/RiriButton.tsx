"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Combined floating action button.
 *
 * • On the home page  → shows the Riri AI assistant icon.
 * • On all other pages → shows the Messages / Chat icon that links to /chat.
 *
 * This removes the previous duplication where both <RiriButton> and
 * <ChatButton> were rendered at the same time in layout.tsx.
 */
export default function UnimartFAB() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  // Track unread message count for the chat icon badge
  useEffect(() => {
    const onCount = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUnreadCount(Number(detail?.count || 0));
    };
    window.addEventListener('unimart:messageCount', onCount as EventListener);
    return () => window.removeEventListener('unimart:messageCount', onCount as EventListener);
  }, []);

  const isHome = pathname === '/';

  if (isHome) {
    // Riri AI assistant button
    const openRiri = () => {
      try {
        window.dispatchEvent(new CustomEvent('unimart:openRiri', { detail: {} }));
      } catch (e) {
        const ev = document.createEvent('CustomEvent');
        // @ts-ignore
        ev.initCustomEvent('unimart:openRiri', true, true, {});
        window.dispatchEvent(ev);
      }
    };

    return (
      <button
        id="riri-fab"
        onClick={openRiri}
        aria-label="Open RIRI AI assistant"
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transform transition"
        style={{ boxShadow: '0 4px 20px rgba(13,148,136,0.45)' }}
      >
        {/* Riri chat bubble SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  // Chat inbox button (all other pages)
  return (
    <Link
      id="chat-fab"
      href="/chat"
      aria-label="Open messages"
      className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition"
      style={{ boxShadow: '0 4px 20px rgba(13,148,136,0.45)' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

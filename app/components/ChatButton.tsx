"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatDrawer from './ChatDrawer';

export default function ChatButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        className={`fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition ${className || ''}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <ChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

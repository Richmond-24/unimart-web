"use client";

import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Copy } from "lucide-react";

type Props = {
  listing?: any;
  open: boolean;
  onClose: () => void;
  onShare?: (text: string) => void;
};

export default function ShareModal({ listing, open, onClose, onShare }: Props) {
  if (!open) return null;

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = listing?.title || 'Uni-Mart product';
  const image = listing?.imageUrls?.[0] || '';

  const [caption, setCaption] = useState('');

  const buildShareText = (extra?: string) => {
    const parts = [] as string[];
    if (caption && caption.trim()) parts.push(caption.trim());
    if (title) parts.push(title);
    if (url) parts.push(url);
    if (extra) parts.push(extra);
    return parts.join('\n\n');
  };

  const items = [
    { name: 'Facebook', icon: FaFacebook, url: (text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}` },
    { name: 'Twitter', icon: FaTwitter, url: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
    { name: 'WhatsApp', icon: FaWhatsapp, url: (text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}` },
    { name: 'LinkedIn', icon: FaLinkedin, url: (text: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}` },
    { name: 'Instagram', icon: FaInstagram, url: (_: string) => 'https://www.instagram.com/' },
  ];

  const handleShareOpen = (u: string) => {
    try { window.open(u, '_blank', 'width=600,height=500'); } catch (e) { console.debug(e); }
  };

  const handleCopy = async () => {
    const text = buildShareText();
    try { await navigator.clipboard.writeText(text); alert('Link + caption copied to clipboard'); if (onShare) onShare(text); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Link + caption copied to clipboard');
      if (onShare) onShare(text);
    }
  };

  const handleDeviceShare = async () => {
    const text = buildShareText();
    try {
      if (navigator && (navigator as any).share) {
        await (navigator as any).share({ title, text, url });
        if (onShare) onShare(text);
        onClose();
        return;
      }
    } catch (e) {
      console.debug('Device share failed', e);
    }
    // Fallback: copy to clipboard
    await handleCopy();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {image ? <img src={image} className="w-full h-full object-cover" alt={title} /> : <div className="text-sm text-gray-500">No image</div>}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 truncate">Share</div>
            <div className="text-sm text-gray-500 truncate">{title}</div>
          </div>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-500">Add a caption (optional)</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a short message to include with the share"
            rows={3}
            maxLength={280}
            className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="text-xs text-gray-400 text-right mt-1">{caption.length}/280</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {items.map((it) => {
            const Icon = it.icon as any;
            const text = buildShareText();
            const urlToOpen = typeof it.url === 'function' ? it.url(text) : it.url;
            return (
              <button key={it.name} onClick={() => handleShareOpen(urlToOpen)} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Icon className="w-6 h-6 text-gray-700" />
                <div className="text-xs text-gray-600 mt-1">{it.name}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={handleDeviceShare} className="flex-1 py-2 rounded-lg bg-teal-600 text-white flex items-center justify-center gap-2">Share</button>
          <button onClick={handleCopy} className="py-2 px-3 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm">Copy</button>
        </div>
      </div>
    </div>
  );
}

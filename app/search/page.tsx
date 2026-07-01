"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';

export default function SearchPage() {
  const [category, setCategory] = useState<string>('all');
  const [q, setQ] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // populate category/q from current URL on client
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCategory(params.get('category') || 'all');
      setQ(params.get('q') || '');
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // If a free-text query is provided, use the dedicated search endpoint
        if (q && q.trim().length > 0) {
          const res = await apiFetch(`/public/search?q=${encodeURIComponent(q.trim())}`);
          if (mounted && res && res.data) { setItems(res.data); }
          return;
        }

        // Map known category keywords to specific public endpoints
        if (category && category !== 'all') {
          const decoded = decodeURIComponent(category || '');
          const key = (decoded || '').toLowerCase();

          // mapping: fashion & deals -> flash-deals, grocery/food -> food, electronics/tech -> tech-gadgets
          const mapping: Record<string, string> = {
            'fashion': '/public/flash-deals',
            'deals': '/public/flash-deals',
            'flash-deals': '/public/flash-deals',
            'flash deals': '/public/flash-deals',
            'services': '/public/services',
            'service': '/public/services',
            'second hand': '/public/second-hand',
            'second-hand': '/public/second-hand',
            'grocery': '/public/food',
            'groceries': '/public/food',
            'food': '/public/food',
            'electronics': '/public/tech-gadgets',
            'electronic': '/public/tech-gadgets',
            'tech gadgets': '/public/tech-gadgets',
            'tech-gadgets': '/public/tech-gadgets'
          };

          if (mapping[key]) {
            const res = await apiFetch(mapping[key]);
            if (mounted && res && res.data) setItems(res.data);
          } else {
            // Fallback: call generic category route (backend will decode spaces)
            const path = `/public/categories/${encodeURIComponent(decoded)}`;
            const res = await apiFetch(path);
            if (mounted && res && res.data) setItems(res.data);
          }
        } else {
          const res = await apiFetch('/public/listings');
          if (mounted && res && res.data) setItems(res.data);
        }
      } catch (err) {
        console.error('Error fetching listings', err);
        // surface user-friendly message
        // (we keep console.error for debugging but still avoid crash)
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [category, q]);

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => history.back()} aria-label="Back" className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-semibold">Search{category && category !== 'all' ? ` • ${category}` : ''}{q ? ` • ${q}` : ''}</h1>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {new Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
              <div className="w-full h-40 bg-slate-100 rounded-md mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14">
          <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="12" width="144" height="104" rx="12" fill="#F8FAFC" stroke="#E6EEF0"/>
            <path d="M40 80c8-10 20-12 32-8 12 4 22 2 34-8" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="56" cy="48" r="10" fill="#E2E8F0" />
            <path d="M104 46l-14 14" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
            <path d="M104 60l-14-14" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <h2 className="text-xl font-semibold mt-6">No results found</h2>
          <p className="text-sm text-gray-500 mt-2">We couldn't find anything matching your search. Try different keywords.</p>
          <div className="mt-4">
            <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm hover:bg-gray-50">← Back to home</a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {items.map((p) => {
          const lid = p._id || p.id;
          let avg: number | null = null;
          try {
            const raw = localStorage.getItem(`unimart:comments:${lid}`);
            if (raw) {
              const list = JSON.parse(raw) as any[];
              if (list.length) avg = list.reduce((s, c) => s + (c.rating || 0), 0) / list.length;
            }
          } catch (e) { avg = null; }

          return (
            <Link key={lid} href={`/listings/${lid}`} className="block">
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="w-full h-40 bg-slate-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                  {p.imageUrls && p.imageUrls.length ? (
                    <img src={p.imageUrls[0]} alt={p.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-slate-400">No image</div>
                  )}
                </div>
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-teal-700 font-semibold mt-1">{p.price ? `₵${p.price}` : '—'}</div>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`${i < Math.round(avg || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 ml-1">{avg ? avg.toFixed(1) : '—'}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

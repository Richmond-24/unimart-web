"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Link from 'next/link';

export default function SecondHandDeals() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ FIXED: Removed duplicate /api
        const endpoint = '/public/second-hand';
        console.log(`📡 [SecondHandDeals] Fetching from: ${endpoint}`);
        
        const res = await apiFetch(endpoint, { suppressErrorLog: false });
        
        if (mounted && res) {
          console.log('✅ [SecondHandDeals] Response:', res);
          
          // Handle different response structures
          let data = [];
          if (res.success && Array.isArray(res.data)) {
            data = res.data;
          } else if (Array.isArray(res)) {
            data = res;
          } else if (res.data && Array.isArray(res.data)) {
            data = res.data;
          } else if (res.items && Array.isArray(res.items)) {
            data = res.items;
          } else {
            data = [];
          }
          
          setItems(data);
          console.log(`✅ [SecondHandDeals] Loaded ${data.length} items`);
        }
      } catch (err: any) {
        console.error('❌ [SecondHandDeals] Error:', err);
        setError(err.message || 'Failed to load second-hand items');
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  // Error state
  if (error) {
    return (
      <section className="py-6 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load second-hand items: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Second-hand Picks</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Sustainably sourced</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-6">
          {loading && new Array(6).fill(0).map((_,i)=>(
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-xl mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              No second-hand items found.
            </div>
          )}

          {items.map((p:any) => {
            const lid = p._id || p.id;
            let avg: number | null = null;
            try {
              if (typeof window !== 'undefined') {
                const raw = localStorage.getItem(`unimart:comments:${lid}`);
                if (raw) {
                  const list = JSON.parse(raw) as any[];
                  if (list.length) avg = list.reduce((s, c) => s + (c.rating || 0), 0) / list.length;
                }
              }
            } catch (e) { avg = null; }

            return (
              <Link key={lid} href={`/listings/${lid}`} className="block group">
                <div className="flex flex-col">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm">
                    {p.imageUrls?.length ? (
                      <img 
                        src={p.imageUrls[0]} 
                        alt={p.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f1f5f9"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                    )}
                    <div className="absolute top-2 left-2 text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">Pre-loved</div>
                  </div>
                  <div className="px-0.5">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                        {p.sellerName || p.seller || 'Campus Seller'}
                      </p>
                      {avg !== null && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-[12px] font-medium text-slate-700">{avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mb-1">{p.title || 'Untitled'}</p>
                    <p className="text-[15px] font-bold" style={{ color: 'var(--temu-orange)' }}>
                      ₵{p.price ?? '—'}
                      {p.originalPrice && <span className="text-slate-400 line-through ml-1.5 text-[12px] font-normal">₵{p.originalPrice}</span>}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* See all button */}
        <div className="mt-6 flex justify-center">
          <Link 
            href="/search?category=second-hand" 
            className="px-6 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            See all Second-hand →
          </Link>
        </div>
      </div>
    </section>
  );
}
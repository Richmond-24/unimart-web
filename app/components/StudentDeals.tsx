"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';

export default function StudentDeals() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // ✅ FIXED: Added /api prefix
        const endpoint = "/api/public/services";
        console.log(`📡 [StudentDeals] Fetching from: ${endpoint}`);
        
        const res = await apiFetch(endpoint, { suppressErrorLog: true });
        
        if (mounted && res && res.data) {
          setItems(res.data);
          console.log(`✅ [StudentDeals] Loaded ${res.data.length} items`);
        } else if (mounted && res && Array.isArray(res)) {
          setItems(res);
          console.log(`✅ [StudentDeals] Loaded ${res.length} items`);
        } else {
          console.log('ℹ️ [StudentDeals] No data received, using fallback');
          setItems([]);
        }
      } catch (err) {
        console.error('Error loading student services', err);
        setLoadError('Failed to load student deals');
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Student Deals</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Verified student savings</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-3 gap-y-6">
          {/* Skeleton */}
          {loading && new Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-xl mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}

          {/* Error state */}
          {!loading && loadError && (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">{loadError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !loadError && items.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              No student deals found.
            </div>
          )}

          {items.map((p: any) => {
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
        {items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Link 
              href="/category/student-deals" 
              className="px-6 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              See all Student Deals →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
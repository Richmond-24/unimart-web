
"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';

export default function StudentDeals() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/public/services');
        if (mounted && res && res.data) setItems(res.data);
      } catch (err) {
        console.error('Error loading student services', err);
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
            <Link href={`/search?category=${encodeURIComponent('Services')}`} className="text-sm text-teal-700 hover:underline">See all</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {/* Skeleton */}
          {loading && new Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
              <div className="w-full h-28 bg-slate-100 rounded-md mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="text-sm text-slate-500">No student deals found.</div>
          )}

          {/* Deals - without rating stars */}
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
              <Link key={lid} href={`/listings/${lid}`} className="block">
                <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col hover:shadow-md transition h-full overflow-hidden">
                  {/* Image */}
                  <div className="w-full h-28 bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    {p.imageUrls && p.imageUrls.length ? (
                      <img src={p.imageUrls[0]} alt={p.title} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-slate-400 text-sm">No image</div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-sm font-medium truncate break-words">
                    {p.title}
                  </div>

                  {/* Price */}
                  <div className="text-teal-700 font-semibold mt-2">
                    {p.price ? `₵${p.price}` : '—'}
                  </div>

                  {/* Spacer to push seller section down */}
                  <div className="flex-1" />

                  {/* Seller info (avatar + name + rating) - balanced structure */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      {p.sellerImage ? (
                        <img src={p.sellerImage} alt={p.sellerName || 'Seller'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
                          {(p.sellerName || 'S').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-600 truncate">{p.sellerName || p.seller || 'Campus Seller'}</div>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex items-center text-yellow-400 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`${i < Math.round(avg || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 ml-1">{avg ? avg.toFixed(1) : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
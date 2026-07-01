
"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';

export default function FashionDeals() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/public/listings?category=Fashion');
        if (mounted && res && res.data) setItems(res.data);
      } catch (err) {
        console.error('Error loading fashion listings', err);
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
          <h2 className="text-xl font-semibold">Fashion Picks</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">Trendy & affordable</span>
            <Link href={`/search?category=${encodeURIComponent('Fashion')}`} className="text-sm text-teal-700 hover:underline">See all</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Skeleton */}
          {loading && new Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
              <div className="w-full h-40 bg-slate-100 rounded-md mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="text-sm text-slate-500">No fashion items found.</div>
          )}

          {/* Fashion items with rating moved below seller name */}
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
                <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition flex flex-col h-full overflow-hidden">
                  {/* Image */}
                  <div className="w-full h-40 bg-slate-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
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
                  <div className="text-teal-700 font-semibold mt-1">
                    {p.price ? `₵${p.price}` : '—'}
                  </div>

                  {/* Spacer to push seller/rating down */}
                  <div className="flex-1" />

                  {/* Seller row: avatar + name */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      {p.sellerImage ? (
                        <img src={p.sellerImage} alt={p.sellerName || 'Seller'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
                          {(p.sellerName || 'S').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 truncate flex-1">
                      {p.sellerName || p.seller || 'Campus Seller'}
                    </div>
                  </div>

                  {/* Rating row (moved below seller name) */}
                  <div className="mt-2 flex items-center gap-1">
                    <div className="flex items-center text-yellow-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`${i < Math.round(avg || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 ml-1">
                      {avg ? avg.toFixed(1) : '—'}
                    </span>
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
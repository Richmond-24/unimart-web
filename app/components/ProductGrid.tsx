
"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";
import Link from "next/link";

export default function ProductGrid(props: { horizontal?: boolean } = {}) {
  const { horizontal } = props;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/public/trending");
          if (mounted && res?.data) setProducts(res.data);
          setLoadError(null);
      } catch (err) {
          // show friendly inline error instead of noisy console exception
          setLoadError("Unable to load trending products. Check backend or network.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold mb-4">Trending near you</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Skeleton */}
        {loading && products.length === 0 &&
          new Array(8).fill(0).map((_, i) => (
            <div key={i} className="market-card animate-pulse p-3">
              <div className="w-full h-40 bg-slate-100 rounded-3xl mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}

        {/* Empty / Error */}
        {!loading && products.length === 0 && (
          <div className="text-sm text-slate-500">
            {loadError || 'No trending products found.'}
          </div>
        )}

        {/* Products */}
        {products.map((p: any) => {
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
            <Link
              key={lid}
              href={`/listings/${lid}`}
              className="block h-full"
            >
              <div className="market-card p-3 flex flex-col h-full overflow-hidden">
                {/* Image */}
                <div className="w-full aspect-[4/3] bg-slate-100 rounded-3xl mb-3 overflow-hidden flex items-center justify-center">
                {p.imageUrls?.length ? (
                  <img
                    src={p.imageUrls[0]}
                    alt={p.title || "Product"}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-slate-400 text-sm">No image</div>
                )}
              </div>

              {/* Title */}
              <div className="text-sm font-semibold leading-snug text-slate-900 break-words mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.title || "Untitled"}
              </div>

              {/* Price */}
              <div className="text-teal-700 font-bold text-base mb-3">
                {p.price ? `₵${p.price}` : "—"}
              </div>

              <div className="flex-1" />

              {/* Seller info + rating */}
              <div className="mt-3 flex items-start gap-2">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                  {p.sellerImage ? (
                    <img
                      src={p.sellerImage}
                      alt={p.sellerName || "Seller"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-semibold">
                      {(p.sellerName || "S")
                        .split(" ")
                        .map((s: string) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>

                {/* Seller name */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-700 truncate break-words">
                    {p.sellerName || p.seller || "Campus Seller"}
                  </div>

                  {/* Rating (kept inside card; will wrap on small screens) */}
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
    </section>
  );
}
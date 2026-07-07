
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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6">
        {/* Skeleton */}
        {loading && products.length === 0 &&
          new Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
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
              className="block group"
            >

              {/* Airbnb-style card: no box shadow on container, just clean image + text */}
              <div className="flex flex-col">
                {/* Square image — same rounded-xl style as CampusTrending */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm">
                  {p.imageUrls?.length ? (
                    <img
                      src={p.imageUrls[0]}
                      alt={p.title || "Product"}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                  )}
                </div>

                {/* Info below image */}
                <div className="px-0.5">
                  {/* Top row: seller name + rating */}
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                      {p.sellerName || p.seller || "Campus Seller"}
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
                  

                  {/* Product title */}
                  <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mb-1">
                    {p.title || "Untitled"}
                  </p>

                  {/* Price — orange, larger */}
                  <p className="text-[15px] font-bold" style={{ color: "var(--temu-orange)" }}>
                    ₵{p.price ?? "—"}
                    {p.originalPrice && (
                      <span className="text-slate-400 line-through ml-1.5 text-[12px] font-normal">₵{p.originalPrice}</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

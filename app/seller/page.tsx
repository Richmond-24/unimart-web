"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";

type Seller = {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  salesCount?: number;
  bio?: string;
  university?: string;
  hall?: string;
};

// Ring treatment by rank: #1 gets the gold ring, #2-3 get the teal ring,
// everyone else gets a quiet slate ring. Order communicates rank, so the
// ring is doing the same job a medal does — no numbers needed.
function ringClasses(rank: number) {
  if (rank === 0) {
    return "bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500";
  }
  if (rank <= 2) {
    return "bg-gradient-to-tr from-teal-400 to-teal-600";
  }
  return "bg-slate-200";
}

export default function SellerIndex() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadSellers = async () => {
      setLoading(true);
      setError(null);
      try {
        let res: any = await apiFetch('/top-sellers').catch(() => null);
        if (!res || (!Array.isArray(res) && !Array.isArray(res.data))) {
          res = await apiFetch('/sellers').catch(() => null);
        }
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (!mounted) return;
        const mapped = data.map((seller: any, idx: number) => ({
          id: seller._id || seller.id || String(idx),
          name: seller.user?.name || seller.name || `Seller ${idx + 1}`,
          avatar: seller.user?.avatar || seller.avatar,
          rating: seller.rating || seller.user?.rating || 0,
          salesCount: seller.salesCount || seller.sales || seller.totalSales || 0,
          bio: seller.bio || seller.description || seller.user?.bio,
          university: seller.user?.university,
          hall: seller.user?.hall,
        }));
        // Highest rated first — the horizontal order below is the ranking.
        mapped.sort((a: Seller, b: Seller) => (b.rating || 0) - (a.rating || 0));
        setSellers(mapped);
      } catch (err) {
        console.error('Failed to load sellers', err);
        if (mounted) setError('Unable to load top sellers. Please try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSellers();
    return () => { mounted = false; };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">Top Sellers</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Explore the best campus sellers</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Ranked highest-rated first. Scroll to see everyone.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50">
            Back
          </Link>
        </div>

        <div className="relative">
          {/* Edge fades hint that the row scrolls */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-slate-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-slate-50 to-transparent" />

          {/* Desktop scroll arrows */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 -translate-x-3 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-teal-700 sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 translate-x-3 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-teal-700 sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading && new Array(8).fill(null).map((_, idx) => (
              <div key={idx} className="flex w-24 flex-shrink-0 snap-start flex-col items-center gap-2 sm:w-28">
                <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200 sm:h-24 sm:w-24" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-2 w-10 animate-pulse rounded bg-slate-200" />
              </div>
            ))}

            {!loading && error && (
              <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && sellers.length === 0 && (
              <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                No top sellers are available right now.
              </div>
            )}

            {!loading && sellers.map((seller, rank) => (
              <Link
                key={seller.id}
                href={`/seller/${seller.id}`}
                className="group flex w-24 flex-shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-28"
              >
                <div className={`rounded-full p-[3px] transition group-hover:scale-105 ${ringClasses(rank)}`}>
                  <div className="rounded-full bg-slate-50 p-[3px]">
                    <div className="h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full bg-slate-100 sm:h-[5.5rem] sm:w-[5.5rem]">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-teal-100 text-2xl font-bold text-teal-800">
                          {seller.name?.slice(0, 1) || "S"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="w-full truncate text-sm font-semibold text-slate-900 transition group-hover:text-teal-700">
                  {rank === 0 ? "🥇 " : rank === 1 ? "🥈 " : rank === 2 ? "🥉 " : ""}{seller.name}
                </p>
                <p className="text-xs text-slate-500">{seller.rating?.toFixed(1) ?? '0.0'} ★ · {seller.salesCount ?? 0} sold</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
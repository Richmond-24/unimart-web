"use client";

import React, { useEffect, useState } from "react";
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

export default function SellerIndex() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">Top Sellers</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Explore the best campus sellers</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Discover top-rated sellers with active listings, trusted reviews, and fast campus delivery.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50">
            Back
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && new Array(6).fill(null).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-32 rounded-3xl bg-slate-200" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-200" />
              </div>
            </div>
          ))}

          {!loading && error && (
            <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && sellers.length === 0 && (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No top sellers are available right now.
            </div>
          )}

          {!loading && sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/seller/${seller.id}`}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-100">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-teal-100 text-xl font-bold text-teal-800">
                      {seller.name?.slice(0, 1) || "S"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-slate-900 transition group-hover:text-teal-700">{seller.name}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{seller.bio || 'Campus seller with active listings'}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {seller.university && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{seller.university}</span>}
                {seller.hall && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{seller.hall}</span>}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{seller.rating?.toFixed(1) ?? '0.0'} ★</span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">{seller.salesCount ?? 0} sales</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

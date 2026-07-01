"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiFetch from "../../../lib/apiClient";

type SellerDetail = {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  salesCount?: number;
  bio?: string;
  university?: string;
  hall?: string;
  email?: string;
  products?: Array<{ _id: string; title?: string; price?: number; imageUrls?: string[]; }>; 
};

export default function SellerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadSeller = async () => {
      setLoading(true);
      setError(null);
      try {
        const res: any = await apiFetch(`/sellers/${id}`);
        const data = res?.data || null;
        if (!mounted) return;
        if (!data) {
          setError('Seller not found.');
          setSeller(null);
          return;
        }

        const mapped: SellerDetail = {
          id: data._id || data.id || id,
          name: data.user?.name || data.name || 'Top Seller',
          avatar: data.user?.avatar || data.avatar,
          rating: data.rating || data.user?.rating || 0,
          salesCount: data.products?.length || data.salesCount || 0,
          bio: data.bio || data.description || data.user?.bio,
          university: data.user?.university,
          hall: data.user?.hall,
          email: data.user?.email || data.email,
          products: Array.isArray(data.products) ? data.products.map((item: any) => ({
            _id: item._id || item.id,
            title: item.title || item.name || item.productName,
            price: item.price,
            imageUrls: item.imageUrls || (item.images ? [item.images[0]] : undefined),
          })) : [],
        };
        setSeller(mapped);
      } catch (err: any) {
        console.error('Failed to load seller', err);
        if (!mounted) return;
        setError(err?.message || 'Unable to load seller details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSeller();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-48 rounded-3xl bg-slate-100" />
          <div className="mt-6 flex flex-col gap-4">
            <div className="h-6 w-2/5 rounded bg-slate-100" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-40 rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Seller not found</h1>
          <p className="mt-3 text-sm text-slate-600">{error || 'We could not find this seller.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => router.back()} className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
              Go back
            </button>
            <Link href="/seller" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Browse sellers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-3xl bg-slate-100">
                {seller.avatar ? (
                  <img src={seller.avatar} alt={seller.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-teal-100 text-3xl font-bold text-teal-800">{seller.name?.slice(0, 1) || 'S'}</div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-600">Top Seller</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">{seller.name}</h1>
                <p className="mt-2 text-sm text-slate-600">{seller.bio || 'Trusted campus seller with active product listings.'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Rating</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{seller.rating?.toFixed(1) ?? '0.0'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sales</p>
                <p className="mt-3 text-2xl font-semibold text-orange-600">{seller.salesCount ?? 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Location</p>
                <p className="mt-3 text-base font-medium text-slate-900">{seller.university || 'Campus'}{seller.hall ? ` · ${seller.hall}` : ''}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/seller" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Back to sellers
            </Link>
            <a href={seller.email ? `mailto:${seller.email}?subject=Inquiry%20about%20${encodeURIComponent(seller.name)}` : '#'} className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
              Contact seller
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Active listings</h2>
              <p className="mt-1 text-sm text-slate-500">Products currently sold by this seller.</p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">{seller.products?.length ?? 0} items</span>
          </div>

          {seller.products && seller.products.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {seller.products.map((product) => (
                <Link key={product._id} href={`/listings/${product._id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-48 overflow-hidden bg-slate-100">
                    {product.imageUrls?.[0] ? (
                      <img src={product.imageUrls[0]} alt={product.title || 'Product'} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-sm font-semibold text-slate-900">{product.title || 'Untitled product'}</p>
                    <p className="text-sm text-slate-500">{product.price != null ? <span className="text-orange-600 font-semibold">₵{product.price}</span> : 'Price unavailable'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No active listings found for this seller.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

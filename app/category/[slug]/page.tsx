"use client";

import React, { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiFetch from "../../../lib/apiClient";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug || 'all').toString();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(slug);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('CategoryPage load ->', { slug });
      }
      setLoading(true);
      try {
        const key = slug.toLowerCase();
        const mapping: Record<string, string> = {
          'deals': '/public/flash-deals',
          'flash-deals': '/public/flash-deals',
          'flash deals': '/public/flash-deals',
          'grocery': '/public/food',
          'groceries': '/public/food',
          'food': '/public/food',
          'electronics': '/public/tech-gadgets',
          'tech': '/public/tech-gadgets',
          'tech-gadgets': '/public/tech-gadgets'
        };

        if (key === 'all') {
          const endpoint = '/public/listings';
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('CategoryPage endpoint ->', { endpoint });
          }
          const res = await apiFetch(endpoint);
          if (mounted && res && res.data) setItems(res.data);
          setTitle('All products');
          return;
        }

        if (mapping[key]) {
          const endpoint = mapping[key];
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('CategoryPage mapping used ->', { key, endpoint });
          }
          const res = await apiFetch(endpoint);
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug('CategoryPage fetched ->', { endpoint, itemsCount: Array.isArray(res?.data) ? res.data.length : undefined, raw: res });
          }
          if (mounted && res && res.data) setItems(res.data);
          setTitle(slug.replace(/-/g, ' '));
          return;
        }

        // Fallback to generic category endpoint (backend expects decoded category name)
        const endpoint = `/public/categories/${encodeURIComponent(slug)}`;
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.debug('CategoryPage fallback endpoint ->', { endpoint });
        }
        const res = await apiFetch(endpoint);
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.debug('CategoryPage fetched fallback ->', { endpoint, itemsCount: Array.isArray(res?.data) ? res.data.length : undefined, raw: res });
        }
        if (mounted && res && res.data) setItems(res.data);
        setTitle(slug.replace(/-/g, ' '));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching category listings', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [slug]);

  return (
    <div className="py-8">
      <div className="mb-6">\n        <h1 className="text-3xl font-bold text-[#0D9488] mb-2 capitalize">{title}</h1>\n        <div className="h-1 w-20 bg-gradient-to-r from-[#0D9488] to-[#0f766e] rounded-full"></div>\n      </div>
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && items.length === 0 && <div className="text-sm text-slate-500">No products found.</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-6 mt-4">
        {loading && new Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-full aspect-square bg-slate-100 rounded-xl mb-2" />
            <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-slate-100 rounded w-1/2 mb-1.5" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
        {items.map((p) => {
          const lid = p._id || p.id;
          let avg: number | null = null;
          try {
            const raw = localStorage.getItem(`unimart:comments:${lid}`);
            if (raw) {
              const list = JSON.parse(raw) as any[];
              if (list.length) avg = list.reduce((s: number, c: any) => s + (c.rating || 0), 0) / list.length;
            }
          } catch (e) { avg = null; }

          return (
            <Link key={lid} href={`/listings/${lid}`} className="block group">
              <div className="flex flex-col">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm">
                  {p.imageUrls?.length ? (
                    <img src={p.imageUrls[0]} alt={p.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
                  )}
                </div>
                <div className="px-0.5">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                      {(p as any).sellerName || (p as any).seller || 'Campus Seller'}
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
                    ₵{(p as any).price ?? '—'}
                    {(p as any).originalPrice && <span className="text-slate-400 line-through ml-1.5 text-[12px] font-normal">₵{(p as any).originalPrice}</span>}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

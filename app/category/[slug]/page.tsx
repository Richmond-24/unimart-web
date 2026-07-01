"use client";

import React, { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
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
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {!loading && items.length === 0 && <div className="text-sm text-slate-500">No products found.</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {items.map((p) => (
          <div key={p._id || p.id} className="bg-white rounded-lg shadow-sm p-3">
            <div className="w-full h-40 bg-slate-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
              {p.imageUrls && p.imageUrls.length ? (
                <img src={p.imageUrls[0]} alt={p.title} className="object-cover w-full h-full" />
              ) : (
                <div className="text-slate-400">No image</div>
              )}
            </div>
            <div className="text-sm font-medium truncate">{p.title}</div>
            <div className="text-teal-700 font-semibold mt-1">{p.price ? `₵${p.price}` : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

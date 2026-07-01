"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";

type Deal = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  img?: string;
  slug?: string;
  endsAt: number; // timestamp
};
 

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function FlashDeals() {
  const [now, setNow] = useState(Date.now());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // First try to fetch curated featured items from the Home API
        let featuredRes: any = null;
        try {
          featuredRes = await apiFetch('/home/featured');
        } catch (e) {
          featuredRes = null;
        }

        // Then fetch flash-deals (marketplace items)
        let flashRes: any = null;
        try {
          flashRes = await apiFetch('/public/flash-deals');
        } catch (err) {
          // apiFetch already handles fallbacks (env vars, localhost probing, deployed backend)
          flashRes = null;
        }

        if (!mounted) return;

        const featuredItems = Array.isArray(featuredRes) ? featuredRes : (featuredRes && Array.isArray(featuredRes.data) ? featuredRes.data : []);
        const flashItems = Array.isArray(flashRes) ? flashRes : (flashRes && Array.isArray(flashRes.data) ? flashRes.data : []);

        // Merge featured + flash lists, dedupe by _id or id, and map to Deal[]
        const combined = [...(featuredItems || []), ...(flashItems || [])];
        const seen = new Set();
        const unique = [] as any[];
        for (const p of combined) {
          const id = p._id || p.id;
          if (!id) continue;
          if (seen.has(id)) continue;
          seen.add(id);
          unique.push(p);
        }

        if (unique.length > 0) {
          const mapped: Deal[] = unique.map((p: any) => {
            const id = p._id || p.id;
            const title = p.title || p.name || p.productName || 'Untitled';
            const priceVal = p.price ?? p.priceAmount ?? p.productPrice ?? null;
            const price = typeof priceVal === 'number' ? `GH₵${priceVal}` : (p.price ? String(p.price) : 'GH₵0');
            const originalVal = p.originalPrice ?? p.listPrice ?? p.mrp ?? null;
            const originalPrice = typeof originalVal === 'number' ? `GH₵${originalVal}` : (originalVal ? String(originalVal) : undefined);
            const img = (p.images && p.images[0]) || p.image || p.imageUrls?.[0] || undefined;
            const endsAt = (p.flashDealExpiry && new Date(p.flashDealExpiry).getTime()) || (p.expiresAt && new Date(p.expiresAt).getTime()) || (p.flashDeal && p.flashDeal.endsAt && new Date(p.flashDeal.endsAt).getTime()) || (Date.now() + 1000 * 60 * 60);
            const slug = p.slug || p.permalink || p.handle || undefined;
            return { id, title, price, originalPrice, img, endsAt, slug } as any;
          });

          setDeals(mapped as Deal[]);
        }
      } catch (err) {
        // keep sample deals on error
        // eslint-disable-next-line no-console
        console.error('Failed to load flash deals', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  return (
    <section id="flash-deals" className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Flash Deals</h2>
          <Link href="/search?tag=flash" className="text-sm text-teal-600 hover:underline">See all</Link>
        </div>

        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide horizontal-snap">
          {loading && (
            // Show three skeleton cards while loading
            <>
              {[1,2,3].map(s => (
                <div key={s} className="snap-start market-card min-w-[240px] flex-none overflow-hidden animate-pulse">
                  <div className="w-full h-32 bg-gray-100" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && deals.length === 0 && (
            <div className="snap-start market-card min-w-[240px] flex-none p-4">
              <p className="text-sm text-gray-600">No flash deals right now. Check back soon.</p>
            </div>
          )}

          {deals.map(d => {
            const remaining = d.endsAt - now;
            return (
              <div
                key={d.id}
                className="snap-start market-card min-w-[240px] flex-none overflow-hidden block"
              >
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  {d.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Link href={`/listings/${(d as any).slug || d.id}`} className="absolute inset-0 block">
                      <img src={d.img} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
                    </Link>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">No image</div>
                  )}

                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
                    {formatRemaining(remaining)}
                  </div>

                  <div className="absolute top-2 right-2 bg-white/80 rounded-md px-2 py-0.5 text-right">
                    <div className="text-red-600 font-bold">{d.price}</div>
                    {d.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">{d.originalPrice}</div>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium mb-1 text-gray-900">{d.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">Limited time offer — while stocks last</p>
                  <div className="flex gap-2">
                    <Link href={`/listings/${(d as any).slug || d.id}`} className="flex-1 text-center bg-teal-600 text-white text-sm px-3 py-1 rounded-md">Shop</Link>
                    {/* Save button removed per design request */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

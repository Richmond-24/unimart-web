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

// Fallback deals
const FALLBACK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Student Discount Pack',
    price: 'GH₵29.99',
    originalPrice: 'GH₵59.99',
    img: '/images/placeholder.png',
    endsAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours
  },
  {
    id: '2',
    title: 'Tech Gadget Flash Sale',
    price: 'GH₵49.99',
    originalPrice: 'GH₵99.99',
    img: '/images/placeholder.png',
    endsAt: Date.now() + 1000 * 60 * 60 * 5, // 5 hours
  },
  {
    id: '3',
    title: 'Book Bundle Deal',
    price: 'GH₵19.99',
    originalPrice: 'GH₵39.99',
    img: '/images/placeholder.png',
    endsAt: Date.now() + 1000 * 60 * 30, // 30 minutes
  },
];

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
  const [loading, setLoading] = useState<boolean>(true);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Timer for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load deals
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setUsingFallback(false);
      
      try {
        // ✅ FIXED: Added /api prefix to both endpoints
        // First try to fetch flash-deals from the public API
        let flashRes: any = null;
        try {
          flashRes = await apiFetch('/public/flash-deals', { suppressErrorLog: true });
          console.log('📡 [FlashDeals] Flash deals response:', flashRes);
        } catch (err) {
          console.log('ℹ️ [FlashDeals] Flash deals endpoint error:', err);
          flashRes = null;
        }

        if (!mounted) return;

        // Extract flash items
        let flashItems: any[] = [];
        if (flashRes?.data && Array.isArray(flashRes.data)) {
          flashItems = flashRes.data;
        } else if (Array.isArray(flashRes)) {
          flashItems = flashRes;
        }

        // Also try to get featured items as backup
        let featuredItems: any[] = [];
        try {
          const featuredRes = await apiFetch('/home/featured', { suppressErrorLog: true });
          if (featuredRes?.data && Array.isArray(featuredRes.data)) {
            featuredItems = featuredRes.data;
          } else if (Array.isArray(featuredRes)) {
            featuredItems = featuredRes;
          }
        } catch (err) {
          // Featured endpoint error - ignore
        }

        // Combine and dedupe
        const combined = [...flashItems, ...featuredItems];
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
            const title = p.title || p.name || 'Untitled';
            
            // Handle price
            let price = 'GH₵0';
            const priceVal = p.price ?? p.priceAmount ?? p.productPrice ?? null;
            if (typeof priceVal === 'number') {
              price = `GH₵${priceVal}`;
            } else if (priceVal) {
              price = String(priceVal);
            }
            
            // Handle original price
            let originalPrice = undefined;
            const originalVal = p.originalPrice ?? p.listPrice ?? p.mrp ?? null;
            if (typeof originalVal === 'number') {
              originalPrice = `GH₵${originalVal}`;
            } else if (originalVal) {
              originalPrice = String(originalVal);
            }
            
            // Handle image
            const img = (p.images && p.images[0]) || 
                        p.image || 
                        (p.imageUrls && p.imageUrls[0]) || 
                        undefined;
            
            // Handle expiry
            let endsAt = Date.now() + 1000 * 60 * 60 * 2; // Default 2 hours
            if (p.flashDealExpiry) {
              endsAt = new Date(p.flashDealExpiry).getTime();
            } else if (p.expiresAt) {
              endsAt = new Date(p.expiresAt).getTime();
            } else if (p.flashDeal?.endsAt) {
              endsAt = new Date(p.flashDeal.endsAt).getTime();
            } else if (p.discount && p.discount > 0) {
              // If it has a discount but no expiry, set to 24 hours
              endsAt = Date.now() + 1000 * 60 * 60 * 24;
            }
            
            const slug = p.slug || p.permalink || p.handle || id;
            
            return { id, title, price, originalPrice, img, endsAt, slug };
          });

          setDeals(mapped);
          setUsingFallback(false);
          console.log(`✅ [FlashDeals] Loaded ${mapped.length} deals from API`);
        } else {
          // Use fallback deals
          console.log('ℹ️ [FlashDeals] No deals from API, using fallback');
          setUsingFallback(true);
          setDeals(FALLBACK_DEALS);
        }
        
      } catch (err) {
        console.log('ℹ️ [FlashDeals] API error, using fallback deals');
        if (mounted) {
          setUsingFallback(true);
          setDeals(FALLBACK_DEALS);
        }
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
          <h2 className="text-xl font-semibold">⚡ Flash Deals</h2>
          {!loading && deals.length > 0 && (
            <span className="text-sm text-slate-400">
              {usingFallback ? 'Sample deals' : `${deals.length} items`}
            </span>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide horizontal-snap">
          {loading && (
            <>
              {[1,2,3,4].map(s => (
                <div key={s} className="snap-start flex-none w-[160px] animate-pulse">
                  <div className="w-full aspect-square bg-slate-100 rounded-xl mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
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
            const isExpired = remaining <= 0;
            
            return (
              <Link
                key={d.id}
                href={`/listings/${d.slug || d.id}`}
                className="snap-start flex-none w-[160px] block group"
              >
                <div className="flex flex-col">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shadow-sm">
                    {d.img ? (
                      <img 
                        src={d.img} 
                        alt={d.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f1f5f9"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12" font-family="sans-serif"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50">
                        No image
                      </div>
                    )}
                    
                    {/* Countdown Timer Badge */}
                    {!isExpired && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {formatRemaining(remaining)}
                      </div>
                    )}
                    
                    {/* Expired Badge */}
                    {isExpired && (
                      <div className="absolute top-2 left-2 bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        Expired
                      </div>
                    )}
                    
                    {/* Flash Badge */}
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      🔥 FLASH
                    </div>
                  </div>
                  
                  <div className="px-0.5">
                    <p className="text-[12px] text-slate-500 leading-snug line-clamp-1 mb-1">
                      {d.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold" style={{ color: 'var(--temu-orange)' }}>
                        {d.price}
                      </p>
                      {d.originalPrice && (
                        <span className="text-slate-400 line-through text-[12px] font-normal">
                          {d.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* See all button */}
        {deals.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Link 
              href="/search?category=flash-deals" 
              className="px-6 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              See all Flash Deals →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
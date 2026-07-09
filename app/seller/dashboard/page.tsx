
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../lib/apiClient';
import { connectSocket, getSocket } from '../../../lib/socket';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const refreshDebounceRef = useRef<number | null>(null);

  async function refreshStats() {
    if (!user) return;
    try {
      const res = await apiFetch('/sellers/me');
      if (res && res.success) {
        const sp = res.data;
        setSellerProfile(sp);
        setProducts(sp.products || []);
        if (sp.stats) {
          setStats({
            total: sp.stats.totalProducts || 0,
            active: sp.stats.activeProducts || 0,
            pending: (sp.stats.totalProducts || 0) - (sp.stats.activeProducts || 0),
            views: sp.stats.totalViews || 0,
            orders: sp.stats.totalSales || 0,
            revenue: (sp.stats.revenue || 0).toFixed ? (sp.stats.revenue || 0).toFixed(2) : String(sp.stats.revenue || 0),
            conversionRate: sp.stats.totalProducts ? ((sp.stats.totalSales || 0) / Math.max(1, sp.stats.totalProducts) * 100).toFixed(1) : '0.0'
          });
        }
        setLastUpdated(new Date().toISOString());
      }
    } catch (e) {
      console.error('refreshStats error', e);
    }
  }
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('unimart:user') || 'null');
      setUser(u);
      if (!u) router.push('/');
      else if (u.role !== 'seller') router.push('/');
    } catch (e) { router.push('/'); }
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      await refreshStats();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      // connectSocket now retrieves token from localStorage automatically
      const socket = connectSocket();

      const scheduleRefresh = () => {
        try {
          if (refreshDebounceRef.current) window.clearTimeout(refreshDebounceRef.current as any);
        } catch (e) {}
        refreshDebounceRef.current = window.setTimeout(() => {
          refreshStats();
        }, 800) as unknown as number;
      };

      const handler = (product: any) => {
        // quick local update for immediacy
        setProducts((prev: any[]) => [product, ...prev]);
        scheduleRefresh();
      };

      const handlerByEmail = (data: any) => {
        try {
          const email = data?.email;
            if (email && sellerProfile?.user?.email && email.toLowerCase() === sellerProfile.user.email.toLowerCase()) {
            setProducts((prev: any[]) => [data.listing, ...prev]);
            scheduleRefresh();
          }
        } catch (e) { scheduleRefresh(); }
      };

      socket?.on('seller:product_created', handler);
      socket?.on('seller:product_created:by_email', handlerByEmail);
      socket?.on('seller:product_updated', scheduleRefresh);
      socket?.on('order:created', scheduleRefresh);

      return () => {
        try { socket?.off('seller:product_created', handler); } catch (e) {}
        try { socket?.off('seller:product_created:by_email', handlerByEmail); } catch (e) {}
        try { socket?.off('seller:product_updated', scheduleRefresh); } catch (e) {}
        try { socket?.off('order:created', scheduleRefresh); } catch (e) {}
        try { if (refreshDebounceRef.current) window.clearTimeout(refreshDebounceRef.current as any); } catch (e) {}
      };
    } catch (err) {
      // ignore socket errors silently
    }
  }, [user]);

  if (!user) return null;

  const shopInitials = ((sellerProfile && (sellerProfile.shopName || sellerProfile.user?.name)) || user?.shopName || user?.name || 'S')
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // ── LOADING SKELETON ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-teal-700 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 h-24 animate-pulse" />
            ))}
          </div>
          <div className="bg-white rounded-xl p-5 h-28 animate-pulse" />
          <div className="bg-white rounded-xl p-5 h-48 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── STAT CARD ──
  const StatCard = ({
    title, value, subtitle, iconPath, iconPath2, bgColor, iconColor,
  }: {
    title: string; value: string | number; subtitle?: string;
    iconPath: string; iconPath2?: string; bgColor: string; iconColor: string;
  }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: bgColor }}
      >
        <svg className="w-5 h-5" style={{ color: iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} />
          {iconPath2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath2} />}
        </svg>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── FIXED HEADER ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-teal-700 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Left: avatar + titles */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Uni-Mart"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/60 leading-none mb-1">Uni‑Mart</p>
              <h1 className="text-white font-extrabold text-xl sm:text-2xl leading-tight truncate">Sellers Dashboard</h1>
              <p className="text-white/70 text-xs sm:text-sm truncate mt-0.5">
                {sellerProfile?.shopName || user?.shopName || user?.name || 'Your shop'}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => {
                try {
                  const base = process.env.NEXT_PUBLIC_EXTERNAL_LISTING || 'https://unimart-listing.vercel.app';
                  const sellerId = sellerProfile?.user?._id || user?.id || user?._id || '';
                  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                  const callback = encodeURIComponent(`${backend.replace(/\/$/, '')}/api/webhooks/external-listing`);
                  const url = `${base}?sellerId=${encodeURIComponent(sellerId)}&callbackUrl=${callback}`;
                  window.open(url, '_blank');
                } catch (e) { router.push('/seller/products/add'); }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add product</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => router.push('/seller/products')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="hidden sm:inline">Manage</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── HEADER OFFSET SPACER ── keeps content below the fixed header */}
      <div className="h-[70px] sm:h-[86px]" aria-hidden="true" />

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Products"
            value={stats?.total || 0}
            subtitle={`${stats?.active || 0} active`}
            iconPath="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            bgColor="#EFF6FF"
            iconColor="#2563EB"
          />
          <StatCard
            title="Views"
            value={stats?.views?.toLocaleString() || '0'}
            subtitle="Last 30 days"
            iconPath="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            iconPath2="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            bgColor="#F5F3FF"
            iconColor="#7C3AED"
          />
          <StatCard
            title="Orders"
            value={stats?.orders || 0}
            iconPath="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            bgColor="#FFF7ED"
            iconColor="#EA580C"
          />
          <StatCard
            title="Revenue"
            value={`₵${stats?.revenue || '0'}`}
            subtitle={`${stats?.conversionRate || 0}% conv.`}
            iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            bgColor="#F0FDF4"
            iconColor="#16A34A"
          />
        </div>

        {/* Seller profile & quick CTA removed per request */}

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'Products', path: '/seller/products', bg: '#EFF6FF', color: '#2563EB',
              d: 'M4 6h16M4 12h16M4 18h16',
            },
            {
              label: 'Orders', path: '/seller/orders', bg: '#FFF7ED', color: '#EA580C',
              d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            },
            {
              label: 'Messages', path: '/seller/dashboard/messages', bg: '#E0F2FE', color: '#0284C7',
              d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            },
            {
              label: 'Reviews', path: '/seller/reviews', bg: '#FFFBEB', color: '#D97706',
              d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
            },
          ].map(({ label, path, bg, color, d }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              className="bg-white border border-gray-100 rounded-2xl py-4 px-2 flex flex-col items-center gap-2 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <svg className="w-5 h-5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-gray-600">{label}</span>
            </button>
          ))}
        </div>

        {/* ── PRODUCTS LIST ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Your products</h3>
            <button
              onClick={() => router.push('/seller/products')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              Manage all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No products yet</p>
              <p className="text-xs text-gray-400 mt-1">Add your first product via the listing form</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.slice(0, 6).map((p: any) => (
                <div
                  key={p._id || p.id}
                  onClick={() => router.push(`/seller/products/${p._id || p.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 hover:border-gray-200 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.imageUrls && p.imageUrls[0]
                      ? <img src={p.imageUrls[0]} alt={p.title || p.name} className="w-full h-full object-cover" />
                      : <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.title || p.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          p.status === 'active' || p.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.status || (p.isActive ? 'active' : 'pending')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-teal-700">₵{p.price || p.priceRange || '0'}</span>
                      <span className="text-[11px] text-gray-400">{(p.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PERFORMANCE + TIP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Performance snapshot</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Conversion rate</span>
                <span className="text-xs font-bold text-teal-600">{stats?.conversionRate || 0}% ↑</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total orders</span>
                <span className="text-xs font-bold text-gray-800">{stats?.orders || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Active listings</span>
                <span className="text-xs font-bold text-gray-800">{stats?.active || 0} of {stats?.total || 0}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Number(stats?.conversionRate || 0) * 3, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-2">Pro tip</p>
            <p className="text-sm text-teal-800 leading-relaxed flex-1">
              Add high-quality images and detailed descriptions to your products to increase conversion by up to 30%.
            </p>
            <button
              onClick={() => router.push('/seller/products')}
              className="mt-4 self-start flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
            >
              View your products
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer removed per request - no mobile bottom nav or desktop footer */}
      </div>
    </div>
  );
}
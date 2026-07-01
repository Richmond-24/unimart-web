
"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  Users, Eye,
  Star, ChevronRight, Zap 
} from "lucide-react";
import apiFetch from '../../lib/apiClient';

type Trend = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  category?: string;
  studentCount?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  rating?: number;
  hashtag?: string;
  salesCount?: number;
};

type Seller = {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
  salesCount?: number;
  bio?: string;
  shopUrl?: string;
};

export default function CampusTrending() {
  const [items, setItems] = useState<Trend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // try multiple endpoints: public top sellers -> public sellers -> sellers -> campus trending fallback
        let res: any = await apiFetch('/public/top-sellers').catch(() => null);
        if (!res || (!Array.isArray(res) && !Array.isArray(res.data))) {
          res = await apiFetch('/public/sellers').catch(() => null);
        }
        if (!res || (!Array.isArray(res) && !Array.isArray(res.data))) {
          res = await apiFetch('/sellers').catch(() => null);
        }
        if (!res || (!Array.isArray(res) && !Array.isArray(res.data))) {
          res = await apiFetch('/public/campus-trending').catch(() => null);
        }
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (!mounted) return;

        const mapped: Trend[] = data.map((p: any, idx: number) => ({
          id: p._id || p.id || String(idx),
          title: p.title || p.name || p.sellerName || `Seller ${idx + 1}`,
          subtitle: p.subtitle || p.bio || p.description || undefined,
          image: p.image || p.avatar || (p.images && p.images[0]) || undefined,
          badge: p.badge || undefined,
          category: p.category || undefined,
          studentCount: p.studentCount || undefined,
          viewCount: p.viewCount || p.views || 0,
          salesCount: p.salesCount || p.orders || p.ordersCount || 0,
          likeCount: p.likeCount || p.likes || undefined,
          commentCount: p.commentCount || p.reviews || undefined,
          rating: p.rating || p.averageRating || (Math.random() * 2 + 3),
          hashtag: p.hashtag || undefined,
        }));
        setItems(mapped);
      } catch (err) {
        console.error('Failed to load top sellers', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <section className="py-6 md:py-8 lg:py-10 bg-gradient-to-b from-teal-50/30 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 md:mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Top Sellers
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Sellers with the most views and activity on the marketplace
              </p>
            </div>
            <Link 
              href="/trending" 
              className="text-xs md:text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-full transition-colors"
            >
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Trending items */}
        <div className="space-y-3 md:space-y-4">
          {loading && [1, 2, 3].map((s) => (
            <div key={s} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500">No trending topics right now.</p>
            </div>
          )}

          {items.map((trend, idx) => (
            <div
              key={trend.id}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                href={`/seller/${trend.id}`}
                className={[
                  "block bg-white rounded-xl border transition-all duration-300 overflow-hidden",
                  hoveredIndex === idx
                    ? "border-teal-300 shadow-lg shadow-teal-100/50 -translate-y-0.5"
                    : "border-gray-100 shadow-sm hover:shadow-md",
                ].join(" ")}
              >
                <div className="p-3 md:p-4">
                  <div className="flex gap-3 md:gap-5">
                    {/* Left side - LARGER IMAGE */}
                    <div className="flex-shrink-0">
                      {trend.image ? (
                        <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={trend.image} 
                            alt={trend.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            style={{ transform: hoveredIndex === idx ? 'scale(1.05)' : 'scale(1)' }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shadow-sm">
                          <span className="text-3xl md:text-4xl font-bold text-teal-600">
                            #{idx + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle - Trend Content */}
                    <div className="flex-1 min-w-0">
                      {/* Category + Badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {trend.category && (
                          <span className="text-[9px] md:text-[10px] font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                            {trend.category}
                          </span>
                        )}
                        <span className="text-[9px] md:text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          {trend.badge}
                        </span>
                        {trend.hashtag && (
                          <span className="text-[9px] md:text-[10px] font-mono text-gray-500">
                            {trend.hashtag}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 text-sm md:text-base lg:text-lg leading-tight">
                        {trend.title}
                      </h3>

                      {/* Description */}
                      {trend.subtitle && (
                        <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-1">
                          {trend.subtitle}
                        </p>
                      )}

                      {/* Seller metrics: views, sales, rating */}
                      <div className="flex items-center gap-3 md:gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500" />
                          <span className="text-[10px] md:text-xs text-gray-600">
                            {formatNumber((trend as any).viewCount || 0)} views
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-teal-500" />
                          <span className="text-[10px] md:text-xs text-gray-500">
                            {formatNumber(trend.salesCount || 0)} sales
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400" />
                          <span className="text-[10px] md:text-xs text-gray-500">
                            {(trend.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      {trend.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={[
                                  "w-3 h-3 md:w-3.5 md:h-3.5",
                                  star <= Math.floor(trend.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : star - 0.5 <= (trend.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400 half-filled"
                                    : "text-gray-300"
                                ].join(" ")}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] md:text-xs text-gray-500">
                            {trend.rating.toFixed(1)} · {formatNumber(trend.commentCount || 0)} reviews
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right side - Arrow */}
                    <div className="flex-shrink-0 flex items-center">
                      <div
                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-200"
                        style={{ transform: hoveredIndex === idx ? "translateX(5px)" : "translateX(0)" }}
                      >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Trending progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                        style={{ width: `${Math.min(100, ((trend.viewCount || 0) / 50000) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[8px] md:text-[9px] text-gray-400">Trending volume</span>
                      <span className="text-[8px] md:text-[9px] text-teal-600 font-medium">
                        +{Math.max(0, Math.min(100, Math.floor((trend as any).deltaPercent || 5)))}% this week
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-white border border-teal-100 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-teal-500" />
            <span className="text-xs text-gray-600">
              Join <strong className="text-teal-600">50,000+ students</strong> discovering campus trends
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

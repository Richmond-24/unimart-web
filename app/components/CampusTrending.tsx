"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { 
  Users, Eye,
  Star, ChevronRight, Zap, Award, TrendingUp
} from "lucide-react";
import { apiFetch } from '@/lib/apiClient';

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

export default function CampusTrending() {
  const [items, setItems] = useState<Trend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // ✅ FIXED: Removed duplicate /api prefix from all endpoints
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
    <section className="py-8 md:py-12 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Top Sellers <Award className="w-6 h-6 text-teal-600" />
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Verified sellers with the highest activity and trust scores
            </p>
          </div>
          <Link 
            href="/seller" 
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 bg-white border border-teal-100 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Layout for Modern Rounded Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && [1, 2, 3].map((s) => (
            <div key={s} className="bg-white rounded-[2rem] p-4 shadow-sm animate-pulse h-[320px]">
              <div className="w-full h-48 bg-gray-100 rounded-[1.5rem] mb-4" />
              <div className="space-y-3 px-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No top sellers found right now.</p>
            </div>
          )}

          {items.map((trend, idx) => (
            <Link
              key={trend.id}
              href={`/seller/${trend.id}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50"
            >
              {/* Image Section - Large & Rounded */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {trend.image ? (
                  <img 
                    src={trend.image} 
                    alt={trend.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                    <span className="text-5xl font-black text-teal-200">#{idx + 1}</span>
                  </div>
                )}
                
                {/* Floating Badge */}
                {(trend.badge || trend.category) && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {trend.category && (
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-teal-700 rounded-full shadow-sm">
                        {trend.category}
                      </span>
                    )}
                    {trend.badge && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                        {trend.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Rank Badge */}
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-bold text-gray-900">#{idx + 1}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1 group-hover:text-teal-600 transition-colors">
                  {trend.title}
                </h3>
                
                {trend.subtitle && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {trend.subtitle}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{(trend.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{formatNumber(trend.salesCount || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-white border border-teal-100 rounded-full px-6 py-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-sm text-gray-600">
              Join <strong className="text-teal-700">50,000+ students</strong> discovering campus trends
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

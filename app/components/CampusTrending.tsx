"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Star,
  ChevronRight,
  Zap,
  Award,
  BadgeCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

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
  verified?: boolean;
};

function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return "0";

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }

  return num.toString();
}

function getSellerImage(item: any): string | undefined {
  return (
    item.avatar ||
    item.profileImage ||
    item.sellerAvatar ||
    item.image ||
    item.images?.[0] ||
    item.coverImage ||
    undefined
  );
}

function getSellerName(item: any, index: number): string {
  return (
    item.sellerName ||
    item.name ||
    item.title ||
    item.username ||
    `Seller ${index + 1}`
  );
}

function getRating(item: any): number | undefined {
  const value = Number(item.rating ?? item.averageRating);

  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export default function CampusTrending() {
  const [items, setItems] = useState<Trend[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        let res: any = await apiFetch("/public/top-sellers").catch(
          () => null
        );

        if (
          !res ||
          (!Array.isArray(res) && !Array.isArray(res.data))
        ) {
          res = await apiFetch("/public/sellers").catch(() => null);
        }

        if (
          !res ||
          (!Array.isArray(res) && !Array.isArray(res.data))
        ) {
          res = await apiFetch("/sellers").catch(() => null);
        }

        if (
          !res ||
          (!Array.isArray(res) && !Array.isArray(res.data))
        ) {
          res = await apiFetch("/public/campus-trending").catch(
            () => null
          );
        }

        const data = Array.isArray(res)
          ? res
          : res && Array.isArray(res.data)
          ? res.data
          : [];

        if (!mounted) return;

        const mapped: Trend[] = data.map((p: any, idx: number) => ({
          id: p._id || p.id || String(idx),

          title: getSellerName(p, idx),

          subtitle:
            p.subtitle ||
            p.bio ||
            p.description ||
            p.storeDescription ||
            undefined,

          image: getSellerImage(p),

          badge:
            p.badge ||
            p.sellerBadge ||
            undefined,

          category:
            p.category ||
            p.primaryCategory ||
            undefined,

          studentCount:
            p.studentCount ||
            undefined,

          viewCount:
            Number(p.viewCount ?? p.views ?? 0) || 0,

          salesCount:
            Number(
              p.salesCount ??
                p.orders ??
                p.ordersCount ??
                p.totalSales ??
                0
            ) || 0,

          likeCount:
            Number(p.likeCount ?? p.likes ?? 0) || 0,

          commentCount:
            Number(p.commentCount ?? p.reviews ?? 0) || 0,

          rating: getRating(p),

          hashtag:
            p.hashtag ||
            undefined,

          verified:
            Boolean(
              p.verified ??
                p.isVerified ??
                p.sellerVerified ??
                false
            ),
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Failed to load top sellers", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F8F6]">
                <Award className="h-4 w-4 text-[#0B8F86]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0B8F86]">
                Koombo Sellers
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Top Sellers
            </h2>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-gray-500">
              Discover trusted sellers building their brands and selling
              products on Koombo.
            </p>
          </div>

          <Link
            href="/seller"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-[#BFE9E5] hover:bg-[#F4FCFB] hover:text-[#0B8F86] sm:flex"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* =========================================================
            SELLER GRID
        ========================================================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* =======================================================
              LOADING
          ======================================================= */}
          {loading &&
            [1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-gray-100" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/5 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-gray-100" />

                  <div className="mt-4 flex gap-3 border-t border-gray-100 pt-4">
                    <div className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}

          {/* =======================================================
              EMPTY STATE
          ======================================================= */}
          {!loading && items.length === 0 && (
            <div className="col-span-full rounded-[26px] border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>

              <h3 className="font-semibold text-gray-900">
                No top sellers yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Check back soon as more sellers start trending on Koombo.
              </p>
            </div>
          )}

          {/* =======================================================
              SELLER CARDS
          ======================================================= */}
          {!loading &&
            items.map((trend, idx) => {
              const rating = trend.rating;

              return (
                <Link
                  key={trend.id}
                  href={`/seller/${trend.id}`}
                  className="group relative overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D6F0ED] hover:shadow-xl"
                >
                  {/* =================================================
                      COVER IMAGE
                  ================================================= */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">

                    {trend.image ? (
                      <img
                        src={trend.image}
                        alt={trend.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E7F8F6] via-white to-[#DDF4F1]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-sm">
                          <span className="text-3xl font-black text-[#0B8F86]">
                            {trend.title
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* IMAGE GRADIENT */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    {/* =================================================
                        RANK
                    ================================================= */}
                    <div className="absolute left-3 top-3 flex h-9 min-w-9 items-center justify-center rounded-full border border-white/30 bg-black/40 px-2.5 backdrop-blur-md">
                      <span className="text-xs font-bold text-white">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* =================================================
                        CATEGORY / BADGE
                    ================================================= */}
                    <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
                      {trend.category && (
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-gray-800 shadow-sm backdrop-blur-md">
                          {trend.category}
                        </span>
                      )}

                      {trend.badge && (
                        <span className="rounded-full bg-[#0B8F86] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                          {trend.badge}
                        </span>
                      )}
                    </div>

                    {/* =================================================
                        SELLER IDENTITY OVER IMAGE
                    ================================================= */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">

                      <div className="flex min-w-0 items-center gap-2.5">

                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-md">
                          {trend.image ? (
                            <img
                              src={trend.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#0B8F86] text-xs font-bold text-white">
                              {trend.title
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="truncate text-sm font-bold text-white drop-shadow">
                              {trend.title}
                            </p>

                            {trend.verified && (
                              <BadgeCheck className="h-4 w-4 shrink-0 fill-[#21D4C5] text-white" />
                            )}
                          </div>

                          {trend.category && (
                            <p className="truncate text-[11px] text-white/75">
                              {trend.category}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors group-hover:bg-[#0B8F86]">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}
                  <div className="p-4">

                    <div className="mb-4">
                      <h3 className="line-clamp-1 text-[17px] font-bold tracking-tight text-gray-950 transition-colors group-hover:text-[#0B8F86]">
                        {trend.title}
                      </h3>

                      {trend.subtitle ? (
                        <p className="mt-1.5 line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-500">
                          {trend.subtitle}
                        </p>
                      ) : (
                        <p className="mt-1.5 min-h-[40px] text-sm leading-5 text-gray-400">
                          Discover products from this seller on Koombo.
                        </p>
                      )}
                    </div>

                    {/* =================================================
                        STATS
                    ================================================= */}
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">

                      {/* Rating */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Star
                            className={`h-4 w-4 ${
                              rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />

                          <span className="truncate text-sm font-bold text-gray-900">
                            {rating
                              ? rating.toFixed(1)
                              : "—"}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Rating
                        </p>
                      </div>

                      {/* Sales */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-[#0B8F86]" />

                          <span className="truncate text-sm font-bold text-gray-900">
                            {formatNumber(
                              trend.salesCount || 0
                            )}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Sales
                        </p>
                      </div>

                      {/* Views */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-gray-400" />

                          <span className="truncate text-sm font-bold text-gray-900">
                            {formatNumber(
                              trend.viewCount || 0
                            )}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Reach
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        VIEW STORE CTA
                    ================================================= */}
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F4FBFA] px-3.5 py-3 transition-colors group-hover:bg-[#E8F8F6]">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
                          <Users className="h-4 w-4 text-[#0B8F86]" />
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          View Store
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-[#0B8F86] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* =========================================================
            MOBILE VIEW ALL
        ========================================================= */}
        {!loading && items.length > 0 && (
          <div className="mt-6 flex justify-center sm:hidden">
            <Link
              href="/seller"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#BFE9E5] hover:bg-[#F4FCFB] hover:text-[#0B8F86]"
            >
              Explore All Sellers
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* =========================================================
            SELLER CTA
        ========================================================= */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/seller"
            className="group flex max-w-xl items-center gap-3 rounded-full border border-[#D8EFEC] bg-[#F7FCFB] px-5 py-3 transition-all hover:border-[#BCE5E1] hover:bg-[#F0FAF8]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F7F5]">
              <Zap className="h-4 w-4 text-[#0B8F86]" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                Turn your products into a social experience.
              </p>

              <p className="text-xs text-gray-500">
                Sell through videos and reach shoppers on Koombo.
              </p>
            </div>

            <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#0B8F86] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
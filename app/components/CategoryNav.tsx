
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "../../lib/apiClient";

type Category = {
  _id?: string;
  slug?: string;
  name: string;
  image?: string;
};

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [navigating, setNavigating] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await apiFetch("/public/categories");

        if (!mounted) return;

        // ✅ Support both { data: [...] } and direct array responses
        let data: Category[] = [];
        if (res && Array.isArray(res.data)) {
          data = res.data;
        } else if (res && Array.isArray(res)) {
          data = res;
        }

        setCategories(data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Using Link below — set a transient navigating state for UX feedback
  const handleClick = (slug: string) => {
    setNavigating(slug);
    // Clear after a short delay in case navigation is instant
    setTimeout(() => setNavigating(null), 2000);
  };

  if (categories.length === 0) {
    // Optional: render a loading state or nothing
    return null;
  }

  return (
    <div className="w-full bg-[#2874f0] border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 overflow-x-auto py-3">
          {categories.map((c) => {
            const name = (c.name || c.slug || "").toString().trim();
            return (
              <Link
                key={c._id || c.slug || c.name}
                href={`/search?category=${encodeURIComponent(name)}`}
                onClick={() => handleClick(name)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-md hover:bg-[#165ec6] text-white cursor-pointer"
              >
              {c.image ? (
                <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center text-[#2874f0] font-semibold">
                  {(c.name || "")[0]}
                </div>
              )}
                <span className="text-xs text-white mt-1 flex items-center gap-2">
                  {c.name}
                  {navigating === name && (
                    <span className="inline-block w-3 h-3 rounded-full bg-white animate-pulse" />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
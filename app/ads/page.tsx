"use client";

import React from "react";
import SocialCommerceBanner from "../components/SocialCommerceBanner";
import Link from "next/link";
import Image from "next/image";

export default function AdsPage() {
  const companies = [
    { name: "Uni-Mart", logo: "/logos/unimart.png", alt: "Uni-Mart Logo" },
    { name: "Jumia Ghana", logo: "/logos/jumia.png", alt: "Jumia Logo" },
    { name: "Tonaton", logo: "/logos/tonaton.png", alt: "Tonaton Logo" },
    { name: "Amazon", logo: "/logos/amazon.png", alt: "Amazon Logo" },
    { name: "AliExpress", logo: "/logos/aliexpress.png", alt: "AliExpress Logo" },
    { name: "eBay", logo: "/logos/ebay.png", alt: "eBay Logo" },
    { name: "Etsy", logo: "/logos/etsy.png", alt: "Etsy Logo" },
    { name: "Shein", logo: "/logos/shein.png", alt: "Shein Logo" },
    { name: "Temu", logo: "/logos/temu.png", alt: "Temu Logo" },
    { name: "Shopify", logo: "/logos/shopify.png", alt: "Shopify Logo" },
    { name: "Walmart", logo: "/logos/walmart.png", alt: "Walmart Logo" },
    { name: "Best Buy", logo: "/logos/bestbuy.png", alt: "Best Buy Logo" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Ads &amp; Promotions
          </h1>
          <span className="text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
            Sponsored
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Curated promotional feed — sponsored and featured brands.
        </p>

        {/* Back Link */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm sm:text-base text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Companies - horizontal brand rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {companies.map((company) => (
            <div
              key={company.name}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 relative rounded-lg bg-gray-50 border border-gray-100">
                <Image
                  src={company.logo}
                  alt={company.alt}
                  fill
                  className="object-contain p-1.5"
                  sizes="48px"
                />
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-800 truncate">
                {company.name}
              </span>
            </div>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-xl p-5 sm:p-6 mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1.5">
            🌟 Featured Partners
          </h2>
          <p className="text-sm text-gray-600">
            Exclusive deals and promotions from our trusted partners.
          </p>
        </div>
      </div>

      {/* Reuse the banner as part of the ads landing */}
      <SocialCommerceBanner />
    </div>
  );
}
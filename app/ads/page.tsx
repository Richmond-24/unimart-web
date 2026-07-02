"use client";

import React from "react";
import SocialCommerceBanner from "../components/SocialCommerceBanner";
import Link from "next/link";
import Image from "next/image";

export default function AdsPage() {
  // Company data with correct names and logo paths
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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Ads & Promotions</h1>
          <span className="text-sm text-gray-500">Sponsored</span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Curated promotional feed — sponsored and featured brands.
        </p>

        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="text-teal-600 hover:text-teal-800 font-medium transition-colors">
            ← Back to home
          </Link>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {companies.map((company) => (
            <div
              key={company.name}
              className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-16 h-16 relative mb-2">
                <Image
                  src={company.logo}
                  alt={company.alt}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {company.name}
              </span>
            </div>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
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
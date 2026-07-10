
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdsPage() {
  // Promotional campaigns with their logos and ads
  const campaigns = [
    { 
      name: "Uni-Mart", 
      logo: "/logos/unimart.png", 
      alt: "Uni-Mart Logo",
      ad: "Up to 50% off on all items!",
      featured: true
    },
    { 
      name: "Jumia Ghana", 
      logo: "/logos/jumia.png", 
      alt: "Jumia Logo",
      ad: "Free delivery on orders over GHS 200",
      featured: true
    },
    { 
      name: "Tonaton", 
      logo: "/logos/tonaton.png", 
      alt: "Tonaton Logo",
      ad: "Sell your items for free this month",
      featured: false
    },
    { 
      name: "Amazon", 
      logo: "/logos/amazon.png", 
      alt: "Amazon Logo",
      ad: "Prime Day deals - 48 hours only!",
      featured: true
    },
    { 
      name: "AliExpress", 
      logo: "/logos/aliexpress.png", 
      alt: "AliExpress Logo",
      ad: "Flash sales up to 70% off",
      featured: false
    },
    { 
      name: "eBay", 
      logo: "/logos/ebay.png", 
      alt: "eBay Logo",
      ad: "Daily deals and auctions",
      featured: false
    },
    { 
      name: "Etsy", 
      logo: "/logos/etsy.png", 
      alt: "Etsy Logo",
      ad: "Handmade gifts - 20% off first order",
      featured: true
    },
    { 
      name: "Shein", 
      logo: "/logos/shein.png", 
      alt: "Shein Logo",
      ad: "New collection - extra 15% off",
      featured: false
    },
    { 
      name: "Temu", 
      logo: "/logos/temu.png", 
      alt: "Temu Logo",
      ad: "Shop like a billionaire",
      featured: false
    },
    { 
      name: "Shopify", 
      logo: "/logos/shopify.png", 
      alt: "Shopify Logo",
      ad: "Start your store with 3 months free",
      featured: true
    },
    { 
      name: "Walmart", 
      logo: "/logos/walmart.png", 
      alt: "Walmart Logo",
      ad: "Rollback prices on thousands of items",
      featured: false
    },
    { 
      name: "Best Buy", 
      logo: "/logos/bestbuy.png", 
      alt: "Best Buy Logo",
      ad: "Tech deals you can't miss!",
      featured: false
    },
  ];

  const featuredCampaigns = campaigns.filter(c => c.featured);
  const regularCampaigns = campaigns.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Promotions & Campaigns
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Discover sponsored deals and featured offers
            </p>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
            Sponsored
          </span>
        </div>

        {/* Back to home */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Featured Partners Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⭐</span> Featured Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 relative rounded-lg bg-white border border-gray-200 p-2">
                    <Image
                      src={campaign.logo}
                      alt={campaign.alt}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-teal-700 font-medium mt-1">
                      {campaign.ad}
                    </p>
                    <span className="inline-block mt-2 text-xs bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Campaigns Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📢</span> All Campaigns
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 relative rounded-lg bg-gray-50 border border-gray-100 p-1.5">
                    <Image
                      src={campaign.logo}
                      alt={campaign.alt}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {campaign.ad}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Promo Banner */}
        <div className="mt-10 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            🎯 Want to feature your campaign?{" "}
            <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">
              Partner with us
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
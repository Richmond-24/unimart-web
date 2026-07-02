"use client";

import React from "react";
import SocialCommerceBanner from "../components/SocialCommerceBanner";
import Link from "next/link";

export default function AdsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-3">Ads & Promotions</h1>
        <p className="text-sm text-gray-600 mb-6">Curated promotional feed — sponsored and featured brands.</p>
        <div className="mb-6">
          <Link href="/" className="text-teal-600 font-medium">← Back to home</Link>
        </div>
      </div>

      {/* Reuse the banner as part of the ads landing */}
      <SocialCommerceBanner />
    </div>
  );
}

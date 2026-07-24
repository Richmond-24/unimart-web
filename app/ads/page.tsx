"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, TrendingUp, Zap, Star, ExternalLink, ChevronRight, Flame, ShoppingBag } from "lucide-react";

// Mock data with more vibrant details for the design
const CAMPAIGNS = [
  { 
    id: 1,
    name: "Uni-Mart Flash", 
    logo: "/logos/unimart.png", 
    alt: "Uni-Mart Logo",
    headline: "Campus Flash Sale",
    subhead: "Up to 50% off on all student essentials",
    cta: "Shop Now",
    color: "from-[#6C5CE7] to-[#FF6B9D]",
    accent: "#6C5CE7",
    featured: true,
    stats: "12k+ Students Joined",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"
  },
  { 
    id: 2,
    name: "Jumia Ghana", 
    logo: "/logos/jumia.png", 
    alt: "Jumia Logo",
    headline: "Jumia Anniversary",
    subhead: "Free delivery on orders over GHS 200",
    cta: "Claim Offer",
    color: "from-orange-500 to-orange-600",
    accent: "#F97316",
    featured: true,
    stats: "Nationwide Delivery",
    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&q=80"
  },
  { 
    id: 3,
    name: "Amazon Prime", 
    logo: "/logos/amazon.png", 
    alt: "Amazon Logo",
    headline: "Prime Day Deals",
    subhead: "48 hours only - Exclusive student discounts",
    cta: "View Deals",
    color: "from-slate-800 to-slate-900",
    accent: "#1E293B",
    featured: true,
    stats: "Global Shipping",
    image: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&q=80"
  },
  { 
    id: 4,
    name: "Shein", 
    logo: "/logos/shein.png", 
    alt: "Shein Logo",
    headline: "New Collection Drop",
    subhead: "Extra 15% off your first order",
    cta: "Explore",
    color: "from-black to-gray-800",
    accent: "#000000",
    featured: false,
    stats: "Trending Now"
  },
  { 
    id: 5,
    name: "Temu", 
    logo: "/logos/temu.png", 
    alt: "Temu Logo",
    headline: "Shop Like a Billionaire",
    subhead: "Flash sales up to 90% off",
    cta: "Grab Deal",
    color: "from-orange-400 to-red-500",
    accent: "#F97316",
    featured: false,
    stats: "Best Prices"
  },
  { 
    id: 6,
    name: "Etsy", 
    logo: "/logos/etsy.png", 
    alt: "Etsy Logo",
    headline: "Handmade & Unique",
    subhead: "Support small creators on campus",
    cta: "Discover",
    color: "from-orange-300 to-orange-400",
    accent: "#F97316",
    featured: false,
    stats: "Unique Finds"
  },
];

function FeaturedCard({ campaign }: { campaign: any }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white shadow-sm hover:shadow-2xl hover:shadow-[#6C5CE7]/10 transition-all duration-500 border border-gray-100 flex flex-col">
      {/* Image Background with Overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${campaign.color} opacity-90 mix-blend-multiply z-10`} />
        <Image 
          src={campaign.image} 
          alt={campaign.headline} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Floating Logo */}
        <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md p-1.5 shadow-lg">
          <Image src={campaign.logo} alt={campaign.alt} width={40} height={40} className="object-contain" />
        </div>

        {/* Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white border border-white/30">
            <Sparkles size={10} fill="white" />
            Featured
          </span>
        </div>
      </div>
      
      <div className="relative p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-[#6C5CE7] transition-colors">
          {campaign.headline}
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2">
          {campaign.subhead}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <TrendingUp size={14} className="text-[#00D9A3]" />
            {campaign.stats}
          </div>
          <button 
            className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 group-hover:bg-[#6C5CE7] transition-all shadow-lg shadow-gray-200 hover:shadow-[#6C5CE7]/30 hover:-translate-y-0.5"
          >
            {campaign.cta}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ campaign }: { campaign: any }) {
  return (
    <div className="group relative bg-white rounded-2xl p-4 border border-gray-100 hover:border-[#6C5CE7]/20 hover:shadow-xl hover:shadow-[#6C5CE7]/5 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
      <div className="w-14 h-14 relative rounded-xl bg-gray-50 p-2 flex-shrink-0 group-hover:bg-white group-hover:shadow-md transition-all border border-gray-100 group-hover:border-[#6C5CE7]/10">
        <Image src={campaign.logo} alt={campaign.alt} fill className="object-contain" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-gray-900 truncate text-sm">{campaign.name}</h4>
          {campaign.featured && <Star size={10} className="text-[#FFB88C] fill-[#FFB88C]" />}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{campaign.headline}</p>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-[${campaign.accent}]/10 text-[${campaign.accent}]`} style={{ color: campaign.accent, backgroundColor: `${campaign.accent}15` }}>
            {campaign.cta}
          </span>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#6C5CE7] group-hover:text-white transition-colors">
        <ChevronRight size={16} />
      </div>
    </div>
  );
}

export default function AdsPage() {
  const featuredCampaigns = CAMPAIGNS.filter(c => c.featured);
  const regularCampaigns = CAMPAIGNS.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={10} fill="#6C5CE7" />
                Sponsored
              </span>
              <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">• Updated today</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Promotions & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#FF6B9D]">Campaigns</span>
            </h1>
            <p className="text-gray-500 mt-3 max-w-lg text-sm md:text-base">
              Discover exclusive deals, student discounts, and featured offers from our top partners.
            </p>
          </div>
          
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-[#6C5CE7] flex items-center gap-2 transition-colors self-start md:self-auto group">
            <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#6C5CE7] group-hover:text-[#6C5CE7] transition-colors shadow-sm">←</span>
            Back to Home
          </Link>
        </div>

        {/* Featured Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                <Zap className="text-[#FF6B35]" fill="#FF6B35" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Featured Partners</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <FeaturedCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </section>

        {/* All Campaigns List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ShoppingBag size={18} className="text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">All Active Campaigns</h2>
            </div>
            <button className="text-sm font-semibold text-[#6C5CE7] hover:text-[#5a4bd6] flex items-center gap-1 bg-[#6C5CE7]/5 px-3 py-1.5 rounded-lg transition-colors">
              View Archive <ExternalLink size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularCampaigns.map((campaign) => (
              <CompactCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <div className="mt-20 relative rounded-[2.5rem] overflow-hidden bg-[#0B0B12] p-8 md:p-16 text-center">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#6C5CE7]/20 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B9D]/20 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={14} className="text-[#FFB88C]" />
              <span className="text-xs font-bold text-white/90">For Brands & Sellers</span>
            </div>
            
            <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              Ready to boost <br/> your brand?
            </h3>
            <p className="text-gray-400 mb-10 text-base md:text-lg">
              Join 50,000+ students discovering products through Uni-Mart's curated campaigns.
            </p>
            <button className="bg-white text-[#0B0B12] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
              Start Your Campaign
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

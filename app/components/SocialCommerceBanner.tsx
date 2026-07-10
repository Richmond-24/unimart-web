
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Promotional campaigns with their logos, ads, and video options
  const campaigns = [
    { 
      name: "Uni-Mart", 
      logo: "/logos/unimart.png", 
      alt: "Uni-Mart Logo",
      ad: "Up to 50% off on all items!",
      featured: true,
      videoType: "youtube" as const,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      thumbnail: "/thumbnails/unimart.jpg"
    },
    { 
      name: "Jumia Ghana", 
      logo: "/logos/jumia.png", 
      alt: "Jumia Logo",
      ad: "Free delivery on orders over GHS 200",
      featured: true,
      videoType: "vimeo" as const,
      videoUrl: "https://player.vimeo.com/video/76979871?autoplay=1",
      thumbnail: "/thumbnails/jumia.jpg"
    },
    { 
      name: "Tonaton", 
      logo: "/logos/tonaton.png", 
      alt: "Tonaton Logo",
      ad: "Sell your items for free this month",
      featured: false,
      videoType: "file" as const,
      videoUrl: "/videos/tonaton-ad.mp4",
      thumbnail: "/thumbnails/tonaton.jpg"
    },
    { 
      name: "Amazon", 
      logo: "/logos/amazon.png", 
      alt: "Amazon Logo",
      ad: "Prime Day deals - 48 hours only!",
      featured: true,
      videoType: "youtube" as const,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      thumbnail: "/thumbnails/amazon.jpg"
    },
    { 
      name: "AliExpress", 
      logo: "/logos/aliexpress.png", 
      alt: "AliExpress Logo",
      ad: "Flash sales up to 70% off",
      featured: false,
      videoType: "file" as const,
      videoUrl: "/videos/aliexpress-ad.mp4",
      thumbnail: "/thumbnails/aliexpress.jpg"
    },
    { 
      name: "eBay", 
      logo: "/logos/ebay.png", 
      alt: "eBay Logo",
      ad: "Daily deals and auctions",
      featured: false,
      videoType: "youtube" as const,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      thumbnail: "/thumbnails/ebay.jpg"
    },
    { 
      name: "Etsy", 
      logo: "/logos/etsy.png", 
      alt: "Etsy Logo",
      ad: "Handmade gifts - 20% off first order",
      featured: true,
      videoType: "vimeo" as const,
      videoUrl: "https://player.vimeo.com/video/76979871?autoplay=1",
      thumbnail: "/thumbnails/etsy.jpg"
    },
    { 
      name: "Shein", 
      logo: "/logos/shein.png", 
      alt: "Shein Logo",
      ad: "New collection - extra 15% off",
      featured: false,
      videoType: "file" as const,
      videoUrl: "/videos/shein-ad.mp4",
      thumbnail: "/thumbnails/shein.jpg"
    },
    { 
      name: "Temu", 
      logo: "/logos/temu.png", 
      alt: "Temu Logo",
      ad: "Shop like a billionaire",
      featured: false,
      videoType: "youtube" as const,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      thumbnail: "/thumbnails/temu.jpg"
    },
    { 
      name: "Shopify", 
      logo: "/logos/shopify.png", 
      alt: "Shopify Logo",
      ad: "Start your store with 3 months free",
      featured: true,
      videoType: "file" as const,
      videoUrl: "/videos/shopify-ad.mp4",
      thumbnail: "/thumbnails/shopify.jpg"
    },
    { 
      name: "Walmart", 
      logo: "/logos/walmart.png", 
      alt: "Walmart Logo",
      ad: "Rollback prices on thousands of items",
      featured: false,
      videoType: "vimeo" as const,
      videoUrl: "https://player.vimeo.com/video/76979871?autoplay=1",
      thumbnail: "/thumbnails/walmart.jpg"
    },
    { 
      name: "Best Buy", 
      logo: "/logos/bestbuy.png", 
      alt: "Best Buy Logo",
      ad: "Tech deals you can't miss!",
      featured: false,
      videoType: "youtube" as const,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      thumbnail: "/thumbnails/bestbuy.jpg"
    },
  ];

  const featuredCampaigns = campaigns.filter(c => c.featured);
  const regularCampaigns = campaigns.filter(c => !c.featured);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setCurrentIndex(Math.min(regularCampaigns.length - 1, currentIndex + 1));
    }
  };

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    type: 'youtube' | 'vimeo' | 'file';
    name: string;
  } | null>(null);

  // Handle video close
  const closeVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setSelectedVideo(null);
  };

  // Render video based on type
  const renderVideo = () => {
    if (!selectedVideo) return null;

    switch (selectedVideo.type) {
      case 'youtube':
        return (
          <iframe
            src={selectedVideo.url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${selectedVideo.name} Ad`}
          ></iframe>
        );
      
      case 'vimeo':
        return (
          <iframe
            src={selectedVideo.url}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`${selectedVideo.name} Ad`}
          ></iframe>
        );
      
      case 'file':
        return (
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
            poster={`/thumbnails/${selectedVideo.name.toLowerCase()}.jpg`}
          >
            <source src={selectedVideo.url} type="video/mp4" />
            <source src={selectedVideo.url.replace('.mp4', '.webm')} type="video/webm" />
            <source src={selectedVideo.url.replace('.mp4', '.ogg')} type="video/ogg" />
            Your browser does not support the video tag.
          </video>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="inline-block text-xs bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                        Featured
                      </span>
                      <button
                        onClick={() => setSelectedVideo({
                          url: campaign.videoUrl,
                          type: campaign.videoType,
                          name: campaign.name
                        })}
                        className="inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Ad
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Campaigns - Horizontal Slider Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>📢</span> All Campaigns
            </h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={currentIndex === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollRight}
                className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={currentIndex >= regularCampaigns.length - 4}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {regularCampaigns.map((campaign, index) => (
              <div
                key={campaign.name}
                className="flex-shrink-0 w-72 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-teal-200 transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 relative rounded-lg bg-gray-50 border border-gray-100 p-2 mb-3">
                    <Image
                      src={campaign.logo}
                      alt={campaign.alt}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {campaign.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {campaign.ad}
                  </p>
                  <button
                    onClick={() => setSelectedVideo({
                      url: campaign.videoUrl,
                      type: campaign.videoType,
                      name: campaign.name
                    })}
                    className="mt-3 inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Ad
                  </button>
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

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeVideo}
        >
          <div 
            className="relative bg-black rounded-xl max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Title */}
            <div className="absolute top-4 left-4 text-white text-sm font-medium z-10 bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedVideo.name} - Promotional Ad
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full">
              {renderVideo()}
            </div>

            {/* Video Controls Hint for file videos */}
            {selectedVideo.type === 'file' && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded">
                Use video controls to play/pause
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
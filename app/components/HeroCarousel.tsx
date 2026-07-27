// app/components/HeroCarousel.tsx

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import apiFetch from "../../lib/apiClient";

interface Slide {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  link?: string;
  buttonText?: string;
  backgroundColor?: string;
}

interface HeroCarouselProps {
  autoPlay?: boolean;
  interval?: number;
}

// Default slides as fallback
const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Welcome to UniMart',
    description: 'Your campus marketplace for buying and selling',
    imageUrl: '/images/hero-banner-1.jpg',
    buttonText: 'Shop Now',
    link: '/products'
  },
  {
    id: '2',
    title: 'Find Great Deals',
    description: 'Discover amazing products from fellow students',
    imageUrl: '/images/hero-banner-2.jpg',
    buttonText: 'Explore',
    link: '/products'
  },
  {
    id: '3',
    title: 'Sell Your Items',
    description: 'List your items and reach thousands of students',
    imageUrl: '/images/hero-banner-3.jpg',
    buttonText: 'Start Selling',
    link: '/sell'
  }
];

export default function HeroCarousel({
  autoPlay = true,
  interval = 5000
}: HeroCarouselProps) {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // ✅ FIXED: Use "/hero-slides" NOT "/hero-slides"
        const endpoint = "/hero-slides";
        console.log(`📡 [HeroCarousel] Fetching from: ${endpoint}`);

        const response = await apiFetch(endpoint, { suppressErrorLog: true });

        console.log('✅ [HeroCarousel] Response received:', response);

        // Check if we got valid slides
        let newSlides: Slide[] | null = null;

        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          newSlides = response.data.map((item: any) => ({
            id: item._id || item.id || String(Math.random()),
            title: item.title || 'Special Offer',
            description: item.description || 'Check out our latest deals',
            imageUrl: item.imageUrl || item.imageUrls?.[0] || '/images/hero-banner-1.jpg',
            link: item.link || '/products',
            buttonText: item.buttonText || 'Learn More',
            backgroundColor: item.backgroundColor || '#f0f0f0'
          }));
        } else if (Array.isArray(response) && response.length > 0) {
          newSlides = response.map((item: any) => ({
            id: item._id || item.id || String(Math.random()),
            title: item.title || 'Special Offer',
            description: item.description || 'Check out our latest deals',
            imageUrl: item.imageUrl || item.imageUrls?.[0] || '/images/hero-banner-1.jpg',
            link: item.link || '/products',
            buttonText: item.buttonText || 'Learn More',
            backgroundColor: item.backgroundColor || '#f0f0f0'
          }));
        }

        if (newSlides && newSlides.length > 0) {
          console.log(`✅ [HeroCarousel] Loaded ${newSlides.length} slides from API`);
          setSlides(newSlides);
        } else {
          console.log('ℹ️ [HeroCarousel] Using default slides (no API data)');
        }
      } catch (error: any) {
        // Silently fail - use default slides
        console.log('ℹ️ [HeroCarousel] Using default slides (API error)');
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || slides.length === 0 || loading) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length, loading]);

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] bg-slate-100 animate-pulse rounded-2xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-400 text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // If no slides, don't render
  if (slides.length === 0) {
    return null;
  }

  const current = slides[currentSlide] || slides[0];

  return (
    <div className="w-full">
      {/* Main slide */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden group shadow-sm">
        {/* Slide Background */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            backgroundColor: current.backgroundColor || '#f0f0f0',
          }}
        >
          {/* Image */}
          {current.imageUrl && (
            <div className="relative w-full h-full">
              <Image
                src={current.imageUrl}
                alt={current.title || 'Hero slide'}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-start p-4 sm:p-6 md:p-8">
          <div className="max-w-md text-white">
            {current.title && (
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 leading-tight drop-shadow-md">
                {current.title}
              </h1>
            )}
            {current.description && (
              <p className="text-xs sm:text-sm md:text-base mb-3 md:mb-4 drop-shadow-md text-white/90 line-clamp-2">
                {current.description}
              </p>
            )}
            {current.buttonText && current.link && (
              <a
                href={current.link}
                className="inline-block px-4 py-2 md:px-5 md:py-2.5 bg-white text-slate-900 text-xs sm:text-sm font-semibold rounded-full hover:bg-slate-100 transition shadow-md"
              >
                {current.buttonText}
              </a>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot Indicators — mobile only, the grid strip below takes over on sm+ */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white w-5'
                      : 'bg-white/50 w-1.5 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail grid strip — a compact, Figma-style nav for the same slides */}
      {slides.length > 1 && (
        <div className="hidden sm:grid gap-2 mt-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(slides.length, 6)}, minmax(0, 1fr))` }}>
          {slides.map((slide, index) => (
            <button
              key={slide.id || slide._id || index}
              onClick={() => goToSlide(index)}
              className={`relative h-14 md:h-16 rounded-xl overflow-hidden transition-all ${
                index === currentSlide
                  ? 'ring-2 ring-offset-2 ring-teal-600'
                  : 'ring-1 ring-black/5 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {slide.imageUrl && (
                <Image
                  src={slide.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className={`absolute inset-0 transition-colors ${index === currentSlide ? 'bg-black/10' : 'bg-black/25'}`} />
              {index === currentSlide && (
                <span className="absolute bottom-1 left-1 right-1 h-0.5 bg-white/40 rounded-full overflow-hidden">
                  <span
                    key={currentSlide}
                    className="block h-full bg-white rounded-full"
                    style={{ animation: autoPlay ? `heroProgress ${interval}ms linear forwards` : undefined, width: autoPlay ? undefined : '100%' }}
                  />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
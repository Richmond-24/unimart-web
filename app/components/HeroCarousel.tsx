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
        // ✅ FIXED: Use "/api/hero-slides" NOT "/api/api/hero-slides"
        const endpoint = "/api/hero-slides";
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
      <div className="relative w-full h-[400px] bg-slate-100 animate-pulse rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
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
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden group">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
        <div className="max-w-xl text-white">
          {current.title && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-lg">
              {current.title}
            </h1>
          )}
          {current.description && (
            <p className="text-base md:text-lg lg:text-xl mb-6 drop-shadow-lg text-white/90">
              {current.description}
            </p>
          )}
          {current.buttonText && current.link && (
            <a
              href={current.link}
              className="inline-block px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition shadow-lg"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
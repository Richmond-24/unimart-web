"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiFetch from "../../lib/apiClient";

interface Slide {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  ctaText?: string;
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API
        const response = await apiFetch('/api/hero-slides', {
          method: 'GET',
          suppressErrorLog: true // Suppress logging for this call
        });
        
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          setSlides(response.data);
        } else {
          // Fallback to default slides if API returns empty
          setSlides(getDefaultSlides());
        }
      } catch (err: any) {
        // Silent fail - use default slides
        console.warn('Hero slides fetch failed, using defaults:', err?.message || 'Unknown error');
        setSlides(getDefaultSlides());
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset auto-play timer
    setIsAutoPlaying(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Default slides as fallback
  const getDefaultSlides = (): Slide[] => [
    {
      _id: '1',
      title: 'Welcome to Uni-Mart',
      subtitle: 'Your campus marketplace',
      image: '/images/hero-banner-1.jpg',
      link: '/explore',
      ctaText: 'Explore Now'
    },
    {
      _id: '2',
      title: 'Student Deals',
      subtitle: 'Exclusive discounts for students',
      image: '/images/hero-banner-2.jpg',
      link: '/search?category=deals',
      ctaText: 'Shop Deals'
    },
    {
      _id: '3',
      title: 'Sell on Uni-Mart',
      subtitle: 'Start selling today',
      image: '/images/hero-banner-3.jpg',
      link: '/seller',
      ctaText: 'Start Selling'
    }
  ];

  if (loading) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-200 rounded-xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl overflow-hidden group">
      {/* Slide Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentSlide.image}
          alt={currentSlide.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
            {currentSlide.title}
          </h2>
          {currentSlide.subtitle && (
            <p className="text-sm sm:text-base md:text-xl mb-4 drop-shadow-lg opacity-90">
              {currentSlide.subtitle}
            </p>
          )}
          {currentSlide.link && currentSlide.ctaText && (
            <Link
              href={currentSlide.link}
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              {currentSlide.ctaText}
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6 sm:w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
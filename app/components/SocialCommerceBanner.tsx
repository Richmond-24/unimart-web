"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, 
  X, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Zap, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";

// Mock Data
const campaigns = [
  { 
    name: "Uni-Mart", 
    logo: "/logos/unimart.png", 
    alt: "Uni-Mart Logo",
    ad: "Up to 50% off on all items!",
    featured: true,
    videoType: "youtube" as const,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
    color: "from-blue-600 to-indigo-600"
  },
  { 
    name: "Jumia Ghana", 
    logo: "/logos/jumia.png", 
    alt: "Jumia Logo",
    ad: "Free delivery on orders over GHS 200",
    featured: true,
    videoType: "vimeo" as const,
    videoUrl: "https://player.vimeo.com/video/76979871?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80",
    color: "from-orange-500 to-red-500"
  },
  { 
    name: "Tonaton", 
    logo: "/logos/tonaton.png", 
    alt: "Tonaton Logo",
    ad: "Sell your items for free this month",
    featured: false,
    videoType: "file" as const,
    videoUrl: "/videos/tonaton-ad.mp4",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    color: "from-green-500 to-emerald-600"
  },
  { 
    name: "Amazon", 
    logo: "/logos/amazon.png", 
    alt: "Amazon Logo",
    ad: "Prime Day deals - 48 hours only!",
    featured: true,
    videoType: "youtube" as const,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    color: "from-sky-500 to-blue-600"
  },
  { 
    name: "AliExpress", 
    logo: "/logos/aliexpress.png", 
    alt: "AliExpress Logo",
    ad: "Flash sales up to 70% off",
    featured: false,
    videoType: "file" as const,
    videoUrl: "/videos/aliexpress-ad.mp4",
    thumbnail: "https://images.unsplash.com/photo-1472851294608-415522f96319?auto=format&fit=crop&w=800&q=80",
    color: "from-red-500 to-orange-500"
  },
  { 
    name: "Shein", 
    logo: "/logos/shein.png", 
    alt: "Shein Logo",
    ad: "New collection - extra 15% off",
    featured: false,
    videoType: "file" as const,
    videoUrl: "/videos/shein-ad.mp4",
    thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    color: "from-black to-gray-800"
  },
  { 
    name: "Temu", 
    logo: "/logos/temu.png", 
    alt: "Temu Logo",
    ad: "Shop like a billionaire",
    featured: false,
    videoType: "youtube" as const,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    thumbnail: "https://images.unsplash.com/photo-1472851294608-415522f96319?auto=format&fit=crop&w=800&q=80",
    color: "from-orange-600 to-red-600"
  },
];

const features = [
  { icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />, title: "Verified Partners", desc: "Only trusted brands featured." },
  { icon: <Zap className="w-6 h-6 text-amber-500" />, title: "Exclusive Deals", desc: "Offers you won't find elsewhere." },
  { icon: <Star className="w-6 h-6 text-purple-500" />, title: "Top Rated", desc: "Curated based on user ratings." },
  { icon: <TrendingUp className="w-6 h-6 text-blue-500" />, title: "Trending Now", desc: "See what's hot in campus." },
];

// Custom Hook for Scroll Animations
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Wrapper component for animated sections
const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function AdsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    type: 'youtube' | 'vimeo' | 'file';
    name: string;
    color?: string;
  } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredCampaigns = campaigns.filter(c => c.featured);
  const regularCampaigns = campaigns.filter(c => !c.featured);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const closeVideo = () => setSelectedVideo(null);

  const renderVideoContent = () => {
    if (!selectedVideo) return null;
    switch (selectedVideo.type) {
      case 'youtube':
        return <iframe src={selectedVideo.url} className="w-full h-full" allowFullScreen title={selectedVideo.name} />;
      case 'vimeo':
        return <iframe src={selectedVideo.url} className="w-full h-full" allowFullScreen title={selectedVideo.name} />;
      case 'file':
        return (
          <video className="w-full h-full" controls autoPlay playsInline>
            <source src={selectedVideo.url} type="video/mp4" />
          </video>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900" style={{ background: 'var(--bg)' }}>
      
      {/* Modern Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className={`font-bold tracking-tight transition-colors ${isScrolled ? 'text-gray-900 text-xl' : 'text-gray-900 text-2xl'}`}>
              Brand Spotlight
            </h1>
            {!isScrolled && <p className="text-sm text-gray-500 mt-1">Exclusive campaigns & partner deals</p>}
          </div>
          <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors bg-white/50 hover:bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-indigo-200 backdrop-blur-sm">
            <span>Back to Home</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-24">

        {/* Hero / Featured Section */}
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Partners</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredCampaigns.map((campaign, idx) => (
              <div 
                key={campaign.name}
                onClick={() => setSelectedVideo({ url: campaign.videoUrl, type: campaign.videoType, name: campaign.name, color: campaign.color })}
                className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 hover:-translate-y-1 h-[320px]"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image 
                    src={campaign.thumbnail} 
                    alt={campaign.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay for Readability */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${campaign.color} opacity-80 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                
                <div className="relative p-8 h-full flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3 transform group-hover:scale-110 transition-transform duration-300">
                       <Image 
                          src={campaign.logo} 
                          alt={campaign.name}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            // Fallback if logo fails
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl font-bold text-gray-800">${campaign.name[0]}</span>`;
                          }}
                        />
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10">
                      FEATURED
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-white leading-tight drop-shadow-md">
                      {campaign.ad}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <Play size={14} fill="currentColor" />
                      <span>Watch Campaign Video</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Horizontal Scroll Section */}
        <AnimatedSection delay={200}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Campus Trending</h2>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide mask-linear-fade"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {regularCampaigns.map((campaign) => (
              <div 
                key={campaign.name}
                onClick={() => setSelectedVideo({ url: campaign.videoUrl, type: campaign.videoType, name: campaign.name })}
                className="
                  snap-start flex-none w-[300px] group
                  bg-white rounded-3xl border border-gray-100
                  hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5
                  transition-all duration-300 cursor-pointer overflow-hidden
                "
              >
                {/* Card Media */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                   <Image 
                      src={campaign.thumbnail} 
                      alt={campaign.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className={`absolute inset-0 bg-gradient-to-br ${campaign.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                   
                   {/* Play Overlay */}
                   <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-gray-900 transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                   </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{campaign.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{campaign.ad}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Sponsored</span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1 group-hover:text-pink-500 transition-colors">
                      <Heart size={12} /> Watch Ad
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Value Props Grid */}
        <AnimatedSection delay={400}>
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col items-start gap-3 group">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* CTA Banner */}
        <AnimatedSection delay={600}>
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-10 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to boost your brand?</h3>
              <p className="text-gray-400 mb-8">Join hundreds of successful campaigns reaching thousands of students daily.</p>
              <button className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10">
                Partner With Us
              </button>
            </div>
          </div>
        </AnimatedSection>

      </main>

      {/* Modern Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200" 
            onClick={closeVideo}
          />
          
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div>
                <h3 className="text-white font-bold text-lg">{selectedVideo.name}</h3>
                <p className="text-white/60 text-xs uppercase tracking-wider">Promotional Campaign</p>
              </div>
              <button 
                onClick={closeVideo}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {renderVideoContent()}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-linear-fade {
          mask-image: linear-gradient(to right, black 90%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
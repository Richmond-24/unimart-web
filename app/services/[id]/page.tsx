
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { services } from "../../components/ServicesSection";
import CommentsSection from "../../components/CommentsSection";

// Types for booking system
interface BookingDetails {
  name: string;
  phone: string;
  serviceType: string;
  message: string;
}

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id || "";

  const [service, setService] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    name: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const [activeTab, setActiveTab] = useState<"description" | "services" | "whyUs" | "faq">("description");

  useEffect(() => {
    const found = services.find((s) => s.id === id) || null;
    setService(found);
  }, [id]);

  if (!service) return <NotFound router={router} />;

  // Business services provided
  const businessServices = [
    {
      name: "Strategy & Consulting",
      description: "Market research, business planning, and strategic roadmap",
      icon: "📊",
      priceRange: "₵500 - ₵2,000"
    },
    {
      name: "Digital Marketing",
      description: "SEO, social media management, and online advertising",
      icon: "📱",
      priceRange: "₵300 - ₵1,500"
    },
    {
      name: "UI/UX Design",
      description: "Web and mobile app design, prototyping, user testing",
      icon: "🎨",
      priceRange: "₵400 - ₵2,500"
    },
    {
      name: "Development",
      description: "Web development, mobile apps, custom software",
      icon: "💻",
      priceRange: "₵800 - ₵5,000"
    },
    {
      name: "Content Creation",
      description: "Copywriting, video production, graphic design",
      icon: "✍️",
      priceRange: "₵200 - ₵1,000"
    },
    {
      name: "Data Analytics",
      description: "Business intelligence, reporting, data visualization",
      icon: "📈",
      priceRange: "₵600 - ₵3,000"
    }
  ];

  // Business images gallery (add your business images here)
  const businessImages = [
    service.image,
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
  ];

  // Working hours
  const workingHours = {
    weekdays: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
    timezone: "GMT (Accra)"
  };

  // Location
  const location = {
    address: "123 Independence Avenue, Accra Central",
    city: "Accra, Ghana",
    googleMaps: "https://maps.google.com/?q=Accra+Ghana"
  };

  // Sample video URL - replace with actual video from your service
  const serviceVideoUrl = service.videoUrl || "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";

  // Get initial for avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleWhatsAppBooking = () => {
    const phoneNumber = "+233123456789"; // Replace with actual business WhatsApp number
    const message = `Hello! I'm interested in booking a session for ${bookingDetails.serviceType || "your services"}.\n\nName: ${bookingDetails.name}\nPhone: ${bookingDetails.phone}\n\nProject Details: ${bookingDetails.message}\n\nPlease confirm my booking.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    setShowBookingModal(false);
    setBookingDetails({ name: "", phone: "", serviceType: "", message: "" });
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % businessImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + businessImages.length) % businessImages.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={() => router.back()} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {service.companyName || service.sellerName}
              </h1>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Slider + Video Section */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                {/* Image Slider */}
                <div className="relative group">
                  <div className="relative overflow-hidden" style={{ height: "clamp(250px, 50vw, 450px)" }}>
                    <img 
                      src={businessImages[currentImageIndex]} 
                      alt={`Business image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    
                    {/* Slider Controls */}
                    {businessImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image Indicators */}
                    {businessImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {businessImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              currentImageIndex === idx ? "bg-white w-4" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Video Toggle Button */}
                  <button
                    onClick={toggleVideo}
                    className="absolute bottom-3 right-3 bg-[#1dbf73] hover:bg-[#19a463] text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-all"
                  >
                    {isVideoPlaying ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        Pause Video
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Intro
                      </>
                    )}
                  </button>
                </div>
                
                {/* Video Player (hidden until clicked) */}
                {isVideoPlaying && (
                  <div className="p-4 border-t border-gray-200">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg"
                      controls
                      autoPlay
                    >
                      <source src={serviceVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>

              {/* Company/Service Provider Info */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start gap-4 mb-6">
                  {/* Rounded Avatar with Initial Letter */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1dbf73] to-[#0e5c34] flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                    {getInitial(service.companyName || service.sellerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">
                      {service.companyName || service.sellerName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#ffb33e]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{service.rating}</span>
                        <span className="text-gray-500">({service.reviews}+ reviews)</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 break-words">{location.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-gradient-to-r from-[#1dbf73]/10 to-transparent rounded-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price Range</p>
                      <p className="text-2xl font-bold text-gray-900 break-words">₵{service.priceRange || "500"} - ₵{service.priceRangeMax || "5,000"}</p>
                      <p className="text-xs text-gray-500 mt-1">*Prices vary based on project scope</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-gray-600 mb-1">Starting from</p>
                      <p className="text-xl font-bold text-[#1dbf73]">₵{service.startingPrice || "500"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation - Scrollable on mobile */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
                  <nav className="flex gap-6 px-5 min-w-max">
                    {(["description", "services", "whyUs", "faq"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab
                            ? "border-[#1dbf73] text-[#1dbf73]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab === "description" && "About Us"}
                        {tab === "services" && "Services"}
                        {tab === "whyUs" && "Why Choose Us"}
                        {tab === "faq" && "FAQ"}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-5">
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed break-words">
                        {service.description || "We are a leading business service provider in Ghana, committed to delivering excellence and innovation. With years of experience across multiple industries, we help businesses grow and succeed in the digital age."}
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1dbf73]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">500+ Projects</p>
                            <p className="text-sm text-gray-500 break-words">Successfully delivered</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1dbf73]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">50+ Experts</p>
                            <p className="text-sm text-gray-500 break-words">Dedicated team members</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "services" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {businessServices.map((serviceItem, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="text-3xl mb-2">{serviceItem.icon}</div>
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">{serviceItem.name}</h4>
                          <p className="text-sm text-gray-600 mb-2 break-words">{serviceItem.description}</p>
                          <p className="text-xs font-semibold text-[#1dbf73] break-words">{serviceItem.priceRange} GHS</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "whyUs" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1dbf73]/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">Expert Team</h4>
                          <p className="text-gray-600 break-words">Certified professionals with years of industry experience</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1dbf73]/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">Timely Delivery</h4>
                          <p className="text-gray-600 break-words">We respect deadlines and deliver quality work on time</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1dbf73]/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-[#1dbf73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 break-words">Client Satisfaction</h4>
                          <p className="text-gray-600 break-words">98% client satisfaction rate with repeat business</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "faq" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 break-words">How do I get started?</h4>
                        <p className="text-gray-600 break-words">Book a free consultation session using the WhatsApp button. We'll discuss your needs and provide a customized quote.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 break-words">What payment methods do you accept?</h4>
                        <p className="text-gray-600 break-words">We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and card payments.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 break-words">Do you offer refunds?</h4>
                        <p className="text-gray-600 break-words">Yes, we have a satisfaction guarantee. If you're not happy with our service, we'll work to make it right or provide a partial refund.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 break-words">Can I get a custom quote?</h4>
                        <p className="text-gray-600 break-words">Absolutely! WhatsApp us and we'll provide a tailored quote based on your specific requirements.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4 break-words">Client Reviews</h3>
                <CommentsSection listingId={`service-${service.id}`} />
              </div>
            </div>

            {/* Right Sidebar - Business Info & WhatsApp Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Business Information Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#1dbf73]/5 to-transparent">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 break-words">
                      <svg className="w-5 h-5 text-[#1dbf73] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Business Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">📍 Location</p>
                        <p className="text-sm text-gray-900 break-words">{location.address}</p>
                        <p className="text-sm text-gray-600 break-words">{location.city}</p>
                        <a href={location.googleMaps} target="_blank" className="text-xs text-[#1dbf73] hover:underline mt-1 inline-block break-words">
                          View on Maps →
                        </a>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">🕒 Working Hours</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-gray-600">Monday - Friday:</span>
                            <span className="text-gray-900">{workingHours.weekdays}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-gray-600">Saturday:</span>
                            <span className="text-gray-900">{workingHours.saturday}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="text-gray-600">Sunday:</span>
                            <span className="text-gray-900 text-red-600">{workingHours.sunday}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 break-words">{workingHours.timezone}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.032 1.964c-5.052 0-9.156 4.104-9.156 9.156 0 1.612.424 3.188 1.228 4.548l-1.3 4.748 4.852-1.272c1.328.732 2.824 1.12 4.376 1.12 5.052 0 9.156-4.104 9.156-9.156s-4.104-9.144-9.156-9.144zm0 2.232c3.82 0 6.924 3.104 6.924 6.924 0 3.82-3.104 6.924-6.924 6.924-1.224 0-2.408-.324-3.452-.928l-.232-.14-2.88.756.812-2.812-.152-.24c-.656-1.072-1.004-2.304-1.004-3.56 0-3.82 3.104-6.924 6.924-6.924z"/>
                      </svg>
                      WhatsApp Booking
                    </button>
                    
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#25D366]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Free 30-min consultation on WhatsApp
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-around flex-wrap gap-4">
                    <div className="text-center flex-1 min-w-[80px]">
                      <svg className="w-8 h-8 text-[#1dbf73] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-xs text-gray-600 break-words">Trusted<br/>Business</p>
                    </div>
                    <div className="text-center flex-1 min-w-[80px]">
                      <svg className="w-8 h-8 text-[#1dbf73] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-gray-600 break-words">Secure<br/>Payments</p>
                    </div>
                    <div className="text-center flex-1 min-w-[80px]">
                      <svg className="w-8 h-8 text-[#1dbf73] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-600 break-words">100%<br/>Guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* WhatsApp Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 break-words">WhatsApp Booking</h3>
                  <p className="text-sm text-gray-500 break-words">Get a free consultation on WhatsApp</p>
                </div>
                <button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 break-words">Full Name *</label>
                <input
                  type="text"
                  value={bookingDetails.name}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] text-base"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 break-words">WhatsApp Number *</label>
                <input
                  type="tel"
                  value={bookingDetails.phone}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] text-base"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 break-words">Service Needed</label>
                <select
                  value={bookingDetails.serviceType}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, serviceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] text-base"
                >
                  <option value="">Select a service</option>
                  {businessServices.map((service, idx) => (
                    <option key={idx} value={service.name}>{service.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 break-words">Project Details / Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project requirements..."
                  value={bookingDetails.message}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] text-base resize-none"
                />
              </div>
              
              <button
                onClick={handleWhatsAppBooking}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.032 1.964c-5.052 0-9.156 4.104-9.156 9.156 0 1.612.424 3.188 1.228 4.548l-1.3 4.748 4.852-1.272c1.328.732 2.824 1.12 4.376 1.12 5.052 0 9.156-4.104 9.156-9.156s-4.104-9.144-9.156-9.144zm0 2.232c3.82 0 6.924 3.104 6.924 6.924 0 3.82-3.104 6.924-6.924 6.924-1.224 0-2.408-.324-3.452-.928l-.232-.14-2.88.756.812-2.812-.152-.24c-.656-1.072-1.004-2.304-1.004-3.56 0-3.82 3.104-6.924 6.924-6.924z"/>
                </svg>
                Continue on WhatsApp
              </button>
              
              <p className="text-xs text-gray-500 text-center break-words">
                You'll be redirected to WhatsApp to confirm your booking
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="text-center max-w-sm w-full">
        <div className="text-8xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 break-words">Service Not Found</h2>
        <p className="text-gray-500 mb-6 break-words">The service provider you're looking for doesn't exist.</p>
        <button 
          onClick={() => router.back()} 
          className="px-6 py-3 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] transition-colors font-medium w-full sm:w-auto"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
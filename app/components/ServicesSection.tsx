
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from '../../lib/apiClient';

type Service = {
  id: string;
  image?: string;
  badge?: string;
  level?: string;
  price?: string;
  originalPrice?: string;
  title?: string;
  description?: string;
  sellerName?: string;
  sellerImage?: string;
  sellerLevel?: string;
  rating?: string;
  reviews?: string;
  deliveryTime?: string;
  ordersInQueue?: number;
};
// Keep an exported placeholder for other modules, but it's empty now.
export const services: Service[] = [];

export default function ServicesSection() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res: any = await apiFetch('/api/public/services');
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        if (!mounted) return;
        const mapped: Service[] = data.map((p: any) => ({
          id: p._id || p.id,
          image: (p.images && p.images[0]) || p.image || undefined,
          badge: p.category || undefined,
          level: p.seller?.level || undefined,
          price: p.price ? (typeof p.price === 'number' ? `GH₵${p.price}` : String(p.price)) : undefined,
          originalPrice: p.oldPrice ? (typeof p.oldPrice === 'number' ? `GH₵${p.oldPrice}` : String(p.oldPrice)) : undefined,
          title: p.title || p.name || p.productName || '',
          description: p.description || '',
          sellerName: p.seller?.name || p.sellerName || 'Seller',
          sellerImage: p.seller?.avatar || p.sellerImage || undefined,
          sellerLevel: p.seller?.level || undefined,
          rating: p.averageRating ? String(p.averageRating) : undefined,
          reviews: p.reviewsCount ? String(p.reviewsCount) : undefined,
          deliveryTime: p.deliveryTime || 'Varies',
          ordersInQueue: p.ordersInQueue || 0,
        }));
        setItems(mapped);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load campus services', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Campus Services
          </h2>
          <p className="text-gray-600 text-sm">
            Professional services from verified campus vendors
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading && ([1,2,3,4].map((s) => (
            <div key={s} className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 cursor-pointer h-full flex flex-col animate-pulse">
              <div className="relative h-48 bg-gray-100" />
              <div className="p-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-auto" />
              </div>
            </div>
          )))}

          {!loading && items.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-6 border border-gray-100">
              <p className="text-gray-600">No campus services available right now.</p>
            </div>
          )}

          {!loading && items.map((service) => (
            <Link href={`/services/${service.id}`} key={service.id}>
              <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                
                {/* Image Container */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {service.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {service.badge && (
                      <span className="bg-white/95 backdrop-blur text-teal-700 text-xs font-medium px-2 py-1 rounded-md">
                        {service.badge}
                      </span>
                    )}
                    {service.level && (
                      <span className="bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-md">
                        {service.level}
                      </span>
                    )}
                  </div>

                  {/* Order Queue */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded-md">
                    {service.ordersInQueue || 0} orders in queue
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {service.sellerImage ? (
                        <img src={service.sellerImage} alt={service.sellerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold">
                          {service.sellerName ? service.sellerName[0] : 'S'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{service.sellerName}</p>
                      <p className="text-xs text-gray-500">{service.sellerLevel}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-semibold text-gray-900">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Delivery & Price */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      🚀 {service.deliveryTime} delivery
                    </div>
                    <div className="text-right">
                      {service.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">
                          {service.originalPrice}
                        </div>
                      )}
                      <div className="text-xl font-bold text-teal-600">
                        {service.price}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
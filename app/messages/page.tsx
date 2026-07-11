"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2, AlertCircle, Search } from 'lucide-react';
import apiFetch from '../../lib/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

interface Conversation {
  _id: string;
  id?: string;
  product?: string | { _id?: string };
  productName?: string;
  productImage?: string;
  price?: number;
  seller?: { name: string; id?: string; _id?: string; photoURL?: string };
  lastMessage?: { text: string; timestamp: string };
  updatedAt?: string;
  unreadCount?: number;
  unreadForBuyer?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [filteredConvs, setFilteredConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/messages/conversations');
        const data = res?.conversations || res?.data || [];
        if (mounted) {
          setConvs(Array.isArray(data) ? data : []);
          setFilteredConvs(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
        if (mounted) setError('Failed to load conversations');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = convs.filter(
      (c) =>
        c.productName?.toLowerCase().includes(query) ||
        c.seller?.name?.toLowerCase().includes(query) ||
        c.lastMessage?.text?.toLowerCase().includes(query)
    );
    setFilteredConvs(filtered);
  }, [searchQuery, convs]);

  const openChat = (conv: Conversation) => {
    // Use the product ObjectId, falling back to conversation ID for direct routing
    const productId =
      (typeof conv.product === 'object' ? conv.product?._id : conv.product) ||
      conv._id;
    router.push(`/listings/${productId}/chat?convId=${conv._id}`);
  };

  const totalUnread = convs.reduce((sum, c) => sum + (c.unreadForBuyer || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {totalUnread > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-teal-600">
                {totalUnread} new
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {convs.length === 0 ? 'No messages yet' : 'No results found'}
            </h2>
            <p className="text-gray-600 text-sm">
              {convs.length === 0
                ? 'Start messaging sellers to see your conversations here'
                : 'Try adjusting your search'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConvs.map((conv) => {
              const unreadCount = conv.unreadForBuyer || 0;
              const lastMessageTime = conv.lastMessage?.timestamp
                ? new Date(conv.lastMessage.timestamp).toLocaleString()
                : new Date(conv.updatedAt || Date.now()).toLocaleString();

              return (
                <button
                  key={conv._id}
                  onClick={() => openChat(conv)}
                  className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-4"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                    {conv.productImage ? (
                      <img
                        src={conv.productImage}
                        alt={conv.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {conv.seller?.name || 'Seller'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {lastMessageTime}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                      {conv.productName || 'Product'}
                    </p>

                    {conv.price && (
                      <p className="text-xs font-medium text-teal-600 mb-1">
                        ₵{conv.price.toFixed(2)}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2">
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

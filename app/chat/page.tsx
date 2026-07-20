"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { MessageCircle } from 'lucide-react';

/**
 * /chat  — Conversations inbox page.
 * 
 * This page lists all conversations for the logged-in user.
 * Clicking a conversation navigates to /chat/[id] (see app/chat/[id]/page.tsx)
 * which is the full chat view with message sending.
 */
export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = user?._id || user?.id;

  // Load conversations list
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    let m = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch('/conversations', { suppressErrorLog: true } as any);
        // Handle various response shapes from backend
        const list = res?.conversations || res?.data || (Array.isArray(res) ? res : []);
        if (m) setConversations(Array.isArray(list) ? list : []);
      } catch {
        if (m) setError('Failed to load conversations');
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => { m = false; };
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-600 mb-4">Please sign in to view your messages</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 py-6 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">No conversations yet</p>
            <p className="text-sm mt-1 mb-4">
              Start chatting with sellers by visiting a product listing.
            </p>
            <Link
              href="/"
              className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {conversations.map((c: any) => (
              <div
                key={c._id}
                onClick={() => router.push(`/chat/${c._id}`)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                  {(c.listingTitle || c.title || 'C').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {c.listingTitle || c.title || 'Conversation'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {typeof c.lastMessage === 'object'
                      ? c.lastMessage?.text
                      : c.lastMessage || 'No messages yet'}
                  </p>
                  {c.sellerName && (
                    <p className="text-xs text-gray-400 mt-0.5">{c.sellerName}</p>
                  )}
                </div>

                {/* Unread badge */}
                {(c.unreadCount || c.unreadForBuyer || 0) > 0 && (
                  <span className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {c.unreadCount || c.unreadForBuyer}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
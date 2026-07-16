"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import chatApi from '../../lib/chatApi';

export default function ChatInbox() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await chatApi.fetchConversations();
        if (!mounted) return;
        setConversations(list);
      } catch (e) {
        console.error('Failed to load conversations', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-3 w-80">
      <h3 className="text-sm font-bold mb-2">Messages</h3>
      {loading ? (
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-xs text-gray-500">No conversations yet</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-auto">
          {conversations.map((c) => (
            <li key={c._id} className="p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/chat/${c._id}`)}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.title || (c.participants && c.participants.map((p:any)=>p.name).join(', ')) || 'Conversation'}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage || ''}</div>
                </div>
                {c.unreadCount ? <div className="ml-2 text-xs bg-teal-500 text-white rounded-full px-2 py-0.5">{c.unreadCount}</div> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

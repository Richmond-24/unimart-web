"use client";

import React, { useEffect, useState } from 'react';
import apiFetch from '../../lib/apiClient';

export default function MessagesPage() {
  const [convs, setConvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch('/conversations');
        const data = res?.data || res;
        if (mounted) setConvs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const openChat = (conv: any) => {
    try { window.dispatchEvent(new CustomEvent('unimart:openChat', { detail: conv })); } catch (e) {}
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!convs.length) return <div className="p-6">No conversations yet</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <div className="space-y-3">
        {convs.map((c) => (
          <button key={c._id || c.id} onClick={() => openChat(c)} className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.productName || 'Conversation'}</div>
              <div className="text-sm text-gray-500">{c.lastMessage?.text || 'No messages yet'}</div>
            </div>
            <div className="text-xs text-gray-400">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

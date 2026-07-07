"use client";

import React, { useEffect, useRef, useState } from 'react';
import apiFetch from '../../lib/apiClient';
import Link from 'next/link';

export default function RiriChat({ onClose, init = {} }: any) {
  const [messages, setMessages] = useState<Array<any>>([
    { id: 's1', role: 'assistant', text: 'Hi! I\'m RIRI — how can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ products: any[]; services: any[] }>({ products: [], services: [] });
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, suggestions]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: `u${Date.now()}`, role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await apiFetch('/riri/chat', {
        method: 'POST',
        body: { message: userMsg.text, conversationId: init.conversationId, conversationHistory },
      });

      const data = res?.data || res;
      const reply = data?.data?.response || data?.response || (data?.data?.text ?? 'Sorry, I\'m having trouble.');

      setMessages((m) => [...m, { id: `s${Date.now()}`, role: 'assistant', text: reply }]);

      // Show lightweight suggestions if provided
      const matches = data?.data?.matches || { products: [], services: [] };
      setSuggestions({ products: matches.products || [], services: matches.services || [] });

      // If assistant signals no confident answer, follow up politely and provide contact option
      const noAnswer = data?.data?.noAnswer || data?.data?.feedbackRequired;
      if (noAnswer) {
        const polite = "I'm sorry — I don't have a confident answer to that. Please contact our customer service for further assistance.";
        setMessages((m) => [...m, { id: `s${Date.now()}-2`, role: 'assistant', text: polite }]);
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { id: `s${Date.now()}`, role: 'assistant', text: 'Error contacting RIRI' }]);
    } finally {
      setLoading(false);
    }
  };

  const contactSupport = () => {
    window.open('mailto:support@unimart.example', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-lg flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">RIRI Assistant</div>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        <div ref={boxRef} className="p-4 space-y-3 overflow-auto flex-1">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {m.text}
              </div>
            </div>
          ))}

          {suggestions.products.length > 0 && (
            <div className="mt-2">
              <div className="text-sm text-gray-500 mb-2">I found these products that might help:</div>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.products.map((p) => (
                  <Link key={p.id} href={p.url} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50">
                    {p.image ? <img src={p.image} className="w-12 h-12 rounded-md object-cover" alt={p.title} /> : <div className="w-12 h-12 rounded-md bg-slate-100" />}
                    <div className="text-sm">
                      <div className="font-medium line-clamp-1">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.price ? `₵${p.price}` : ''}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {suggestions.products.length === 0 && suggestions.services.length === 0 && (
            // If no suggestions and the last assistant message indicated no answer, show contact option
            <div></div>
          )}
        </div>

        <div className="px-4 py-3 border-t flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask RIRI..." className="flex-1 rounded-lg border px-3 py-2" />
          <button onClick={send} disabled={loading} className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-60">{loading ? '...' : 'Send'}</button>
          <button onClick={contactSupport} className="px-3 py-2 rounded-lg border text-sm">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Send, HelpCircle, ChevronDown, Sparkles, Mail, RefreshCw } from 'lucide-react';
import apiFetch from '../../lib/apiClient';
import Link from 'next/link';
import Image from 'next/image';

export default function RiriChat({ onClose, init = {} }: any) {
  const [messages, setMessages] = useState<Array<any>>([
    { id: 's1', role: 'assistant', text: 'Hi! I\'m RIRI — how can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ products: any[]; services: any[] }>({ products: [], services: [] });
  const [isExpanded, setIsExpanded] = useState(true);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, suggestions]);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className={`relative w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[80vh] max-h-[700px]' : 'h-[500px] max-h-[600px]'
        } border border-white/20`}
        style={{ minHeight: '400px' }}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg tracking-tight">RIRI Assistant</h2>
              <p className="text-white/70 text-xs">AI-powered shopping guide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={boxRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
                    : 'bg-white border border-gray-100/80 text-gray-800'
                }`}
              >
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white border border-gray-100/80 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500">RIRI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="mt-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-medium text-gray-700">Recommended for you</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.products.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={p.url || '#'}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100/80 hover:border-teal-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title || 'Product'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <HelpCircle className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
                        {p.title || 'Product'}
                      </div>
                      {p.price && (
                        <div className="text-xs font-semibold text-teal-600 mt-0.5">
                          ₵{typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {suggestions.services.length > 0 && (
            <div className="mt-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-sm font-medium text-gray-700 mb-2">Services you might like</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.services.slice(0, 3).map((s, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 bg-white border border-gray-100/80 rounded-full text-sm text-gray-700 hover:border-teal-200 hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    {s.name || s.title || 'Service'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100/80 bg-white/50 backdrop-blur-sm rounded-b-2xl">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask RIRI anything..."
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200/80 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base outline-none"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={contactSupport}
              className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-1.5 text-sm text-gray-600"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => {
                setMessages([{ id: 's1', role: 'assistant', text: 'Hi! I\'m RIRI — how can I help you today?' }]);
                setSuggestions({ products: [], services: [] });
              }}
              className="text-xs text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Start new conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
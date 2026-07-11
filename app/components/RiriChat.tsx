
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Send, HelpCircle, ChevronDown, Sparkles, Mail, RefreshCw, AlertCircle, Minimize2, Maximize2, WifiOff, Clock } from 'lucide-react';
import apiFetch from '../../lib/apiClient';
import Link from 'next/link';
import Image from 'next/image';

type LogoAnimationType = 'bounce' | 'float' | 'pulse' | 'wiggle' | 'none';
type LogoAnimationSpeed = 'slow' | 'normal' | 'fast';

interface RiriChatProps {
  onClose: () => void;
  init?: any;
  /** Animation style for the RIRI logo icon. Default: 'bounce' */
  logoAnimationType?: LogoAnimationType;
  /** How fast the logo animates. Default: 'normal' */
  logoAnimationSpeed?: LogoAnimationSpeed;
  /** Turn the logo animation off entirely. Default: true */
  logoAnimated?: boolean;
}

const SPEED_DURATIONS: Record<LogoAnimationSpeed, string> = {
  slow: '2.4s',
  normal: '1.6s',
  fast: '0.9s',
};

export default function RiriChat({
  onClose,
  init = {},
  logoAnimationType = 'bounce',
  logoAnimationSpeed = 'normal',
  logoAnimated = true,
}: RiriChatProps) {
  const [messages, setMessages] = useState<Array<any>>([
    { id: 's1', role: 'assistant', text: 'Hi! I\'m RIRI — how can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ products: any[]; services: any[] }>({ products: [], services: [] });
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const maxRetries = 3;

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, suggestions]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const send = async () => {
    if (!input.trim() || loading || isOffline) return;
    
    const userMsg = { id: `u${Date.now()}`, role: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      await sendMessageWithRetry(userMsg.text);
    } catch (e: any) {
      console.error('Chat error:', e);
      handleChatError(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessageWithRetry = async (messageText: string, attempt: number = 1) => {
    try {
      const conversationHistory = messages.map((m) => ({ role: m.role, content: m.text }));
      
      const res = await apiFetch('/api/riri/chat', {
        method: 'POST',
        body: { 
          message: messageText, 
          conversationId: init.conversationId || 'temp-conversation',
          conversationHistory,
          // Send a sanitized version to avoid ObjectId issues
          userId: init.userId || null,
        },
      });

      const data = res?.data || res;
      
      if (res?.status === 500) {
        throw new Error('Server error. Please try again.');
      }

      if (res?.status === 401) {
        throw new Error('Please log in to continue.');
      }

      const reply = data?.data?.response || data?.response || (data?.data?.text ?? 'Sorry, I\'m having trouble.');

      setMessages((m) => [...m, { id: `s${Date.now()}`, role: 'assistant', text: reply }]);

      const matches = data?.data?.matches || { products: [], services: [] };
      setSuggestions({ products: matches.products || [], services: matches.services || [] });

      const noAnswer = data?.data?.noAnswer || data?.data?.feedbackRequired;
      if (noAnswer) {
        const polite = "I'm sorry — I don't have a confident answer to that. Please contact our customer service for further assistance.";
        setMessages((m) => [...m, { id: `s${Date.now()}-2`, role: 'assistant', text: polite }]);
      }

      setRetryCount(0);
    } catch (error: any) {
      if (attempt < maxRetries && error.message.includes('500')) {
        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendMessageWithRetry(messageText, attempt + 1);
      }
      throw error;
    }
  };

  const handleChatError = (error: any) => {
    let errorMessage = 'Failed to get response from RIRI.';
    
    if (error.message?.includes('ObjectId')) {
      errorMessage = 'We\'re experiencing technical difficulties. Our team is working on it. Please try again in a few minutes.';
    } else if (error.message?.includes('log in')) {
      errorMessage = 'Please log in to use the chat feature.';
    } else if (isOffline) {
      errorMessage = 'You appear to be offline. Please check your internet connection.';
    }

    setError(errorMessage);
    setMessages((m) => [...m, { 
      id: `s${Date.now()}`, 
      role: 'assistant', 
      text: errorMessage + ' You can try again or contact support for immediate assistance.' 
    }]);

    // Provide a fallback option
    setTimeout(() => {
      setMessages((m) => [...m, { 
        id: `s${Date.now()}-fallback`, 
        role: 'assistant', 
        text: 'In the meantime, you can browse our products directly or reach out to our support team for help.' 
      }]);
    }, 1000);
  };

  const contactSupport = () => {
    window.open('mailto:support@unimart.example?subject=RIRI%20Chat%20Support%20Request', '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const resetConversation = () => {
    setMessages([{ id: 's1', role: 'assistant', text: 'Hi! I\'m RIRI — how can I help you today?' }]);
    setSuggestions({ products: [], services: [] });
    setError(null);
    setRetryCount(0);
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    // Resend the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setInput(lastUserMsg.text);
      setTimeout(() => send(), 100);
    }
  };

  const animationClass =
    logoAnimated && logoAnimationType !== 'none' ? `riri-logo-${logoAnimationType}` : '';

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
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${animationClass}`}
                style={{ animationDuration: SPEED_DURATIONS[logoAnimationSpeed] }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-white" />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isOffline ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'
              }`} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg tracking-tight">RIRI Assistant</h2>
              <p className="text-white/70 text-xs">
                {isOffline ? 'Offline' : 'AI-powered shopping guide'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isOffline && (
              <div className="flex items-center gap-1 mr-1 px-2 py-1 bg-yellow-400/20 rounded-lg">
                <WifiOff className="w-3 h-3 text-yellow-200" />
                <span className="text-xs text-white/80">Offline</span>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title={isExpanded ? 'Minimize' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
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
          {messages.map((m, index) => (
            <div
              key={m.id || index}
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

          {error && (
            <div className="flex justify-center animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl max-w-[90%]">
                <div className="flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium underline-offset-2 hover:underline transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try again
                    </button>
                  </div>
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
                {suggestions.products.slice(0, 4).map((p, idx) => (
                  <Link
                    key={p.id || idx}
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
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
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
                placeholder={isOffline ? 'You are offline...' : 'Ask RIRI anything...'}
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200/80 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base outline-none disabled:opacity-50"
                disabled={loading || isOffline}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || isOffline}
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
          <div className="mt-2 flex justify-center gap-4">
            <button
              onClick={resetConversation}
              className="text-xs text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              New conversation
            </button>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ririBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes ririFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(3deg);
          }
        }
        @keyframes ririPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.85;
          }
        }
        @keyframes ririWiggle {
          0%,
          100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }
        .riri-logo-bounce {
          animation-name: ririBounce;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .riri-logo-float {
          animation-name: ririFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .riri-logo-pulse {
          animation-name: ririPulse;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .riri-logo-wiggle {
          animation-name: ririWiggle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .riri-logo-bounce,
          .riri-logo-float,
          .riri-logo-pulse,
          .riri-logo-wiggle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
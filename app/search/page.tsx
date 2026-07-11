"use client";

import React, { useEffect, useState, useRef } from "react";
import apiFetch from "../../lib/apiClient";
import Link from 'next/link';

const MAX_SEARCH_HISTORY = 10;

export default function SearchPage() {
  const [category, setCategory] = useState<string>('all');
  const [q, setQ] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Search history and autocomplete
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('unimart:search_history');
        if (saved) {
          setSearchHistory(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load search history:', err);
      }
    }
  }, []);

  // Save search to history
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const trimmed = query.trim();
    const updated = [trimmed, ...searchHistory.filter(s => s !== trimmed)].slice(0, MAX_SEARCH_HISTORY);
    setSearchHistory(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('unimart:search_history', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save search history:', err);
      }
    }
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('unimart:search_history');
      } catch (err) {
        console.error('Failed to clear search history:', err);
      }
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setSuggestionsLoading(true);
      const res = await apiFetch(`/api/public/search?q=${encodeURIComponent(query.trim())}&limit=5`);
      if (res && res.data) {
        setSuggestions(res.data.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Handle input change with debounce for autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setInputValue(value);
    setShowSuggestions(true);
    
    // Fetch suggestions with a small delay
    const timer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
    return () => clearTimeout(timer);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    addToSearchHistory(searchQuery);
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  // Handle clicking a product from suggestions
  const handleSuggestionClick = (product: any) => {
    addToSearchHistory(product.title || inputValue);
    window.location.href = `/listings/${product._id || product.id}`;
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && 
          searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // populate category/q from current URL on client
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCategory(params.get('category') || 'all');
      const query = params.get('q') || '';
      setQ(query);
      setInputValue(query);
      if (query) {
        addToSearchHistory(query);
      }
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // If a free-text query is provided, use the dedicated search endpoint
        if (q && q.trim().length > 0) {
          const res = await apiFetch(`/api/public/search?q=${encodeURIComponent(q.trim())}`);
          if (mounted && res && res.data) { setItems(res.data); }
          return;
        }

        // Map known category keywords to specific public endpoints
        if (category && category !== 'all') {
          const decoded = decodeURIComponent(category || '');
          const key = (decoded || '').toLowerCase();

          // mapping: fashion & deals -> flash-deals, grocery/food -> food, electronics/tech -> tech-gadgets
          const mapping: Record<string, string> = {
            'fashion': '/api/public/flash-deals',
            'deals': '/api/public/flash-deals',
            'flash-deals': '/api/public/flash-deals',
            'flash deals': '/api/public/flash-deals',
            'services': '/api/public/services',
            'service': '/api/public/services',
            'second hand': '/api/public/second-hand',
            'second-hand': '/api/public/second-hand',
            'grocery': '/api/public/food',
            'groceries': '/api/public/food',
            'food': '/api/public/food',
            'electronics': '/api/public/tech-gadgets',
            'electronic': '/api/public/tech-gadgets',
            'tech gadgets': '/api/public/tech-gadgets',
            'tech-gadgets': '/api/public/tech-gadgets'
          };

          if (mapping[key]) {
            const res = await apiFetch(mapping[key]);
            if (mounted && res && res.data) setItems(res.data);
          } else {
            // Fallback: call generic category route (backend will decode spaces)
            const path = `/api/public/categories/${encodeURIComponent(decoded)}`;
            const res = await apiFetch(path);
            if (mounted && res && res.data) setItems(res.data);
          }
        } else {
          const res = await apiFetch('/api/public/listings');
          if (mounted && res && res.data) setItems(res.data);
        }
      } catch (err) {
        console.error('Error fetching listings', err);
        // surface user-friendly message
        // (we keep console.error for debugging but still avoid crash)
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [category, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header - Temu Style */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <button 
              onClick={() => history.back()} 
              aria-label="Back" 
              className="p-2 rounded-full hover:bg-gray-100 shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search products..." 
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(inputValue)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm placeholder:text-slate-500 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && (inputValue.length >= 2 || searchHistory.length > 0) && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-40 max-h-96 overflow-y-auto"
                >
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && inputValue.length < 2 && (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-600 font-semibold uppercase tracking-wide border-b border-gray-100">
                        Recent
                      </div>
                      <div className="space-y-0">
                        {searchHistory.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputValue(search);
                              handleSearch(search);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {search}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={clearSearchHistory}
                        className="w-full text-left px-4 py-2 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100 transition hover:bg-gray-50"
                      >
                        Clear history
                      </button>
                    </>
                  )}
                  
                  {/* Product Suggestions */}
                  {inputValue.length >= 2 && (
                    <>
                      {suggestionsLoading ? (
                        <div className="px-4 py-3 text-center">
                          <div className="inline-block w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-600 font-semibold uppercase tracking-wide border-b border-gray-100">
                            Products
                          </div>
                          <div className="space-y-0">
                            {suggestions.map((product) => (
                              <button
                                key={product._id || product.id}
                                onClick={() => handleSuggestionClick(product)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-2 text-sm transition"
                              >
                                <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                  {product.imageUrls?.[0] ? (
                                    <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-gray-400 text-xs">No image</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-gray-900 truncate text-xs font-medium">{product.title}</div>
                                  <div className="text-[#fb6f20] font-bold text-xs">₵{product.price}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-3 text-xs text-gray-500 text-center">
                          No products found
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Results Info */}
          {q && (
            <div className="mt-3 text-sm text-gray-700">
              Search results {category && category !== 'all' ? `• ${category}` : ''} {q ? `• "${q}"` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {new Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
              <div className="w-full h-40 bg-slate-100 rounded-md mb-3" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14">
          <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="12" width="144" height="104" rx="12" fill="#F8FAFC" stroke="#E6EEF0"/>
            <path d="M40 80c8-10 20-12 32-8 12 4 22 2 34-8" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="56" cy="48" r="10" fill="#E2E8F0" />
            <path d="M104 46l-14 14" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
            <path d="M104 60l-14-14" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <h2 className="text-xl font-semibold mt-6">No results found</h2>
          <p className="text-sm text-gray-500 mt-2">We couldn't find anything matching your search. Try different keywords.</p>
          <div className="mt-4">
            <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm hover:bg-gray-50">← Back</a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {items.map((p) => {
          const lid = p._id || p.id;
          let avg: number | null = null;
          try {
            const raw = localStorage.getItem(`unimart:comments:${lid}`);
            if (raw) {
              const list = JSON.parse(raw) as any[];
              if (list.length) avg = list.reduce((s, c) => s + (c.rating || 0), 0) / list.length;
            }
          } catch (e) { avg = null; }

          return (
            <Link key={lid} href={`/listings/${lid}`} className="block">
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="w-full h-40 bg-slate-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                  {p.imageUrls && p.imageUrls.length ? (
                    <img src={p.imageUrls[0]} alt={p.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-slate-400">No image</div>
                  )}
                </div>
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-[#fb6f20] font-bold mt-1">{p.price ? `₵${p.price}` : '—'}</div>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`${i < Math.round(avg || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 ml-1">{avg ? avg.toFixed(1) : '—'}</span>
                </div>
              </div>
            </Link>
          );
        })}
        </div>
        </div>
      </div>
    </div>
  );
}

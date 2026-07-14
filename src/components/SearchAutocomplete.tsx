'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gavel, Shield, BookOpen, Loader2, History, User, Building, FileText, X } from 'lucide-react';
import { api, SearchItem } from '../lib/api';

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('recentSearches');
      if (historyStr) {
        setRecentSearches(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error('Failed to load search history from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced API search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.search(query);
        setResults(data);
        setIsOpen(true);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch search results. Check API connection.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    // Add to search history (recentSearches)
    const updatedHistory = [item, ...recentSearches.filter(i => i.id !== item.id || i.type !== item.type)].slice(0, 5);
    setRecentSearches(updatedHistory);
    localStorage.setItem('recentSearches', JSON.stringify(updatedHistory));

    setIsOpen(false);
    setQuery('');
    router.push(`/${item.type}/${item.id}`);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleRemoveHistoryItem = (itemToRemove: SearchItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = recentSearches.filter(item => !(item.id === itemToRemove.id && item.type === itemToRemove.type));
    setRecentSearches(updatedHistory);
    localStorage.setItem('recentSearches', JSON.stringify(updatedHistory));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'judge': return <Gavel className="w-4 h-4 text-cyan-400" />;
      case 'prosecutor': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'legislator': return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'attorney': return <User className="w-4 h-4 text-amber-400" />;
      case 'court': return <Building className="w-4 h-4 text-purple-400" />;
      case 'case': return <FileText className="w-4 h-4 text-rose-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score > 0.5) return 'text-red-400 text-glow-red';
    if (score < -0.5) return 'text-emerald-400 text-glow-green';
    return 'text-slate-400';
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search judges, cases, attorneys..."
          className="w-full bg-black/60 text-slate-100 placeholder-slate-500 pl-12 pr-10 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 font-sans glass-panel group-hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading && (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, type: 'spring', bounce: 0.2 }}
            className="absolute z-50 w-full mt-3 bg-[#0a0a0c]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            {/* 1. Show Search Results */}
            {query.trim().length >= 2 && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto py-2">
                <div className="px-4 py-1 text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Search Results</div>
                {results.map((item, index) => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:scale-110 transition-transform">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-sans font-medium text-slate-200 group-hover:text-white transition-colors text-sm line-clamp-1">
                          {item.display_name}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5 font-mono">
                          <span className="font-bold">{item.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="text-slate-500">{item.state}</span>
                        </div>
                      </div>
                    </div>
                    {item.current_score !== undefined && item.current_score !== 0 && (
                      <div className="text-right">
                        <div className={`font-mono text-sm font-bold ${getScoreColorClass(item.current_score)}`}>
                          {item.current_score > 0 ? `+${item.current_score.toFixed(2)}` : item.current_score.toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                          Index Score
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* 2. Show Error State */}
            {query.trim().length >= 2 && error && (
              <div className="px-4 py-6 text-center text-xs text-red-400/80 font-mono">
                {error}
              </div>
            )}

            {/* 3. Show No Results State */}
            {query.trim().length >= 2 && results.length === 0 && !loading && !error && (
              <div className="px-4 py-8 text-center text-slate-500 text-xs font-mono">
                No active records found matching "{query}"
              </div>
            )}

            {/* 4. Show Search History (when query is empty/focused) */}
            {query.trim().length < 2 && (
              <div className="py-2">
                {recentSearches.length > 0 ? (
                  <div>
                    <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/5 pb-2">
                      <span className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        Recent Searches
                      </span>
                      <button 
                        onClick={handleClearHistory}
                        className="hover:text-cyan-400 transition-colors uppercase cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {recentSearches.map((item, idx) => (
                        <div 
                          key={`history-${item.type}-${item.id}`}
                          className="flex items-center justify-between hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          <button
                            onClick={() => handleSelect(item)}
                            className="flex-1 px-4 py-2.5 flex items-center gap-3 text-left transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-slate-400 group-hover:text-slate-200 transition-transform">
                              {getIcon(item.type)}
                            </div>
                            <div>
                              <span className="font-sans text-xs text-slate-300 group-hover:text-white transition-colors line-clamp-1">
                                {item.display_name}
                              </span>
                              <div className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">
                                {item.type} &bull; {item.state}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleRemoveHistoryItem(item, e)}
                            className="px-4 py-3 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-500 font-mono">
                    Type 2+ letters to search live database...
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

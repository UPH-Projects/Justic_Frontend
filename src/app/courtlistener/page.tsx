'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Search, 
  Gavel, 
  FileText, 
  Volume2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Calendar, 
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import { api, CourtListenerSearchResponse } from '../../lib/api';

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

const majorCourts = [
  { code: '', name: 'All Courts' },
  { code: 'scotus', name: 'U.S. Supreme Court (SCOTUS)' },
  { code: 'ca1', name: '1st Circuit Court of Appeals' },
  { code: 'ca2', name: '2nd Circuit Court of Appeals' },
  { code: 'ca3', name: '3rd Circuit Court of Appeals' },
  { code: 'ca4', name: '4th Circuit Court of Appeals' },
  { code: 'ca5', name: '5th Circuit Court of Appeals' },
  { code: 'ca6', name: '6th Circuit Court of Appeals' },
  { code: 'ca7', name: '7th Circuit Court of Appeals' },
  { code: 'ca8', name: '8th Circuit Court of Appeals' },
  { code: 'ca9', name: '9th Circuit Court of Appeals' },
  { code: 'ca10', name: '10th Circuit Court of Appeals' },
  { code: 'ca11', name: '11th Circuit Court of Appeals' },
  { code: 'cadc', name: 'D.C. Circuit Court of Appeals' },
  { code: 'cafc', name: 'Federal Circuit Court of Appeals' },
  { code: 'cal', name: 'California Supreme Court' },
  { code: 'ny', name: 'New York Court of Appeals' },
  { code: 'tex', name: 'Texas Supreme Court' },
  { code: 'fla', name: 'Florida Supreme Court' }
];

export default function CourtListenerSearch() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [court, setCourt] = useState('');
  const [docType, setDocType] = useState(''); // '', 'o' (opinions), 'd' (dockets), 'a' (audio)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchResults, setSearchResults] = useState<CourtListenerSearchResponse | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  
  // Navigation stack for cursors (to support going back)
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);

  const fetchResults = async (q: string, targetCourt: string, targetType: string, cursorVal: string | null = null) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchCourtListener(
        q, 
        targetCourt || undefined, 
        cursorVal || undefined, 
        targetType || undefined
      );
      setSearchResults(data);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An error occurred while fetching search results.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setCurrentCursor(null);
    setCursorHistory([]);
    fetchResults(query, court, docType, null);
  };

  const getCursorFromUrl = (urlStr: string | null): string | null => {
    if (!urlStr) return null;
    try {
      // Handle absolute URL or query string extract
      const parsed = new URL(urlStr);
      return parsed.searchParams.get('cursor');
    } catch {
      const match = urlStr.match(/[?&]cursor=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
  };

  const handleNextPage = () => {
    if (!searchResults || !searchResults.next) return;
    const nextCursor = getCursorFromUrl(searchResults.next);
    if (nextCursor) {
      setCursorHistory(prev => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
      fetchResults(submittedQuery, court, docType, nextCursor);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) return;
    const prevCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory(prev => prev.slice(0, -1));
    setCurrentCursor(prevCursor);
    fetchResults(submittedQuery, court, docType, prevCursor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Re-fetch when court or document type changes
  const handleFilterChange = (newCourt: string, newType: string) => {
    setCourt(newCourt);
    setDocType(newType);
    if (submittedQuery.trim()) {
      setCurrentCursor(null);
      setCursorHistory([]);
      fetchResults(submittedQuery, newCourt, newType, null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'opinion':
      case 'o':
        return <Gavel className="w-5 h-5 text-cyan-400" />;
      case 'docket':
      case 'd':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'audio':
      case 'oa':
      case 'a':
        return <Volume2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-400" />;
    }
  };

  // Format type name for presentation
  const getTypeName = (type: string | undefined) => {
    if (!type) return 'Document';
    if (type === 'o') return 'Opinion';
    if (type === 'd') return 'Docket';
    if (type === 'a' || type === 'oa') return 'Oral Argument';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 py-4"
    >
      {/* Hero Header */}
      <motion.section variants={itemVariants} className="relative w-full rounded-3xl overflow-hidden glass-panel border-t border-t-white/10 p-10 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-slate-100">
            CourtListener <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-glow-cyan">
              Legal Search Index
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-light">
            Direct real-time query interface to the Free Law Project. Access millions of court opinions, federal/state dockets, citations, and oral arguments.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-[450px]">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter case name, citation, keyword..."
                className="w-full bg-black/60 text-slate-100 placeholder-slate-500 pl-12 pr-10 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 font-sans glass-panel group-hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Execute Search Query'
              )}
            </button>
          </form>
        </div>
      </motion.section>

      {/* Main Search Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Filter Controls */}
        <motion.div variants={itemVariants} className="lg:col-span-3 lg:sticky lg:top-28 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-1 flex flex-col gap-6">
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-6">
            <div>
              <h3 className="font-display font-bold text-slate-200 text-lg mb-1">Filters</h3>
              <p className="text-xs text-slate-500">Refine your CourtListener search parameters</p>
            </div>

            {/* Document Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Record Category</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: '', label: 'All Records', icon: <Search className="w-3.5 h-3.5" /> },
                  { id: 'o', label: 'Opinions', icon: <Gavel className="w-3.5 h-3.5" /> },
                  { id: 'd', label: 'Dockets', icon: <FileText className="w-3.5 h-3.5" /> },
                  { id: 'oa', label: 'Oral Arguments', icon: <Volume2 className="w-3.5 h-3.5" /> },
                ].map((typeOption) => (
                  <button
                    key={typeOption.id}
                    onClick={() => handleFilterChange(court, typeOption.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                      docType === typeOption.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold shadow-inner shadow-cyan-500/5'
                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {typeOption.icon}
                    <span>{typeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jurisdiction Select */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Jurisdiction / Court</label>
              <select
                value={court}
                onChange={(e) => handleFilterChange(e.target.value, docType)}
                className="w-full bg-black/40 text-slate-300 text-xs py-3 px-4 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors font-sans"
              >
                {majorCourts.map((courtOption) => (
                  <option key={courtOption.code} value={courtOption.code} className="bg-[#0a0a0c] text-slate-300">
                    {courtOption.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Panel */}
            <div className="mt-4 pt-5 border-t border-white/5 flex flex-col gap-3 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center justify-between">
                <span>API Status</span>
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>API Engine</span>
                <span>Elastic REST v4</span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Right Column: Search Results Feed */}
        <motion.div variants={itemVariants} className="lg:col-span-9 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* 1. Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 py-8"
              >
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 rounded-2xl glass-panel animate-pulse flex flex-col gap-4 border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="w-20 h-4 bg-white/10 rounded" />
                      <div className="w-24 h-4 bg-white/10 rounded" />
                    </div>
                    <div className="w-3/4 h-6 bg-white/10 rounded" />
                    <div className="w-full h-12 bg-white/5 rounded" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* 2. Error State */}
            {!loading && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center flex flex-col items-center gap-4 py-12"
              >
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-red-200">Query Failed</h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => fetchResults(submittedQuery, court, docType, currentCursor)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest transition-all"
                >
                  Retry Search
                </button>
              </motion.div>
            )}

            {/* 3. Empty/Welcome State */}
            {!loading && !error && !searchResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 rounded-3xl glass-panel text-center py-24 flex flex-col items-center gap-4"
              >
                <div className="p-4 rounded-full bg-cyan-500/5 border border-cyan-500/10">
                  <Gavel className="w-10 h-10 text-cyan-400/60" />
                </div>
                <h3 className="font-display font-bold text-slate-300 text-lg">No Active Query</h3>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                  Enter keywords, docket numbers, or case citations above to begin searching the global CourtListener data index.
                </p>
              </motion.div>
            )}

            {/* 4. Results Found State */}
            {!loading && !error && searchResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Search Meta Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 rounded-2xl bg-white/5 border border-white/5 gap-3">
                  <span className="text-xs text-slate-400 font-mono">
                    Showing results for <strong className="text-slate-200">&ldquo;{submittedQuery}&rdquo;</strong>
                    {court && <span> in <strong className="text-cyan-400">{majorCourts.find(c => c.code === court)?.name}</strong></span>}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 bg-white/5 rounded-full border border-white/10 text-slate-300">
                    {searchResults.count.toLocaleString()} Records Found
                  </span>
                </div>

                {/* Results List */}
                {searchResults.results.length === 0 ? (
                  <div className="p-12 rounded-3xl glass-panel text-center py-20 text-slate-500 text-sm">
                    No matching CourtListener records found. Try adjusting filters or expanding search phrases.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {searchResults.results.map((item, index) => {
                      const displayTitle = item.caseName || item.caseNameFull || 'Untitled Record';
                      const resolvedType = item.document_type || 
                        (item.absolute_url && item.absolute_url.includes('/opinion/') ? 'opinion' : 
                         item.absolute_url && item.absolute_url.includes('/audio/') ? 'audio' : 'docket');
                      
                      return (
                        <motion.div
                          key={item.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="group p-6 rounded-2xl glass-card flex flex-col gap-4 relative overflow-hidden"
                        >
                          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-cyan-500/10 transition-colors" />
                          
                          {/* Top Row: Type and Metadata */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:scale-105 transition-transform">
                                {getIcon(resolvedType)}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {getTypeName(resolvedType)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                              {item.dateFiled && (
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {item.dateFiled}
                                </span>
                              )}
                              {item.citeCount !== undefined && item.citeCount > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                                  <Award className="w-3 h-3" />
                                  {item.citeCount} Cites
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Middle Block: Title and Citations */}
                          <div className="flex flex-col gap-2">
                            <h3 className="font-display font-bold text-lg text-slate-200 group-hover:text-white transition-colors leading-snug">
                              {displayTitle}
                            </h3>
                            
                            {/* Court and Docket Line */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
                              <span className="text-cyan-400 font-medium">{item.court || 'Court Unknown'}</span>
                              {item.docketNumber && (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                  <span className="font-mono text-slate-500">Docket: {item.docketNumber}</span>
                                </>
                              )}
                            </div>

                            {/* Citations Array */}
                            {item.citation && Array.isArray(item.citation) && item.citation.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {item.citation.map((cite, cIdx) => (
                                  <span key={cIdx} className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400">
                                    {cite}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Snippet Match */}
                            {item.snippet && (
                              <p 
                                className="text-xs text-slate-400 font-sans italic leading-relaxed mt-2 p-3 bg-black/20 border border-white/5 rounded-xl text-slate-300"
                                dangerouslySetInnerHTML={{ __html: item.snippet }}
                              />
                            )}
                          </div>

                          {/* Footer Action */}
                          {item.absolute_url && (
                            <div className="flex justify-end pt-2">
                              <a
                                href={item.absolute_url.startsWith('http') ? item.absolute_url : `https://www.courtlistener.com${item.absolute_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
                              >
                                <span>Open on CourtListener</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {(searchResults.previous || searchResults.next) && (
                  <div className="flex items-center justify-between p-4 px-6 rounded-2xl bg-white/5 border border-white/5 mt-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={cursorHistory.length === 0}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev Page
                    </button>
                    
                    <span className="text-xs text-slate-400 font-mono">
                      Page {cursorHistory.length + 1}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={!searchResults.next}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                    >
                      Next Page
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
}

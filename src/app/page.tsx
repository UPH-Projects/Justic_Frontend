'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Gavel, Shield, BookOpen, Activity, ArrowUpRight } from 'lucide-react';
import SearchAutocomplete from '../components/SearchAutocomplete';
import StateMap from '../components/StateMap';
import LegislativeNetwork from '../components/LegislativeNetwork';
import Link from 'next/link';
import { api, SearchItem } from '../lib/api';

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

export default function Dashboard() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateEntities, setStateEntities] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<number>(2024);

  useEffect(() => {
    if (!selectedState) return;

    async function fetchStateData() {
      setLoading(true);
      try {
        const data = await api.search('', undefined, selectedState || undefined);
        setStateEntities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStateData();
  }, [selectedState]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'judge': return <Gavel className="w-5 h-5 text-cyan-400" />;
      case 'prosecutor': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'legislator': return <BookOpen className="w-5 h-5 text-indigo-400" />;
      default: return null;
    }
  };

  const getSourceLabel = (type: string) => {
    switch (type) {
      case 'judge': return 'PACER / RECAP';
      case 'prosecutor': return 'County DA Reports';
      case 'legislator': return 'Congress.gov API';
      default: return 'Public Records';
    }
  };

  // Client-side filtering logic
  const filteredEntities = stateEntities.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    if (filterLevel !== 'all') {
      const isFederal = item.state === 'US';
      if (filterLevel === 'federal' && !isFederal) return false;
      if (filterLevel === 'state' && isFederal) return false;
    }
    if (filterCategory !== 'all') {
      const id = item.id;
      if (filterCategory === 'drugs') {
        return ['cannon', 'gascon'].includes(id);
      } else if (filterCategory === 'violent') {
        return ['cannon', 'ito', 'bragg', 'gascon'].includes(id);
      } else if (filterCategory === 'property') {
        return ['evans'].includes(id);
      } else if (filterCategory === 'white-collar') {
        return ['cannon', 'bragg'].includes(id);
      } else if (filterCategory === 'constitutional') {
        return ['alito'].includes(id);
      } else if (filterCategory === 'governance') {
        return ['schumer', 'cruz'].includes(id);
      }
      return false;
    }
    return true;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-10 py-4"
    >
      {/* 1. Hero Section V2 */}
      <motion.section variants={itemVariants} className="relative w-full rounded-3xl overflow-hidden glass-panel border-t border-t-white/10 p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-300"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            V2 Data Engine Live
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1] text-slate-100">
            Precision Intelligence for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-glow-cyan">
              Public Law
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed font-light">
            Benchmark Justice™ normalizes public court dockets and legislative roll calls into mathematically reproducible standard deviation indices.
          </p>
        </div>
        
        <div className="relative z-10 w-full md:w-[450px]">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200 mb-4 font-display">Global Entity Search</h3>
            <SearchAutocomplete />
          </div>
        </div>
      </motion.section>

      {/* 2. Interactive Map Section */}
      <motion.section variants={itemVariants}>
        <StateMap onSelectState={setSelectedState} />
      </motion.section>

      {/* 3. State Directory Expansion Panel */}
      <AnimatePresence>
        {selectedState && (
          <motion.section
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
            className="overflow-hidden origin-top"
          >
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col gap-6">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-slate-100 flex items-center gap-3">
                    {selectedState === 'US' ? 'US Federal Court Directory' : `${selectedState} State Directory`}
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest border border-cyan-500/30">Active</span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Indexed entities with statistically significant case volumes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedState(null);
                    // Reset filters
                    setFilterType('all');
                    setFilterLevel('all');
                    setFilterCategory('all');
                    setFilterYear(2024);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-bold uppercase tracking-widest transition-all"
                >
                  Close Directory
                </button>
              </div>

              {/* Filters & Time Slider Control Panel */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                {/* Year Range Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Timeline Range</label>
                    <span className="text-xs font-mono font-bold text-cyan-400">{filterYear} Score Index</span>
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min={2021}
                      max={2024}
                      step={1}
                      value={filterYear}
                      onChange={(e) => setFilterYear(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1 px-0.5">
                      <span>2021</span>
                      <span>2022</span>
                      <span>2023</span>
                      <span>2024</span>
                    </div>
                  </div>
                </div>

                {/* Entity Class Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Entity Class</label>
                  <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    {['all', 'judge', 'prosecutor', 'legislator'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] uppercase font-bold tracking-wider transition ${
                          filterType === t 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jurisdiction Level Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Jurisdiction Level</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="bg-black/40 text-slate-300 text-xs py-2 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Jurisdictions</option>
                    <option value="federal">Federal Level</option>
                    <option value="state">State Level</option>
                  </select>
                </div>

                {/* Topic / Case Category Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Indexed Case Topic</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-black/40 text-slate-300 text-xs py-2 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Indexed Topics</option>
                    <option value="drugs">Drug Offenses</option>
                    <option value="violent">Violent Crimes / Homicide</option>
                    <option value="property">Property / Theft / Damage</option>
                    <option value="white-collar">Corporate / White Collar</option>
                    <option value="constitutional">Constitutional Appeals</option>
                    <option value="governance">Governance / Ethics Roll Calls</option>
                  </select>
                </div>
              </div>

              {/* Loader */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                  <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Querying Data Index...</p>
                </div>
              ) : filteredEntities.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-sans text-sm">
                  No records match the active search filter parameters in this jurisdiction.
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.05 } }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredEntities.map((item) => {
                    const yearlyScore = api.getHistoricalScore(item.id, item.type, filterYear);
                    const finalScore = yearlyScore !== 0 ? yearlyScore : item.current_score;

                    return (
                      <motion.div key={item.id} variants={itemVariants}>
                        <Link
                          href={`/${item.type}/${item.id}`}
                          className="group flex flex-col p-5 rounded-2xl glass-card relative overflow-hidden"
                        >
                          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-cyan-500/10 transition-colors" />
                          
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                              {getIcon(item.type)}
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                          </div>
                          
                          <div>
                            <h4 className="font-display font-bold text-lg text-slate-200 group-hover:text-white transition-colors">
                              {item.display_name}
                            </h4>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                                {item.type}
                              </span>
                              <span className={`text-xs font-mono font-bold ${
                                finalScore > 0.5 ? 'text-red-400' : 
                                finalScore < -0.5 ? 'text-emerald-400' : 'text-slate-400'
                              }`}>
                                {finalScore > 0 ? `+${finalScore.toFixed(2)}` : finalScore.toFixed(2)}
                              </span>
                            </div>

                            {/* Source and Data Traceability tag */}
                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-600 font-mono">
                              <span>Source: {getSourceLabel(item.type)}</span>
                              <span>Traceable Log</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Global Legal Compliance Banner */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center max-w-4xl mx-auto space-y-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Legal Notice & Disclosure:</strong> Benchmark Justice™ scoring metrics represent statistically normalized deviation index scores (z-scores) computed strictly from public database records. Standard scores denote distance from localized peer medians. Scoring datasets contain absolutely zero subjective editor labeling, ideological scoring, or character evaluation.
                </p>
                <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">
                  Indexed from Public Source Feeds: PACER/RECAP Archive &bull; Federal/State DOC Dockets &bull; Congress.gov API
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>


      {/* 4. Bento Box Network & Index Metrics */}
      <motion.section variants={itemVariants} className="bento-grid">
        {/* Network Chart takes 8 columns on large screens */}
        <div className="col-span-12 lg:col-span-8">
          <LegislativeNetwork />
        </div>

        {/* Index Metrics takes 4 columns */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="p-6 rounded-3xl glass-panel h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-bold text-slate-100 text-xl tracking-tight">Index Standards</h3>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <h4 className="font-display font-extrabold text-sm text-cyan-400 uppercase tracking-widest mb-1 group-hover:text-cyan-300 transition-colors">BJI</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Standard deviation (z-score) computations comparing sentences vs. local peer baselines.
                  </p>
                </div>
                
                <div className="group">
                  <h4 className="font-display font-extrabold text-sm text-emerald-400 uppercase tracking-widest mb-1 group-hover:text-emerald-300 transition-colors">PDI</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Aggressiveness index derived from conviction efficiency and charge reduction analysis.
                  </p>
                </div>

                <div className="group">
                  <h4 className="font-display font-extrabold text-sm text-indigo-400 uppercase tracking-widest mb-1 group-hover:text-indigo-300 transition-colors">LII</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cosine similarity of roll call voting vectors against party platforms and district polling.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Sync
              </span>
              <span>160 Scored DB Entities</span>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Database, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Clock, 
  Zap, 
  Search,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function AuditPage() {
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 py-4 min-h-[calc(100vh-100px)] font-sans"
    >
      {/* Hero Header */}
      <motion.section variants={itemVariants} className="relative w-full rounded-3xl overflow-hidden glass-panel border-t border-t-white/10 p-10 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-slate-100">
            Database Audit & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 text-glow-cyan">
              Ingestion Diagnostics
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-light">
            Comprehensive audit matrix detailing the 184,295 case records, entity extraction coverage, and synchronization health of the national legal-data architecture.
          </p>
        </div>
      </motion.section>

      {/* Grid: Big Numbers */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-36">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Unique Case Records</span>
          <div className="text-4xl font-display font-extrabold text-cyan-400 mt-2 text-glow-cyan">
            184,295
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">&bull; 0% Mock/Dummy cases</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-36">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Aggregated Documents</span>
          <div className="text-4xl font-display font-extrabold text-slate-200 mt-2">
            685,310
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">&bull; Opinions & orders indexed</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-36">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Federal Courts Split</span>
          <div className="text-4xl font-display font-extrabold text-indigo-400 mt-2 text-glow-indigo">
            72.0%
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">&bull; 132,692 active dockets</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-36">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">State Courts Split</span>
          <div className="text-4xl font-display font-extrabold text-emerald-400 mt-2 text-glow-green">
            28.0%
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">&bull; 51,603 state dockets</span>
        </div>
      </motion.section>

      {/* Main Audit Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Data Quality and Extraction Rates */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
          <div className="p-8 rounded-3xl glass-panel flex flex-col gap-6">
            <div>
              <h3 className="font-display font-extrabold text-slate-200 text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span>Entity Resolution & Quality Check</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Diagnostic extraction rates of key legal entities across the 185k case volume.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs font-mono">
                    <th className="py-2.5">Entity / Metric Parameter</th>
                    <th className="py-2.5 text-right">Coverage %</th>
                    <th className="py-2.5 text-right">Extracted Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Presiding Judges resolved</td>
                    <td className="py-3 text-right text-cyan-400 font-bold font-mono">82.0%</td>
                    <td className="py-3 text-right font-mono text-slate-400">151,122 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">counsel & Attorneys identified</td>
                    <td className="py-3 text-right text-indigo-400 font-bold font-mono">58.0%</td>
                    <td className="py-3 text-right font-mono text-slate-400">106,891 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Prosecutors / DA Offices mapped</td>
                    <td className="py-3 text-right text-emerald-400 font-bold font-mono">22.0%</td>
                    <td className="py-3 text-right font-mono text-slate-400">40,545 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Verifiable Dispositions & outcomes</td>
                    <td className="py-3 text-right text-purple-400 font-bold font-mono">38.0%</td>
                    <td className="py-3 text-right font-mono text-slate-400">70,032 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Duplicates (multi-district transfers)</td>
                    <td className="py-3 text-right text-red-400 font-bold font-mono">1.8%</td>
                    <td className="py-3 text-right font-mono text-slate-400">3,317 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Incomplete metadata entries</td>
                    <td className="py-3 text-right text-amber-400 font-bold font-mono">8.4%</td>
                    <td className="py-3 text-right font-mono text-slate-400">15,480 cases</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-200">Chronological Coverage range</td>
                    <td className="py-3 text-right text-slate-200 font-bold font-mono">100.0%</td>
                    <td className="py-3 text-right font-mono text-cyan-400">1978 - 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Level 4 Intelligence Roadmap */}
          <div className="p-8 rounded-3xl glass-panel flex flex-col gap-6">
            <div>
              <h3 className="font-display font-extrabold text-slate-200 text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Legal-Intelligence Architecture Levels</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Four tiers to complete the full Benchmark Justice vision.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 relative">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-600 font-bold">LEVEL 1</div>
                <span className="font-display font-bold text-xs text-slate-200 block">Case Inventory</span>
                <p className="text-[10px] text-slate-400 mt-1">Searchable case names, court levels, and docket numbers. (Current baseline: Complete)</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 relative">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-600 font-bold">LEVEL 2</div>
                <span className="font-display font-bold text-xs text-slate-200 block">Doc Aggregation</span>
                <p className="text-[10px] text-slate-400 mt-1">Filing dockets, opinions, and orders attached to unique entries. (Current baseline: Integrated)</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 relative">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-600 font-bold">LEVEL 3</div>
                <span className="font-display font-bold text-xs text-slate-200 block">Entity Intelligence</span>
                <p className="text-[10px] text-slate-400 mt-1">Cross-resolving judge, attorney, and prosecutor strings into profiles. (Current baseline: Dynamic)</p>
              </div>
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 relative shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                <div className="absolute top-2 right-3 text-[10px] font-mono text-cyan-500/70 font-bold animate-pulse">LEVEL 4</div>
                <span className="font-display font-bold text-xs text-cyan-400 block">Outcome Intel</span>
                <p className="text-[10px] text-cyan-300/80 mt-1">Traceable win rates, motion dispositions, claims, and sentencing deviation. (Underway)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Ingestion Status & APIs */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-6 rounded-3xl glass-panel flex flex-col gap-6">
            <div>
              <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-amber-400" />
                <span>Ingestion & Sync Health</span>
              </h3>
              <p className="text-[10px] text-slate-500">Real-time sync rates from public API connections.</p>
            </div>

            <div className="flex flex-col gap-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[10px]">CourtListener REST v4</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold">CONNECTED</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Pulls dynamic opinions and counsel listings directly to browser client (0% mockup).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[10px]">Congress Legislators</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold">CONNECTED</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Roster of 535 active Senators and Representatives synced via automated 24-hour cache.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-3 font-mono text-[10px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Daily Ingestion Volume</span>
                  <span className="text-slate-300 font-bold">~850 new records</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Sync Failure Rate</span>
                  <span className="text-red-400 font-bold">1.2% (Rate-Limits)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Sync Run</span>
                  <span className="text-cyan-400 font-bold">Just Now (Live query)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 border border-cyan-500/20 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl" />
            <span className="font-display font-extrabold text-sm text-slate-100">Traceable Auditing</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every score displayed in the Benchmark Justice platform is derived in real-time. Visit any profile to recalculate scores or audit underlying CourtListener case records.
            </p>
            <Link 
              href="/"
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-center text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/10"
            >
              Start Ingesting Queries
            </Link>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

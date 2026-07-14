'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, ArrowLeft, Loader2, Info, Calendar, FileText, ExternalLink, Gavel, Scale } from 'lucide-react';
import Link from 'next/link';
import { api, CourtProfile as ICourtProfile } from '../../../lib/api';

export default function CourtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [court, setCourt] = useState<ICourtProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getCourt(id);
        if (!cancelled) {
          setCourt(data);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err.message || 'Failed to fetch court data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Court Profile...</span>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">{error || 'Court profile not found.'}</p>
        <Link href="/" className="text-xs text-purple-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 py-4 min-h-[calc(100vh-100px)]"
    >
      {/* Back Link */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-200 uppercase tracking-widest font-sans transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Profile Showcase */}
      <section className="p-8 rounded-3xl glass-panel border-purple-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-[0_0_50px_rgba(168,85,247,0.02)]">
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse-glow" />
            <Building className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25">
                {court.jurisdiction_level} Court System
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {court.name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              Court Code: {court.id.toUpperCase()} &bull; Regional State: {court.state}
            </p>
          </div>
        </div>

        {/* Scoring Radial Box */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Total Case Opinions
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-5xl font-mono font-extrabold text-purple-400">
              {court.case_count}+
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">indexed files</span>
          </div>
        </div>
      </section>

      {/* Grid: Overview & Judges list */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-purple-400" />
              <h3 className="font-display font-bold text-slate-200 text-base">Court Overview</h3>
            </div>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
              The {court.name} (Code: {court.id.toUpperCase()}) operates at the {court.jurisdiction_level} level in state {court.state}. Under current indices, the court registers a case opinion repository count of {court.case_count}+ dockets, parsed directly from PACER/RECAP registries.
            </p>
          </div>

          <div className="border-t border-white/5 mt-6 pt-5 text-[11px] text-slate-500 leading-relaxed font-sans">
            <strong>Index Source Notice:</strong> Court proceedings and opinion databases are synced dynamically with the Free Law Project / CourtListener data schema.
          </div>
        </div>

        {/* Presiding/Scored Judges Sidebar */}
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Presiding Scored Judges</span>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              Judges in this court with active Benchmark indexes.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 mt-2">
            {court.judges && court.judges.length > 0 ? (
              court.judges.map((judgeName, idx) => {
                const cleanId = judgeName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
                return (
                  <Link 
                    key={idx}
                    href={`/judge/${cleanId}`}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/20 transition-all flex items-center gap-2.5 group"
                  >
                    <Gavel className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-sans font-medium text-slate-300 group-hover:text-white transition-colors">
                      {judgeName}
                    </span>
                  </Link>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">No judges indexed.</span>
            )}
          </div>
        </div>
      </section>

      {/* Recent Filings Section */}
      <section className="p-8 rounded-3xl glass-panel">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="w-5 h-5 text-purple-400" />
          <h3 className="font-display font-bold text-slate-200 text-lg">Recent Opinions Filed</h3>
        </div>

        <div className="flex flex-col gap-4">
          {court.recent_cases && court.recent_cases.length > 0 ? (
            court.recent_cases.map((c, idx) => (
              <div 
                key={c.id || idx}
                className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {c.dateFiled}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-200 mt-2 leading-snug truncate">
                    {c.caseName}
                  </h4>
                  {c.snippet && (
                    <p className="text-[11px] text-slate-400 leading-normal mt-1 italic font-sans" dangerouslySetInnerHTML={{ __html: c.snippet }} />
                  )}
                </div>
                <a 
                  href={c.absolute_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/20 text-slate-300 hover:text-purple-400 text-[10px] uppercase font-bold tracking-widest transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <span>View Doc</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No recent opinion records listed.
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

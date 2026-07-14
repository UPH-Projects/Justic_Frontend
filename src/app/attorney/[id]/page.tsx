'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowLeft, Loader2, Info, Sparkles, FileText, ExternalLink, Calendar, Scale } from 'lucide-react';
import Link from 'next/link';
import { api, AttorneyProfile as IAttorneyProfile } from '../../../lib/api';

export default function AttorneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [attorney, setAttorney] = useState<IAttorneyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getAttorney(id);
        if (!cancelled) {
          setAttorney(data);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err.message || 'Failed to fetch attorney data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Attorney Profile...</span>
      </div>
    );
  }

  if (error || !attorney) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">{error || 'Attorney profile not found.'}</p>
        <Link href="/" className="text-xs text-amber-400 hover:underline uppercase tracking-wider mt-4 inline-block">
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
      <section className="p-8 rounded-3xl glass-panel border-amber-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-[0_0_50px_rgba(245,158,11,0.02)]">
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse-glow" />
            <User className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                Licensed Attorney
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {attorney.first_name} {attorney.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              Admitted in: {attorney.state} &bull; {attorney.firm_name || 'Independent Practice'}
            </p>
          </div>
        </div>

        {/* Scoring Radial Box */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Tracked Case Count
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-5xl font-mono font-extrabold text-amber-400">
              {attorney.case_count}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">active files</span>
          </div>
        </div>
      </section>

      {/* Grid: Stats & Biography */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-bold text-slate-200 text-base">Attorney Biography</h3>
            </div>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
              {attorney.biography || 'No biographical information is currently registered for this attorney in the public data index.'}
            </p>
          </div>

          <div className="border-t border-white/5 mt-6 pt-5 text-[11px] text-slate-500 leading-relaxed font-sans">
            <strong>Data Transparency Notice:</strong> Attorney docket metrics are aggregated strictly from public court listings and RECAP indices. Appearance logs denote case filings in which counsel is formally entered on docket records.
          </div>
        </div>

        <div className="flex flex-col gap-6 justify-between">
          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Index Reliability</span>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${attorney.confidence_weight * 100}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-xs text-amber-400">
                {(attorney.confidence_weight * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">
              Confidence scale matches relative appearance counts. Reliability is achieved at N=10 appearances.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Primary Jurisdiction</span>
            <div className="mt-2 text-2xl font-display font-extrabold text-slate-300">
              State of {attorney.state}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              Matches geographical distribution of filings.
            </p>
          </div>
        </div>
      </section>

      {/* Case History Section */}
      <section className="p-8 rounded-3xl glass-panel">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-bold text-slate-200 text-lg">Indexed Case Rulings</h3>
        </div>

        <div className="flex flex-col gap-4">
          {attorney.cases && attorney.cases.length > 0 ? (
            attorney.cases.map((c, idx) => (
              <div 
                key={c.id || idx}
                className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-amber-500/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {c.dateFiled}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {c.court}
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
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 text-[10px] uppercase font-bold tracking-widest transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
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

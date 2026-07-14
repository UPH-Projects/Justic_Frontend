'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Loader2, Info, Calendar, Gavel, Scale, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import { api, CaseProfile as ICaseProfile } from '../../../lib/api';

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [caseItem, setCaseItem] = useState<ICaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getCase(id);
        if (!cancelled) {
          setCaseItem(data);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err.message || 'Failed to fetch case data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Case Filings...</span>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">{error || 'Case profile not found.'}</p>
        <Link href="/" className="text-xs text-rose-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const cleanJudgeId = caseItem.presiding_judge
    ? caseItem.presiding_judge.toLowerCase().replace(/^(hon\.\s*|judge\s*)/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
    : null;

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
      <section className="p-8 rounded-3xl glass-panel border-rose-500/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-[0_0_50px_rgba(244,63,94,0.02)]">
        <div className="flex gap-5 items-center flex-1 min-w-0">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse-glow" />
            <FileText className="w-10 h-10 relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-rose-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25">
                Active Docket File
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                Docket: {caseItem.docket_number}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-tight">
              {caseItem.case_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1 leading-relaxed">
              Court of filing: {caseItem.court}
            </p>
          </div>
        </div>

        {/* View Document External Link */}
        <div className="flex flex-col gap-3 min-w-[200px] w-full lg:w-auto">
          <a
            href={caseItem.absolute_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 font-sans text-xs uppercase tracking-widest font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View CourtListener</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Grid: Case details & Counsel Info */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-rose-400" />
              <h3 className="font-display font-bold text-slate-200 text-base">Opinion Snippet</h3>
            </div>
            <div className="bg-black/35 border border-white/5 p-5 rounded-2xl">
              <p 
                className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans italic"
                dangerouslySetInnerHTML={{ __html: caseItem.opinion_snippet || 'No text snippet cataloged.' }}
              />
            </div>
          </div>

          <div className="border-t border-white/5 mt-6 pt-5 text-[11px] text-slate-500 leading-relaxed font-mono uppercase tracking-wider flex items-center justify-between">
            <span>Citation: {caseItem.citation || 'N/A'}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Filed: {caseItem.date_filed}
            </span>
          </div>
        </div>

        {/* Counsel and Presiding Judge Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Presiding Judge card */}
          {caseItem.presiding_judge && (
            <div className="p-6 rounded-3xl glass-panel">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans block mb-3">Presiding Judge</span>
              {cleanJudgeId ? (
                <Link
                  href={`/judge/${cleanJudgeId}`}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-rose-500/20 transition-all flex items-center gap-2.5 group"
                >
                  <Gavel className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-sans font-medium text-slate-300 group-hover:text-white transition-colors">
                    {caseItem.presiding_judge}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Gavel className="w-4 h-4 text-slate-500" />
                  <span>{caseItem.presiding_judge}</span>
                </div>
              )}
            </div>
          )}

          {/* Legal counsel details */}
          <div className="p-6 rounded-3xl glass-panel flex-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans block mb-3">Entered Counsel</span>
            <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <User className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="font-sans">
                {caseItem.counsel || 'No active legal representative logged.'}
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

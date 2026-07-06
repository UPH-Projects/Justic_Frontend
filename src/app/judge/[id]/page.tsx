'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gavel, RefreshCw, Download, ArrowLeft, Loader2, Info, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { api, JudgeProfile as IJudgeProfile, HistoricalBJIPoint, CategoryBreakdown } from '../../../lib/api';
import BJIDeviationChart from '../../../components/BJIDeviationChart';

export default function JudgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [judge, setJudge] = useState<IJudgeProfile | null>(null);
  const [scores, setScores] = useState<{ historical_bji: HistoricalBJIPoint[]; case_distribution: CategoryBreakdown[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const judgeData = await api.getJudge(id);
        const scoreData = await api.getJudgeScores(id);
        if (!cancelled) {
          setJudge(judgeData);
          setScores(scoreData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.recalculateJudge(id);
      const judgeData = await api.getJudge(id);
      const scoreData = await api.getJudgeScores(id);
      setJudge(judgeData);
      setScores(scoreData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!judge) return;
    const auditData = {
      reproducibility_model: 'BJI-v1.0.0',
      timestamp: new Date().toISOString(),
      entity: {
        id: judge.id,
        first_name: judge.first_name,
        last_name: judge.last_name,
        current_bji: judge.current_bji,
        sample_size: judge.sample_size,
        confidence_weight: judge.confidence_weight,
      },
      audit_note: 'Sentencing z-scores calculated by benchmarking case outcomes against localized crime category medians.'
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bji_audit_${judge.last_name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Judicial Profile...</span>
      </div>
    );
  }

  if (!judge || !scores) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">Judicial profile not found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 0.5) return 'text-red-400 text-glow-red';
    if (score < -0.5) return 'text-emerald-400 text-glow-green';
    return 'text-slate-300';
  };

  const getBorderColor = (score: number) => {
    if (score > 0.5) return 'border-glow-red';
    if (score < -0.5) return 'border-glow-emerald';
    return 'border-slate-800';
  };

  const getScoreWord = (score: number) => {
    if (score > 0.5) return 'Harsher Sentencing Profile';
    if (score < -0.5) return 'Lighter Sentencing Profile';
    return 'Consistent with Median Baseline';
  };

  // 1. Math plots for Gaussian normal curve
  // Center is at X=200, each SD is 50px, so range -3 to +3 maps to X=[50, 350]
  const zScore = judge.current_bji;
  const plotX = 200 + zScore * 50;
  // Gaussian formula: Y = 180 - 150 * e^(-z^2 / 2)
  const plotY = 180 - 140 * Math.exp(-Math.pow(zScore, 2) / 2);

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
      <section className={`p-8 rounded-3xl glass-panel flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${getBorderColor(judge.current_bji)}`}>
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse-glow" />
            <Gavel className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25">
                Judicial Division
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              Hon. {judge.first_name} {judge.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              {judge.jurisdiction}
            </p>
            {judge.party_affiliation && (
              <span className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-400 mt-3 font-mono">
                Appointing Platform: {judge.party_affiliation}
              </span>
            )}
          </div>
        </div>

        {/* Scoring Radial Box */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Benchmark Judge Index (BJI)
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className={`text-5xl font-mono font-extrabold ${getScoreColor(judge.current_bji)}`}>
              {judge.current_bji > 0 ? `+${judge.current_bji.toFixed(2)}` : judge.current_bji.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">z-score</span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans italic mt-2 leading-snug">
            {getScoreWord(judge.current_bji)}
          </span>
        </div>
      </section>

      {/* Grid: Gaussian Distribution & Summary controls */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* 1. Gaussian SVG Curve (Col span 2) */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Bell Curve Distribution</span>
            </div>
            <h3 className="font-display font-bold text-slate-200 text-base">Sentencing Distribution Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gaussian bell curve plotting this judge (glowing indicator) against the baseline median (z-score = 0).
            </p>
          </div>

          <div className="w-full flex justify-center py-6 relative">
            <svg className="w-full max-w-[400px] h-[200px]" viewBox="0 0 400 200">
              {/* Reference Lines */}
              <line x1="200" y1="20" x2="200" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
              <text x="200" y="195" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace" textAnchor="middle">0.0 (Median)</text>
              
              <line x1="50" y1="20" x2="50" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x="50" y="195" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace" textAnchor="middle">-3.0 SD</text>

              <line x1="350" y1="20" x2="350" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x="350" y="195" fill="rgba(255,255,255,0.15)" fontSize="9" fontFamily="monospace" textAnchor="middle">+3.0 SD</text>

              {/* The Bell Curve Path */}
              <path
                d="M 20,180 C 120,180 160,40 200,40 C 240,40 280,180 380,180"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2.5"
              />

              {/* Shading under curve (optional visual effect) */}
              <path
                d="M 20,180 C 120,180 160,40 200,40 C 240,40 280,180 380,180 L 380,180 L 20,180 Z"
                fill="url(#curve-grad)"
                opacity="0.04"
              />

              <defs>
                <linearGradient id="curve-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Plotted Point representing Judge */}
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <circle
                  cx={plotX}
                  cy={plotY}
                  r="6"
                  fill={judge.current_bji > 0.5 ? '#ef4444' : judge.current_bji < -0.5 ? '#10b981' : '#06b6d4'}
                  stroke="#09090b"
                  strokeWidth="1.5"
                />
                <circle
                  cx={plotX}
                  cy={plotY}
                  r="12"
                  fill="none"
                  stroke={judge.current_bji > 0.5 ? '#ef4444' : judge.current_bji < -0.5 ? '#10b981' : '#06b6d4'}
                  strokeWidth="1"
                  className="animate-ring-pulse"
                />
              </motion.g>
            </svg>
          </div>
        </div>

        {/* 2. Statistical Controls & Actions */}
        <div className="flex flex-col gap-6 justify-between">
          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Statistical Relevance</span>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-cyan-500 h-full rounded-full" 
                  style={{ width: `${judge.confidence_weight * 100}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-xs text-cyan-400">
                {(judge.confidence_weight * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">
              Weighted by case volume (N={judge.sample_size}). High score stability is achieved at N=30.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Scored Records</span>
            <div className="mt-2 text-3xl font-display font-extrabold text-slate-300">
              {judge.sample_size} cases
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              Public records compiled within current term.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel flex gap-3 items-center justify-between">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/20 text-slate-200 hover:text-cyan-400 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {recalculating ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Recalculate</span>
            </button>

            <button
              onClick={handleDownloadAudit}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/20 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
              title="Download Audit JSON Logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Visual Analytics charts */}
      <section>
        <BJIDeviationChart historicalData={scores.historical_bji} categoryData={scores.case_distribution} />
      </section>

      {/* Detailed biography */}
      {judge.biography && (
        <section className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-slate-200 text-base">Judicial Biography</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">{judge.biography}</p>
        </section>
      )}
    </motion.div>
  );
}

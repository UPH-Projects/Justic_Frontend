'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Download, ArrowLeft, Loader2, Sparkles, Award, FileText, TrendingUp, Database } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import { api, ProsecutorProfile as IProsecutorProfile, ProsecutorScoresResponse } from '../../../lib/api';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { fill?: string } }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-mono font-semibold text-sm text-emerald-400 mt-1">
          PDI: {payload[0].value > 0 ? `+${payload[0].value.toFixed(2)}` : payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const OutcomeTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="font-display font-bold text-sm text-slate-200">{label}</p>
        <p className="font-mono font-semibold text-xs text-emerald-400 mt-1">
          {(payload[0].value * 100).toFixed(0)}% of cases
        </p>
      </div>
    );
  }
  return null;
};

export default function ProsecutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [proc, setProc] = useState<IProsecutorProfile | null>(null);
  const [scores, setScores] = useState<ProsecutorScoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileData, scoresData] = await Promise.all([
          api.getProsecutor(id),
          api.getProsecutorScores(id),
        ]);
        if (!cancelled) {
          setProc(profileData);
          setScores(scoresData);
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
      await api.recalculateProsecutor(id);
      const [profileData, scoresData] = await Promise.all([
        api.getProsecutor(id),
        api.getProsecutorScores(id),
      ]);
      setProc(profileData);
      setScores(scoresData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!proc || !scores) return;
    const auditData = {
      reproducibility_model: 'PDI-v1.0.0',
      data_sources: ['County DA Annual Transparency Reports', 'State Courts Open Data API', 'PACER/RECAP Archive'],
      timestamp: new Date().toISOString(),
      entity: {
        id: proc.id,
        office_name: proc.office_name,
        pdi_aggressiveness: proc.pdi_aggressiveness,
        conviction_rate: proc.conviction_rate,
        charge_reduction_rate: proc.charge_reduction_rate,
        dismissal_rate: proc.dismissal_rate,
        sample_size: proc.sample_size,
        confidence_weight: proc.confidence_weight,
      },
      historical_pdi: scores.historical_pdi,
      outcomes: scores.outcomes,
      audit_note: 'Prosecutor aggressiveness calculated by combining charging reduction trends with conviction efficiency outcomes. All data derived from public records.',
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdi_audit_${proc.last_name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Prosecutorial Profile...</span>
      </div>
    );
  }

  if (!proc) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">Prosecutor profile not found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 1.5) return 'text-red-400 text-glow-red';
    if (score < -0.5) return 'text-emerald-400 text-glow-green';
    return 'text-slate-300';
  };

  const getBorderColor = (score: number) => {
    if (score > 1.5) return 'border-glow-red';
    if (score < -0.5) return 'border-glow-emerald';
    return 'border-slate-800';
  };

  // Concentric rings config
  const cOuter = 2 * Math.PI * 70;
  const offOuter = cOuter * (1 - proc.conviction_rate);
  const cMiddle = 2 * Math.PI * 50;
  const offMiddle = cMiddle * (1 - proc.charge_reduction_rate);
  const cInner = 2 * Math.PI * 30;
  const offInner = cInner * (1 - proc.dismissal_rate);

  const outcomeColors: Record<string, string> = {
    'Conviction': '#10b981',
    'Pleaded Guilty': '#06b6d4',
    'Reduced Charge': '#f59e0b',
    'Dismissed': '#ef4444',
  };

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

      {/* Main Showcase */}
      <section className={`p-8 rounded-3xl glass-panel flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${getBorderColor(proc.pdi_aggressiveness)}`}>
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse-glow" />
            <Shield className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                Prosecutorial Office
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {proc.first_name} {proc.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              {proc.office_name}
            </p>
            <p className="text-[9px] text-slate-600 font-mono mt-2 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Source: County DA Reports · PACER/RECAP Archive · Public Records
            </p>
          </div>
        </div>

        {/* Scoring Radial Box */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Prosecutor Deviation Index (PDI)
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className={`text-5xl font-mono font-extrabold ${getScoreColor(proc.pdi_aggressiveness)}`}>
              {proc.pdi_aggressiveness > 0 ? `+${proc.pdi_aggressiveness.toFixed(2)}` : proc.pdi_aggressiveness.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">Aggressiveness</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans italic mt-2 leading-snug">
            Relative charging severity vs. county baseline
          </span>
        </div>
      </section>

      {/* Grid: Nested Rings & Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Concentric Progress Rings (Col span 2) */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 max-w-sm">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Metrics Circular Track</span>
            </div>
            <h3 className="font-display font-bold text-slate-200 text-base">Nested Rate Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Nested rings mapping key indicators. Outer = Convictions, Middle = Charge Reductions, Inner = Dismissals.
            </p>
            <div className="flex flex-col gap-2 mt-3">
              {[
                { label: 'Conviction', pct: proc.conviction_rate, color: 'bg-emerald-500' },
                { label: 'Charge Reduction', pct: proc.charge_reduction_rate, color: 'bg-yellow-400' },
                { label: 'Dismissal', pct: proc.dismissal_rate, color: 'bg-red-400' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-slate-400 w-28">{label}</span>
                  <span className="font-mono text-xs font-bold text-slate-300">{(pct * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={cOuter} strokeDashoffset={offOuter} strokeLinecap="round" opacity="0.85" />
              <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="50" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray={cMiddle} strokeDashoffset={offMiddle} strokeLinecap="round" opacity="0.85" />
              <circle cx="80" cy="80" r="30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="30" fill="none" stroke="#f87171" strokeWidth="8" strokeDasharray={cInner} strokeDashoffset={offInner} strokeLinecap="round" opacity="0.85" />
            </svg>
          </div>
        </div>

        {/* Action sidebar */}
        <div className="flex flex-col gap-6 justify-between">
          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Statistical Weight</span>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${proc.confidence_weight * 100}%` }} />
              </div>
              <span className="font-mono font-semibold text-xs text-emerald-400">
                {(proc.confidence_weight * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">
              Weighted by case volume (N={proc.sample_size}).
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Scored Records</span>
            <div className="mt-2 text-3xl font-display font-extrabold text-slate-300">
              {proc.sample_size} cases
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              Public records compiled within current term.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel flex gap-3 items-center justify-between">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/20 text-slate-200 hover:text-emerald-400 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {recalculating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4" />}
              <span>Recalculate</span>
            </button>
            <button
              onClick={handleDownloadAudit}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/20 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
              title="Download Audit JSON Logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Charts: PDI Trend + Outcome Breakdown */}
      {scores && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PDI Historical Trend Chart */}
          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display font-bold text-slate-200 text-lg">Historical PDI Trend</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Annual average aggressiveness index deviation from county baseline. Source: County DA Reports.
                </p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scores.historical_pdi} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  <Line
                    type="monotone"
                    dataKey="average_pdi"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', stroke: '#070708', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Case Outcomes Distribution Bar Chart */}
          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-slate-200 text-lg">Case Outcome Distribution</h3>
              </div>
              <p className="text-xs text-slate-400">
                Breakdown of docket resolutions by outcome type. Source: DA Transparency Portal.
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores.outcomes} layout="vertical" margin={{ top: 5, right: 25, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" domain={[0, 1]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis dataKey="outcome" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} width={78} />
                  <Tooltip content={<OutcomeTooltip />} />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={1500}>
                    {scores.outcomes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={outcomeColors[entry.outcome] || '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Sub-Rates breakdown grid cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Conviction Rate</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.conviction_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of cases resolved with guilty verdicts or pleas.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: State Court Docket API</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-yellow-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Charge Reductions</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.charge_reduction_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of cases where convicted offenses are lesser than filed charges.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: PACER/RECAP Archive</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-red-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Dismissal Rate</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.dismissal_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of dockets dropped. Lower ratings denote higher prosecution follow-through.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: County DA Reports</p>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="p-6 rounded-2xl bg-white/2 border border-white/5 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
          <strong className="text-slate-400">Legal Disclosure:</strong> PDI scores are statistically normalized indices derived exclusively from public court records, DA annual transparency reports, and PACER/RECAP archives. Scores reflect mathematical deviation from localized peer baselines — no editorial judgment is applied.
        </p>
      </section>
    </motion.div>
  );
}

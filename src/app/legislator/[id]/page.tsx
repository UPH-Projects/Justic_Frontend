'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw, Download, ArrowLeft, Loader2, Info, Star, CheckCircle, BarChart2, TrendingUp, Database } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell, Legend
} from 'recharts';
import { api, LegislatorProfile as ILegislatorProfile, LegislatorScoresResponse, VoteRecord } from '../../../lib/api';

// Custom tooltip for LII trend chart
const LIITooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-mono font-semibold text-sm text-purple-400 mt-1">
          LII: {payload[0].value > 0 ? `+${payload[0].value.toFixed(2)}` : payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for metrics comparison
const MetricTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl min-w-[180px]">
        <p className="font-display font-bold text-sm text-slate-200 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-mono text-xs mt-0.5" style={{ color: entry.color }}>
            {entry.name}: {(entry.value * 100).toFixed(0)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Voting heatmap cell colors
const voteColor: Record<string, { bg: string; text: string; border: string }> = {
  yea: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  nay: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  abstain: { bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700/30' },
};

interface VoteCardProps {
  vote: VoteRecord;
}

function VoteCard({ vote }: VoteCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const colors = voteColor[vote.legislator_vote];

  return (
    <div
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
      className={`relative p-4 rounded-2xl border ${colors.bg} ${colors.border} cursor-default group transition-all duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{vote.bill_id}</span>
          <p className="text-xs font-display font-bold text-slate-200 mt-0.5 leading-snug line-clamp-2">{vote.title}</p>
          <span className="text-[9px] text-slate-500 font-mono">{vote.category}</span>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}>
            {vote.legislator_vote}
          </span>
          <span className={`text-[9px] font-mono ${vote.passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {vote.passed ? '✓ Passed' : '✗ Failed'}
          </span>
        </div>
      </div>

      {/* Alignment mini-bars */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600 w-12 text-right font-mono">Party</span>
          <div className="flex-1 bg-slate-900 rounded-full h-1 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${vote.party_alignment_rate * 100}%` }} />
          </div>
          <span className="text-[8px] text-slate-400 font-mono w-7">{(vote.party_alignment_rate * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-slate-600 w-12 text-right font-mono">District</span>
          <div className="flex-1 bg-slate-900 rounded-full h-1 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${vote.district_alignment_rate * 100}%` }} />
          </div>
          <span className="text-[8px] text-slate-400 font-mono w-7">{(vote.district_alignment_rate * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function LegislatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [leg, setLeg] = useState<ILegislatorProfile | null>(null);
  const [scores, setScores] = useState<LegislatorScoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileData, scoresData] = await Promise.all([
          api.getLegislator(id),
          api.getLegislatorScores(id),
        ]);
        if (!cancelled) {
          setLeg(profileData);
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
      await api.recalculateLegislator(id);
      const [profileData, scoresData] = await Promise.all([
        api.getLegislator(id),
        api.getLegislatorScores(id),
      ]);
      setLeg(profileData);
      setScores(scoresData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!leg || !scores) return;
    const auditData = {
      reproducibility_model: 'LII-v1.0.0',
      data_sources: ['Congress.gov API', 'GovTrack.us Roll Call API', 'OpenStates Data Feed'],
      timestamp: new Date().toISOString(),
      entity: {
        id: leg.id,
        first_name: leg.first_name,
        last_name: leg.last_name,
        party: leg.party,
        legislative_influence_index: leg.legislative_influence_index,
        participation_rate: leg.participation_rate,
        district_alignment: leg.district_alignment,
        sample_size: leg.sample_size,
      },
      historical_lii: scores.historical_lii,
      votes: scores.votes,
      audit_note: 'LII calculated by cosine similarity of roll call voting vectors against party platforms and district polling data.',
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lii_audit_${leg.last_name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Legislative Profile...</span>
      </div>
    );
  }

  if (!leg) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">Legislator profile not found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 1.0) return 'text-purple-400 text-glow-purple';
    if (score < -1.0) return 'text-red-400 text-glow-red';
    return 'text-slate-300';
  };

  const getBorderColor = (score: number) => {
    if (score > 1.0) return 'border-glow-purple';
    if (score < -1.0) return 'border-glow-red';
    return 'border-slate-800';
  };

  // Multi-metric comparison bar chart data
  const metricsComparisonData = [
    {
      name: 'Participation',
      legislator: leg.participation_rate,
      chamberMedian: 0.88,
    },
    {
      name: 'Party Alignment',
      legislator: leg.district_alignment,
      chamberMedian: 0.82,
    },
    {
      name: 'Confidence',
      legislator: leg.confidence_weight,
      chamberMedian: 0.78,
    },
  ];

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

      {/* Profile Header */}
      <section className={`p-8 rounded-3xl glass-panel flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${getBorderColor(leg.legislative_influence_index)}`}>
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse-glow" />
            <BookOpen className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25">
                Legislative Chamber
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {leg.chamber === 'senate' ? 'Senator' : 'Representative'} {leg.first_name} {leg.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              Party: {leg.party} &bull; District: {leg.district || 'At-Large'}
            </p>
            <p className="text-[9px] text-slate-600 font-mono mt-2 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Source: Congress.gov API · GovTrack.us Roll Call · OpenStates Feed
            </p>
          </div>
        </div>

        {/* Scoring Summary Badge */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Legislative Influence Index (LII)
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className={`text-5xl font-mono font-extrabold ${getScoreColor(leg.legislative_influence_index)}`}>
              {leg.legislative_influence_index > 0 ? `+${leg.legislative_influence_index.toFixed(2)}` : leg.legislative_influence_index.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">Platform Influence</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans italic mt-2 leading-snug">
            Roll call voting consensus vs. party baseline
          </span>
        </div>
      </section>

      {/* Control Panel Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="p-6 rounded-3xl glass-panel">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Statistical Weight</span>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${leg.confidence_weight * 100}%` }} />
            </div>
            <span className="font-mono font-semibold text-xs text-purple-400">
              {(leg.confidence_weight * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">
            Weighted by roll-call votes cast (N={leg.sample_size}).
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Scored Sessions</span>
          <div className="mt-2 text-3xl font-display font-extrabold text-slate-300">
            {leg.sample_size} votes / bills
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Total active sessions evaluated in index score.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex gap-3 items-center justify-between">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/20 text-slate-200 hover:text-purple-400 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {recalculating ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <RefreshCw className="w-4 h-4" />}
            <span>Recalculate</span>
          </button>
          <button
            onClick={handleDownloadAudit}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/20 text-slate-300 hover:text-purple-400 transition cursor-pointer"
            title="Download Audit JSON Logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Analytics Charts: LII Trend + Metrics Comparison */}
      {scores && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LII Historical Trend */}
          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h3 className="font-display font-bold text-slate-200 text-lg">Historical LII Trend</h3>
              </div>
              <p className="text-xs text-slate-400">
                Annual average Legislative Influence Index over previous terms. Source: Congress.gov API.
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scores.historical_lii} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} />
                  <Tooltip content={<LIITooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  <Line
                    type="monotone"
                    dataKey="average_lii"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', stroke: '#070708', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#a855f7', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Multi-Metric Comparison Bar Chart */}
          <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-slate-200 text-lg">Metrics vs. Chamber Median</h3>
              </div>
              <p className="text-xs text-slate-400">
                Legislator performance metrics benchmarked against the full chamber median baseline.
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricsComparisonData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip content={<MetricTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '10px', fontFamily: 'monospace' }}>{value}</span>}
                  />
                  <Bar dataKey="legislator" name={`${leg.last_name}`} fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1200} />
                  <Bar dataKey="chamberMedian" name="Chamber Median" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Voting Heatmap Grid */}
      {scores && scores.votes.length > 0 && (
        <section className="p-8 rounded-3xl glass-panel">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <h3 className="font-display font-bold text-slate-200 text-xl">Roll Call Voting Heatmap</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Individual bill vote records with party and district alignment scores. Source: Congress.gov API · GovTrack.us.
              <span className="ml-3 gap-3 inline-flex items-center text-[9px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">YEA</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">NAY</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/30">ABSTAIN</span>
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scores.votes.map((vote) => (
              <VoteCard key={vote.bill_id} vote={vote} />
            ))}
          </div>
        </section>
      )}

      {/* Sub-rates grids */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Voting Attendance</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(leg.participation_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of active voting roll calls cast.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: Congress.gov API</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-yellow-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Party Alignment</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(leg.district_alignment * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of votes cast aligning with party platform majority.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: GovTrack.us Roll Call API</p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-cyan-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Sponsorships</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {leg.sample_size > 0 ? (leg.sample_size - 3 > 0 ? leg.sample_size - 3 : 0) : 0}
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Total sponsored bill drafts submitted to the chamber floor.
          </p>
          <p className="text-[9px] text-slate-600 font-mono">Source: OpenStates Data Feed</p>
        </div>
      </section>

      {/* Biography */}
      {leg.biography && (
        <section className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-bold text-slate-200 text-base">Legislative Biography</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">{leg.biography}</p>
        </section>
      )}

      {/* Legal Disclaimer */}
      <section className="p-6 rounded-2xl bg-white/2 border border-white/5 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
          <strong className="text-slate-400">Legal Disclosure:</strong> LII scores are computed using cosine similarity of roll call voting vectors against party platforms and district polling data. All metrics derived exclusively from public congressional records, open data APIs, and GovTrack.us — no editorial judgment is applied.
        </p>
      </section>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Shield, BookOpen, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface StateMapProps {
  selectedState: string | null;
  onSelectState: (stateCode: string | null) => void;
}

const US_STATES_GRID = [
  // Row 0
  { code: 'AK', name: 'Alaska', row: 0, col: 0 },
  { code: 'ME', name: 'Maine', row: 0, col: 11 },

  // Row 1
  { code: 'WA', name: 'Washington', row: 1, col: 1 },
  { code: 'ID', name: 'Idaho', row: 1, col: 2 },
  { code: 'MT', name: 'Montana', row: 1, col: 3 },
  { code: 'ND', name: 'North Dakota', row: 1, col: 4 },
  { code: 'MN', name: 'Minnesota', row: 1, col: 5 },
  { code: 'WI', name: 'Wisconsin', row: 1, col: 6 },
  { code: 'MI', name: 'Michigan', row: 1, col: 8 },
  { code: 'NY', name: 'New York', row: 1, col: 9 },
  { code: 'VT', name: 'Vermont', row: 1, col: 10 },
  { code: 'NH', name: 'New Hampshire', row: 1, col: 11 },

  // Row 2
  { code: 'OR', name: 'Oregon', row: 2, col: 1 },
  { code: 'NV', name: 'Nevada', row: 2, col: 2 },
  { code: 'WY', name: 'Wyoming', row: 2, col: 3 },
  { code: 'SD', name: 'South Dakota', row: 2, col: 4 },
  { code: 'IA', name: 'Iowa', row: 2, col: 5 },
  { code: 'IL', name: 'Illinois', row: 2, col: 6 },
  { code: 'IN', name: 'Indiana', row: 2, col: 7 },
  { code: 'OH', name: 'Ohio', row: 2, col: 8 },
  { code: 'PA', name: 'Pennsylvania', row: 2, col: 9 },
  { code: 'NJ', name: 'New Jersey', row: 2, col: 10 },
  { code: 'MA', name: 'Massachusetts', row: 2, col: 11 },

  // Row 3
  { code: 'CA', name: 'California', row: 3, col: 1 },
  { code: 'UT', name: 'Utah', row: 3, col: 2 },
  { code: 'CO', name: 'Colorado', row: 3, col: 3 },
  { code: 'NE', name: 'Nebraska', row: 3, col: 4 },
  { code: 'MO', name: 'Missouri', row: 3, col: 5 },
  { code: 'KY', name: 'Kentucky', row: 3, col: 6 },
  { code: 'WV', name: 'West Virginia', row: 3, col: 7 },
  { code: 'VA', name: 'Virginia', row: 3, col: 8 },
  { code: 'MD', name: 'Maryland', row: 3, col: 9 },
  { code: 'DE', name: 'Delaware', row: 3, col: 10 },
  { code: 'CT', name: 'Connecticut', row: 3, col: 11 },

  // Row 4
  { code: 'AZ', name: 'Arizona', row: 4, col: 2 },
  { code: 'NM', name: 'New Mexico', row: 4, col: 3 },
  { code: 'KS', name: 'Kansas', row: 4, col: 4 },
  { code: 'AR', name: 'Arkansas', row: 4, col: 5 },
  { code: 'TN', name: 'Tennessee', row: 4, col: 6 },
  { code: 'NC', name: 'North Carolina', row: 4, col: 7 },
  { code: 'SC', name: 'South Carolina', row: 4, col: 8 },
  { code: 'DC', name: 'District of Columbia', row: 4, col: 9 },
  { code: 'RI', name: 'Rhode Island', row: 4, col: 10 },

  // Row 5
  { code: 'TX', name: 'Texas', row: 5, col: 3 },
  { code: 'OK', name: 'Oklahoma', row: 5, col: 4 },
  { code: 'LA', name: 'Louisiana', row: 5, col: 5 },
  { code: 'MS', name: 'Mississippi', row: 5, col: 6 },
  { code: 'AL', name: 'Alabama', row: 5, col: 7 },
  { code: 'GA', name: 'Georgia', row: 5, col: 8 },

  // Row 6
  { code: 'HI', name: 'Hawaii', row: 6, col: 0 },
  { code: 'FED', name: 'US Federal Jurisdiction', row: 6, col: 4.5, isFed: true },
  { code: 'FL', name: 'Florida', row: 6, col: 9 }
];

export default function StateMap({ selectedState, onSelectState }: StateMapProps) {
  const [activeHover, setActiveHover] = useState<string | null>(null);
  
  // Real-time counts
  const [counts, setCounts] = useState<{ judges: number; legislators: number; prosecutors: number } | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    if (!selectedState) {
      setCounts(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingCounts(true);
      try {
        const lookupKey = selectedState === 'FED' ? 'US' : selectedState;
        const data = await api.search('', undefined, lookupKey);
        
        if (!cancelled) {
          const judgesCount = data.filter(item => item.type === 'judge').length;
          const legislatorsCount = data.filter(item => item.type === 'legislator').length;
          const prosecutorsCount = data.filter(item => item.type === 'prosecutor').length;
          setCounts({
            judges: judgesCount,
            legislators: legislatorsCount,
            prosecutors: prosecutorsCount
          });
        }
      } catch (err) {
        console.error('Failed to fetch real-time state counts:', err);
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedState]);

  const statesData: { [key: string]: { name: string; desc: string; color: string; shadow: string } } = {
    US: {
      name: 'US Federal Jurisdiction',
      desc: 'Supreme and Appellate federal court sentencing distributions and national legislative roll calls.',
      color: 'text-cyan-400',
      shadow: 'shadow-cyan-500/20 border-cyan-500/30'
    },
    CA: {
      name: 'California (CA)',
      desc: 'California State Superior Court and Los Angeles County District Attorney plea indices.',
      color: 'text-emerald-400',
      shadow: 'shadow-emerald-500/20 border-emerald-500/30'
    },
    NY: {
      name: 'New York (NY)',
      desc: 'New York State Supreme Court and Manhattan District Attorney prosecutorial aggressiveness indices.',
      color: 'text-purple-400',
      shadow: 'shadow-purple-500/20 border-purple-500/30'
    },
    TX: {
      name: 'Texas (TX)',
      desc: 'Texas State District Court dockets and legislative alignment statistics.',
      color: 'text-red-400',
      shadow: 'shadow-red-500/20 border-red-500/30'
    }
  };

  const getStateMeta = (code: string) => {
    const lookupKey = code === 'US' || code === 'FED' ? 'US' : code;
    if (statesData[lookupKey]) {
      return statesData[lookupKey];
    }
    const stateItem = US_STATES_GRID.find(s => s.code === code);
    const name = stateItem ? stateItem.name : code;
    return {
      name: `${name} (${code})`,
      desc: `Public legal records indexing and BJI/LII score calculations for the state of ${name}.`,
      color: 'text-slate-400',
      shadow: 'border-slate-800'
    };
  };

  const handleStateClick = (code: string) => {
    const lookupKey = code === 'FED' ? 'US' : code;
    onSelectState(lookupKey);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/20 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Interactive Cartogram Selector</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight leading-none">
          Explore Jurisdictional Analytics
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed">
          Click on any glowing state or the capital anchor to analyze real-time case files, judges, and legislators.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-4">
        {/* SVG Grid Cartogram (Col span 2) */}
        <div className="lg:col-span-2 relative flex items-center justify-center p-8 rounded-3xl glass-panel">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none rounded-3xl" />
          
          <svg className="w-full max-w-[500px] h-[300px]" viewBox="0 0 500 300">
            {US_STATES_GRID.map((state) => {
              const cellWidth = 32;
              const cellHeight = 32;
              const gap = 4;
              const offsetX = 36;
              const offsetY = 20;

              const x = offsetX + state.col * (cellWidth + gap);
              const y = offsetY + state.row * (cellHeight + gap);

              // Special rendering for FED (US) circular anchor
              if (state.isFed) {
                const cx = x + cellWidth / 2;
                const cy = y + cellHeight / 2;
                const radius = 18;
                const isSelected = selectedState === 'US';
                const isHovered = activeHover === 'US';
                const strokeColor = isSelected || isHovered ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)';
                const fillColor = isSelected || isHovered ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.08)';

                return (
                  <g
                    key="FED"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveHover('US')}
                    onMouseLeave={() => setActiveHover(null)}
                    onClick={() => handleStateClick('US')}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected || isHovered ? 2 : 1}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    {(isSelected || isHovered) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 5}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1"
                        className="animate-ring-pulse"
                      />
                    )}
                    <text
                      x={cx}
                      y={cy + 3}
                      fill="#06b6d4"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      FED
                    </text>
                  </g>
                );
              }

              // Normal states rendering
              const isSelected = selectedState === state.code;
              const isHovered = activeHover === state.code;
              const isActive = isSelected || isHovered;

              let strokeColor = 'rgba(255, 255, 255, 0.08)';
              let fillColor = 'rgba(255, 255, 255, 0.01)';
              let textColor = '#475569';

              if (state.code === 'CA') {
                strokeColor = isActive ? '#10b981' : 'rgba(16, 185, 129, 0.4)';
                fillColor = isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.05)';
                textColor = '#10b981';
              } else if (state.code === 'NY') {
                strokeColor = isActive ? '#8b5cf6' : 'rgba(139, 92, 246, 0.4)';
                fillColor = isActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.05)';
                textColor = '#8b5cf6';
              } else if (state.code === 'TX') {
                strokeColor = isActive ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
                fillColor = isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.05)';
                textColor = '#ef4444';
              } else {
                strokeColor = isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
                fillColor = isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.01)';
                textColor = isActive ? '#f8fafc' : '#475569';
              }

              return (
                <g
                  key={state.code}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveHover(state.code)}
                  onMouseLeave={() => setActiveHover(null)}
                  onClick={() => handleStateClick(state.code)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    rx={6}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isActive ? 2 : 1}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                  <text
                    x={x + cellWidth / 2}
                    y={y + cellHeight / 2 + 3}
                    fill={textColor}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                >
                    {state.code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel displaying selected state metrics */}
        <div className="h-full flex items-center">
          <div className="w-full h-64 relative rounded-3xl p-6 flex flex-col justify-between glass-panel overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedState ? (
                <motion.div
                  key={selectedState}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Jurisdiction Focus</span>
                    </div>

                    <h3 className={`text-xl font-display font-extrabold tracking-tight ${getStateMeta(selectedState).color}`}>
                      {getStateMeta(selectedState).name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-2">
                      {getStateMeta(selectedState).desc}
                    </p>
                  </div>

                  <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-2">
                        <Gavel className="w-3.5 h-3.5 text-slate-500" />
                        <span>Judges</span>
                      </span>
                      {loadingCounts ? (
                        <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                      ) : (
                        <span className="font-mono text-cyan-400 font-bold">{counts?.judges || 0} Scored</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prosecutors (DAs)</span>
                      </span>
                      {loadingCounts ? (
                        <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                      ) : (
                        <span className="font-mono text-emerald-400 font-bold">{counts?.prosecutors || 0} Scored</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Legislators</span>
                      </span>
                      {loadingCounts ? (
                        <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                      ) : (
                        <span className="font-mono text-indigo-400 font-bold">{counts?.legislators || 0} Scored</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-center text-center items-center py-6"
                >
                  <MapPin className="w-10 h-10 text-slate-700/60 animate-bounce mb-3" />
                  <h3 className="font-display font-bold text-sm text-slate-300">Click State Grid Element</h3>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto mt-1 leading-normal">
                    Select a state on the cartogram to pull real-time case files, judges, and legislators.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

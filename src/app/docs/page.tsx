'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Gavel, Shield, BookOpen, Search, Info, Scale, Clock, Activity, FileText } from 'lucide-react';

const DOC_SECTIONS = [
  { id: 'overview', title: 'Platform Overview', icon: Activity },
  { id: 'how-it-works', title: 'How Benchmark Justice Works', icon: Scale },
  { id: 'data-sources', title: 'Data Sources & Live APIs', icon: FileText },
  { id: 'bji', title: 'BJI (Benchmark Judge Index)', icon: Gavel },
  { id: 'pdi', title: 'PDI (Prosecutorial Decision Index)', icon: Shield },
  { id: 'lii', title: 'LII (Legislative Influence Index)', icon: BookOpen },
  { id: 'search-guide', title: 'Advanced Search Guide', icon: Search },
  { id: 'faq', title: 'Frequently Asked Questions', icon: HelpCircle },
  { id: 'disclaimer', title: 'Legal Disclosures', icon: Info },
  { id: 'history', title: 'Version History', icon: Clock }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4 min-h-[calc(100vh-120px)] relative">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto pr-1">
        <div className="p-5 rounded-2xl glass-panel flex flex-col gap-2">
          <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Documentation Menu</div>
          {DOC_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-sans font-medium uppercase tracking-wider transition flex items-center gap-3 cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{sec.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Documentation Content Area */}
      <main className="flex-1 space-y-12 pb-16">
        
        {/* Section 1: Platform Overview */}
        <section id="overview" className="p-8 rounded-3xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 filter blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Platform Overview</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              Welcome to the <strong>Benchmark Justice™ Legal Analytics platform</strong>. Benchmark Justice is a modern, data-driven indexer that compiles and normalizes public docket information, court opinions, and legislative activities into transparent indices.
            </p>
            <p>
              By leveraging advanced mathematical normalization techniques (specifically, statistical z-scores), the engine computes relative deviation metrics across three critical divisions: the <strong>Judicial Division</strong>, the <strong>Prosecutorial Division</strong>, and the <strong>Legislative Division</strong>.
            </p>
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 text-slate-400 text-xs italic">
              <strong>Core Objective:</strong> To build a legal data-mining and mathematical analysis suite that remains entirely transparent, reproducible, and verifiable, sourcing raw data exclusively from public APIs.
            </div>
          </div>
        </section>

        {/* Section 2: How it Works */}
        <section id="how-it-works" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">How Benchmark Justice Works</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              Benchmark Justice does not employ subjective ratings, political labels, or editorial opinions. Instead, the platform queries public records and runs statistical formulas to measure relative actions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li><strong>Data Ingestion:</strong> Direct extraction of active dockets and vote rosters.</li>
              <li><strong>Classification:</strong> Records are mapped by localized court or congressional district.</li>
              <li><strong>Normalization:</strong> Calculating deviation from peer medians (mean baseline).</li>
              <li><strong>Scoring:</strong> Publication of index ratings ranging from negative to positive standard deviations.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Data Sources & Live APIs */}
        <section id="data-sources" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Data Sources & Live APIs</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              Our data processing engine communicates directly with official government and community data repositories:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-black/45 border border-white/5">
                <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider text-[10px]">CourtListener (RECAP Project)</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Queries litigation opinions and dockets. Used to trace federal/state judge rulings and case records.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/45 border border-white/5">
                <span className="font-mono text-indigo-400 font-bold uppercase tracking-wider text-[10px]">GitHub Congress Registry</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Retrieves live term details for all active Senators and Representatives representing U.S. districts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: BJI Explanation */}
        <section id="bji" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Gavel className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">BJI (Benchmark Judge Index)</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              The **Benchmark Judge Index (BJI)** measures sentencing deviation. By extracting opinions filed by a specific judge and comparing their sentence durations against regional peer medians for the same crime category:
            </p>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-500">// BJI Scoring Formula</div>
              <div>BJI (z-score) = (Judge Sentence - Peer Median Sentence) / Standard Deviation</div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li><strong className="text-red-400">Positive BJI (+1.5, +2.1):</strong> Reflects sentencing profiles that are longer than the statistical median.</li>
              <li><strong className="text-emerald-400">Negative BJI (-0.6, -1.2):</strong> Reflects sentencing profiles that are shorter than the statistical median.</li>
              <li><strong>Zero BJI (0.0):</strong> Indicates consistent alignment with baseline peer medians.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: PDI Explanation */}
        <section id="pdi" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">PDI (Prosecutorial Decision Index)</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              The **Prosecutorial Decision Index (PDI)** measures prosecutorial aggressiveness. It processes decisions regarding plea bargaining ratios, charge reductions, and case dismissal rates:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
              <li>High conviction efficiency and low charge reduction rates result in a higher PDI, denoting a strict prosecutorial strategy.</li>
              <li>High dismissal rates and frequent charge reduction packages result in a lower PDI, denoting a reform-focused or selective prosecutorial strategy.</li>
            </ul>
          </div>
        </section>

        {/* Section 6: LII Explanation */}
        <section id="lii" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">LII (Legislative Influence Index)</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-4 font-sans">
            <p>
              The **Legislative Influence Index (LII)** measures a legislator's voting alignment and structural influence. It calculates the cosine similarity of their voting vector against the respective party platform and district constituency preferences.
            </p>
            <p className="text-slate-400">
              LII score increases with term longevity and committee assignments, reflecting the legislator's capability to steer legislative rosters and pass key bills.
            </p>
          </div>
        </section>

        {/* Section 7: Search Guide */}
        <section id="search-guide" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Advanced Search Guide</h2>
          </div>
          <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
            <p>
              To locate specific entities in the index database, use the following tips:
            </p>
            <ul className="list-decimal list-inside space-y-2 text-slate-400 pl-2">
              <li><strong>Autocomplete:</strong> Type the first two letters of any name to display instant matching cards.</li>
              <li><strong>Filter by State:</strong> Enter a state postal code (e.g. `NY`, `CA`) to restrict the search.</li>
              <li><strong>Type Selectors:</strong> Click on the dropdown menu to narrow matches down to Judges, Legislators, Courts, or Cases.</li>
            </ul>
          </div>
        </section>

        {/* Section 8: FAQ */}
        <section id="faq" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6 font-sans">
            <div>
              <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Q: Where does the data come from?</h4>
              <p className="text-xs text-slate-400 mt-1">A: Sourced strictly in real-time from the CourtListener search API and Congress legislators current term dataset.</p>
            </div>
            <div>
              <h4 className="text-slate-200 font-bold text-xs uppercase tracking-wider">Q: How often is the database refreshed?</h4>
              <p className="text-xs text-slate-400 mt-1">A: Autocomplete indexes are fetched fresh on demand and cached in-memory inside serverless function contexts.</p>
            </div>
          </div>
        </section>

        {/* Section 9: Disclaimer */}
        <section id="disclaimer" className="p-8 rounded-3xl glass-panel border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.01)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Legal Disclosures</h2>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed space-y-3 font-sans">
            <p>
              <strong>Disclaimer:</strong> All indexes (BJI, PDI, LII) published by Benchmark Justice™ are statistical measurements generated via algorithmic normalization equations. They do not constitute ethical reviews, character evaluations, legal advice, or official performance audits.
            </p>
            <p>
              Users must not rely on these index metrics for hiring, electoral decision-making, or legal representation selection.
            </p>
          </div>
        </section>

        {/* Section 10: Version History */}
        <section id="history" className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">Version History</h2>
          </div>
          <div className="text-xs text-slate-400 space-y-4 font-mono">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>v2.1.0 (Current)</span>
              <span>API Integration & Dynamic State Cartogram Mapping</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>v2.0.0</span>
              <span>Next.js API Ingestion Conversion (Backend-free architecture)</span>
            </div>
            <div className="flex justify-between pb-2">
              <span>v1.0.0</span>
              <span>Static prototype mapping interface</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

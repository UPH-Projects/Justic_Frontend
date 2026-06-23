"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, Bug } from "lucide-react";
import BugReportModal from "@/components/BugReportModal";

export default function Header() {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#040405]/80 backdrop-blur-xl shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-6">
          
          {/* Centered Brand Stack (Logo on top, Text below) */}
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Logo icon */}
            <Link 
              href="/" 
              className="group flex items-center justify-center"
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300 flex-shrink-0">
                <img 
                  src="/favicon.jpg" 
                  alt="Benchmark Justice Logo" 
                  className="w-32 h-32 sm:w-44 sm:h-44 object-cover" 
                />
              </div>
            </Link>
            
            {/* Brand text */}
            <Link 
              href="/" 
              className="flex flex-col items-center group"
            >
              <span className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-slate-100 tracking-tight leading-none group-hover:text-glow-cyan transition-all">
                Benchmark <span className="text-cyan-400">Justice™</span>
              </span>
              <span className="text-[9px] sm:text-[10px] lg:text-xs text-slate-400 font-mono uppercase tracking-[0.2em] mt-2">
                Analytics Engine V2
              </span>
            </Link>
          </div>

          {/* Navigation Buttons (starts below the logo stack) */}
          <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 lg:gap-8 w-full max-w-2xl mt-2">
            <Link
              href="/"
              className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-300 hover:text-cyan-400 uppercase tracking-widest transition-all duration-300 py-2 px-4 sm:px-5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center justify-center"
            >
              Dashboard
            </Link>
            <Link
              href="/courtlistener"
              className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-300 hover:text-cyan-400 uppercase tracking-widest transition-all duration-300 py-2 px-4 sm:px-5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center justify-center"
            >
              CourtListener
            </Link>
            <a
              href="/docs"
              target="_blank"
              className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-300 hover:text-cyan-400 uppercase tracking-widest transition-all duration-300 py-2 px-4 sm:px-5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center gap-1.5 justify-center"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 h-4 flex-shrink-0" />
              <span>Documentation</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Floating Sticky Bug Report Button on the Right Edge */}
      <button
        onClick={() => setIsBugModalOpen(true)}
        className="fixed right-6 bottom-6 z-[90] flex items-center justify-center p-3 rounded-full bg-[#0d0d11]/85 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-105 cursor-pointer group"
      >
        <Bug className="w-5 h-5 flex-shrink-0 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      <BugReportModal 
        isOpen={isBugModalOpen} 
        onClose={() => setIsBugModalOpen(false)} 
      />
    </>
  );
}

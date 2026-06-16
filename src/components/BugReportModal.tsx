"use client";

import React, { useState, useEffect } from "react";
import { X, Bug, CheckCircle, AlertCircle, Loader2, Upload, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load token from localStorage or Env on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("bug_report_token") || "";
      const envToken = process.env.NEXT_PUBLIC_BUG_REPORT_TOKEN || "";
      setToken(savedToken || envToken);
    }
  }, [isOpen]);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bug title is required");
      return;
    }
    if (!description.trim()) {
      setError("Bug description is required");
      return;
    }
    if (!token.trim()) {
      setError("Authentication token is missing. Please set NEXT_PUBLIC_BUG_REPORT_TOKEN or verify your configuration.");
      return;
    }

    setSubmitting(true);

    try {
      let attachments: any[] = [];
      
      // If a file is selected, upload it first
      if (selectedFile) {
        const uploadRes = await api.uploadFile(selectedFile, token.trim());
        if (uploadRes?.attachment) {
          attachments.push(uploadRes.attachment);
        }
      }

      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
      await api.postBug({
        title: title.trim(),
        description: description.trim(),
        token: token.trim(),
        path: currentPath,
        attachments
      });

      setSuccess(true);
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err: any) {
      setError(err.message || "Failed to submit bug report. Please verify your token.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#040405]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d11]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 glass-panel animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100">Submit Bug Report</h2>
          </div>
        </div>

        {success ? (
          /* Success State */
          <div className="flex flex-col items-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-display font-extrabold text-xl text-slate-100 mb-2">Bug Reported Successfully!</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Thank you for reporting this issue. It has been registered in our tracking system.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors uppercase tracking-widest cursor-pointer"
              >
                Report Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-xs font-bold text-white transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-normal animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-1.5">
              <label htmlFor="bug-title" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Bug Title <span className="text-red-400">*</span>
              </label>
              <input
                id="bug-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Briefly describe the issue..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300"
                required
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="bug-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="bug-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide steps to reproduce, actual results, and expected behavior..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300 resize-none"
                required
              />
            </div>

            {/* Screenshot/Image Attachment Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Attach Screenshot / Image
              </label>
              
              {filePreview ? (
                /* File Preview State */
                <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-2 flex items-center justify-between group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-black/40">
                      <img 
                        src={filePreview} 
                        alt="Screenshot Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer mr-1"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Empty Input Area */
                <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/40 cursor-pointer transition-all duration-300 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1.5" />
                    <p className="text-xs text-slate-400 group-hover:text-slate-300">
                      Click to upload an image / screenshot
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          setError("File size exceeds 10MB limit");
                          return;
                        }
                        setSelectedFile(file);
                        setFilePreview(URL.createObjectURL(file));
                        setError(null);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl border border-white/5 hover:border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-xs font-bold text-white transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Bug</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

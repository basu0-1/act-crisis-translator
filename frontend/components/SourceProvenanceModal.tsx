"use client";

import React from "react";
import { ShieldCheck, X, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { SourceProvenance } from "../types";

interface SourceProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provenance: SourceProvenance;
}

export const SourceProvenanceModal: React.FC<SourceProvenanceModalProps> = ({
  isOpen,
  onClose,
  provenance,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">
              Data Source & Trust Hierarchy
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Active Issuing Authority</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-600/40">
                LEVEL {provenance.source_level} (HIGHEST TRUST)
              </span>
            </div>
            <p className="text-sm font-bold text-white">{provenance.source_name}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Confidence: {(provenance.confidence * 100).toFixed(1)}%</span>
              <span>Timestamp: {new Date(provenance.timestamp).toUTCString()}</span>
            </div>
          </div>

          {/* 4 Trust Levels Reference */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              ACT Trust Hierarchy (Higher-Trust Always Overrides)
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">LEVEL 1: Official Emergency Authority</span>
                  <p className="text-[11px] text-slate-300">National Disaster Management, Police, Meteorological Services (Authoritative)</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start space-x-2 opacity-80">
                <span className="h-4 w-4 text-slate-500 text-center font-bold">2</span>
                <div>
                  <span className="font-semibold text-slate-200">LEVEL 2: Trusted Infrastructure Telemetry</span>
                  <p className="text-[11px] text-slate-400">River sensors, dam telemetry, highway traffic cameras</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start space-x-2 opacity-70">
                <span className="h-4 w-4 text-slate-500 text-center font-bold">3</span>
                <div>
                  <span className="font-semibold text-slate-200">LEVEL 3: Verified Local Responder Reports</span>
                  <p className="text-[11px] text-slate-400">First responders and community shelter marshals</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-start space-x-2 opacity-60">
                <span className="h-4 w-4 text-slate-500 text-center font-bold">4</span>
                <div>
                  <span className="font-semibold text-slate-200">LEVEL 4: Crowdsourced Social Reports</span>
                  <p className="text-[11px] text-slate-400">Unverified public feeds (Requires validation before routing)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
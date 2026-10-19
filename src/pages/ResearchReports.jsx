import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Sparkles, Clock, CheckCircle2, 
  ExternalLink, FileDown, ShieldAlert, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResearchReports = () => {
  const { activeExperiment } = useAuth();
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    if (!activeExperiment) return;
    try {
      setLoading(true);
      const data = await api.getReports(activeExperiment.id);
      setReports(data);
    } catch (e) {
      console.warn("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeExperiment]);

  const handleGenerateReport = async () => {
    if (!activeExperiment) return;
    setGenerating(true);
    try {
      const res = await api.generateReport(activeExperiment.id);
      setReports([res, ...reports]);
      alert("Executive PDF Intelligence Dossier generated successfully!");
    } catch (err) {
      alert("PDF generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#34D399]" />
            <h1 className="font-royal-title text-2xl font-bold text-white">
              Executive Research Dossiers (PDF)
            </h1>
          </div>
          <p className="text-xs text-[#E6F4EA]">
            Generate and download publication-grade PDF research dossiers formatted with royal green styling, tables, and linked evidence.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-[#062319]" />
          <span>{generating ? "Formatting 18 Sections..." : "Generate New Executive PDF"}</span>
        </button>
      </div>

      {/* Mandatory Notice */}
      <div className="p-4 rounded-xl bg-[#0A3324] border border-white/20 flex items-center gap-3 text-xs text-[#E6F4EA] shadow-md">
        <ShieldAlert className="w-4 h-4 text-[#34D399] shrink-0" />
        <span>
          Reports automatically embed the mandatory synthetic research disclaimer, persona consistency benchmarks, and real-world validation recommendations.
        </span>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 flex flex-col justify-between space-y-4 shadow-lg hover:border-white/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-[#0E3D2E] text-[#34D399] border border-white/20">
                  ReportLab Engine
                </span>
                <span className="text-[10px] text-[#A7F3D0]">
                  {new Date(report.generated_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-royal-title text-base font-bold text-white mb-2 leading-snug">
                {report.title}
              </h3>

              <div className="space-y-1.5 text-xs text-[#E6F4EA] border-t border-white/10 pt-3">
                <p>Format: <strong className="text-white">Editorial PDF (Numbered Canvas)</strong></p>
                <p>Sections Included: <strong className="text-white">All 18 Mandatory Chapters</strong></p>
                <p>Color Palette: <strong className="text-[#34D399]">Royal Emerald & Crisp White</strong></p>
              </div>
            </div>

            <a
              href={`/api/reports/${report.id}/download`}
              download
              className="w-full py-2.5 rounded-lg bg-[#0E3D2E] hover:bg-white hover:text-[#062319] border border-white/20 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Publication PDF</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchReports;

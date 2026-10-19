import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  Quote, ShieldAlert, RefreshCw, Layers, TrendingUp, Filter
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ["All Categories", "Pricing & Unit Economics", "Delivery SLA & Speed", "Health & Nutrition", "Subscription & Monetization"];

const InsightsDashboard = () => {
  const { activeExperiment } = useAuth();
  const [insightRun, setInsightRun] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadInsights = async () => {
    if (!activeExperiment) return;
    try {
      setLoading(true);
      const res = await api.getInsights(activeExperiment.id);
      setInsightRun(res);
    } catch (e) {
      console.warn("Failed to load insights:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [activeExperiment]);

  const handleReRunInsights = async () => {
    if (!activeExperiment) return;
    setRunning(true);
    try {
      const res = await api.runInsights(activeExperiment.id);
      setInsightRun(res);
    } catch (e) {
      alert("Failed to run insights: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  const filteredThemes = insightRun?.themes?.filter(t => {
    if (selectedCategory === "All Categories") return true;
    return t.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#34D399]" />
            <h1 className="font-royal-title text-2xl font-bold text-white">
              Insight Intelligence Agent
            </h1>
          </div>
          <p className="text-xs text-[#E6F4EA]">
            Extracted strategic findings, theme clusters, and verified participant evidence grounded in stored survey and interview data.
          </p>
        </div>

        <button
          onClick={handleReRunInsights}
          disabled={running}
          className="px-5 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#062319] ${running ? 'animate-spin' : ''}`} />
          <span>{running ? "Analyzing Evidence..." : "Re-Run Insight Agent"}</span>
        </button>
      </div>

      {/* Synthesis Summary Card */}
      {insightRun && (
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399]">
              Executive Research Synthesis
            </span>
            <span className="text-xs font-semibold text-white">
              {insightRun.adoption_rate}% Simulated Adoption Potential
            </span>
          </div>
          <p className="text-sm text-white leading-relaxed font-serif-royal">
            {insightRun.summary}
          </p>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-[#062319] font-bold shadow-sm'
                : 'bg-[#0A3324] border border-white/15 text-[#E6F4EA] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Themes List */}
      <div className="space-y-6">
        {filteredThemes.map((theme) => {
          const isNegative = theme.sentiment === 'negative';
          const isPositive = theme.sentiment === 'positive';

          return (
            <div
              key={theme.id}
              className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-5 transition-all shadow-lg hover:border-white/40"
            >
              {/* Theme Top Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded border ${
                      isNegative
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                        : isPositive
                        ? 'bg-[#0E3D2E] border-white/20 text-[#34D399]'
                        : 'bg-[#062319] border-white/20 text-white'
                    }`}>
                      {theme.category}
                    </span>
                    <span className="text-xs text-[#A7F3D0]">
                      Confidence: <strong className="text-white font-mono">{Math.round(theme.confidence * 100)}%</strong>
                    </span>
                  </div>
                  <h2 className="font-royal-title text-lg font-bold text-white">{theme.title}</h2>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-[#A7F3D0]">
                    Supported by <strong>{theme.participant_count} personas</strong>
                  </span>
                </div>
              </div>

              {/* Theme Narrative */}
              <p className="text-xs text-[#E6F4EA] leading-relaxed">
                {theme.summary}
              </p>

              {/* Supporting Quotes Box */}
              {theme.supporting_quotes?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#34D399] block">
                    Verified Synthetic Quotations
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {theme.supporting_quotes.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#062319] border-l-2 border-[#34D399] border-r border-t border-b border-white/10">
                        <Quote className="w-3.5 h-3.5 text-[#34D399]/60 mb-1" />
                        <p className="text-xs text-white/90 italic leading-relaxed">
                          "{q.quote}"
                        </p>
                        <p className="text-[10px] text-[#34D399] mt-2 font-mono">
                          — {q.persona_name} <span className="text-white/60">({q.persona_segment})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Implication Box */}
              {theme.product_implication && (
                <div className="p-4 rounded-xl bg-[#0E3D2E] border border-white/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#34D399] block mb-1">
                    Strategic Product Implication
                  </span>
                  <p className="text-xs text-[#E6F4EA] leading-relaxed">
                    {theme.product_implication}
                  </p>
                </div>
              )}

              {/* Counterexamples & Limitations */}
              {(theme.counterexamples || theme.limitations) && (
                <div className="pt-2 text-[11px] text-[#A7F3D0] space-y-1">
                  {theme.counterexamples && (
                    <p><strong>Divergence / Counterexample:</strong> {theme.counterexamples}</p>
                  )}
                  {theme.limitations && (
                    <p className="text-white/70"><strong>Limitations:</strong> {theme.limitations}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsDashboard;

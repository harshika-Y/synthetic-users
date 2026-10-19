import React, { useState, useEffect } from 'react';
import { 
  Gauge, TrendingUp, AlertTriangle, CheckCircle2, 
  HelpCircle, RefreshCw, BarChart2, ShieldAlert, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdoptionScoring = () => {
  const { activeExperiment } = useAuth();
  const [adoptionData, setAdoptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const loadAdoption = async () => {
    if (!activeExperiment) return;
    try {
      setLoading(true);
      const res = await api.getAdoption(activeExperiment.id);
      setAdoptionData(res);
    } catch (e) {
      console.warn("Failed to load adoption data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdoption();
  }, [activeExperiment]);

  const handleRecalculate = async () => {
    if (!activeExperiment) return;
    setRunning(true);
    try {
      const res = await api.runAdoption(activeExperiment.id);
      setAdoptionData(res);
    } catch (e) {
      alert("Recalculate failed: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-5 h-5 text-[#34D399]" />
            <h1 className="font-royal-title text-2xl font-bold text-white">
              Product Adoption Scoring Module
            </h1>
          </div>
          <p className="text-xs text-[#E6F4EA]">
            Evaluating stated willingness to adopt Kadappa Cafe Express across 5 weighted feature dimensions.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={running}
          className="px-5 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#062319] ${running ? 'animate-spin' : ''}`} />
          <span>{running ? "Scoring Cohort..." : "Recalculate Scores"}</span>
        </button>
      </div>

      {/* Transparent Formula Card */}
      <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#34D399] block mb-1">
            Explainable Evaluation Algorithm
          </span>
          <h2 className="font-royal-title text-base font-bold text-white">
            Core Question: “Would this persona use Kadappa Cafe Express?”
          </h2>
          <p className="text-xs text-[#E6F4EA] font-mono mt-1">
            Formula: Score = 0.25*(30-Min SLA) + 0.20*(Millet & Nutrition) + 0.20*(Morning Pass ROI) + 0.15*(Live GPS) + 0.20*(Fee Elasticity)
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-[#A7F3D0]">Overall Mean Cohort Score</p>
          <p className="font-royal-title text-3xl font-bold text-white mt-0.5">
            {adoptionData?.average_score || 72.5}/100
          </p>
        </div>
      </div>

      {/* Segment Breakdown Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-royal-title text-lg font-bold text-white">
          Aggregated Segment Performance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adoptionData?.segments?.map((seg, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-4 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{seg.segment}</span>
                  <span className="font-royal-title text-lg font-bold text-[#34D399]">
                    {seg.mean_score}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#062319] overflow-hidden mb-3 border border-white/10">
                  <div
                    className={`h-full ${seg.mean_score >= 75 ? 'bg-[#34D399]' : seg.mean_score >= 60 ? 'bg-white' : 'bg-rose-400'}`}
                    style={{ width: `${seg.mean_score}%` }}
                  />
                </div>

                <div className="space-y-2 text-xs text-[#E6F4EA]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#34D399]">Top Valued Feature:</span>
                    <p className="text-white font-medium">{seg.top_feature}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-300">Primary Friction / Barrier:</span>
                    <p className="text-white font-medium">{seg.main_objection}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-[#A7F3D0]">
                {seg.reasoning}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Personas Detailed Score Table */}
      <div className="space-y-4">
        <h2 className="font-royal-title text-lg font-bold text-white">
          Individual Persona Dossier Scores
        </h2>

        <div className="rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#062319] border-b border-white/20 text-[10px] uppercase font-bold text-[#34D399]">
                <th className="p-4">Persona Name</th>
                <th className="p-4">Segment Archetype</th>
                <th className="p-4">Score</th>
                <th className="p-4">Intention</th>
                <th className="p-4">Key Driver</th>
                <th className="p-4">Key Barrier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {adoptionData?.scores?.map((score) => (
                <tr key={score.persona_id} className="hover:bg-[#0E3D2E]/40 transition-colors">
                  <td className="p-4 font-bold text-white">{score.persona_name}</td>
                  <td className="p-4 text-[#A7F3D0]">{score.persona_segment}</td>
                  <td className="p-4 font-royal-title text-sm font-bold text-[#34D399]">
                    {score.overall_score}/100
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      score.stated_intention === 'High' 
                        ? 'bg-[#0E3D2E] text-[#34D399] border border-white/20' 
                        : score.stated_intention === 'Moderate'
                        ? 'bg-[#062319] text-white border border-white/20'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                    }`}>
                      {score.stated_intention}
                    </span>
                  </td>
                  <td className="p-4 text-[#34D399] truncate max-w-[180px]">
                    {score.drivers?.[0] || "30-Min Delivery"}
                  </td>
                  <td className="p-4 text-rose-300 truncate max-w-[180px]">
                    {score.barriers?.[0] || "₹99 Delivery Fee"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdoptionScoring;

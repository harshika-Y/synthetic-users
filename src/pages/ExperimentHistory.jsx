import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ExperimentHistory = () => {
  const navigate = useNavigate();
  const { setActiveExperiment } = useAuth();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await api.getExperiments();
        setExperiments(data);
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectAndNavigate = (exp) => {
    setActiveExperiment(exp);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div className="border-b border-white/15 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-[#34D399]" />
          <h1 className="font-royal-title text-2xl font-bold text-white">
            Experiment Archive & Study History
          </h1>
        </div>
        <p className="text-xs text-[#E6F4EA]">
          Complete repository of past synthetic research simulations, hypotheses tested, and archived results.
        </p>
      </div>

      <div className="space-y-4">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg hover:border-white/40 transition-all"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                  exp.status === 'completed'
                    ? 'bg-[#0E3D2E] text-[#34D399] border border-white/20'
                    : 'bg-[#062319] text-white/80 border border-white/15'
                }`}>
                  {exp.status}
                </span>
                <span className="text-[11px] text-[#A7F3D0]">
                  {new Date(exp.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-royal-title text-base font-bold text-white">
                {exp.title}
              </h3>
              <p className="text-xs text-[#E6F4EA] line-clamp-1">
                {exp.objective}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleSelectAndNavigate(exp)}
                className="px-4 py-2 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <span>Select & Open Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#062319]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentHistory;

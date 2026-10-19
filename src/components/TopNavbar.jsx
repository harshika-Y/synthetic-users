import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, FlaskConical, Plus, Sparkles, 
  Cpu, LogOut, ChevronDown, UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const TopNavbar = () => {
  const { user, logout, activeExperiment, setActiveExperiment, isLiveAI } = useAuth();
  const [experiments, setExperiments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExps = async () => {
      try {
        const data = await api.getExperiments();
        setExperiments(data);
        if (data.length > 0 && !activeExperiment) {
          setActiveExperiment(data[0]);
        }
      } catch (e) {
        console.error("Failed to load experiments for navbar", e);
      }
    };
    fetchExps();
  }, []);

  return (
    <header className="h-16 bg-[#062319]/95 backdrop-blur-md border-b border-white/15 px-6 flex items-center justify-between z-20 shrink-0 text-white">
      {/* Workspace & Experiment Selectors */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-[#E6F4EA]">
          <Building2 className="w-4 h-4 text-[#34D399]" />
          <span className="font-semibold text-white">Kadappa Cafe Research Studio</span>
          <span className="text-white/30">/</span>
        </div>

        {/* Experiment Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A3324] border border-white/20 text-xs text-white hover:border-white/40 transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="max-w-[200px] truncate font-medium">
              {activeExperiment ? activeExperiment.title : "Select Experiment"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/60" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0A3324] border border-white/30 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#A7F3D0] border-b border-white/10">
                Switch Active Experiment
              </div>
              <div className="max-h-60 overflow-y-auto">
                {experiments.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      setActiveExperiment(exp);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#0E3D2E] transition-colors ${
                      activeExperiment?.id === exp.id ? 'text-white font-semibold bg-[#0E3D2E] border-l-2 border-[#34D399]' : 'text-[#E6F4EA]'
                    }`}
                  >
                    <span className="truncate">{exp.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${
                      exp.status === 'completed' ? 'bg-[#0E3D2E] text-[#34D399] border border-white/10' : 'bg-[#062319] text-white/80 border border-white/10'
                    }`}>
                      {exp.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls & User Pill */}
      <div className="flex items-center gap-4">
        {/* Live Engine Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A3324] border border-white/20 text-[11px]">
          <Cpu className={`w-3.5 h-3.5 text-[#34D399]`} />
          <span className="text-[#E6F4EA]">
            {isLiveAI ? 'Groq Live AI' : 'Deterministic Simulation'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveAI ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-300'}`} />
        </div>

        {/* New Experiment Button */}
        <button
          onClick={() => navigate('/experiments/new')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all shadow-md shadow-black/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#062319]" />
          <span>New Experiment</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:ring-1 hover:ring-white/40 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0E3D2E] border border-white/30 flex items-center justify-center text-white font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0) : 'R'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0A3324] border border-white/30 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name || "Principal Researcher"}</p>
                <p className="text-[10px] text-[#A7F3D0] truncate">{user?.email || "researcher@regalux.ai"}</p>
                <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-[#0E3D2E] text-[#34D399] border border-white/10 uppercase tracking-wider font-semibold">
                  {user?.role || "Chief Research Scientist"}
                </span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;

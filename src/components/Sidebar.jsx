import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FlaskConical, ClipboardList, 
  MessagesSquare, Sparkles, Gauge, Layers, FileText, 
  Sliders, UtensilsCrossed, ShieldAlert, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Persona Studio', path: '/personas', icon: Users },
  { name: 'Experiments', path: '/experiments', icon: FlaskConical },
  { name: 'Survey Lab', path: '/surveys', icon: ClipboardList },
  { name: 'Interview Room', path: '/interviews', icon: MessagesSquare },
  { name: 'Insights', path: '/insights', icon: Sparkles },
  { name: 'Adoption Score', path: '/adoption', icon: Gauge },
  { name: 'Scenario Library', path: '/scenarios', icon: Layers },
  { name: 'Research Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Sliders },
];

const Sidebar = () => {
  const { activeExperiment, isLiveAI } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-[#041D15] border-r border-white/15 flex flex-col h-screen select-none shrink-0 z-30 text-white">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/15 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-lg shadow-black/20 border border-white/30">
          <span className="font-royal-title text-base font-bold text-[#062319]">R</span>
        </div>
        <div>
          <h1 className="font-royal-title text-lg tracking-widest text-white font-bold leading-tight">
            REGALUX<span className="text-[#34D399] ml-1">AI</span>
          </h1>
          <p className="text-[9px] uppercase tracking-widest text-[#A7F3D0]">Research Intelligence</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-[#A7F3D0]/70 font-semibold">
          Platform Suite
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-[#0E3D2E] text-white border-l-2 border-[#34D399] shadow-sm shadow-black/20 font-semibold' 
                  : 'text-[#E6F4EA] hover:text-white hover:bg-[#0A3324] hover:translate-x-0.5'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0 text-[#34D399]" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-[#A7F3D0]/70 font-semibold">
          Subject Under Study
        </div>
        <NavLink
          to="/cafe"
          className={({ isActive }) => `
            flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
            ${isActive 
              ? 'bg-[#0E3D2E] text-white border-l-2 border-[#34D399]' 
              : 'text-[#E6F4EA] hover:text-white hover:bg-[#0A3324]'
            }
          `}
        >
          <div className="flex items-center gap-2.5 truncate">
            <UtensilsCrossed className="w-4 h-4 shrink-0 text-[#34D399]" />
            <span className="truncate">Kadappa Cafe / Express</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0A3324] text-[#34D399] border border-white/20 uppercase tracking-wider font-bold">Demo</span>
        </NavLink>
      </nav>

      {/* Active Experiment Capsule */}
      <div className="p-3 m-3 rounded-xl bg-[#0A3324] border border-white/20 shadow-md">
        <div className="flex items-center justify-between text-[10px] text-[#A7F3D0] mb-1">
          <span className="uppercase tracking-wider font-semibold">Active Study</span>
          <span className={`w-2 h-2 rounded-full ${isLiveAI ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-300'}`} />
        </div>
        <p className="text-xs font-semibold text-white truncate">
          {activeExperiment?.title || "SwiftBite Corporate Study"}
        </p>
        <p className="text-[10px] text-[#34D399] mt-0.5">
          {isLiveAI ? "Live Groq AI Engine" : "High-Fidelity Simulation"}
        </p>
      </div>

      {/* Mandatory Synthetic Disclaimer */}
      <div className="px-4 py-2 border-t border-white/10 text-[9px] text-[#A7F3D0]/75 flex items-center gap-1.5 leading-tight">
        <ShieldAlert className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
        <span>Synthetic Research Simulator. Not verified human survey.</span>
      </div>
    </aside>
  );
};

export default Sidebar;

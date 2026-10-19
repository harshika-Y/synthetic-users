import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Sparkles, Users, 
  MessageSquare, FileText, CheckCircle2, ChevronRight,
  TrendingUp, Compass, Cpu, Layers, Coffee
} from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#062319] text-white relative selection:bg-white/20 selection:text-white">
      {/* Three.js Interactive Particle Background */}
      <ThreeBackground />

      {/* Top Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center shadow-lg shadow-black/20 border border-white/40">
            <span className="font-royal-title text-base font-bold text-[#062319]">K</span>
          </div>
          <div>
            <span className="font-royal-title text-lg tracking-widest text-white font-bold">
              KADAPPA<span className="text-[#34D399] ml-1">AI</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest text-[#A7F3D0] ml-2 pl-2 border-l border-white/20">
              User Research Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-medium text-[#E6F4EA] hover:text-white transition-colors px-3 py-1.5"
          >
            Researcher Sign In
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all shadow-md shadow-black/20 cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#062319]" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Editorial Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E3D2E] border border-white/20 text-xs text-[#34D399] mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
          <span className="tracking-wide">AI-Powered Synthetic User Research & Cafe Validation</span>
        </div>

        {/* Master Prompt Headline */}
        <h1 className="font-royal-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          Understand the customers behind <span className="text-[#34D399]">authentic South Indian dining.</span>
        </h1>

        {/* Master Prompt Supporting Copy */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#E6F4EA] leading-relaxed mb-10">
          Create unlimited synthetic customer personas, conduct live voice & video interviews, and uncover product adoption opportunities for Kadappa Cafe.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#062319] text-sm font-bold tracking-wide hover:bg-[#F0FDF4] transition-all shadow-xl shadow-black/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Research Studio</span>
            <ArrowRight className="w-4 h-4 text-[#062319]" />
          </button>
          <button
            onClick={() => navigate('/interviews')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0A3324] hover:bg-[#0E3D2E] border border-white/30 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Compass className="w-4 h-4 text-[#34D399]" />
            <span>Join Live Video Interview</span>
          </button>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A3324]/80 border border-white/20 text-xs text-[#E6F4EA]">
          <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>Notice: Findings are AI-generated synthetic simulations, not verified empirical customer research.</span>
        </div>
      </section>

      {/* Featured Subject Showcase: Kadappa Cafe */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="p-8 rounded-2xl bg-[#0A3324] border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#0E3D2E] text-[#34D399] border border-white/20">
                  Featured Subject Under Study
                </span>
                <span className="text-xs text-[#A7F3D0]">Metro India Working Professionals</span>
              </div>
              <h2 className="font-royal-title text-2xl sm:text-3xl font-bold text-white">
                Kadappa Cafe Express — Authentic South Indian Breakfast Delivery
              </h2>
            </div>
            <button
              onClick={() => navigate('/cafe')}
              className="px-4 py-2 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>View Cafe Subject</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#062319]" />
            </button>
          </div>

          {/* 5 Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { num: '01', title: '30-Min SLA', desc: 'Predictable speed before morning sprints' },
              { num: '02', title: 'Foxtail Millets', desc: 'Dietician-audited diabetic-friendly dosas' },
              { num: '03', title: '₹199 Morning Pass', desc: 'Monthly membership with zero delivery fee' },
              { num: '04', title: 'Live GPS Tracking', desc: 'Silent arrival with zero phone calls' },
              { num: '05', title: 'Thermal Packaging', desc: 'Insulated boxes keeping dosas crisp' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#062319] border border-white/15 hover:border-white/40 transition-all">
                <span className="text-xs font-mono font-bold text-[#34D399] block mb-1">{f.num}</span>
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-[#E6F4EA] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Workflow Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#34D399]">Scientific Rigor</span>
          <h2 className="font-royal-title text-3xl sm:text-4xl font-bold text-white mt-2">
            The Synthetic Research Intelligence Lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 relative shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0E3D2E] border border-white/30 flex items-center justify-center text-[#34D399] mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-royal-title text-lg font-bold text-white mb-2">1. Synthesize Diverse Personas</h3>
            <p className="text-xs text-[#E6F4EA] leading-relaxed">
              Generate any number of distinct customer archetypes (1 to 100+) with specific budgets, routines, and objections.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 relative shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0E3D2E] border border-white/30 flex items-center justify-center text-[#34D399] mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-royal-title text-lg font-bold text-white mb-2">2. Live Voice & Video Interviews</h3>
            <p className="text-xs text-[#E6F4EA] leading-relaxed">
              Conduct live voice and video interviews with speech-to-text, real-time closed captions, and spoken audio responses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 relative shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0E3D2E] border border-white/30 flex items-center justify-center text-[#34D399] mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-royal-title text-lg font-bold text-white mb-2">3. Extract Evidence & PDF Dossiers</h3>
            <p className="text-xs text-[#E6F4EA] leading-relaxed">
              Cluster themes with genuine participant quotes, calculate 0–100 adoption scores, and download executive PDF reports.
            </p>
          </div>
        </div>
      </section>

      {/* Royal Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-xs text-[#A7F3D0]">
        <p className="font-royal-title tracking-wider text-white">
          KADAPPA CAFE — SYNTHETIC USER RESEARCH INTELLIGENCE
        </p>
        <p className="mt-2 text-[11px] text-[#E6F4EA]/70 max-w-xl mx-auto">
          Built for executive product teams, UX strategists, and restaurant operators. All personas and conversations are synthetic simulations.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

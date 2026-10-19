import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, UtensilsCrossed, ExternalLink, ShieldCheck } from 'lucide-react';
import Home from './Home';

const CafeSubjectPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#051408] text-[#ffb400] relative">
      {/* Top Banner Ribbon */}
      <div className="sticky top-0 z-50 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#D6B66F]/30 px-6 py-3 flex items-center justify-between text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 rounded-lg bg-[#D6B66F] text-[#0B0D10] font-bold flex items-center gap-1.5 hover:brightness-110 transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to REGALUX AI</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[#A8B0BC]">
            <UtensilsCrossed className="w-4 h-4 text-[#D6B66F]" />
            <span className="font-semibold text-[#F6F1E7]">Active Subject Prototype:</span>
            <span className="text-[#D6B66F]">SwiftBite & Kadappa Cafe Smart Delivery</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-[#123D32] text-[#34D399] border border-[#1B5E4B] font-mono">
            30-Min SLA & Healthy Section Tested
          </span>
          <button
            onClick={() => navigate('/surveys')}
            className="text-[#D6B66F] hover:underline font-semibold"
          >
            Inspect Survey Responses →
          </button>
        </div>
      </div>

      {/* Render the actual live food prototype */}
      <Home />
    </div>
  );
};

export default CafeSubjectPreview;

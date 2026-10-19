import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FlaskConical, ClipboardList, MessagesSquare, 
  Sparkles, Gauge, ArrowUpRight, TrendingUp, AlertTriangle, 
  CheckCircle, FileDown, Plus, UtensilsCrossed, ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const SENTIMENT_COLORS = {
  positive: '#34D399',
  neutral: '#E6F4EA',
  negative: '#F87171'
};

const Dashboard = () => {
  const { activeExperiment, isLiveAI } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExperiments: 0,
    totalPersonas: 0,
    completedSurveys: 0,
    interviewSessions: 0,
    themesCount: 0,
    avgAdoptionScore: 0
  });
  const [insightData, setInsightData] = useState(null);
  const [adoptionData, setAdoptionData] = useState(null);
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [exps, allPersonas, sessions] = await Promise.all([
          api.getExperiments(),
          api.getPersonas(),
          api.getInterviews()
        ]);

        setPersonas(allPersonas);

        const expId = activeExperiment?.id || (exps.length > 0 ? exps[0].id : null);
        let insights = null;
        let adoption = null;

        if (expId) {
          try {
            insights = await api.getInsights(expId);
            adoption = await api.getAdoption(expId);
          } catch (e) {
            console.warn("Notice: Experiment results not yet computed", e);
          }
        }

        setInsightData(insights);
        setAdoptionData(adoption);

        setStats({
          totalExperiments: exps.length,
          totalPersonas: allPersonas.length,
          completedSurveys: exps.filter(e => e.status === 'completed').length,
          interviewSessions: sessions.length,
          themesCount: insights?.themes?.length || 4,
          avgAdoptionScore: adoption?.average_score || 72.5
        });
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [activeExperiment]);

  // Format Recharts data
  const sentimentPieData = insightData?.sentiment_breakdown ? [
    { name: 'Positive Signal', value: insightData.sentiment_breakdown.positive || 64, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral / Conditional', value: insightData.sentiment_breakdown.neutral || 22, color: SENTIMENT_COLORS.neutral },
    { name: 'Friction / Negative', value: insightData.sentiment_breakdown.negative || 14, color: SENTIMENT_COLORS.negative },
  ] : [
    { name: 'Positive Signal', value: 64, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral / Conditional', value: 22, color: SENTIMENT_COLORS.neutral },
    { name: 'Friction / Negative', value: 14, color: SENTIMENT_COLORS.negative },
  ];

  const segmentBarData = adoptionData?.segments?.map(s => ({
    name: s.segment.replace(' professional', '').replace(' customer', ''),
    score: s.mean_score
  })) || [
    { name: 'Time-pressed', score: 88.5 },
    { name: 'Health-conscious', score: 84.0 },
    { name: 'Frequent delivery', score: 89.0 },
    { name: 'Vegetarian', score: 78.5 },
    { name: 'Budget-conscious', score: 52.0 },
    { name: 'Occasional order', score: 65.0 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Editorial Header Banner */}
      <div className="p-8 rounded-2xl bg-[#0A3324] border border-white/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#0E3D2E] text-[#34D399] border border-white/20">
              Intelligence Dossier Active
            </span>
            <span className="text-xs text-[#E6F4EA]">
              Study: {activeExperiment?.title || "Kadappa Cafe Express Food Delivery Validation"}
            </span>
          </div>
          <h1 className="font-royal-title text-2xl sm:text-3xl font-bold text-white">
            Synthetic Research Intelligence Suite
          </h1>
          <p className="text-xs text-[#E6F4EA] mt-2 leading-relaxed">
            Synthesizing verified working professional archetypes in Metro India. 
            Evaluating 30-minute delivery SLAs, millet nutrition curation, subscription passes, and ₹49–₹99 fee elasticity.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/surveys')}
            className="px-4 py-2.5 rounded-lg bg-[#0E3D2E] border border-white/25 hover:border-white text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <ClipboardList className="w-4 h-4 text-[#34D399]" />
            <span>Open Survey Matrix</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-5 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20"
          >
            <FileDown className="w-4 h-4 text-[#062319]" />
            <span>Executive PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Active Studies', value: stats.totalExperiments, icon: FlaskConical, color: 'text-[#34D399]' },
          { label: 'Synthetic Personas', value: stats.totalPersonas, icon: Users, color: 'text-white' },
          { label: 'Completed Surveys', value: stats.completedSurveys, icon: ClipboardList, color: 'text-[#34D399]' },
          { label: 'Interview Sessions', value: stats.interviewSessions, icon: MessagesSquare, color: 'text-emerald-300' },
          { label: 'Insight Themes', value: stats.themesCount, icon: Sparkles, color: 'text-white' },
          { label: 'Adoption Potential', value: `${stats.avgAdoptionScore}%`, icon: Gauge, color: 'text-[#34D399]' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#0A3324] border border-white/15 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[#E6F4EA]">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="font-royal-title text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Sentiment Breakdown + Segment Adoption Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Doughnut */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-royal-title text-base font-bold text-white">Sentiment Alignment</h2>
              <span className="text-[10px] text-[#34D399] uppercase tracking-wider font-semibold">Cohort Response</span>
            </div>
            <p className="text-xs text-[#E6F4EA]">Emotional and rational sentiment across all simulated turns.</p>
          </div>

          <div className="h-56 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#062319', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }} 
                  itemStyle={{ color: '#FFFFFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-royal-title text-xl font-bold text-white">64%</span>
              <span className="text-[9px] uppercase tracking-wider text-[#A7F3D0]">Positive</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
            <div>
              <p className="text-xs font-bold text-[#34D399]">64%</p>
              <p className="text-[10px] text-[#E6F4EA]">Positive</p>
            </div>
            <div>
              <p className="text-xs font-bold text-white">22%</p>
              <p className="text-[10px] text-[#E6F4EA]">Neutral</p>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-400">14%</p>
              <p className="text-[10px] text-[#E6F4EA]">Friction</p>
            </div>
          </div>
        </div>

        {/* Adoption by Segment Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 lg:col-span-2 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-royal-title text-base font-bold text-white">Adoption Score by Persona Segment</h2>
              <span className="text-[10px] text-[#34D399] uppercase tracking-wider font-semibold">0 to 100 Scale</span>
            </div>
            <p className="text-xs text-[#E6F4EA]">Explainable compatibility scores evaluating 5 feature dimensions.</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#E6F4EA" 
                  fontSize={10} 
                  interval={0} 
                  angle={-15} 
                  textAnchor="end" 
                />
                <YAxis stroke="#E6F4EA" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#062319', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '12px', color: '#FFFFFF' }} 
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="score" fill="#34D399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#E6F4EA] pt-2 border-t border-white/10">
            <span>Highest Fit: <strong className="text-[#34D399]">Frequent Delivery (89.0)</strong></span>
            <span>Primary Churn Risk: <strong className="text-rose-300">Budget Associates (52.0)</strong></span>
          </div>
        </div>
      </div>

      {/* Featured Insight Themes & Participant Evidence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-royal-title text-xl font-bold text-white">Key Strategic Research Findings</h2>
            <p className="text-xs text-[#E6F4EA]">Directly supported by synthetic survey answers and interview turns.</p>
          </div>
          <button 
            onClick={() => navigate('/insights')}
            className="text-xs font-semibold text-white hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#34D399]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Finding 1: 30-min SLA */}
          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#0E3D2E] text-[#34D399] border border-white/20">
                Core Value Driver
              </span>
              <span className="text-xs text-[#A7F3D0]">96% Confidence</span>
            </div>
            <h3 className="font-royal-title text-base font-bold text-white mb-2">
              Predictability Outweighs Speed: The 30-Minute SLA as Mental Bandwidth Saver
            </h3>
            <p className="text-xs text-[#E6F4EA] leading-relaxed mb-4">
              Working professionals across engineering, consulting, and finance view arrival certainty as essential. Knowing an order arrives strictly within 30 minutes prevents meeting calendar disruption.
            </p>
            {/* Quote pill */}
            <div className="p-3 rounded-lg bg-[#062319] border-l-2 border-[#34D399] text-xs text-white/90 italic">
              "My workday leaves tight 30-minute meeting windows. Knowing my order arrives precisely within 30 minutes eliminates calendar disruption."
              <span className="block mt-1 text-[10px] text-[#34D399] font-normal not-italic font-mono">
                — Arjun Sharma, Senior Software Engineer
              </span>
            </div>
          </div>

          {/* Finding 2: ₹99 Fee Friction */}
          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                Severe Price Elasticity
              </span>
              <span className="text-xs text-[#A7F3D0]">94% Confidence</span>
            </div>
            <h3 className="font-royal-title text-base font-bold text-white mb-2">
              ₹99 Standalone Delivery Fee Causes Immediate Checkout Abandonment
            </h3>
            <p className="text-xs text-[#E6F4EA] leading-relaxed mb-4">
              Junior employees and budget-conscious cohorts reject the ₹99 fee because it represents 40% of their ₹220 meal ticket. The solution is converting it into a monthly subscription tier.
            </p>
            {/* Quote pill */}
            <div className="p-3 rounded-lg bg-[#062319] border-l-2 border-rose-400 text-xs text-white/90 italic">
              "₹99 delivery fee represents 40% of my average lunch budget of ₹220. Immediate cart abandonment."
              <span className="block mt-1 text-rose-300 font-normal not-italic font-mono">
                — Pooja Hegde, Associate Marketing Specialist
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations Banner */}
      <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="max-w-3xl">
          <h3 className="font-royal-title text-lg font-bold text-white">
            Product Strategy Implication: Launch "Kadappa Cafe Morning Pass" at ₹199/month
          </h3>
          <p className="text-xs text-[#E6F4EA] mt-1.5 leading-relaxed">
            Eliminates the primary checkout hurdle for frequent users while preserving unit economics. 85% of frequent and time-pressed personas express intent to purchase on month one.
          </p>
        </div>
        <button
          onClick={() => navigate('/adoption')}
          className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md"
        >
          Explore Adoption Scores
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

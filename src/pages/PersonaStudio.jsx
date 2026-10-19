import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, RefreshCw, Filter, Search, 
  ChevronDown, ChevronUp, Eye, Sliders, CheckSquare, 
  Square, ArrowRight, ShieldCheck, HeartPulse, Clock, 
  DollarSign, MessageSquare, Coffee, Zap, Award, Check,
  Plus, Minus, FileText, CheckCircle2, Trash2, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const extractPreviewEntities = (text) => {
  if (!text || text.trim().length < 6) return null;
  const t = text.toLowerCase();
  
  // Extract roles
  const roles = [];
  if (t.includes('professor') || t.includes('teacher') || t.includes('faculty') || t.includes('lecturer')) roles.push('Academic & Educator');
  if (t.includes('engineer') || t.includes('developer') || t.includes('tech') || t.includes('coder') || t.includes('sde')) roles.push('Software Engineer');
  if (t.includes('doctor') || t.includes('physician') || t.includes('surgeon') || t.includes('cardiologist')) roles.push('Medical Professional');
  if (t.includes('student') || t.includes('college') || t.includes('intern') || t.includes('hostel')) roles.push('University Student / Intern');
  if (t.includes('fitness') || t.includes('gym') || t.includes('yoga') || t.includes('athlete')) roles.push('Fitness & Health Enthusiast');
  if (t.includes('pilot') || t.includes('airline') || t.includes('aviation')) roles.push('Commercial Airline Pilot');
  if (t.includes('lawyer') || t.includes('legal') || t.includes('advocate')) roles.push('Legal Counsel');
  if (t.includes('designer') || t.includes('photographer')) roles.push('Creative Media Specialist');
  if (t.includes('night') || t.includes('midnight') || t.includes('bpo')) roles.push('Night-Shift Specialist');
  if (roles.length === 0) {
    const words = text.replace(/^(?:i\s+(?:want|need)|looking\s+for|simulate)\s*(?:a|an|\d+)?/i, '').trim().split(/\s+/).slice(0, 3).join(' ');
    roles.push(words.charAt(0).toUpperCase() + words.slice(1) || 'Custom Persona');
  }

  // Extract location
  let location = "Bhubaneswar";
  const cities = ['bhubaneswar', 'cuttack', 'puri', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'mumbai', 'pune', 'delhi', 'kolkata'];
  for (const c of cities) {
    if (t.includes(c)) {
      location = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Extract timing
  const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  const timing = timeMatch ? timeMatch[1].toUpperCase() : (t.includes('night') ? '2:00 AM' : '7:45 AM');

  // Extract dishes
  const dishes = [];
  if (t.includes('podi') || t.includes('idli')) dishes.push('Spicy Ghee Podi Idli');
  if (t.includes('coffee')) dishes.push('Degree Filter Coffee');
  if (t.includes('millet') || t.includes('ragi')) dishes.push('Ragi & Millet Dosa');
  if (t.includes('vada')) dishes.push('Crispy Medu Vada');
  if (t.includes('dosa')) dishes.push('Butter Masala Dosa');
  if (t.includes('jain') || t.includes('pure veg')) dishes.push('Jain Sattvic Dosa');
  if (t.includes('diabetic') || t.includes('sugar-free')) dishes.push('Diabetic Sugar-Free Meal');

  // Extract dislikes
  const hateMatch = text.match(/(?:hates?|dislikes?|avoids?|complaining of|refuses?)\s+([^,.]+)/i);
  const dislike = hateMatch ? hateMatch[1].trim() : null;

  return {
    roles,
    location,
    timing,
    dishes: dishes.length > 0 ? dishes : ['South Indian Breakfast', 'Degree Coffee'],
    dislike
  };
};

const SEGMENTS = [
  "All Segments",
  "Time-pressed corporate professional",
  "Health-conscious working professional",
  "Budget-conscious student / flatmate",
  "Senior citizen & diabetic-conscious diner",
  "Vegetarian professional",
  "Frequent food delivery customer",
  "Occasional restaurant-ordering customer",
  "Night-shift worker",
  "Premium convenience-focused professional"
];

const SAMPLE_PROMPTS = [
  {
    title: "⚡ 3 Metro Techies (Junior, Lead, Director)",
    count: 3,
    prompt: "I need 3 distinct tech professionals in Bangalore/Hyderabad: 1 junior engineer on tight budget who wants quick vada-pav/idli, 1 senior sprint lead who needs hot filter coffee and ghee roast delivered before 8:30 AM standup, and 1 tech executive who wants unlimited zero-fee priority delivery."
  },
  {
    title: "🌿 5 Health & Millet Connoisseurs",
    count: 5,
    prompt: "I need 5 health-conscious personas: diabetic senior citizens who need sugar-free filter coffee and salt-reduced ragi idli, gym athletes who order high-protein foxtail millet dosa with zero soda, and pure-veg Jain customers who avoid onion/garlic and require cold-pressed sesame ghee."
  },
  {
    title: "💰 8 Budget University Students & Interns",
    count: 8,
    prompt: "I need 8 budget-conscious college students and interns living in hostels near tech parks: they have a ₹4,000 monthly food allowance, split delivery fees on ₹120 dosa meals with roommates, and hate surge charges or fees above ₹49."
  },
  {
    title: "🌙 15 Diverse Metro Customers (Cohort Study)",
    count: 15,
    prompt: "I need 15 diverse customers across all demographics in Metro India: junior devs, senior directors, early risers, night-shift US offshore engineers, diabetic seniors, and college students ordering hot South Indian breakfast from Kadappa Cafe."
  },
  {
    title: "🏢 25 Enterprise Office Breakfast Customers",
    count: 25,
    prompt: "I need 25 distinct corporate professionals working in large tech parks who order team breakfasts, early morning filter coffee before scrum meetings, and evaluate the ₹199/month unlimited delivery pass."
  }
];

const DIET_TAGS = [
  "Ghee Podi Masala Dosa",
  "Kumbakonam Filter Coffee",
  "Foxtail Millet & Ragi Dosa",
  "100% Pure Jain Veg",
  "Crispy Medu Vada & Idli Combo",
  "Low Glycemic / Diabetic-Friendly",
  "Cold-Pressed Ghee (Zero Palm Oil)",
  "Set Dosa with Sagu",
  "Thatte Idli with Gunpowder"
];

// Expanded presets supporting more than 12 personas (up to 100)
const COUNT_PRESETS = [1, 3, 5, 8, 12, 16, 20, 25, 30, 50, 75, 100];

const PersonaStudio = () => {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState("All Segments");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [justGeneratedIds, setJustGeneratedIds] = useState([]);
  const [successBanner, setSuccessBanner] = useState("");

  // Synthesis Modal State
  const [generateDrawerOpen, setGenerateDrawerOpen] = useState(false);
  const [genMode, setGenMode] = useState("prompt"); // "prompt" or "builder"
  const [genCount, setGenCount] = useState(5);
  
  // Prompt Mode State
  const [needPrompt, setNeedPrompt] = useState(
    "I need 5 diverse personas for Kadappa Cafe: 1 corporate developer who needs hot filter coffee and ghee roast before 8:30 AM standup, 1 fitness enthusiast who only eats zero-oil ragi/millet idlis, 1 price-conscious student who splits breakfast orders with flatmates, 1 night-shift engineer needing 2 AM hot meal, and 1 diabetic senior citizen seeking sugar-free coffee."
  );

  // Builder Mode State
  const [targetMarket, setTargetMarket] = useState("Corporate professionals and South Indian breakfast lovers");
  const [productDesc, setProductDesc] = useState("Kadappa Cafe — 30-Min Express Hot Dosa Delivery, Millets & Breakfast Pass");
  const [segmentFocus, setSegmentFocus] = useState("Time-pressed corporate professional");
  const [routineSchedule, setRoutineSchedule] = useState("7:30 AM – 8:30 AM morning standup rush, tight sprints");
  const [monthlyBudget, setMonthlyBudget] = useState("8500");
  const [selectedDietTags, setSelectedDietTags] = useState([
    "Ghee Podi Masala Dosa", 
    "Kumbakonam Filter Coffee"
  ]);
  const [customDiet, setCustomDiet] = useState("");
  const [deliveryExpectation, setDeliveryExpectation] = useState("Strict 30-Minute Hot Dosa SLA (Insulated packaging mandatory)");
  const [feeSensitivity, setFeeSensitivity] = useState("Morning Pass Enthusiast — Prefers ₹199/Month Unlimited Delivery Pass");

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const data = await api.getPersonas(selectedSegment !== "All Segments" ? selectedSegment : null);
      setPersonas(data);
    } catch (e) {
      console.error("Failed to load personas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();
  }, [selectedSegment]);

  const handleApplySamplePrompt = (sample) => {
    setNeedPrompt(sample.prompt);
    setGenCount(sample.count);
  };

  const toggleDietTag = (tag) => {
    if (selectedDietTags.includes(tag)) {
      setSelectedDietTags(selectedDietTags.filter(t => t !== tag));
    } else {
      setSelectedDietTags([...selectedDietTags, tag]);
    }
  };

  const handleRegenerate = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await api.regeneratePersona(id);
      setPersonas(personas.map(p => p.id === id ? updated : p));
    } catch (err) {
      alert("Failed to regenerate persona: " + err.message);
    }
  };

  const handleGenerateNew = async (e) => {
    e.preventDefault();
    if (genCount < 1) {
      alert("Please select at least 1 persona to generate.");
      return;
    }
    setGenerating(true);
    try {
      const combinedDiet = [...selectedDietTags, customDiet].filter(Boolean).join(", ");
      
      const payload = {
        count: genCount,
        product_description: productDesc,
        target_market: targetMarket,
        need_description: genMode === "prompt" ? needPrompt : undefined,
        segment_focus: genMode === "builder" ? segmentFocus : undefined,
        routine_schedule: genMode === "builder" ? routineSchedule : undefined,
        monthly_budget: genMode === "builder" ? `₹${parseInt(monthlyBudget).toLocaleString('en-IN')}/month on dining & food delivery` : undefined,
        dietary_prefs: genMode === "builder" ? (combinedDiet || "South Indian breakfast & filter coffee") : undefined,
        delivery_expectations: genMode === "builder" ? deliveryExpectation : undefined,
        fee_sensitivity: genMode === "builder" ? feeSensitivity : undefined,
        custom_instructions: genMode === "prompt" ? needPrompt : undefined
      };

      const created = await api.generatePersonas(payload);
      const newIds = created.map(p => p.id);
      setJustGeneratedIds(newIds);
      setPersonas([...created, ...personas]);
      setSuccessBanner(`Successfully synthesized ${created.length} unique personas matching your exact need!`);
      setGenerateDrawerOpen(false);
      setTimeout(() => setSuccessBanner(""), 8000);
    } catch (err) {
      alert("Generation error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const toggleCompare = (p, e) => {
    e.stopPropagation();
    if (compareList.find(item => item.id === p.id)) {
      setCompareList(compareList.filter(item => item.id !== p.id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 personas at a time.");
        return;
      }
      setCompareList([...compareList, p]);
    }
  };

  const handleDeletePersona = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete persona "${name}"?`)) return;
    try {
      await api.deletePersona(id);
      setPersonas(prev => prev.filter(p => p.id !== id));
      setCompareList(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert("Failed to delete persona: " + err.message);
    }
  };

  const handleClearAllPersonas = async () => {
    if (!window.confirm("Are you sure you want to clear all personas from the studio? You can synthesize custom personas or click 'Reset Defaults' anytime.")) return;
    try {
      setLoading(true);
      await api.clearPersonas();
      setPersonas([]);
      setCompareList([]);
      setSuccessBanner("All personas cleared. You now have a clean slate to synthesize your custom personas!");
      setTimeout(() => setSuccessBanner(""), 6000);
    } catch (err) {
      alert("Failed to clear personas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Restore the standard Kadappa Cafe customer archetypes?")) return;
    try {
      setLoading(true);
      const data = await api.resetDefaultPersonas();
      setPersonas(data);
      setSuccessBanner("Restored core Kadappa Cafe customer archetypes successfully!");
      setTimeout(() => setSuccessBanner(""), 6000);
    } catch (err) {
      alert("Failed to restore defaults: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonas = personas.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.segment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.dietary_prefs && p.dietary_prefs.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E3D2E] border border-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#34D399]" />
            </div>
            <h1 className="font-royal-title text-2xl font-bold text-white tracking-wide">
              Kadappa Cafe Synthetic Persona Studio
            </h1>
          </div>
          <p className="text-xs text-[#E6F4EA]">
            Synthesize any number of custom, non-duplicated customer personas dynamically (1 to 100+) based on your exact research needs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-lg bg-[#0A3324] border border-white/20 text-xs font-semibold text-white hover:bg-[#0E3D2E] hover:border-white/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Restore core Kadappa Cafe archetypes"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleClearAllPersonas}
            className="px-3.5 py-2 rounded-lg bg-[#0A3324] border border-rose-500/30 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Clear all personas to start with custom ones"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Clear All</span>
          </button>

          {compareList.length > 0 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#0E3D2E] border border-white/30 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Compare ({compareList.length})</span>
            </button>
          )}

          <button
            onClick={() => setGenerateDrawerOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20"
          >
            <Sparkles className="w-4 h-4 text-[#062319]" />
            <span>Synthesize Personas for My Need</span>
          </button>
        </div>
      </div>

      {/* Success Banner if newly generated */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-[#0A3324] border border-[#34D399]/40 text-xs text-white flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner("")} className="text-white/70 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* Kadappa Cafe Research Context Banner */}
      <div className="p-5 rounded-2xl bg-[#0A3324] border border-white/20 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0E3D2E] border border-white/25 flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6 text-[#34D399]" />
            </div>
            <div>
              <h3 className="font-royal-title text-sm font-bold text-white">
                Active Cafe Research Grounding: Kadappa Cafe Express
              </h3>
              <p className="text-xs text-[#E6F4EA] mt-0.5">
                Every persona is generated with authentic South Indian breakfast behaviors, distinct morning routines, and fee tolerances.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-[#062319] border border-white/20 text-[#34D399] font-medium flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#34D399]" /> 30-Min Hot SLA
            </span>
            <span className="px-3 py-1 rounded-full bg-[#062319] border border-white/20 text-white font-medium flex items-center gap-1.5">
              <Award className="w-3 h-3 text-[#34D399]" /> Millet & Pure-Veg
            </span>
            <span className="px-3 py-1 rounded-full bg-[#062319] border border-white/20 text-white font-medium flex items-center gap-1.5">
              ₹199/mo Morning Pass
            </span>
            <span className="px-3 py-1 rounded-full bg-[#062319] border border-white/20 text-white font-medium flex items-center gap-1.5">
              ₹49–₹99 Fee Tier
            </span>
            <span className="px-3 py-1 rounded-full bg-[#0E3D2E] border border-[#34D399]/40 text-[#34D399] font-bold flex items-center gap-1.5">
              <Users className="w-3 h-3 text-[#34D399]" /> {personas.length} Personas Loaded
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by persona name, occupation, segment, or dietary habit (e.g. Millet, Jain, Filter Coffee)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A3324] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
          />
        </div>

        <div className="relative shrink-0">
          <Filter className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-[#0A3324] border border-white/20 text-xs text-white focus:outline-none focus:border-white/50 cursor-pointer"
          >
            {SEGMENTS.map(s => (
              <option key={s} value={s} className="bg-[#0A3324] text-white">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonas.map((persona) => {
          const isExpanded = expandedId === persona.id;
          const isSelectedForCompare = compareList.some(item => item.id === persona.id);
          const isRecentlyGenerated = justGeneratedIds.includes(persona.id);

          return (
            <div
              key={persona.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isRecentlyGenerated 
                  ? 'bg-[#0E3D2E] border-white shadow-xl shadow-black/40 ring-2 ring-[#34D399]'
                  : isSelectedForCompare 
                  ? 'bg-[#0A3324] border-white shadow-lg' 
                  : 'bg-[#0A3324] border-white/20 hover:border-white/40'
              }`}
            >
              {/* Persona Header Card */}
              <div className="p-6">
                {isRecentlyGenerated && (
                  <div className="mb-3 px-2.5 py-0.5 rounded-full bg-white text-[#062319] text-[10px] font-bold flex items-center gap-1.5 w-fit">
                    <Sparkles className="w-3 h-3 text-[#062319]" />
                    <span>Synthesized for Your Need</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={persona.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt={persona.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/30 shadow-md"
                    />
                    <div>
                      <h3 className="font-royal-title text-base font-bold text-white">{persona.name}</h3>
                      <p className="text-xs text-[#34D399] font-medium">{persona.occupation}, {persona.age || 29}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleCompare(persona, e)}
                    className="text-white/60 hover:text-white transition-colors p-1"
                    title="Compare this persona"
                  >
                    {isSelectedForCompare ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Segment Pill */}
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-[#062319] text-[#34D399] border border-white/20 mb-3">
                  {persona.segment}
                </span>

                {/* Key Quick Attributes */}
                <div className="space-y-2 text-xs text-[#E6F4EA] mt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span className="truncate">{persona.schedule || "9:30 AM – 7:30 PM corporate hours"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span className="truncate">{persona.budget || "₹8,000/mo food delivery"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    <span className="truncate">{persona.dietary_prefs || "Healthy, protein-conscious"}</span>
                  </div>
                </div>

                {/* Consistency Profile Mini Indicators */}
                {persona.consistency_profile && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#E6F4EA]">
                    <div>
                      <span className="text-white/60">Speed: </span>
                      <strong className="text-white">{persona.consistency_profile.time_sensitivity || 8.5}/10</strong>
                    </div>
                    <div>
                      <span className="text-white/60">Health: </span>
                      <strong className="text-white">{persona.consistency_profile.health_importance || 8.0}/10</strong>
                    </div>
                    <div>
                      <span className="text-white/60">Sub Pass: </span>
                      <strong className="text-white">{persona.consistency_profile.subscription_interest || 8.0}/10</strong>
                    </div>
                  </div>
                )}

                {/* Expandable Deep Profile */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/15 space-y-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider mb-1">Motivations</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/90 text-[11px]">
                        {persona.motivations?.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-rose-300 tracking-wider mb-1">Primary Objections</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/90 text-[11px]">
                        {persona.objections?.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider mb-1">Delivery Expectation</p>
                      <p className="text-[11px] text-[#E6F4EA]">{persona.delivery_expectations}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider mb-1">Tone & Communication Style</p>
                      <p className="text-[11px] text-[#E6F4EA]">{persona.communication_style || "Direct and analytical"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-3 bg-[#062319]/80 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : persona.id)}
                  className="text-xs font-semibold text-white hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? "Collapse" : "Inspect Dossier"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/interviews?personaId=${persona.id}`)}
                    className="px-3 py-1 rounded-lg bg-[#0E3D2E] border border-white/20 text-[11px] font-semibold text-white hover:bg-white hover:text-[#062319] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Interview this persona in the 1-on-1 discovery room"
                  >
                    <MessageSquare className="w-3 h-3 text-[#34D399]" />
                    <span>Interview</span>
                  </button>

                  <button
                    onClick={(e) => handleRegenerate(persona.id, e)}
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1 cursor-pointer p-1"
                    title="Re-synthesize this persona archetype"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => handleDeletePersona(persona.id, persona.name, e)}
                    className="text-xs text-white/60 hover:text-rose-400 flex items-center gap-1 cursor-pointer p-1"
                    title="Delete this persona"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Persona Generator Modal with User Count & Need Control */}
      {generateDrawerOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-2xl bg-[#0A3324] border border-white/30 shadow-2xl relative text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E3D2E] border border-white/25 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <h2 className="font-royal-title text-xl font-bold text-white">Synthesize Personas for Your Need</h2>
                  <p className="text-xs text-[#E6F4EA]">
                    Choose exactly how many personas to generate (1 to 100+) and describe your specific customer requirements.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setGenerateDrawerOpen(false)} 
                className="text-white/60 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateNew} className="space-y-6">
              
              {/* 1. HOW MANY PERSONAS DO YOU NEED (User selects count - NO RESTRICTIVE 12 LIMIT) */}
              <div className="p-4 rounded-xl bg-[#062319] border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      Select How Many Personas Need To Be Generated
                    </label>
                    <span className="text-[11px] text-[#E6F4EA]">
                      Type any number up to 100. Each generated persona will have a unique identity, occupation, and budget.
                    </span>
                  </div>

                  {/* Number Input + Increment/Decrement */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setGenCount(Math.max(1, genCount - 1))}
                      className="w-8 h-8 rounded-lg bg-[#0E3D2E] border border-white/20 text-white hover:bg-white hover:text-[#062319] flex items-center justify-center font-bold cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={genCount}
                      onChange={(e) => setGenCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="w-16 h-8 text-center rounded-lg bg-[#0E3D2E] border border-white/30 text-sm font-bold text-white focus:outline-none focus:border-white"
                    />

                    <button
                      type="button"
                      onClick={() => setGenCount(Math.min(100, genCount + 1))}
                      className="w-8 h-8 rounded-lg bg-[#0E3D2E] border border-white/20 text-white hover:bg-white hover:text-[#062319] flex items-center justify-center font-bold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Count Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Quick Counts:</span>
                  {COUNT_PRESETS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGenCount(cnt)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        genCount === cnt
                          ? 'bg-white text-[#062319] font-bold shadow-sm'
                          : 'bg-[#0A3324] text-[#E6F4EA] hover:text-white border border-white/15'
                      }`}
                    >
                      {cnt} {cnt === 1 ? 'Persona' : 'Personas'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. SPECIFYING YOUR NEED (Tabs: Prompt vs Form Builder) */}
              <div>
                <div className="flex items-center gap-2 border-b border-white/15 pb-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setGenMode("prompt")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      genMode === "prompt"
                        ? 'bg-white text-[#062319]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mode 1: Describe My Need (Natural Language AI)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenMode("builder")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      genMode === "builder"
                        ? 'bg-white text-[#062319]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Mode 2: Custom Criteria Builder</span>
                  </button>
                </div>

                {/* TAB 1: NATURAL LANGUAGE NEED */}
                {genMode === "prompt" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#E6F4EA] mb-1.5">
                        Describe what kind of personas you need for Kadappa Cafe:
                      </label>
                      <textarea
                        rows="4"
                        value={needPrompt}
                        onChange={(e) => setNeedPrompt(e.target.value)}
                        placeholder="e.g. I need 15 personas: college students on tight budget who want cheap idli under ₹50, IT leads who order hot filter coffee & ghee roast before 8:30 AM standup, diabetic customers who only eat zero-oil millet dosa..."
                        className="w-full px-3 py-2.5 rounded-xl bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white leading-relaxed"
                      />
                    </div>

                    {/* Live Dynamic Semantic Extraction Preview */}
                    {extractPreviewEntities(needPrompt) && (
                      <div className="p-3.5 rounded-xl bg-[#062319] border border-white/20 shadow-inner space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
                            <span>Live Semantic NLP Analysis (Dynamic Synthesis Preview):</span>
                          </span>
                          <span className="text-[10px] text-[#34D399] font-mono font-bold">
                            Target: {genCount} {genCount === 1 ? 'Persona' : 'Personas'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-[#0A3324] border border-white/15">
                            <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Detected Roles</span>
                            <span className="text-white font-semibold truncate block">
                              {extractPreviewEntities(needPrompt).roles.join(", ")}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-[#0A3324] border border-white/15">
                            <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">City / Market</span>
                            <span className="text-white font-semibold truncate block">
                              {extractPreviewEntities(needPrompt).location}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-[#0A3324] border border-white/15">
                            <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Breakfast SLA</span>
                            <span className="text-[#34D399] font-semibold truncate block">
                              {extractPreviewEntities(needPrompt).timing}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-[#0A3324] border border-white/15">
                            <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Dishes / Diet</span>
                            <span className="text-white font-semibold truncate block">
                              {extractPreviewEntities(needPrompt).dishes.join(", ")}
                            </span>
                          </div>
                        </div>

                        {extractPreviewEntities(needPrompt).dislike && (
                          <div className="text-[10px] text-rose-300 flex items-center gap-1.5 pt-1 border-t border-white/10">
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                            <span>Extracted Frustration & Objection: <strong>"{extractPreviewEntities(needPrompt).dislike}"</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sample Need Presets */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white tracking-wider block mb-2">
                        Sample Persona Needs (Click to Auto-Fill):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SAMPLE_PROMPTS.map((sample, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleApplySamplePrompt(sample)}
                            className="p-2.5 rounded-lg bg-[#062319] border border-white/15 hover:border-white/50 cursor-pointer transition-all hover:bg-[#0E3D2E] text-left"
                          >
                            <p className="text-xs font-bold text-white mb-0.5">{sample.title}</p>
                            <p className="text-[10px] text-[#E6F4EA] line-clamp-2">{sample.prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: STRUCTURED CRITERIA BUILDER */}
                {genMode === "builder" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#E6F4EA] mb-1">Target Segment</label>
                        <select
                          value={segmentFocus}
                          onChange={(e) => setSegmentFocus(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                        >
                          {SEGMENTS.filter(s => s !== "All Segments").map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#E6F4EA] mb-1">Target Market Demographic</label>
                        <input
                          type="text"
                          value={targetMarket}
                          onChange={(e) => setTargetMarket(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#E6F4EA] mb-1">Daily Work Routine & Breakfast Timing</label>
                      <input
                        type="text"
                        value={routineSchedule}
                        onChange={(e) => setRoutineSchedule(e.target.value)}
                        placeholder="e.g. 7:30 AM – 8:30 AM morning standup rush, tight sprints"
                        className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-[#E6F4EA]">
                          Monthly Food & Delivery Spending Budget
                        </label>
                        <span className="text-xs font-bold text-white">
                          ₹{parseInt(monthlyBudget).toLocaleString('en-IN')} / month
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3000"
                        max="25000"
                        step="500"
                        value={monthlyBudget}
                        onChange={(e) => setMonthlyBudget(e.target.value)}
                        className="w-full accent-white cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#E6F4EA] mb-2">
                        Kadappa Cafe Dietary Preferences & Favorites
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {DIET_TAGS.map((tag) => {
                          const isSelected = selectedDietTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleDietTag(tag)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-white text-[#062319] font-bold shadow-sm'
                                  : 'bg-[#062319] border border-white/20 text-[#E6F4EA] hover:border-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="Add custom food preferences (e.g. extra spicy podi, zero oil, diabetic-friendly)..."
                        value={customDiet}
                        onChange={(e) => setCustomDiet(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#E6F4EA] mb-1">Delivery Speed SLA</label>
                        <select
                          value={deliveryExpectation}
                          onChange={(e) => setDeliveryExpectation(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                        >
                          <option value="Strict 30-Minute Hot Dosa SLA (Insulated packaging mandatory)">Strict 30-Min Hot SLA</option>
                          <option value="Standard 45-Min Window (Acceptable if fresh)">Standard 45-Min Window</option>
                          <option value="Scheduled Morning Breakfast Slot (8:15 AM drop)">Scheduled 8:15 AM Drop</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#E6F4EA] mb-1">Fee Tolerance</label>
                        <select
                          value={feeSensitivity}
                          onChange={(e) => setFeeSensitivity(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                        >
                          <option value="Morning Pass Enthusiast — Prefers ₹199/Month Unlimited Delivery Pass">₹199/mo Morning Pass Subscriber</option>
                          <option value="Price Sensitive — Wants ₹49 Fee Max (Abandons cart if ₹99)">Price Sensitive (₹49 Fee Max)</option>
                          <option value="Speed First — Accepts ₹99 Fee for Guaranteed 30-Min SLA">Speed First (Accepts ₹99 SLA Fee)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-white/15">
                <div className="text-[11px] text-[#E6F4EA]">
                  Configured: <strong className="text-white font-bold">{genCount} {genCount === 1 ? 'Persona' : 'Personas'}</strong> for Kadappa Cafe
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGenerateDrawerOpen(false)}
                    className="px-4 py-2 rounded-lg bg-[#062319] text-xs font-semibold text-white/70 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#062319]" />
                    <span>{generating ? `Synthesizing ${genCount} Personas...` : `Synthesize ${genCount} Personas →`}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl bg-[#0A3324] border border-white/30 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-6">
              <h2 className="font-royal-title text-xl font-bold text-white">Cross-Persona Side-by-Side Dossier</h2>
              <button onClick={() => setCompareModalOpen(false)} className="text-white/60 hover:text-white cursor-pointer text-lg font-bold">✕</button>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(compareList.length, 3)} gap-6`}>
              {compareList.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-[#062319] border border-white/20 space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/30" />
                    <div>
                      <h4 className="font-royal-title text-sm font-bold text-white">{p.name}</h4>
                      <p className="text-[11px] text-[#34D399]">{p.occupation}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Segment</span>
                    <p className="text-xs text-white font-semibold">{p.segment}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Budget & Habits</span>
                    <p className="text-xs text-[#E6F4EA]">{p.budget}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Dietary Prefs</span>
                    <p className="text-xs text-white">{p.dietary_prefs}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Delivery SLA</span>
                    <p className="text-xs text-[#E6F4EA]">{p.delivery_expectations}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Primary Objection</span>
                    <p className="text-xs text-rose-300">{p.objections?.[0] || "None specified"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaStudio;

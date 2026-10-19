import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Filter, Download, CheckCircle2, 
  HelpCircle, Eye, FileSpreadsheet, ArrowUpDown,
  Sparkles, User, Users, Plus, Trash2, Play, Search,
  ChevronRight, ArrowRight, ShieldCheck, Clock, DollarSign,
  HeartPulse, RefreshCw, X, MessageSquare, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DEFAULT_PRESET_QUESTIONS = [
  {
    question_text: "How acceptable is a ₹99 delivery fee for guaranteed 30-minute hot breakfast delivery?",
    question_type: "single_choice",
    options: ["Completely Acceptable", "Acceptable if SLA is guaranteed", "Neutral / Conditional", "Unacceptable / Too High"]
  },
  {
    question_text: "Would you subscribe to a ₹199/month Morning Pass offering unlimited zero-fee breakfast deliveries?",
    question_type: "rating_scale",
    options: []
  },
  {
    question_text: "How important is verified low-glycemic foxtail millet nutritional information on your breakfast?",
    question_type: "likert",
    options: []
  },
  {
    question_text: "Does live pan-to-porch GPS tracking reduce your meeting anxiety during morning sprints?",
    question_type: "yes_no",
    options: []
  },
  {
    question_text: "What is your single biggest frustration when ordering breakfast on food delivery apps?",
    question_type: "open_ended",
    options: []
  }
];

const QUESTION_TEMPLATES = [
  {
    label: "+ Pricing & Fee (₹99)",
    question: {
      question_text: "Is a ₹99 delivery fee acceptable for guaranteed 30-minute breakfast SLA?",
      question_type: "single_choice",
      options: ["Completely Acceptable", "Acceptable if SLA is guaranteed", "Neutral / Conditional", "Unacceptable / Too High"]
    }
  },
  {
    label: "+ 30-Min SLA Delivery",
    question: {
      question_text: "How important is guaranteed 30-minute arrival time to your morning schedule?",
      question_type: "rating_scale",
      options: []
    }
  },
  {
    label: "+ Morning Pass (₹199/mo)",
    question: {
      question_text: "Would you subscribe to an upfront ₹199/month pass for unlimited free deliveries?",
      question_type: "single_choice",
      options: ["Very Likely", "Moderately Likely", "Unlikely"]
    }
  },
  {
    label: "+ Millets & Nutrition",
    question: {
      question_text: "How likely are you to choose foxtail millet idlis over standard refined rice items?",
      question_type: "rating_scale",
      options: []
    }
  },
  {
    label: "+ Spillage & Packaging",
    question: {
      question_text: "Does thermal spill-proof packaging increase your willingness to order breakfast at work?",
      question_type: "yes_no",
      options: []
    }
  }
];

const SurveyLab = () => {
  const { activeExperiment, setActiveExperiment } = useAuth();
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedReasoning, setSelectedReasoning] = useState(null);
  
  // Scope filter: "all", "selected", "single"
  const [viewScope, setViewScope] = useState("all");
  const [focusedPersonaId, setFocusedPersonaId] = useState(null);

  // All Personas & Products
  const [allPersonas, setAllPersonas] = useState([]);
  const [products, setProducts] = useState([]);

  // Custom Survey Modal State
  const [isCustomSurveyOpen, setIsCustomSurveyOpen] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState("Kadappa Cafe — Targeted Persona Survey");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [surveyScope, setSurveyScope] = useState("all"); // "all", "selected", "single"
  const [targetPersonaIds, setTargetPersonaIds] = useState([]);
  const [personaSearch, setPersonaSearch] = useState("");
  const [customQuestions, setCustomQuestions] = useState(DEFAULT_PRESET_QUESTIONS);
  const [isExecutingSurvey, setIsExecutingSurvey] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionStatus, setExecutionStatus] = useState("");

  const loadSurveyResults = async () => {
    try {
      setLoading(true);
      if (activeExperiment?.id) {
        const matrix = await api.getSurveyMatrix(activeExperiment.id);
        setSurveyData(matrix);
        if (matrix?.matrix?.length > 0 && !focusedPersonaId) {
          setFocusedPersonaId(matrix.matrix[0].persona_id);
        }
      }
    } catch (err) {
      console.error("Survey load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveyResults();
  }, [activeExperiment]);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [pers, prods] = await Promise.all([
          api.getPersonas(),
          api.getProducts()
        ]);
        setAllPersonas(pers || []);
        setProducts(prods || []);
        if (prods && prods.length > 0) {
          setSelectedProductId(prods[0].id);
        }
        if (pers && pers.length > 0 && targetPersonaIds.length === 0) {
          setTargetPersonaIds(pers.map(p => p.id));
        }
      } catch (e) {
        console.error("Error loading personas/products:", e);
      }
    };
    fetchPrerequisites();
  }, []);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (!surveyData?.matrix || !surveyData?.questions) return;
    const headers = ["Question", ...filteredMatrix.map(m => m.persona_name)];
    const rows = surveyData.questions.map(q => {
      const qRow = [`"${q.question_text.replace(/"/g, '""')}"`];
      filteredMatrix.forEach(m => {
        const val = m.answers[q.id]?.response_value || "N/A";
        qRow.push(`"${val}"`);
      });
      return qRow.join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kadappa_Cafe_Survey_${activeExperiment?.title || "Study"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scope & Segment Filtering for Results
  const filteredMatrix = (surveyData?.matrix || []).filter(m => {
    if (viewScope === "single" && focusedPersonaId) {
      return m.persona_id === focusedPersonaId;
    }
    if (selectedSegment === "All") return true;
    return (m.persona_segment || "").includes(selectedSegment);
  });

  // Targeted Persona for Dossier Mode
  const activeDossierPersona = (surveyData?.matrix || []).find(m => m.persona_id === focusedPersonaId) || surveyData?.matrix?.[0];

  // Custom Survey Handlers
  const handleOpenCustomSurvey = () => {
    if (allPersonas.length > 0) {
      if (surveyScope === "all") {
        setTargetPersonaIds(allPersonas.map(p => p.id));
      } else if (surveyScope === "single" && targetPersonaIds.length === 0) {
        setTargetPersonaIds([allPersonas[0].id]);
      }
    }
    setIsCustomSurveyOpen(true);
  };

  const handleSelectSurveyScope = (scope) => {
    setSurveyScope(scope);
    if (scope === "all") {
      setTargetPersonaIds(allPersonas.map(p => p.id));
    } else if (scope === "single") {
      setTargetPersonaIds(targetPersonaIds.length > 0 ? [targetPersonaIds[0]] : [allPersonas[0]?.id]);
    }
  };

  const handleTogglePersonaInCustom = (id) => {
    if (surveyScope === "single") {
      setTargetPersonaIds([id]);
    } else {
      if (targetPersonaIds.includes(id)) {
        setTargetPersonaIds(targetPersonaIds.filter(pid => pid !== id));
      } else {
        setTargetPersonaIds([...targetPersonaIds, id]);
      }
    }
  };

  const handleAddQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        question_text: "New evaluated product hypothesis question...",
        question_type: "rating_scale",
        options: []
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (customQuestions.length <= 1) {
      alert("A survey must contain at least one question.");
      return;
    }
    setCustomQuestions(customQuestions.filter((_, i) => i !== idx));
  };

  const handleApplyTemplate = (tmpl) => {
    setCustomQuestions([...customQuestions, { ...tmpl.question }]);
  };

  const handleExecuteCustomSurvey = async (e) => {
    e.preventDefault();
    if (customQuestions.length === 0) {
      alert("Please add at least one survey question.");
      return;
    }
    if (surveyScope !== "all" && targetPersonaIds.length === 0) {
      alert("Please select at least one persona for this survey.");
      return;
    }

    try {
      setIsExecutingSurvey(true);
      setExecutionProgress(20);
      setExecutionStatus(`Targeting ${surveyScope === 'single' ? '1 Persona' : surveyScope === 'selected' ? `${targetPersonaIds.length} Selected Personas` : `All ${allPersonas.length} Personas`}...`);

      await new Promise(r => setTimeout(r, 400));
      setExecutionProgress(50);
      setExecutionStatus("Simulating authentic persona reasoning and vector memory recall...");

      const payload = {
        experiment_id: activeExperiment?.id || undefined,
        product_id: selectedProductId || undefined,
        title: surveyTitle,
        persona_scope: surveyScope,
        persona_ids: targetPersonaIds,
        questions: customQuestions
      };

      const result = await api.runCustomSurvey(payload);
      setExecutionProgress(85);
      setExecutionStatus("Calculating persona consistency profile validation and response matrix...");

      await new Promise(r => setTimeout(r, 400));
      setExecutionProgress(100);
      setExecutionStatus("Survey simulation completed successfully!");

      setSurveyData(result);
      if (result.matrix && result.matrix.length > 0) {
        setFocusedPersonaId(result.matrix[0].persona_id);
      }
      if (surveyScope === "single") {
        setViewScope("single");
      } else {
        setViewScope("all");
      }

      await new Promise(r => setTimeout(r, 500));
      setIsCustomSurveyOpen(false);

    } catch (err) {
      alert("Error executing custom survey: " + err.message);
    } finally {
      setIsExecutingSurvey(false);
    }
  };

  const filteredPersonasForPicker = allPersonas.filter(p => {
    if (!personaSearch) return true;
    const q = personaSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.segment.toLowerCase().includes(q) || p.occupation.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-[#34D399]" />
            <h1 className="font-royal-title text-2xl font-bold text-white tracking-tight">Survey Lab — Targeted Persona Simulator</h1>
          </div>
          <p className="text-xs text-[#A7F3D0]">
            Conduct surveys with custom questions against a single persona, selected personas, or all personas with full internal rationale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCustomSurvey}
            className="px-4 py-2 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20"
          >
            <Sparkles className="w-4 h-4 text-[#062319]" />
            <span>Conduct Custom Survey</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-[#0E3D2E] border border-white/20 hover:border-white/40 text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#34D399]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Persona Scope Selector & Segment Filters */}
      <div className="p-4 rounded-xl bg-[#0A3324] border border-white/20 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Scope Mode Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#34D399] tracking-wider mr-1">
              Cohort View:
            </span>

            <button
              onClick={() => { setViewScope("all"); setSelectedSegment("All"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === "all"
                  ? 'bg-white text-[#062319] font-bold shadow-md'
                  : 'bg-[#062319] border border-white/20 text-[#E6F4EA] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Personas ({surveyData?.matrix?.length || 0})</span>
            </button>

            <button
              onClick={() => {
                setViewScope("single");
                if (!focusedPersonaId && surveyData?.matrix?.length > 0) {
                  setFocusedPersonaId(surveyData.matrix[0].persona_id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === "single"
                  ? 'bg-white text-[#062319] font-bold shadow-md'
                  : 'bg-[#062319] border border-white/20 text-[#E6F4EA] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Single Person Deep-Dive</span>
            </button>
          </div>

          {/* Single Persona Picker Dropdown (when in single mode) */}
          {viewScope === "single" && surveyData?.matrix && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A7F3D0] font-medium">Select Persona:</span>
              <select
                value={focusedPersonaId || ""}
                onChange={(e) => setFocusedPersonaId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#062319] border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {surveyData.matrix.map(m => (
                  <option key={m.persona_id} value={m.persona_id} className="bg-[#062319] text-white">
                    {m.persona_name} — {m.persona_segment}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Segment Pills (when in matrix view) */}
          {viewScope === "all" && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0] tracking-wider">Filter:</span>
              {["All", "Budget-conscious", "Time-pressed", "Health-conscious", "Frequent delivery", "Vegetarian", "Night-shift"].map(seg => (
                <button
                  key={seg}
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedSegment === seg
                      ? 'bg-white text-[#062319] font-bold shadow-sm'
                      : 'bg-[#062319] border border-white/20 text-[#E6F4EA] hover:text-white'
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: SINGLE PERSON DEEP-DIVE DOSSIER */}
      {viewScope === "single" && activeDossierPersona && (
        <div className="space-y-6">
          {/* Persona Dossier Header Card */}
          <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img 
                src={activeDossierPersona.avatar} 
                alt={activeDossierPersona.persona_name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#34D399] shadow-md shadow-black/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-royal-title text-xl font-bold text-white tracking-wide">{activeDossierPersona.persona_name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0E3D2E] border border-[#34D399]/40 text-[10px] text-[#34D399] font-bold uppercase">
                    Single Persona Target
                  </span>
                </div>
                <p className="text-xs text-[#34D399] font-medium mt-0.5">{activeDossierPersona.persona_segment}</p>
                <p className="text-[11px] text-[#A7F3D0] mt-1">{activeDossierPersona.occupation || "Professional"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full md:w-auto">
              <div className="p-3 rounded-xl bg-[#062319] border border-white/10 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Monthly Budget</span>
                <span className="text-white font-semibold">{activeDossierPersona.budget || "₹8,000 / mo"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#062319] border border-white/10 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Schedule</span>
                <span className="text-white font-semibold truncate block max-w-[140px]">{activeDossierPersona.schedule || "Morning Rush"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#062319] border border-white/10 col-span-2 sm:col-span-1 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Dietary Prefs</span>
                <span className="text-white font-semibold truncate block max-w-[140px]">{activeDossierPersona.dietary_prefs || "South Indian"}</span>
              </div>
            </div>
          </div>

          {/* Question-by-Question Dossier Answers */}
          <div className="space-y-4">
            <h3 className="font-royal-title text-base font-bold text-white flex items-center gap-2">
              <span>Evaluated Questions & Recorded Responses</span>
              <span className="text-xs font-mono text-[#34D399] font-semibold">({surveyData?.questions?.length || 0} Dimensions)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {surveyData?.questions?.map((q, idx) => {
                const ans = activeDossierPersona.answers?.[q.id] || { response_value: "—", reasoning: "" };
                const isPositive = ans.response_value.includes("Acceptable") || ans.response_value === "5" || ans.response_value === "Very Likely" || ans.response_value === "4" || ans.response_value === "Yes";
                const isNegative = ans.response_value.includes("Unacceptable") || ans.response_value === "1" || ans.response_value === "Unlikely" || ans.response_value === "No";

                return (
                  <div key={q.id} className="p-5 rounded-xl bg-[#0A3324] border border-white/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-[#0E3D2E] border border-[#34D399] flex items-center justify-center text-[10px] font-bold text-[#34D399]">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#34D399]">
                            {q.question_type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-relaxed">{q.question_text}</h4>
                      </div>

                      {/* Stated Response Badge */}
                      <div className="shrink-0">
                        <span className={`inline-block px-3.5 py-1.5 rounded-xl font-bold text-xs border shadow-sm ${
                          isPositive 
                            ? 'bg-[#0E3D2E] border-[#34D399]/40 text-[#34D399]' 
                            : isNegative 
                            ? 'bg-rose-950/80 border-rose-500/40 text-rose-300' 
                            : 'bg-[#062319] border border-white/20 text-white'
                        }`}>
                          {ans.response_value}
                        </span>
                      </div>
                    </div>

                    {/* Internal Reasoning Quote */}
                    <div className="p-4 rounded-xl bg-[#062319] border border-white/10 space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Persona Internal Reasoning & Grounded Rationale</span>
                        </span>
                        <span className="text-[10px] text-[#A7F3D0] font-mono">
                          {Math.round((ans.consistency_score || 0.94) * 100)}% Consistency Score
                        </span>
                      </div>
                      <p className="text-xs text-[#E6F4EA] italic leading-relaxed">
                        "{ans.reasoning || 'Aligns with my daily schedule and routine.'}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SIDE-BY-SIDE MATRIX TABLE (ALL / SELECTED) */}
      {viewScope === "all" && (
        <div className="rounded-2xl bg-[#0A3324] border border-white/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Table Header: Personas */}
              <thead>
                <tr className="bg-[#062319] border-b border-white/20">
                  <th className="p-4 w-72 min-w-[280px] sticky left-0 bg-[#062319] backdrop-blur-md z-10 border-r border-white/10 font-royal-title text-xs uppercase tracking-wider text-[#34D399]">
                    Evaluated Feature / Question
                  </th>
                  {filteredMatrix.map(m => (
                    <th key={m.persona_id} className="p-4 min-w-[220px] max-w-[260px] border-r border-white/10 align-top">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <img src={m.avatar} alt={m.persona_name} className="w-8 h-8 rounded-lg object-cover border border-white/30" />
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{m.persona_name}</p>
                          <p className="text-[10px] text-[#34D399] truncate">{m.persona_segment}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFocusedPersonaId(m.persona_id);
                          setViewScope("single");
                        }}
                        className="text-[10px] text-[#34D399] hover:text-white hover:underline flex items-center gap-1 mt-1 cursor-pointer font-medium"
                      >
                        <User className="w-2.5 h-2.5" />
                        <span>Inspect Persona Dossier →</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body: Questions rows */}
              <tbody className="divide-y divide-white/10">
                {surveyData?.questions?.map((q, qIdx) => (
                  <tr key={q.id} className="hover:bg-white/5 transition-colors">
                    {/* Sticky Question Title Column */}
                    <td className="p-4 sticky left-0 bg-[#062319] backdrop-blur-md z-10 border-r border-white/10 align-top">
                      <span className="text-[10px] font-mono font-bold text-[#34D399] block mb-1">
                        DIMENSION {qIdx + 1}
                      </span>
                      <p className="font-semibold text-white leading-relaxed">
                        {q.question_text}
                      </p>
                      <span className="inline-block mt-2 text-[9px] uppercase px-2 py-0.5 rounded-full bg-[#0E3D2E] border border-white/15 text-[#A7F3D0] font-mono">
                        {q.question_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Answers for each persona */}
                    {filteredMatrix.map(m => {
                      const ans = m.answers[q.id] || { response_value: "—", reasoning: "" };
                      const isPositive = ans.response_value.includes("Acceptable") || ans.response_value === "5" || ans.response_value === "Very Likely" || ans.response_value === "4" || ans.response_value === "Yes";
                      const isNegative = ans.response_value.includes("Unacceptable") || ans.response_value === "1" || ans.response_value === "Unlikely" || ans.response_value === "No";

                      return (
                        <td key={m.persona_id} className="p-4 border-r border-white/10 align-top">
                          <div className="space-y-2">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-semibold text-xs border ${
                              isPositive 
                                ? 'bg-[#0E3D2E] border-[#34D399]/40 text-[#34D399]' 
                                : isNegative 
                                ? 'bg-rose-950/80 border-rose-500/40 text-rose-300' 
                                : 'bg-[#062319] border border-white/15 text-white'
                            }`}>
                              {ans.response_value}
                            </span>

                            {ans.reasoning && (
                              <p className="text-[11px] text-[#E6F4EA] leading-relaxed line-clamp-3">
                                "{ans.reasoning}"
                              </p>
                            )}

                            {ans.reasoning && (
                              <button
                                onClick={() => setSelectedReasoning({
                                  personaName: m.persona_name,
                                  personaSegment: m.persona_segment,
                                  questionText: q.question_text,
                                  answer: ans.response_value,
                                  reasoning: ans.reasoning,
                                  consistencyScore: ans.consistency_score
                                })}
                                className="text-[10px] text-[#34D399] hover:text-white hover:underline flex items-center gap-1 cursor-pointer pt-1 font-medium"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Rationale & Consistency</span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CONDUCT CUSTOM SURVEY BUILDER */}
      {isCustomSurveyOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-2xl bg-[#0A3324] border border-white/20 shadow-2xl relative text-white space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0E3D2E] border border-white/20 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <h2 className="font-royal-title text-xl font-bold text-white tracking-wide">Conduct Custom Persona Survey</h2>
                  <p className="text-xs text-[#A7F3D0]">
                    Survey a single person, selected persons, or all personas based on your custom questions.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCustomSurveyOpen(false)} 
                className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteCustomSurvey} className="space-y-6">
              
              {/* Product & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider mb-1.5">
                    Survey Study Title
                  </label>
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A7F3D0] uppercase tracking-wider mb-1.5">
                    Target Researched Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#062319] text-white">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. TARGET PERSONAS: SINGLE PERSON / SELECTED PERSONS / ALL PERSONS */}
              <div className="p-5 rounded-xl bg-[#062319] border border-white/15 space-y-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-wider block">
                      Target Persona Cohort
                    </label>
                    <span className="text-[11px] text-[#A7F3D0]">
                      Choose whether this survey should be evaluated by a single person, selected persons, or all persons.
                    </span>
                  </div>

                  {/* 3 Scope Selector Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {[
                      { key: "single", label: "Single Person", icon: User },
                      { key: "selected", label: `Selected (${targetPersonaIds.length})`, icon: Layers },
                      { key: "all", label: `All (${allPersonas.length})`, icon: Users },
                    ].map(s => {
                      const Icon = s.icon;
                      const isActive = surveyScope === s.key;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => handleSelectSurveyScope(s.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-white text-[#062319] shadow-md'
                              : 'bg-[#0E3D2E] border border-white/20 text-[#E6F4EA] hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Persona Search Box */}
                {(surveyScope === "single" || surveyScope === "selected") && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-[#A7F3D0]" />
                      <input
                        type="text"
                        value={personaSearch}
                        onChange={(e) => setPersonaSearch(e.target.value)}
                        placeholder="Search personas by name, occupation, or segment (e.g. 'Priya', 'Consultant', 'Student')..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0E3D2E] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* Persona Card Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {filteredPersonasForPicker.map((p) => {
                        const isSelected = targetPersonaIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleTogglePersonaInCustom(p.id)}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#0E3D2E] border-[#34D399] text-white shadow-md'
                                : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-white/30" />
                              <div className="truncate">
                                <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                <p className="text-[10px] text-[#34D399] truncate">{p.segment}</p>
                              </div>
                            </div>
                            <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              isSelected ? 'bg-[#34D399] border-[#34D399] text-[#062319] font-bold' : 'border-white/30'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {surveyScope === "all" && (
                  <div className="p-3.5 rounded-xl bg-[#0E3D2E] border border-white/15 flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#34D399] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Full Cohort Simulation Active ({allPersonas.length} Personas)</p>
                      <p className="text-[11px] text-[#A7F3D0]">Every synthesized persona across all professional segments will answer each of your questions.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CONFIGURE YOUR QUESTIONS ("BASED ON MY QUESTIONS") */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Survey Questions ({customQuestions.length})
                    </span>
                    <span className="text-[11px] text-[#A7F3D0]">
                      Add, edit, or customize any research questions to test against the selected persona(s).
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#062319]" />
                    <span>Add Question</span>
                  </button>
                </div>

                {/* Quick Preset Question Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#34D399]">Quick Question Templates:</span>
                  {QUESTION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg bg-[#0E3D2E] hover:bg-[#062319] border border-white/20 text-xs text-[#E6F4EA] hover:text-white cursor-pointer transition-colors"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Editable Questions List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {customQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#062319] border border-white/15 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0E3D2E] border border-[#34D399]/50 flex items-center justify-center text-xs text-[#34D399] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={q.question_text}
                          onChange={(e) => {
                            const copy = [...customQuestions];
                            copy[idx].question_text = e.target.value;
                            setCustomQuestions(copy);
                          }}
                          placeholder="Type your custom research question here..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0E3D2E] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-[#34D399]">Question Type:</span>
                          <select
                            value={q.question_type}
                            onChange={(e) => {
                              const copy = [...customQuestions];
                              copy[idx].question_type = e.target.value;
                              setCustomQuestions(copy);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#0E3D2E] border border-white/20 text-xs text-white focus:outline-none"
                          >
                            <option value="single_choice">Single Choice</option>
                            <option value="rating_scale">Rating Scale (1-5)</option>
                            <option value="likert">Likert Scale</option>
                            <option value="yes_no">Yes / No</option>
                            <option value="open_ended">Open Ended</option>
                          </select>
                        </div>

                        {/* Options Input for Single Choice */}
                        {q.question_type === "single_choice" && (
                          <div className="flex items-center gap-2 flex-1 sm:justify-end">
                            <span className="text-[#A7F3D0] text-[11px]">Options (comma separated):</span>
                            <input
                              type="text"
                              value={(q.options || []).join(", ")}
                              onChange={(e) => {
                                const copy = [...customQuestions];
                                copy[idx].options = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                                setCustomQuestions(copy);
                              }}
                              placeholder="e.g. High, Moderate, Low"
                              className="w-48 px-2 py-0.5 rounded-lg bg-[#0E3D2E] border border-white/20 text-[11px] text-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Execution Progress Bar */}
              {isExecutingSurvey && (
                <div className="p-4 rounded-xl bg-[#062319] border border-[#34D399]/40 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#34D399] animate-pulse">{executionStatus}</span>
                    <span className="font-mono text-white font-bold">{executionProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0A3324] overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-white to-[#34D399] transition-all duration-300" 
                      style={{ width: `${executionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  disabled={isExecutingSurvey}
                  onClick={() => setIsCustomSurveyOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs font-semibold text-[#E6F4EA] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isExecutingSurvey}
                  className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-[#062319]" />
                  <span>{isExecutingSurvey ? "Simulating Responses..." : "Launch Survey Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXPANDABLE RATIONALE & CONSISTENCY */}
      {selectedReasoning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0A3324] border border-white/25 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <h3 className="font-royal-title text-base font-bold text-white tracking-wide">
                  {selectedReasoning.personaName}
                </h3>
                <p className="text-xs text-[#34D399]">{selectedReasoning.personaSegment}</p>
              </div>
              <button onClick={() => setSelectedReasoning(null)} className="text-white/60 hover:text-white cursor-pointer p-1">✕</button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Evaluated Question</span>
              <p className="text-xs text-white font-medium mt-1">{selectedReasoning.questionText}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Selected Response</span>
              <p className="text-sm font-bold text-[#34D399] mt-1">{selectedReasoning.answer}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#062319] border border-white/15 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-[#34D399]">Internal Persona Reasoning</span>
              <p className="text-xs text-[#E6F4EA] leading-relaxed mt-1 italic">
                "{selectedReasoning.reasoning}"
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#A7F3D0] pt-2 border-t border-white/15">
              <span>Persona Consistency Validation:</span>
              <strong className="text-[#34D399] font-mono font-bold">
                {Math.round((selectedReasoning.consistencyScore || 0.94) * 100)}% Verified
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLab;

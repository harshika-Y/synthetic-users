import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, Sparkles, Check, ArrowRight, ArrowLeft, 
  Users, Layers, Sliders, Play, Trash2, Plus, Info, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  "1. Target Product",
  "2. Persona Cohort",
  "3. Method Selection",
  "4. Questions Matrix",
  "5. Review & Launch"
];

const DEFAULT_QUESTIONS = [
  { question_text: "How acceptable is a ₹99 flat delivery fee for guaranteed 30-minute arrival?", question_type: "single_choice" },
  { question_text: "Would you subscribe to a ₹199/month unlimited morning breakfast pass?", question_type: "rating_scale" },
  { question_text: "How important is verified low-glycemic / foxtail millet nutritional information on your breakfast?", question_type: "likert" },
  { question_text: "Does real-time rider tracking reduce meeting calendar anxiety during morning sprints?", question_type: "yes_no" },
  { question_text: "What is your single biggest frustration when ordering breakfast on food delivery apps?", question_type: "open_ended" }
];

const ExperimentBuilder = () => {
  const navigate = useNavigate();
  const { setActiveExperiment } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [title, setTitle] = useState("Kadappa Cafe — 30-Min SLA & Morning Pass Validation");
  const [objective, setObjective] = useState("Validate 30-min express delivery and evaluate ₹199/mo Morning Pass adoption across Bhubaneswar and Bangalore working professionals.");
  const [primaryQuestion, setPrimaryQuestion] = useState("Will corporate breakfast consumers adopt a ₹199/mo morning delivery pass for guaranteed 30-min hot South Indian breakfast?");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState([]);
  const [method, setMethod] = useState("both"); // "survey", "interview", "both"
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prods, pers] = await Promise.all([
          api.getProducts(),
          api.getPersonas()
        ]);
        setProducts(prods);
        setPersonas(pers);
        if (prods.length > 0) setSelectedProductId(prods[0].id);
        if (pers.length > 0) setSelectedPersonaIds(pers.map(p => p.id));
      } catch (err) {
        console.error("Error loading builder assets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTogglePersona = (id) => {
    if (selectedPersonaIds.includes(id)) {
      setSelectedPersonaIds(selectedPersonaIds.filter(pid => pid !== id));
    } else {
      setSelectedPersonaIds([...selectedPersonaIds, id]);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question_text: "New evaluated product hypothesis question...", question_type: "rating_scale" }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleLaunchExperiment = async () => {
    if (!title || !selectedProductId || selectedPersonaIds.length === 0) {
      alert("Please ensure title, product, and at least one persona are selected.");
      return;
    }

    try {
      setIsRunning(true);
      setProgress(15);
      setStatusMessage("Provisioning experiment workspace and registering hypotheses...");

      const expPayload = {
        product_id: selectedProductId,
        title,
        objective,
        primary_research_question: primaryQuestion,
        method,
        cohort_definition: {
          persona_ids: selectedPersonaIds,
          count: selectedPersonaIds.length
        },
        hypotheses: [
          { statement: "30-minute delivery SLA increases breakfast conversion by 45%", expected_direction: "positive" },
          { statement: "₹99 standalone delivery fee causes >35% drop-off unless covered by ₹199 Morning Pass", expected_direction: "negative" }
        ],
        questions
      };

      const created = await api.createExperiment(expPayload);
      setProgress(40);
      setStatusMessage("Simulating multi-persona responses and running vector memory retrieval...");

      await new Promise(r => setTimeout(r, 600));
      setProgress(75);
      setStatusMessage("Synthesizing strategic findings, sentiment analysis, and adoption scores...");

      const executed = await api.runExperiment(created.id);
      setProgress(100);
      setStatusMessage("Experiment completed successfully!");

      setActiveExperiment(executed);
      await new Promise(r => setTimeout(r, 400));
      navigate('/dashboard');

    } catch (err) {
      alert("Error running experiment: " + err.message);
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white">
      {/* Title */}
      <div className="border-b border-white/15 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-[#34D399]" />
          <h1 className="font-royal-title text-2xl font-bold text-white">Experiment Builder</h1>
        </div>
        <p className="text-xs text-[#E6F4EA]">
          Design a structured synthetic research study with custom hypothesis testing, persona cohorts, and survey matrix parameters.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                isActive 
                  ? 'bg-white text-[#062319] border-white font-bold text-xs shadow-md' 
                  : isDone 
                  ? 'bg-[#0E3D2E] border-white/30 text-[#34D399] text-xs font-semibold' 
                  : 'bg-[#0A3324] border-white/10 text-white/50 text-xs'
              }`}
            >
              <span className="truncate block">{step}</span>
            </div>
          );
        })}
      </div>

      {/* Stepper Content Body */}
      <div className="p-8 rounded-2xl bg-[#0A3324] border border-white/20 shadow-xl">
        {/* Step 0: Product Definition */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
                Select Researched Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#062319] text-white">{p.name} ({p.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
                Experiment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
                Core Research Objective
              </label>
              <textarea
                rows="2"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
                Primary Research Question
              </label>
              <input
                type="text"
                value={primaryQuestion}
                onChange={(e) => setPrimaryQuestion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>
        )}

        {/* Step 1: Target Personas */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
                Select Personas to Participate ({selectedPersonaIds.length} Selected)
              </span>
              <button
                type="button"
                onClick={() => setSelectedPersonaIds(personas.map(p => p.id))}
                className="text-xs text-white underline hover:text-[#34D399] cursor-pointer"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {personas.map((p) => {
                const isSelected = selectedPersonaIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleTogglePersona(p.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#0E3D2E] border-white text-white shadow-md' 
                        : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-white/30" />
                      <div className="truncate">
                        <p className="text-xs font-bold truncate text-white">{p.name}</p>
                        <p className="text-[10px] text-[#A7F3D0] truncate">{p.segment}</p>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      isSelected ? 'bg-white border-white text-[#062319] font-bold' : 'border-white/30'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Research Methods */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
              Choose Research Modality
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'survey', title: 'Survey Mode Only', desc: 'Parallel quantitative matrix across all personas with individual reasoning.' },
                { key: 'interview', title: 'Interview Mode Only', desc: 'Deep multi-turn 1-on-1 qualitative discovery with episodic memory recall.' },
                { key: 'both', title: 'Comprehensive (Both)', desc: 'Full quantitative survey matrix + stateful 1-on-1 interview deep dives.' },
              ].map(m => (
                <div
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    method === m.key 
                      ? 'bg-[#0E3D2E] border-white text-white shadow-lg' 
                      : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                  }`}
                >
                  <div>
                    <h3 className="font-royal-title text-sm font-bold text-white mb-1">{m.title}</h3>
                    <p className="text-xs text-[#E6F4EA] leading-relaxed">{m.desc}</p>
                  </div>
                  <span className={`mt-4 text-[10px] uppercase font-bold tracking-wider ${method === m.key ? 'text-[#34D399]' : 'text-transparent'}`}>
                    Active Selection
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Questions Config */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider">
                Configure Survey Questions ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#062319] border border-white/15 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0E3D2E] border border-white/30 flex items-center justify-center text-xs text-white font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].question_text = e.target.value;
                        setQuestions(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#0A3324] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                    />
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#A7F3D0]">Question Type:</span>
                    <select
                      value={q.question_type}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].question_type = e.target.value;
                        setQuestions(copy);
                      }}
                      className="px-3 py-1 rounded bg-[#0A3324] border border-white/20 text-xs text-white focus:outline-none"
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="rating_scale">Rating Scale (1-5)</option>
                      <option value="likert">Likert Scale</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="open_ended">Open Ended</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="font-royal-title text-base font-bold text-white border-b border-white/15 pb-2">
              Review Experiment Specification
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#062319] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Study Title</span>
                <p className="text-white font-semibold mt-1">{title}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#062319] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Method</span>
                <p className="text-[#34D399] font-semibold mt-1 capitalize">{method} Mode</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#062319] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Cohort Size</span>
                <p className="text-white font-semibold mt-1">{selectedPersonaIds.length} Synthetic Personas</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#062319] border border-white/10">
                <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Questions Matrix</span>
                <p className="text-white font-semibold mt-1">{questions.length} Evaluated Dimensions</p>
              </div>
            </div>

            {/* Execution Progress Bar (when running) */}
            {isRunning && (
              <div className="p-6 rounded-xl bg-[#062319] border border-white/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#34D399] animate-pulse">{statusMessage}</span>
                  <span className="font-mono text-white font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0A3324] overflow-hidden border border-white/20">
                  <div 
                    className="h-full bg-gradient-to-r from-white to-[#34D399] transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 0 || isRunning}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs font-semibold text-white/70 hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isRunning}
              onClick={handleLaunchExperiment}
              className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xl disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-[#062319]" />
              <span>{isRunning ? "Executing Pipeline..." : "Launch Research Pipeline"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentBuilder;

import React, { useState, useEffect } from 'react';
import { 
  Sliders, Key, Cpu, Database, ShieldCheck, 
  CheckCircle2, Sparkles, AlertCircle, Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended for Groq)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Fast)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (High Context)' }
];

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast, Intelligent, Low Cost - Recommended)' },
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI Flagship Omnimodel)' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy Speed)' }
];

const SettingsPage = () => {
  const { isLiveAI } = useAuth();
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  const [openaiKey, setOpenAIKey] = useState("");
  const [openaiModel, setOpenAIModel] = useState("gpt-4o-mini");
  const [aiProvider, setAiProvider] = useState("auto");
  const [demoMode, setDemoMode] = useState(false);
  const [dbStatus, setDbStatus] = useState("SQLite (Local Auto-Fallback)");
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [groqConfigured, setGroqConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        setGroqModel(data.groq_model || 'llama-3.3-70b-versatile');
        setOpenAIModel(data.openai_model || 'gpt-4o-mini');
        setAiProvider(data.ai_provider || 'auto');
        setDemoMode(data.demo_mode);
        setDbStatus(data.database_url);
        setOpenaiConfigured(!!data.openai_api_key_configured);
        setGroqConfigured(!!data.groq_api_key_configured);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings({
        groq_api_key: groqKey ? groqKey : undefined,
        groq_model: groqModel,
        openai_api_key: openaiKey ? openaiKey : undefined,
        openai_model: openaiModel,
        ai_provider: aiProvider,
        demo_mode: demoMode
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      const updated = await api.getSettings();
      setOpenaiConfigured(!!updated.openai_api_key_configured);
      setGroqConfigured(!!updated.groq_api_key_configured);
    } catch (err) {
      alert("Failed to update settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-white">
      {/* Header Banner */}
      <div className="border-b border-white/15 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-[#34D399]" />
          <h1 className="font-royal-title text-2xl font-bold text-white">
            System Configuration & AI Provider Settings
          </h1>
        </div>
        <p className="text-xs text-[#E6F4EA]">
          Configure OpenAI (Official ChatGPT) or Groq credentials, choose inference models, or run on our built-in dynamic semantic engine.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#0E3D2E] border border-white/30 text-xs text-white flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
          <span>System configuration updated successfully. Provider connections reloaded.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Preferred AI Provider Card */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#34D399]" />
              <h3 className="font-royal-title text-sm font-bold text-white">Active AI Engine Mode</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'auto', title: 'Auto (OpenAI / Groq)', desc: 'Prioritizes OpenAI (ChatGPT) or Groq if keys set' },
              { id: 'openai', title: 'OpenAI (ChatGPT)', desc: 'Official GPT-4o / GPT-4o-mini live inference' },
              { id: 'groq', title: 'Groq Cloud LLM', desc: 'Llama 3.3 70B ultra-high-speed inference' },
            ].map(p => (
              <label
                key={p.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  aiProvider === p.id
                    ? 'bg-[#0E3D2E] border-white text-white font-semibold'
                    : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <input
                    type="radio"
                    name="ai_provider"
                    value={p.id}
                    checked={aiProvider === p.id}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="accent-white cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">{p.title}</span>
                </div>
                <p className="text-[10px] text-[#A7F3D0] leading-snug">{p.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* OpenAI (ChatGPT) Card */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#34D399]" />
              <h3 className="font-royal-title text-sm font-bold text-white">OpenAI (ChatGPT) Credentials</h3>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase ${
              openaiConfigured ? 'bg-[#0E3D2E] text-[#34D399] border border-white/20' : 'bg-[#062319] text-white/60 border border-white/15'
            }`}>
              {openaiConfigured ? 'OpenAI (ChatGPT) Configured' : 'Not Set'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
              OpenAI API Key (sk-...)
            </label>
            <input
              type="password"
              placeholder={openaiConfigured ? "•••••••••••••••••••••••• (Configured — enter new key to replace)" : "sk-••••••••••••••••••••••••••••••••••••••••••••"}
              value={openaiKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white font-mono"
            />
            <p className="text-[11px] text-[#E6F4EA] mt-1.5 leading-relaxed">
              Enables live 1-on-1 interview responses directly from official OpenAI ChatGPT models (GPT-4o, GPT-4o-mini).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
              OpenAI Model
            </label>
            <div className="space-y-2">
              {OPENAI_MODELS.map(m => (
                <label
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    openaiModel === m.id
                      ? 'bg-[#0E3D2E] border-white text-white font-semibold'
                      : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="openai_model"
                      value={m.id}
                      checked={openaiModel === m.id}
                      onChange={(e) => setOpenAIModel(e.target.value)}
                      className="accent-white cursor-pointer"
                    />
                    <span className="text-xs font-medium">{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#34D399]">{m.id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Groq API Key Card */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#34D399]" />
              <h3 className="font-royal-title text-sm font-bold text-white">Groq Cloud LLM Credentials</h3>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase ${
              groqConfigured ? 'bg-[#0E3D2E] text-[#34D399] border border-white/20' : 'bg-[#062319] text-white/60 border border-white/15'
            }`}>
              {groqConfigured ? 'Groq Llama 3.3 Configured' : 'Not Set'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
              Groq API Key (gsk_...)
            </label>
            <input
              type="password"
              placeholder={groqConfigured ? "•••••••••••••••••••••••• (Configured — enter new key to replace)" : "gsk_••••••••••••••••••••••••••••••••••••••••••••"}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white font-mono"
            />
            <p className="text-[11px] text-[#E6F4EA] mt-1.5 leading-relaxed">
              Provides free, ultra-high-speed inference powered by Llama 3.3 70B (free key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline font-bold text-white">console.groq.com</a>).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7F3D0] uppercase tracking-wider mb-2">
              Groq Model Architecture
            </label>
            <div className="space-y-2">
              {GROQ_MODELS.map(m => (
                <label
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    groqModel === m.id 
                      ? 'bg-[#0E3D2E] border-white text-white font-semibold' 
                      : 'bg-[#062319] border-white/10 text-[#E6F4EA] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="groq_model"
                      value={m.id}
                      checked={groqModel === m.id}
                      onChange={(e) => setGroqModel(e.target.value)}
                      className="accent-white cursor-pointer"
                    />
                    <span className="text-xs font-medium">{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#34D399]">{m.id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure & Database */}
        <div className="p-6 rounded-2xl bg-[#0A3324] border border-white/20 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Database className="w-4 h-4 text-[#34D399]" />
            <h3 className="font-royal-title text-sm font-bold text-white">Database & Memory Infrastructure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#062319] border border-white/15">
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Primary Relational Store</span>
              <p className="font-semibold text-white mt-1">{dbStatus}</p>
              <p className="text-[10px] text-[#E6F4EA] mt-0.5">Supports MySQL in production & SQLite local fallback.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#062319] border border-white/15">
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Persona Vector Memory</span>
              <p className="font-semibold text-[#34D399] mt-1">Local Cosine Vector Store</p>
              <p className="text-[10px] text-[#E6F4EA] mt-0.5">Zero cloud telemetry. Sub-millisecond semantic recall.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#062319]" />
          <span>{saving ? "Saving Configuration..." : "Save Settings"}</span>
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;

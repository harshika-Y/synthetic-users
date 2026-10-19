import React, { useState, useEffect, useRef } from 'react';
import { 
  MessagesSquare, Send, Sparkles, User, BrainCircuit, 
  Download, Clock, DollarSign, HeartPulse, ShieldAlert,
  HelpCircle, ChevronRight, RefreshCw, Layers, Mic, MicOff,
  Video, VideoOff, Volume2, VolumeX, PhoneOff, PhoneCall,
  Activity, Radio, Coffee, CheckCircle2, MessageCircle, Key, Settings,
  Search, Info, ChevronDown, ChevronUp, Bot
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_QUESTIONS = [
  "Hi! How are you doing today?",
  "Tell me a little about yourself and your routine.",
  "What did you have for breakfast today?",
  "Do you prefer authentic filter coffee or tea in the morning?",
  "Would a ₹99 delivery fee prevent you from ordering a ₹140 dosa?",
  "Why would you choose Kadappa Cafe over cooking at home?",
  "What frustrates you most about existing breakfast delivery packaging?",
  "How does an unexpected delivery delay affect your morning?",
  "Tell me a joke!"
];

const InterviewRoom = () => {
  const { activeExperiment, isLiveAI } = useAuth();
  const [personas, setPersonas] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // UI View States: Default to Modern Chat Experience!
  const [liveMode, setLiveMode] = useState(false); // false = dedicated Chat Room, true = Video Call stage
  const [showDossier, setShowDossier] = useState(true);
  const [personaSearch, setPersonaSearch] = useState("");
  const [expandedReasoning, setExpandedReasoning] = useState({});

  // Voice & Video Call Controls
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [videoCameraOn, setVideoCameraOn] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [latestPersonaSubtitle, setLatestPersonaSubtitle] = useState("");
  const [selectedPersonaEmotion, setSelectedPersonaEmotion] = useState("Engaged & Attentive");
  
  // Live AI Key Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTab, setAiTab] = useState("openai");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [openaiModelInput, setOpenaiModelInput] = useState("gpt-4o-mini");
  const [groqKeyInput, setGroqKeyInput] = useState("");
  const [groqModelInput, setGroqModelInput] = useState("llama-3.3-70b-versatile");
  const [currentAiSettings, setCurrentAiSettings] = useState(null);
  const [savingKey, setSavingKey] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const selectedPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Text-To-Speech function
  const speakText = (text) => {
    if (!voiceAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('IN') || v.name.toLowerCase().includes('india')) ||
                          voices.find(v => v.lang.includes('en-GB')) ||
                          voices.find(v => v.lang.includes('en-US'));
      if (indianVoice) utterance.voice = indianVoice;

      utterance.onstart = () => {
        setIsSpeakingVoice(true);
        setSelectedPersonaEmotion("Speaking Live");
      };
      utterance.onend = () => {
        setIsSpeakingVoice(false);
        setSelectedPersonaEmotion("Listening & Reflective");
      };
      utterance.onerror = () => setIsSpeakingVoice(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Web Speech API for live voice recognition
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. You can type your question directly in the chat box.");
      return;
    }

    if (isRecordingMic) {
      recognitionRef.current?.stop();
      setIsRecordingMic(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecordingMic(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onend = () => {
      setIsRecordingMic(false);
      chatInputRef.current?.focus();
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err);
      setIsRecordingMic(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Ensure experiment and session exist reliably
  const getEffectiveExperimentId = async () => {
    if (activeExperiment?.id) return activeExperiment.id;
    try {
      const exps = await api.getExperiments();
      if (exps && exps.length > 0) return exps[0].id;
    } catch (e) {
      console.warn("Could not fetch experiments:", e);
    }
    return null;
  };

  // Load personas and initialize active interview session
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const pers = await api.getPersonas();
        setPersonas(pers);

        if (pers.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const reqId = urlParams.get('personaId');
          const targetP = (reqId && pers.find(p => p.id === reqId)) ? pers.find(p => p.id === reqId) : pers[0];
          setSelectedPersonaId(targetP.id);
          
          let expId = await getEffectiveExperimentId();
          const sessions = await api.getInterviews();
          const existing = sessions.find(s => s.persona_id === targetP.id);

          if (existing) {
            setSession(existing);
            setMessages(existing.messages || []);
            const lastPersonaMsg = (existing.messages || []).filter(m => m.sender === 'persona').slice(-1)[0];
            if (lastPersonaMsg) setLatestPersonaSubtitle(lastPersonaMsg.content);
          } else {
            const newSession = await api.startInterview(targetP.id, {
              experiment_id: expId,
              persona_id: targetP.id,
              title: `Chat Session: ${targetP.name}`
            });
            setSession(newSession);
            setMessages(newSession.messages || []);
            const firstMsg = (newSession.messages || [])[0];
            if (firstMsg) {
              setLatestPersonaSubtitle(firstMsg.content);
              speakText(firstMsg.content);
            }
          }
        }
      } catch (e) {
        console.error("Interview init error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [activeExperiment]);

  // Switch Persona Channel
  const handleSelectPersona = async (pId) => {
    if (pId === selectedPersonaId) return;
    setSelectedPersonaId(pId);
    setLoading(true);
    setCallDuration(0);
    window.speechSynthesis?.cancel();
    try {
      let expId = await getEffectiveExperimentId();
      const sessions = await api.getInterviews();
      const existing = sessions.find(s => s.persona_id === pId);

      if (existing) {
        setSession(existing);
        setMessages(existing.messages || []);
        const lastPersonaMsg = (existing.messages || []).filter(m => m.sender === 'persona').slice(-1)[0];
        if (lastPersonaMsg) {
          setLatestPersonaSubtitle(lastPersonaMsg.content);
          speakText(lastPersonaMsg.content);
        }
      } else {
        const pObj = personas.find(p => p.id === pId);
        const newSession = await api.startInterview(pId, {
          experiment_id: expId,
          persona_id: pId,
          title: `Chat Session: ${pObj?.name || 'Persona'}`
        });
        setSession(newSession);
        setMessages(newSession.messages || []);
        const firstMsg = (newSession.messages || [])[0];
        if (firstMsg) {
          setLatestPersonaSubtitle(firstMsg.content);
          speakText(firstMsg.content);
        }
      }
    } catch (e) {
      console.error("Switch persona error:", e);
    } finally {
      setLoading(false);
      chatInputRef.current?.focus();
    }
  };

  // Send Message in Chat
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || sending) return;

    window.speechSynthesis?.cancel();
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: 'researcher',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    // Optimistically show user's message immediately
    setMessages(prev => [...prev, tempMsg]);
    setInputText("");
    setSending(true);
    setSelectedPersonaEmotion("Analyzing & Formulating Opinion");

    try {
      let activeSession = session;
      if (!activeSession) {
        const expId = await getEffectiveExperimentId();
        const targetId = selectedPersonaId || personas[0]?.id;
        activeSession = await api.startInterview(targetId, {
          experiment_id: expId,
          persona_id: targetId,
          title: `Chat Session: ${selectedPersona?.name || 'Persona'}`
        });
        setSession(activeSession);
      }

      const reply = await api.sendMessage(activeSession.id, text.trim());
      setMessages(prev => [...prev.filter(m => m.id !== tempMsg.id), tempMsg, reply]);
      setLatestPersonaSubtitle(reply.content);
      speakText(reply.content);
    } catch (e) {
      alert("Failed to send message: " + e.message);
    } finally {
      setSending(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  // Fetch AI settings when modal is opened
  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        const s = await api.getSettings();
        setCurrentAiSettings(s);
        if (s.openai_model) setOpenaiModelInput(s.openai_model);
        if (s.groq_model) setGroqModelInput(s.groq_model);
        if (s.openai_api_key_configured) setAiTab("openai");
        else if (s.groq_api_key_configured) setAiTab("groq");
        else setAiTab("autonomous");
      } catch (e) {
        console.warn("Failed to load AI settings:", e);
      }
    };
    fetchAISettings();
  }, [aiModalOpen]);

  const handleSaveAIProvider = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      if (aiTab === "openai") {
        await api.updateSettings({
          openai_api_key: openaiKeyInput ? openaiKeyInput.trim() : undefined,
          openai_model: openaiModelInput,
          ai_provider: "openai",
          demo_mode: false
        });
      } else if (aiTab === "groq") {
        await api.updateSettings({
          groq_api_key: groqKeyInput ? groqKeyInput.trim() : undefined,
          groq_model: groqModelInput,
          ai_provider: "groq",
          demo_mode: false
        });
      } else {
        await api.updateSettings({
          ai_provider: "autonomous",
          demo_mode: true
        });
      }
      setKeySuccess(true);
      const updated = await api.getSettings();
      setCurrentAiSettings(updated);
      setTimeout(() => {
        setKeySuccess(false);
        setAiModalOpen(false);
      }, 1200);
    } catch (err) {
      alert("Failed to update AI settings: " + err.message);
    } finally {
      setSavingKey(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleExportTranscript = () => {
    if (!messages.length) return;
    const transcriptText = messages.map(m => {
      const role = m.sender === 'researcher' ? 'YOU (RESEARCHER)' : (selectedPersona?.name || 'PERSONA');
      return `[${new Date(m.timestamp || Date.now()).toLocaleTimeString()}] ${role}:\n${m.content}\n${m.reasoning ? `[Internal Persona Reasoning: ${m.reasoning}]\n` : ''}\n`;
    }).join('\n----------------------------------------\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_transcript_${selectedPersona?.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredPersonas = personas.filter(p => 
    p.name.toLowerCase().includes(personaSearch.toLowerCase()) ||
    p.occupation.toLowerCase().includes(personaSearch.toLowerCase()) ||
    p.segment.toLowerCase().includes(personaSearch.toLowerCase())
  );

  const toggleReasoning = (msgId) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col max-w-[1600px] mx-auto text-white">
      {/* Top Studio Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3 shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A3324] border border-[#34D399]/40 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <MessagesSquare className="w-5 h-5 text-[#34D399]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-royal-title text-lg font-bold text-white tracking-wide">
                1-on-1 Persona Chat Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#34D399] border border-[#34D399]/40 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                LIVE CHAT ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#A7F3D0]">
              Chat in real-time with authentic synthetic customer personas. Answers dynamically like ChatGPT with true personal habits, budgets, and voice.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Engine Status Badge / Key Config Trigger */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A3324] border border-white/20 hover:border-white text-[11px] font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Configure OpenAI (ChatGPT) or Groq provider settings"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>
              {currentAiSettings?.openai_api_key_configured
                ? `Live ChatGPT (${currentAiSettings?.openai_model || 'gpt-4o-mini'})`
                : currentAiSettings?.groq_api_key_configured
                  ? `Live Groq (Llama 3.3 70B)`
                  : "Autonomous AI Engine"}
            </span>
          </button>

          {/* View Mode Toggle: Chat vs Video Studio */}
          <div className="flex rounded-lg bg-[#0A3324] p-1 border border-white/20 text-xs">
            <button
              onClick={() => setLiveMode(false)}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                !liveMode ? 'bg-white text-[#062319] shadow-sm' : 'text-[#E6F4EA] hover:text-white'
              }`}
            >
              <MessagesSquare className="w-3.5 h-3.5" />
              <span>Chat Mode</span>
            </button>
            <button
              onClick={() => setLiveMode(true)}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                liveMode ? 'bg-white text-[#062319] shadow-sm' : 'text-[#E6F4EA] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Studio</span>
            </button>
          </div>

          {/* Voice Audio Readout Toggle */}
          <button
            onClick={() => {
              if (voiceAudioEnabled) window.speechSynthesis?.cancel();
              setVoiceAudioEnabled(!voiceAudioEnabled);
            }}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              voiceAudioEnabled 
                ? 'bg-[#0E3D2E] border-[#34D399]/40 text-[#34D399]' 
                : 'bg-[#0A3324] border-white/20 text-white/50'
            }`}
            title={voiceAudioEnabled ? "Voice Output Active (Click to Mute Audio)" : "Voice Output Muted (Click to Enable Persona Voice)"}
          >
            {voiceAudioEnabled ? <Volume2 className="w-4 h-4 text-[#34D399]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Toggle Dossier Sidebar (only in Chat mode) */}
          {!liveMode && (
            <button
              onClick={() => setShowDossier(!showDossier)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showDossier 
                  ? 'bg-[#0E3D2E] border-[#34D399]/40 text-white' 
                  : 'bg-[#0A3324] border-white/20 text-[#A7F3D0] hover:text-white'
              }`}
              title="Toggle Persona Dossier Panel"
            >
              <Info className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="hidden md:inline">{showDossier ? "Hide Dossier" : "Show Dossier"}</span>
            </button>
          )}

          {/* Export Transcript */}
          <button
            onClick={handleExportTranscript}
            className="px-3 py-1.5 rounded-lg bg-[#0A3324] border border-white/20 hover:border-white text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download full interview transcript as text file"
          >
            <Download className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRIMARY VIEW: DEDICATED FULL-FEATURED CHAT STUDIO
          ========================================================================= */}
      {!liveMode ? (
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
          
          {/* LEFT COLUMN: PERSONAS LIST / CHANNELS (3 cols on lg, 4 on md) */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-xl">
            {/* Persona List Header & Search */}
            <div className="p-3 border-b border-white/10 space-y-2.5 bg-[#062319]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Personas</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0E3D2E] text-[#34D399] font-bold border border-white/10">
                  {personas.length} Available
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or segment..."
                  value={personaSearch}
                  onChange={(e) => setPersonaSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A3324] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                />
              </div>
            </div>

            {/* Persona Channel Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-white/5">
              {filteredPersonas.map((p) => {
                const isSelected = p.id === selectedPersona?.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0E3D2E] to-[#0A3324] border border-[#34D399]/50 shadow-md ring-1 ring-[#34D399]/20'
                        : 'hover:bg-[#0E3D2E]/60 border border-transparent text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className={`w-10 h-10 rounded-xl object-cover border ${
                          isSelected ? 'border-[#34D399]' : 'border-white/20'
                        }`}
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#0A3324] absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#E6F4EA]'}`}>
                          {p.name}
                        </h4>
                        <span className="text-[9px] text-[#34D399] font-medium shrink-0 ml-1">
                          {p.age}y
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 truncate mt-0.5">
                        {p.occupation}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#062319] text-[#A7F3D0] border border-white/10 truncate max-w-full">
                        {p.segment}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredPersonas.length === 0 && (
                <div className="p-4 text-center text-xs text-white/50">
                  No personas match "{personaSearch}"
                </div>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: MAIN CHAT INTERACTION (flex-1) */}
          <div className={`${showDossier ? 'col-span-12 md:col-span-8 lg:col-span-6' : 'col-span-12 md:col-span-8 lg:col-span-9'} flex flex-col rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-2xl relative`}>
            
            {/* Chat Room Active Header */}
            <div className="p-3.5 px-4 bg-[#062319] border-b border-white/15 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={selectedPersona?.avatar}
                    alt={selectedPersona?.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-[#34D399]/60 shadow-md"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#062319] absolute -bottom-0.5 -right-0.5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-royal-title text-sm font-bold text-white truncate">
                      {selectedPersona?.name}
                    </h2>
                    <span className="text-[10px] text-[#34D399] bg-[#0E3D2E] px-2 py-0.5 rounded-full font-medium border border-[#34D399]/30 shrink-0">
                      Online • Direct Chat
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7F3D0] truncate mt-0.5">
                    {selectedPersona?.occupation} • {selectedPersona?.age} yrs • {selectedPersona?.segment}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-white/60 font-mono">
                  {messages.length} messages
                </span>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
              
              {/* Persona Intro Card at start of chat */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#062319] to-[#0E3D2E] border border-white/15 text-xs text-[#E6F4EA] space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#34D399]" />
                  <span>Interactive Chat with {selectedPersona?.name}</span>
                </div>
                <p className="text-[11px] text-[#A7F3D0] leading-relaxed">
                  Ask anything! Say "hi", ask about breakfast choices, inquire about a ₹99 delivery fee, request a joke, or probe dietary preferences. {selectedPersona?.name} will reply authentically in real-time.
                </p>
              </div>

              {/* Message Bubbles */}
              {messages.map((m, idx) => {
                const isResearcher = m.sender === 'researcher';
                const msgId = m.id || `msg-${idx}`;
                const hasReasoning = !isResearcher && m.reasoning;
                const isReasoningOpen = expandedReasoning[msgId];

                return (
                  <div key={msgId} className={`flex gap-2.5 ${isResearcher ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Persona Avatar on Left */}
                    {!isResearcher && (
                      <img
                        src={selectedPersona?.avatar}
                        alt={selectedPersona?.name}
                        className="w-8 h-8 rounded-xl object-cover border border-white/20 shrink-0 mt-1"
                      />
                    )}

                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isResearcher ? 'items-end' : 'items-start'}`}>
                      {/* Message Metadata Header */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-[#A7F3D0]">
                          {isResearcher ? 'You (Researcher)' : selectedPersona?.name}
                        </span>
                        <span className="text-[9px] text-white/40">
                          {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Chat Bubble Body */}
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                        isResearcher
                          ? 'bg-gradient-to-r from-emerald-600 to-[#0F4A36] text-white border border-white/30 rounded-tr-none'
                          : 'bg-[#062319] text-white border border-white/20 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>

                        {/* Persona Thinking Accordion */}
                        {hasReasoning && (
                          <div className="mt-2.5 pt-2 border-t border-white/10">
                            <button
                              onClick={() => toggleReasoning(msgId)}
                              className="text-[10px] text-[#34D399] hover:text-white flex items-center gap-1 cursor-pointer font-medium transition-colors"
                            >
                              <BrainCircuit className="w-3 h-3 text-[#34D399]" />
                              <span>Persona Internal Reasoning</span>
                              {isReasoningOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {isReasoningOpen && (
                              <p className="mt-1 text-[10px] text-[#A7F3D0] italic bg-[#041A13] p-2 rounded-lg border border-white/10 leading-snug">
                                {m.reasoning}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Replay Audio Button */}
                        {!isResearcher && (
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <button
                              onClick={() => speakText(m.content)}
                              className="text-[#34D399] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              title="Speak this response aloud"
                            >
                              <Volume2 className="w-3 h-3 text-[#34D399]" />
                              <span>Listen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Researcher Avatar on Right */}
                    {isResearcher && (
                      <div className="w-8 h-8 rounded-xl bg-[#0E3D2E] border border-white/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-[#34D399]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing / Thinking Indicator */}
              {sending && (
                <div className="flex gap-2.5 justify-start">
                  <img
                    src={selectedPersona?.avatar}
                    alt={selectedPersona?.name}
                    className="w-8 h-8 rounded-xl object-cover border border-white/20 shrink-0 mt-1"
                  />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-[#A7F3D0]">
                        {selectedPersona?.name}
                      </span>
                      <span className="text-[9px] text-[#34D399] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 animate-spin" /> typing...
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#062319] text-white border border-white/20 shadow-lg flex items-center gap-2 text-xs">
                      <BrainCircuit className="w-4 h-4 text-[#34D399] animate-spin" />
                      <span className="text-white/80">{selectedPersona?.name} is formulating a reply</span>
                      <div className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-3.5 py-2 bg-[#062319] border-t border-white/10 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#34D399] shrink-0 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#34D399]" />
                <span>Try:</span>
              </span>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-full bg-[#0A3324] hover:bg-[#0E3D2E] border border-white/15 hover:border-white/40 text-[11px] text-[#E6F4EA] whitespace-nowrap transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Bottom Chat Input Bar */}
            <div className="p-3.5 bg-[#062319] border-t border-white/15 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2"
              >
                {/* Speech Dictation Mic */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all shadow-md shrink-0 ${
                    isRecordingMic 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse border-rose-400' 
                      : 'bg-[#0A3324] hover:bg-[#0E3D2E] border-white/20 text-[#34D399]'
                  }`}
                  title={isRecordingMic ? "Listening... click to stop" : "Speak question via microphone"}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder={`Type a message to ${selectedPersona?.name || 'the persona'}... (Press Enter to send)`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A3324] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] shadow-inner"
                  autoFocus
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 ${
                    inputText.trim() && !sending
                      ? 'bg-white text-[#062319] hover:bg-[#F0FDF4] shadow-emerald-900/50'
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: PERSONA DOSSIER & CONTEXT RADAR (3 cols, collapsible) */}
          {showDossier && (
            <div className="hidden lg:flex col-span-3 flex-col rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-xl">
              
              {/* Dossier Header */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#062319]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#34D399]" />
                  <h3 className="font-royal-title text-xs font-bold text-white uppercase tracking-wider">
                    Persona Dossier
                  </h3>
                </div>
                <span className="text-[10px] text-[#A7F3D0] bg-[#0E3D2E] px-2 py-0.5 rounded-full font-semibold border border-white/10">
                  {selectedPersona?.segment}
                </span>
              </div>

              {/* Dossier Body Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Persona Profile Header */}
                <div className="text-center pb-3 border-b border-white/10">
                  <img
                    src={selectedPersona?.avatar}
                    alt={selectedPersona?.name}
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-white/30 shadow-lg"
                  />
                  <h4 className="font-royal-title text-sm font-bold text-white">{selectedPersona?.name}</h4>
                  <p className="text-[11px] text-[#34D399] font-medium">{selectedPersona?.occupation}, {selectedPersona?.age} yrs</p>
                </div>

                {/* Key Attributes */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Schedule & Routine</span>
                    <p className="text-[#E6F4EA] text-[11px] mt-0.5 leading-relaxed bg-[#062319] p-2 rounded-lg border border-white/10">
                      {selectedPersona?.schedule}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Budget Sensitivity</span>
                    <p className="text-[#E6F4EA] text-[11px] mt-0.5 leading-relaxed bg-[#062319] p-2 rounded-lg border border-white/10">
                      {selectedPersona?.budget}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block">Food Habits & Dietary</span>
                    <p className="text-[#E6F4EA] text-[11px] mt-0.5 leading-relaxed bg-[#062319] p-2 rounded-lg border border-white/10">
                      {selectedPersona?.dietary_prefs || selectedPersona?.food_habits}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-300 block">Primary Objections</span>
                    <ul className="space-y-1 text-[#E6F4EA] text-[11px] mt-1 bg-[#062319] p-2 rounded-lg border border-white/10">
                      {(selectedPersona?.objections || [
                        "High ₹99 delivery fee on small orders",
                        "Risk of soggy dosas in transit",
                        "Delaying morning breakfast standups"
                      ]).map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Persona Memory Radar */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-[#34D399]" />
                      <span className="text-[10px] uppercase font-bold text-[#34D399]">Episodic Memory Radar</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#062319] border border-white/10 text-[10px] text-[#A7F3D0] space-y-1">
                      <p className="font-semibold text-white">Consistent Voice Guard Active</p>
                      <p className="leading-relaxed">
                        Answers calibrate to {selectedPersona?.name}'s unique price tolerance, morning standup SLA, and degree coffee preference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            SECONDARY VIEW: IMMERSIVE LIVE VIDEO INTERVIEW CALL STAGE
            ========================================================================= */
        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Main Live Video Stage (8 cols) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-2xl relative">
            
            {/* Live Video Feed Background & Stream */}
            <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#062319] via-[#082B20] to-[#041A13] p-6 overflow-hidden">
              
              {/* Subtle Animated Audio Waveform in Background when speaking */}
              {isSpeakingVoice && (
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    {[40, 75, 120, 90, 60, 110, 80, 50, 95, 130, 85, 45].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-[#34D399] rounded-full animate-bounce" 
                        style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Persona Center Video Portrait */}
              <div className="text-center relative z-10">
                <div className="relative inline-block">
                  <img
                    src={selectedPersona?.avatar}
                    alt={selectedPersona?.name}
                    className={`w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover border-4 shadow-2xl transition-all duration-300 ${
                      isSpeakingVoice 
                        ? 'border-[#34D399] ring-8 ring-[#34D399]/30 scale-105' 
                        : 'border-white/40 ring-4 ring-black/40'
                    }`}
                  />
                  
                  {/* Status Indicator Badge on Portrait */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#062319] border border-white/30 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    {isSpeakingVoice ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
                        <span className="text-[#34D399]">Speaking...</span>
                      </>
                    ) : sending ? (
                      <>
                        <BrainCircuit className="w-3 h-3 text-[#34D399] animate-spin" />
                        <span>Formulating Reply...</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Live Feed</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <h2 className="font-royal-title text-xl font-bold text-white tracking-wide">
                    {selectedPersona?.name}
                  </h2>
                  <p className="text-xs text-[#34D399] font-medium mt-0.5">
                    {selectedPersona?.occupation} • {selectedPersona?.age || 30} yrs
                  </p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-[#0E3D2E] text-white border border-white/20">
                    {selectedPersona?.segment}
                  </span>
                </div>
              </div>

              {/* Top Video Overlay: Call Time + Emotion State */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#062319]/80 backdrop-blur-md border border-white/20 text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                  <span className="font-mono font-bold text-white">{formatCallTime(callDuration)}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#062319]/80 backdrop-blur-md border border-white/20 text-[11px]">
                  <Activity className="w-3 h-3 text-[#34D399]" />
                  <span className="text-[#E6F4EA] font-medium">State: <strong className="text-white">{selectedPersonaEmotion}</strong></span>
                </div>
              </div>

              {/* Picture-in-Picture: Researcher Self Cam Preview */}
              <div className="absolute bottom-20 right-4 w-32 h-24 rounded-xl bg-[#0E3D2E] border-2 border-white/30 shadow-xl overflow-hidden flex flex-col justify-between p-2">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="px-1.5 py-0.5 rounded bg-black/60 text-white font-semibold">You</span>
                  <div className="flex items-center gap-1">
                    {micMuted ? <MicOff className="w-2.5 h-2.5 text-rose-400" /> : <Mic className="w-2.5 h-2.5 text-[#34D399]" />}
                    {videoCameraOn ? <Video className="w-2.5 h-2.5 text-white" /> : <VideoOff className="w-2.5 h-2.5 text-rose-400" />}
                  </div>
                </div>
                <div className="flex items-center justify-center flex-1">
                  <User className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-[8px] text-center text-white/80 font-medium">Principal Researcher</p>
              </div>

              {/* Live Real-Time Subtitles Banner over Video */}
              {sending ? (
                <div className="absolute bottom-4 left-4 right-36 bg-[#062319]/95 backdrop-blur-md border border-white/30 rounded-xl p-3 shadow-xl">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#34D399] tracking-wider mb-0.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-[#34D399] animate-spin shrink-0" />
                    <span>{selectedPersona?.name} is thinking live:</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <span>Formulating ChatGPT-style authentic response...</span>
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              ) : latestPersonaSubtitle ? (
                <div className="absolute bottom-4 left-4 right-36 bg-[#062319]/90 backdrop-blur-md border border-white/30 rounded-xl p-3 shadow-xl">
                  <p className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider mb-0.5">
                    Live Closed Captions ({selectedPersona?.name}):
                  </p>
                  <p className="text-xs text-white leading-relaxed line-clamp-3">
                    "{latestPersonaSubtitle}"
                  </p>
                </div>
              ) : null}
            </div>

            {/* Video Call Controls Bar */}
            <div className="p-4 bg-[#062319] border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    isRecordingMic 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                      : 'bg-white text-[#062319] hover:bg-[#F0FDF4]'
                  }`}
                  title="Click to speak your question aloud using your microphone"
                >
                  {isRecordingMic ? <Mic className="w-4 h-4 animate-spin text-white" /> : <Mic className="w-4 h-4 text-[#062319]" />}
                  <span>{isRecordingMic ? "Listening..." : "Speak Question (Mic)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMicMuted(!micMuted)}
                  className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    micMuted ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-[#0A3324] border-white/20 text-white'
                  }`}
                  title={micMuted ? "Unmute My Mic" : "Mute My Mic"}
                >
                  {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setVideoCameraOn(!videoCameraOn)}
                  className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    !videoCameraOn ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-[#0A3324] border-white/20 text-white'
                  }`}
                  title={videoCameraOn ? "Turn Off Video" : "Turn On Video"}
                >
                  {videoCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Text Input in Call */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex-1 flex items-center gap-2 min-w-[260px]"
              >
                <input
                  type="text"
                  placeholder={`Chat naturally with ${selectedPersona?.name} ("Hi", "How are you?", "What did you eat?", or food questions)...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#0A3324] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2 rounded-xl bg-white text-[#062319] hover:bg-[#F0FDF4] disabled:opacity-40 transition-all cursor-pointer shadow-md font-bold"
                >
                  <Send className="w-4 h-4 text-[#062319]" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Live Stream Feed: Dynamic Conversation Turns (4 cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-royal-title text-sm font-bold text-white">Live Discussion Turns</h3>
                <p className="text-[10px] text-[#A7F3D0]">Real-time dialogue log & underlying reasoning</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0E3D2E] text-white border border-white/20 font-bold">
                {messages.length} Turns
              </span>
            </div>

            {/* Quick Suggested Prompt Bubbles */}
            <div className="p-3 bg-[#062319] border-b border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0] block mb-1.5">
                Suggested Questions to Try:
              </span>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="text-left p-2 rounded-lg bg-[#0A3324] hover:bg-[#0E3D2E] border border-white/10 hover:border-white/30 text-[11px] text-[#E6F4EA] transition-all cursor-pointer leading-snug"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>

            {/* Message Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, idx) => {
                const isResearcher = m.sender === 'researcher';
                return (
                  <div key={idx} className={`flex flex-col ${isResearcher ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-[#A7F3D0]">
                        {isResearcher ? 'You' : selectedPersona?.name}
                      </span>
                      <span className="text-[9px] text-white/50">
                        {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl text-xs leading-relaxed max-w-[95%] ${
                      isResearcher 
                        ? 'bg-[#0E3D2E] text-white border border-white/30 rounded-br-none' 
                        : 'bg-[#062319] text-white border border-white/20 rounded-bl-none'
                    }`}>
                      <p>{m.content}</p>

                      {!isResearcher && m.reasoning && (
                        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-[#34D399] italic">
                          💭 Reflection: {m.reasoning}
                        </div>
                      )}

                      {!isResearcher && (
                        <button
                          onClick={() => speakText(m.content)}
                          className="mt-1.5 text-[9px] text-[#A7F3D0] hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3 text-[#34D399]" />
                          <span>Replay Audio</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-[#A7F3D0]">
                      {selectedPersona?.name}
                    </span>
                    <span className="text-[9px] text-[#34D399] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 animate-spin" /> Live Thinking...
                    </span>
                  </div>
                  <div className="p-3 rounded-xl text-xs bg-[#062319] text-white border border-white/20 rounded-bl-none shadow-md flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 animate-spin text-[#34D399] shrink-0" />
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span>Formulating response</span>
                      <span className="inline-flex gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* AI Key Configuration Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0A3324] border border-white/30 shadow-2xl relative text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0E3D2E] border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#34D399]" />
                </div>
                <div>
                  <h3 className="font-royal-title text-sm font-bold text-white">Live AI Provider Configuration</h3>
                  <p className="text-[11px] text-[#A7F3D0]">Select inference engine: OpenAI (ChatGPT), Groq, or Dynamic Engine</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Provider Tabs */}
            <div className="flex rounded-lg bg-[#062319] p-1 border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => setAiTab("openai")}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  aiTab === "openai" ? 'bg-white text-[#062319] shadow-sm' : 'text-[#E6F4EA] hover:text-white'
                }`}
              >
                ChatGPT (OpenAI)
              </button>
              <button
                type="button"
                onClick={() => setAiTab("groq")}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  aiTab === "groq" ? 'bg-white text-[#062319] shadow-sm' : 'text-[#E6F4EA] hover:text-white'
                }`}
              >
                Groq (Llama 3.3)
              </button>
              <button
                type="button"
                onClick={() => setAiTab("autonomous")}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  aiTab === "autonomous" ? 'bg-white text-[#062319] shadow-sm' : 'text-[#E6F4EA] hover:text-white'
                }`}
              >
                Built-In Engine
              </button>
            </div>

            <form onSubmit={handleSaveAIProvider} className="space-y-4">
              {aiTab === "openai" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#062319] border border-white/10 text-xs text-[#E6F4EA] leading-relaxed">
                    Connect your <strong>OpenAI API Key</strong> to have the persona answer directly using official <strong>ChatGPT models</strong> in real-time.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase mb-1">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={openaiKeyInput}
                      onChange={(e) => setOpenaiKeyInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase mb-1">
                      ChatGPT Model
                    </label>
                    <select
                      value={openaiModelInput}
                      onChange={(e) => setOpenaiModelInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                      <option value="gpt-4o">gpt-4o (Most Intelligent)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                    </select>
                  </div>
                </div>
              )}

              {aiTab === "groq" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#062319] border border-white/10 text-xs text-[#E6F4EA] leading-relaxed">
                    Connect your <strong>Groq API Key</strong> for ultra-fast (&lt;500ms) Llama 3.3 70B conversational intelligence.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase mb-1">
                      Groq API Key
                    </label>
                    <input
                      type="password"
                      placeholder="gsk_..."
                      value={groqKeyInput}
                      onChange={(e) => setGroqKeyInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white uppercase mb-1">
                      Groq Model
                    </label>
                    <select
                      value={groqModelInput}
                      onChange={(e) => setGroqModelInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#062319] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                      <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                      <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                    </select>
                  </div>
                </div>
              )}

              {aiTab === "autonomous" && (
                <div className="p-3 rounded-xl bg-[#062319] border border-white/10 text-xs text-[#E6F4EA] leading-relaxed space-y-2">
                  <p>
                    <strong>High-Fidelity Built-in Engine</strong> is active by default. It parses question semantics, morning schedules, breakfast preferences, price sensitivity, and answers conversationally without requiring external API keys.
                  </p>
                  <p className="text-[11px] text-[#A7F3D0]">
                    Zero API costs. Zero rate limits. Always fast and authentic.
                  </p>
                </div>
              )}

              {keySuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI settings updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingKey}
                  className="px-4 py-1.5 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] font-bold text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingKey ? "Saving..." : "Save AI Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;

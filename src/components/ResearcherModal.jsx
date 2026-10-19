import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Lock, Mail, ArrowRight, ShieldCheck, 
  FlaskConical, X, CheckCircle2, AlertCircle, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResearcherModal = ({ isOpen, onClose }) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('researcher@regalux.ai');
  const [password, setPassword] = useState('RoyalSecret2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify researcher credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('researcher@regalux.ai');
    setPassword('RoyalSecret2026!');
    setError('');
    setLoading(true);
    try {
      await login('researcher@regalux.ai', 'RoyalSecret2026!');
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectContinue = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl border p-7 relative overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#07261D',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(52, 211, 153, 0.2)',
          color: '#FFFFFF'
        }}
      >
        {/* Glow corner ambient accent */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
          style={{ backgroundColor: '#34D399' }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header / Brand */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#07261D] shadow-lg shadow-white/10 shrink-0">
            <FlaskConical className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#34D399] uppercase font-bold px-2 py-0.5 rounded bg-white/10 border border-white/20">
                Regalux AI Suite
              </span>
              <span className="text-[10px] text-white flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" /> Live
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 tracking-tight font-royal-title">
              Researcher Studio Sign In
            </h2>
            <p className="text-xs text-[#E6F4EA]/80">Authenticate to access Synthetic Personas & Intelligence</p>
          </div>
        </div>

        {/* Active Session Notification if already signed in */}
        {user && (
          <div className="mb-4 p-3 rounded-xl bg-[#041A13] border border-white/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#E6F4EA]/70 block uppercase tracking-wider">Active Session</span>
              <span className="text-[#34D399] font-semibold">{user.email || 'researcher@regalux.ai'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDirectContinue}
                className="px-3.5 py-1 rounded-full bg-white text-[#07261D] font-bold text-[11px] hover:bg-[#F0FDF4] cursor-pointer shadow"
              >
                Enter Studio →
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                title="Sign out this session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Authenticated successfully! Redirecting to studio...</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-white uppercase mb-1">
              Researcher Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#34D399] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="researcher@regalux.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#34D399] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-4 bg-white text-[#07261D] hover:bg-[#F0FDF4]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In as Researcher & Enter Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick 1-Click Access for Convenience */}
        <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-2">
          <button
            onClick={handleQuickDemoLogin}
            type="button"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#0E4634]/70 hover:bg-[#0E4634] border border-[#34D399]/40 text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>1-Click Lead Researcher Quick Access</span>
          </button>
          <div className="text-center text-[10px] text-[#E6F4EA]/70">
            Pre-configured: <span className="text-white font-mono">researcher@regalux.ai</span> / <span className="text-white font-mono">RoyalSecret2026!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherModal;

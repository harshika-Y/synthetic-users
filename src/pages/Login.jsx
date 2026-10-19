import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('researcher@regalux.ai');
  const [password, setPassword] = useState('RoyalSecret2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setEmail('researcher@regalux.ai');
    setPassword('RoyalSecret2026!');
  };

  return (
    <div className="min-h-screen bg-[#062319] text-white flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-radial-gradient from-[#0E3D2E]/40 via-[#0A3324]/80 to-[#041A13] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0A3324] border border-white/25 shadow-2xl relative z-10 text-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/20 border border-white/40">
            <span className="font-royal-title text-xl font-bold text-[#062319]">K</span>
          </div>
          <h1 className="font-royal-title text-2xl font-bold text-white">Researcher Access</h1>
          <p className="text-xs text-[#E6F4EA] mt-1">Sign in to your Kadappa Cafe AI Research Studio</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E6F4EA] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="researcher@regalux.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E6F4EA] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#062319]" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/15 flex flex-col gap-3">
          <button
            onClick={handleAutofillDemo}
            type="button"
            className="w-full py-2 rounded-lg bg-[#0E3D2E] hover:bg-[#134e3a] border border-white/20 text-[11px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Autofill Seeded Demo Credentials</span>
          </button>

          <p className="text-center text-xs text-[#E6F4EA]">
            Need a new research profile?{' '}
            <Link to="/register" className="text-white underline font-semibold hover:text-[#34D399]">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

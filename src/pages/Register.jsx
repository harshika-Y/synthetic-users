import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Principal Researcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#062319] text-white flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0A3324] border border-white/25 shadow-2xl relative z-10 text-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/20 border border-white/40">
            <span className="font-royal-title text-xl font-bold text-[#062319]">K</span>
          </div>
          <h1 className="font-royal-title text-2xl font-bold text-white">Register Profile</h1>
          <p className="text-xs text-[#E6F4EA] mt-1">Join the Kadappa Cafe AI Research Studio</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E6F4EA] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                placeholder="Dr. Alexander Wright"
              />
            </div>
          </div>

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
                placeholder="alexander@regalux.ai"
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

          <div>
            <label className="block text-xs font-medium text-[#E6F4EA] mb-1.5">Research Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#062319] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-[#062319] hover:bg-[#F0FDF4] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50"
          >
            <span>{loading ? 'Creating...' : 'Register Workspace Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#062319]" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#E6F4EA]">
          Already have access?{' '}
          <Link to="/login" className="text-white underline font-semibold hover:text-[#34D399]">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

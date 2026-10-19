import React, { useState } from 'react';
import { 
  User, Lock, Mail, Utensils, Award, Clock, 
  MapPin, CheckCircle2, X, Sparkles, ArrowRight, Heart
} from 'lucide-react';

const CustomerModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'account'
  const [email, setEmail] = useState('foodie@kadappacafe.com');
  const [password, setPassword] = useState('DosaLover2026');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setActiveTab('account');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md rounded-2xl border p-6 relative overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#07261D',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(52, 211, 153, 0.15)',
          color: '#FFFFFF'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#34D399] p-1 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="Kadappa Cafe" className="h-12 w-auto" />
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Kadappa Club
            </h2>
            <p className="text-xs text-[#E6F4EA]/80">Customer Loyalty & Food Ordering Portal</p>
          </div>
        </div>

        {!isLoggedIn ? (
          <div>
            <div className="mb-4 text-xs text-[#E6F4EA]/80 leading-relaxed">
              Sign in to track orders, redeem filter coffee rewards, and rate upcoming express 30-min delivery options.
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white uppercase mb-1">
                  Customer Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#34D399] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-white text-[#041A13] hover:bg-[#F0FDF4]"
              >
                <span>Customer Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#041A13]" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/15 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(true);
                  setActiveTab('account');
                }}
                className="text-xs text-[#34D399] hover:underline font-semibold"
              >
                Quick Demo Customer Access →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Customer Status Banner */}
            <div className="p-4 rounded-xl bg-[#041A13] border border-white/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#E6F4EA]/80">Welcome Back,</p>
                <h3 className="text-sm font-bold text-white">Priya Sundaram</h3>
                <span className="text-[10px] text-[#34D399] font-mono">Gold Foodie Member</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#E6F4EA]/80 block">Rewards Balance</span>
                <span className="text-lg font-bold text-white font-mono">480 pts</span>
              </div>
            </div>

            {/* Quick Favorites */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block mb-2">
                Your Kadappa Cafe Favorites
              </span>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Ghee Podi Masala Dosa', price: '₹140', desc: 'Crispy golden crepe with gunpowder spice' },
                  { name: 'Kumbakonam Degree Filter Coffee', price: '₹55', desc: 'Brewed fresh with chicory & frothed milk' },
                  { name: 'Millet Idli Platter (3 pcs)', price: '₹95', desc: 'Dietician-approved high fiber breakfast' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#041A13]/70 border border-white/15 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-[#E6F4EA]/70">{item.desc}</p>
                    </div>
                    <span className="font-mono text-white font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Order Tracker */}
            <div className="p-3.5 rounded-xl bg-[#0E4634]/60 border border-[#34D399]/40 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-white font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#34D399]" />
                  Active 30-Min Delivery Order
                </span>
                <span className="text-[10px] font-mono text-[#34D399]">Arriving in 14 mins</span>
              </div>
              <p className="text-[11px] text-[#E6F4EA]/80">
                Kitchen dispatch complete. Delivery executive Ramesh is en route to Nuagan Tech Park.
              </p>
            </div>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-[#E6F4EA] hover:text-white cursor-pointer"
            >
              Sign Out of Customer Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerModal;

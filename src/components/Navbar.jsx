import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Sparkles } from 'lucide-react';
import CustomerModal from './CustomerModal';
import ResearcherModal from './ResearcherModal';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [researcherModalOpen, setResearcherModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = () => setResearcherModalOpen(true);
    window.addEventListener('open-researcher-modal', handleOpen);
    return () => window.removeEventListener('open-researcher-modal', handleOpen);
  }, []);

  const handleResearcherClick = () => {
    setResearcherModalOpen(true);
  };

  return (
    <>
      {/* Main Royal Cafe Navbar - Green & Light White Theme Only */}
      <nav 
        className="navbar" 
        style={{ 
          position: 'relative', 
          top: 0, 
          padding: '16px 5%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: 'rgba(6, 35, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <div className="nav-brand">
          <Link to="/">
            <img src="/logo.png" alt="Kadappa Cafe" style={{ height: '85px', width: 'auto' }} />
          </Link>
        </div>

        <div className="nav-links flex items-center gap-6">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/menu" className="nav-link">MENU</Link>
          <Link to="/book" className="nav-link">BOOK TABLE</Link>
          <Link to="/contact" className="nav-link">CONTACT</Link>

          {/* Customer Login Button - Light White Outline */}
          <button
            onClick={() => setCustomerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/60 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-white" />
            <span>Customer Sign In</span>
          </button>

          {/* AI Researcher Studio Button - Pure Light White Shade with Deep Green Text */}
          <button
            onClick={handleResearcherClick}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#062319] text-xs font-bold hover:bg-[#F0FDF4] transition-all shadow-md shadow-white/10 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#062319]" />
            <span>AI Researcher Studio</span>
          </button>
        </div>
      </nav>

      {/* Customer Experience Modal */}
      <CustomerModal 
        isOpen={customerModalOpen} 
        onClose={() => setCustomerModalOpen(false)} 
      />

      {/* Researcher Authentication & Studio Entry Modal */}
      <ResearcherModal
        isOpen={researcherModalOpen}
        onClose={() => setResearcherModalOpen(false)}
      />
    </>
  );
};

export default Navbar;

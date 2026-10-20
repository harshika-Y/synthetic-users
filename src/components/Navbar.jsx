import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag, Receipt, User } from 'lucide-react';
import CustomerModal from './CustomerModal';
import ResearcherModal from './ResearcherModal';
import { useCustomer } from '../context/CustomerContext';
import { getAssetUrl } from '../utils/assets';

const Navbar = () => {
  const [researcherModalOpen, setResearcherModalOpen] = useState(false);
  const { 
    customer, 
    totalItemsCount, 
    subtotal, 
    setIsCartOpen, 
    isCustomerModalOpen, 
    setIsCustomerModalOpen 
  } = useCustomer();
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
            <img src={getAssetUrl('/logo.png')} alt="Kadappa Cafe" style={{ height: '85px', width: 'auto' }} />
          </Link>
        </div>

        <div className="nav-links flex items-center gap-5">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
          <Link to="/menu" className="nav-link">MENU & ORDER</Link>
          <Link to="/book" className="nav-link">BOOK TABLE</Link>
          <Link to="/contact" className="nav-link">CONTACT</Link>

          {/* Cart Button with Count Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#041A13] border border-white/25 hover:border-[#34D399] text-xs font-semibold text-white transition-all cursor-pointer shadow group"
            title="Open Food Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-[#34D399] group-hover:scale-110 transition-transform" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#34D399] text-[#041A13] font-bold text-[10px] font-mono flex items-center justify-center animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <span>Cart</span>
            {totalItemsCount > 0 && (
              <span className="text-[#34D399] font-mono font-bold text-[11px] pl-1 border-l border-white/15">
                ₹{subtotal}
              </span>
            )}
          </button>

          {/* Customer Google Login / Profile Button */}
          {customer ? (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E4634]/90 border border-[#34D399]/60 hover:border-[#34D399] transition-all cursor-pointer shadow"
              title="View Google Data Vault & Bills"
            >
              <img 
                src={customer.picture} 
                alt={customer.name} 
                className="w-5 h-5 rounded-full object-cover border border-[#34D399]" 
              />
              <span className="text-xs font-semibold text-white max-w-[110px] truncate">
                {customer.name.split(' ')[0]}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#34D399] font-mono">
                Google
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/60 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Customer Sign In</span>
            </button>
          )}

          {/* AI Researcher Studio Button */}
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
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
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

import React, { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, 
  Search, Sparkles, BookOpen, Clock, Star, Flame, Check
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menuData';
import { getAssetUrl } from '../utils/assets';
import FoodAdModal from '../components/FoodAdModal';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="page" ref={ref} style={{backgroundColor: 'var(--color-charred-clove)', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'}}>
      {props.image ? (
        <img src={getAssetUrl(props.image)} alt={`Menu Page`} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      ) : (
        <div style={{width: '100%', height: '100%', backgroundColor: 'var(--color-charred-clove)'}}></div>
      )}
    </div>
  );
});

const Menu = () => {
  const [viewMode, setViewMode] = useState('online'); // 'online' | 'flipbook'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [is3DAdOpen, setIs3DAdOpen] = useState(false);
  
  // Flipbook state
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef(null);

  // Customer Cart context
  const { cart, addToCart, removeFromCart, updateQuantity, setIsCartOpen, subtotal, totalItemsCount } = useCustomer();

  const handlePageChange = (e) => {
    setCurrentPage(e.data);
    if (e.data === 0) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const closeMenu = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flip(0);
    }
  };

  const flipNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const flipPrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  // Filtered menu items
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (id) => {
    const found = cart.find((c) => c.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <>
      <div className="watermark-bg"></div>

      <section className="poster-section" style={{ paddingTop: '110px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Header Eyebrow & Title */}
        <div className="text-eyebrow" style={{ marginBottom: '6px', color: '#A0B3A6', letterSpacing: '0.2em', fontSize: '13px' }}>
          FRESH HERITAGE FLAVOURS
        </div>
        <h1 className="text-display" style={{ marginBottom: '20px', lineHeight: '1', fontSize: 'clamp(40px, 6vw, 70px)', color: '#FFFFFF' }}>
          THE MENU
        </h1>

        {/* View Mode Toggle: Order Online vs Flipbook */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#041A13] border border-white/20 mb-8 shadow-lg">
          <button
            onClick={() => setViewMode('online')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'online'
                ? 'bg-white text-[#041A13] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Online (30-Min Delivery)</span>
          </button>

          <button
            onClick={() => setViewMode('flipbook')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'flipbook'
                ? 'bg-white text-[#041A13] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Heritage Flipbook Menu</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* MODE 1: INTERACTIVE ONLINE ORDERING WITH ADD TO CART */}
        {/* ============================================================== */}
        {viewMode === 'online' && (
          <div className="w-full max-w-6xl px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
            
            {/* Featured 3D Commercial Showcase Banner */}
            <div 
              onClick={() => setIs3DAdOpen(true)}
              className="relative overflow-hidden rounded-2xl border border-emerald-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group hover:border-emerald-400 transition-all shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 61, 44, 0.95) 0%, rgba(4, 31, 22, 0.98) 100%)',
                boxShadow: '0 15px 35px -5px rgba(0,0,0,0.7), 0 0 30px rgba(52, 211, 153, 0.15)'
              }}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/50 shrink-0 shadow-lg relative">
                  <img 
                    src={getAssetUrl('/dosa-3d-ad.jpg')} 
                    alt="Ghee Podi Masala Dosa 3D Commercial" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-1">
                    <span className="text-[9px] font-mono text-emerald-300 font-bold">360°</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-black font-mono">
                      FEATURED 3D COMMERCIAL
                    </span>
                    <span className="text-xs text-emerald-300 font-mono">9:16 Vertical • 360° Studio</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Ghee Podi Masala Dosa — 360° Photorealistic Commercial
                  </h4>
                  <p className="text-xs text-emerald-100/70 hidden sm:block">
                    Rising steam, shimmering pure cow ghee highlights & floating podi spices on a turning ceramic platter.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Watch 3D Ad (360°)</span>
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#34D399] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dosas, filter coffee, thalis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Express delivery note */}
                <div className="flex items-center gap-2 text-xs text-[#34D399] font-mono">
                  <Clock className="w-4 h-4" />
                  <span>Nuagan Kitchen Live • Express 30-Min Delivery</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {MENU_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#0E4634] text-white border border-[#34D399] shadow-sm'
                        : 'bg-[#041A13]/80 text-white/70 hover:text-white border border-white/10 hover:border-white/25'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const qty = getItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className="royal-card rounded-2xl p-4 sm:p-5 border flex flex-col justify-between hover:scale-[1.01] transition-all group relative overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(7, 38, 29, 0.85)',
                      borderColor: 'rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {/* Food Item Image with Category Badge & 3D Commercial Trigger */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-[#041A13]/80 border border-white/10 group-hover:border-[#34D399]/40 transition-all">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                      />
                      
                      {/* Bestseller Tag */}
                      {item.isBestseller && (
                        <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-mono shadow-md">
                          ★ Chef Bestseller
                        </span>
                      )}

                      {/* 3D Commercial Watch Button for Ghee Podi Masala Dosa */}
                      {item.has3DAd && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIs3DAdOpen(true);
                          }}
                          className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#041A13]/90 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/60 text-[11px] font-bold font-mono transition-all shadow-lg backdrop-blur-sm cursor-pointer group/btn"
                          title="Watch 6-8s 360° Photorealistic 3D Food Advertisement"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:text-black animate-pulse" />
                          <span>3D Ad (360°)</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Veg indicator & Category */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-4 h-4 border border-emerald-500 rounded-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="text-[11px] text-[#A0B3A6] font-mono">
                          {item.category}
                        </span>
                      </div>

                      {/* Title & Calories */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#34D399] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#E6F4EA]/70 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Meta: Rating and Prep Time */}
                      <div className="flex items-center gap-3 text-[11px] text-[#A0B3A6] pt-1">
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-300" />
                          <span>{item.rating}</span>
                          <span className="text-white/40">({item.reviewsCount})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#34D399]" />
                          <span>{item.prepTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Row: Price & Add to Cart */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                      <div>
                        <span className="text-[10px] text-white/50 block font-mono">Price</span>
                        <span className="text-lg font-bold font-mono text-white">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Add to Cart or Quantity Stepper */}
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 rounded-full bg-white text-[#041A13] font-bold text-xs uppercase tracking-wider hover:bg-[#F0FDF4] transition-all flex items-center gap-1.5 shadow-md cursor-pointer group-hover:shadow-emerald-900/40"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#041A13]" />
                          <span>Add to Cart</span>
                        </button>
                      ) : (
                        <div className="flex items-center bg-[#041A13] border border-[#34D399] rounded-full overflow-hidden shadow-md">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="p-2 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 text-white" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[#34D399]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="p-2 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty Search State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm text-white/60">No dishes found matching "{searchQuery}"</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="px-4 py-2 rounded-full bg-white/10 text-xs text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  Reset Filter & View All Dishes
                </button>
              </div>
            )}

            {/* Floating Quick View Cart Bar on bottom */}
            {totalItemsCount > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#0E4634] to-[#041A13] border-2 border-[#34D399] text-white flex items-center justify-between shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer"
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 25px rgba(52, 211, 153, 0.4)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#34D399] text-[#041A13] flex items-center justify-center font-bold font-mono text-xs">
                      {totalItemsCount}
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block leading-none">
                        View Cart & Delivery Address
                      </span>
                      <span className="text-[10px] text-[#34D399] font-mono">
                        Subtotal: ₹{subtotal}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    <span>Checkout</span>
                    <ChevronRight className="w-4 h-4 text-[#34D399]" />
                  </div>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: ORIGINAL HERITAGE FLIPBOOK MENU */}
        {/* ============================================================== */}
        {viewMode === 'flipbook' && (
          <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', height: '540px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Menu Book Container */}
            <motion.div 
              animate={{ 
                x: isOpen ? 0 : -320,
                y: isOpen ? 0 : -20, 
                scale: isOpen ? 1 : 0.88 
              }}
              transition={{ type: 'spring', stiffness: 80, damping: 20 }}
              style={{ 
                position: 'absolute',
                left: '50%',
                marginLeft: '-400px',
                width: '800px',
                height: '540px', 
                filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.8))',
                zIndex: 10,
                cursor: isOpen ? 'default' : 'pointer'
              }}
            >
              {/* Elegant Floating "Click to Open" Badge */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, x: '-50%' }}
                    animate={{ opacity: 1, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.8, x: '-50%' }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      left: '75%',
                      bottom: '30px', 
                      zIndex: 20,
                      pointerEvents: 'none', 
                      backgroundColor: 'var(--color-tiger-gold)',
                      color: '#0A2911',
                      padding: '6px 12px', 
                      borderRadius: '30px',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '10px', 
                      fontWeight: '800',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.4)' 
                    }}
                  >
                    <motion.div 
                      animate={{ x: [0, 4, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </motion.div>
                    CLICK TO OPEN
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Menu Button */}
              <AnimatePresence>
                {isOpen && (
                  <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onClick={closeMenu}
                    style={{
                      position: 'absolute',
                      top: '-50px', 
                      right: '0',
                      zIndex: 30,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      padding: '6px 14px',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontFamily: 'system-ui, sans-serif',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.15em',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
                  >
                    <X size={14} />
                    CLOSE MENU
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Next Page Arrow */}
              <AnimatePresence>
                {isOpen && currentPage < 4 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={flipNext}
                    style={{
                      position: 'absolute',
                      right: '-70px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 30,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                  >
                    <ChevronRight size={50} strokeWidth={1.5} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Prev Page Arrow */}
              <AnimatePresence>
                {isOpen && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={flipPrev}
                    style={{
                      position: 'absolute',
                      left: '-70px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 30,
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)', 
                      cursor: 'pointer',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'} 
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                  >
                    <ChevronLeft size={50} strokeWidth={1.5} />
                  </motion.button>
                )}
              </AnimatePresence>

              <HTMLFlipBook 
                ref={flipBookRef}
                width={400} 
                height={540} 
                size="stretch"
                minWidth={300}
                maxWidth={400}
                minHeight={400}
                maxHeight={540}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                className="menu-flipbook"
                onFlip={handlePageChange}
              >
                <Page image="/Menu/1.png" />
                <Page image="/Menu/2.png" />
                <Page image="/Menu/3.png" />
                <Page image="/Menu/4.png" />
                <Page image="/Menu/5.png" />
                <Page image="" />
              </HTMLFlipBook>
            </motion.div>
            
            {/* Right Side Features List */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  style={{ position: 'absolute', right: '2%', width: '500px', zIndex: 1 }}
                >
                  <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '30px', padding: '6px 16px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#34D399', letterSpacing: '0.2em', fontSize: '11px', fontWeight: '600' }}>
                      ✦ A SENSORY JOURNEY
                    </div>
                  </div>
                  
                  <h2 style={{ fontFamily: "var(--font-salmond)", fontSize: 'clamp(50px, 6vw, 75px)', color: '#FFF', marginBottom: '16px', fontWeight: '700', textTransform: 'uppercase', lineHeight: '1' }}>
                    Culinary<br/>
                    <span style={{ fontFamily: "'Playfair Display', serif", color: '#34D399', fontStyle: 'italic', textTransform: 'none', fontWeight: '600', fontSize: 'clamp(40px, 5vw, 60px)' }}>Masterpieces.</span>
                  </h2>
                  
                  <p style={{ color: '#A0B3A6', fontFamily: "system-ui, sans-serif", fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                    Turn the pages to explore our handcrafted dishes. From crisp, golden dosas to rich, aromatic filter coffee—every recipe is a tribute to authentic South Indian heritage.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <div style={{ color: '#34D399', fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Signature Dosas</div>
                      <div style={{ color: '#A0B3A6', fontSize: '13px', lineHeight: '1.5' }}>Crisp, golden perfection served with homemade chutneys.</div>
                    </div>
                    <div>
                      <div style={{ color: '#34D399', fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Traditional Thalis</div>
                      <div style={{ color: '#A0B3A6', fontSize: '13px', lineHeight: '1.5' }}>A grand feast featuring authentic, freshly prepared items.</div>
                    </div>
                    <div>
                      <div style={{ color: '#34D399', fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Fluffy Idlis</div>
                      <div style={{ color: '#A0B3A6', fontSize: '13px', lineHeight: '1.5' }}>Melt-in-your-mouth steamed classics, served piping hot.</div>
                    </div>
                    <div>
                      <div style={{ color: '#34D399', fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', marginBottom: '6px' }}>Filter Coffee</div>
                      <div style={{ color: '#A0B3A6', fontSize: '13px', lineHeight: '1.5' }}>Strong, aromatic coffee to awaken your senses.</div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setViewMode('online')}
                      className="px-6 py-2.5 rounded-full bg-white text-[#041A13] font-bold text-xs uppercase tracking-wider hover:bg-[#F0FDF4] transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#041A13]" />
                      <span>Order These Dishes Online →</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </section>

      {/* 6-8s 360° Photorealistic 3D Food Advertisement Modal */}
      <FoodAdModal isOpen={is3DAdOpen} onClose={() => setIs3DAdOpen(false)} />
    </>
  );
};

export default Menu;

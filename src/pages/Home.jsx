import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { getAssetUrl } from '../utils/assets';

const DYNAMIC_TAGLINES = [
  {
    highlight: "Always Fresh",
    badge: "Always Fresh",
    desc: "Crispy dosas, soft idlis, flavourful vadas and more - made with fresh ingredients and served with authentic South Indian taste."
  },
  {
    highlight: "Pure Desi Ghee",
    badge: "Pure Desi Ghee",
    desc: "Golden roasted crepes drenched in authentic pure cow ghee, releasing heavenly traditional aromas in every bite."
  },
  {
    highlight: "Crispy & Golden",
    badge: "Crispy & Golden",
    desc: "Lacy, ultra-crisp crepes sprinkled with artisanal gunpowder spices and served with 3 homemade fresh chutneys."
  },
  {
    highlight: "Degree Filter Brew",
    badge: "Filter Coffee",
    desc: "Signature dark decoction slowly extracted with chicory, frothed with thick boiling milk in brass dabara sets."
  },
  {
    highlight: "Steamed to Perfection",
    badge: "Millet Idlis",
    desc: "Piping hot ragi and foxtail millet idlis steamed naturally from 24-hour stone-ground fermented batter."
  },
  {
    highlight: "Delivered in 30 Mins",
    badge: "30-Min Delivery",
    desc: "Live from our Nuagan kitchen straight to your doorstep in insulated thermal bags keeping food sizzling hot."
  }
];

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { addToCart, setIsCartOpen } = useCustomer();

  // Dynamic Typewriter Headline State
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayText, setDisplayText] = useState(DYNAMIC_TAGLINES[0].highlight);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const targetText = DYNAMIC_TAGLINES[taglineIndex].highlight;
    let timer;

    if (!isDeleting) {
      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 70);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setTaglineIndex((prev) => (prev + 1) % DYNAMIC_TAGLINES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, taglineIndex, isPaused]);

  const selectTagline = (idx) => {
    setTaglineIndex(idx);
    setIsDeleting(false);
    setDisplayText(DYNAMIC_TAGLINES[idx].highlight);
  };

  const openResearcherModal = (e) => {
    if (e) e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-researcher-modal'));
  };
  
  // Track scroll progress within the combined Hero + About container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end center"]
  });

  // Map scroll progress (0 to 1) to x, y, scale, and rotation values
  const dosaX = useTransform(scrollYProgress, [0, 0.45, 1], ["5%", "-90%", "-90%"]);
  const dosaY = useTransform(scrollYProgress, [0, 0.45, 1], ["20%", "5%", "5%"]);
  const dosaScale = useTransform(scrollYProgress, [0, 0.45, 1], [1, 0.85, 0.85]);
  const dosaRotate = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0, 0]);

  return (
    <>
      <div className="watermark-bg"></div>
      
      {/* Scroll Animation Wrapper */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        
        {/* Absolute wrapper to prevent layout shift while giving physical height to the sticky container so it naturally stops at the boundary */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ position: 'sticky', top: '15vh', height: '600px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', overflow: 'visible', width: '100%', maxWidth: '1440px', margin: '0 auto', paddingLeft: '5%', paddingRight: '5%' }}>
            <motion.img 
              src={getAssetUrl('/dosa.png')} 
              alt="Kadappa Cafe Dosa"
              style={{ 
                width: '110%', 
                maxWidth: '700px', 
                height: 'auto', 
                filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.8))',
                x: dosaX,
                y: dosaY,
                scale: dosaScale,
                rotate: dosaRotate
              }} 
            />
          </div>
        </div>

        <section className="hero-poster" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', paddingTop: '130px', paddingBottom: '60px', paddingLeft: '5%', paddingRight: '5%', maxWidth: '1440px', margin: '0 auto', gap: '40px', minHeight: '90vh' }}>
          
          {/* Left Side: Elegant Typography */}
          <div style={{ paddingRight: '20px', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
              <div className="text-eyebrow" style={{ color: '#A0B3A6', letterSpacing: '0.2em', fontSize: '13px' }}>
                AUTHENTIC SOUTH INDIAN FLAVOURS
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.35)', fontSize: '10px', color: '#34D399', fontFamily: 'monospace' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                <span>DYNAMIC SHOWCASE</span>
              </div>
            </div>
            
            {/* Dynamic Animated Heading */}
            <h1 
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: 'clamp(46px, 6.2vw, 88px)', 
                lineHeight: '1.12', 
                color: '#F4F4F4', 
                marginBottom: '16px', 
                fontWeight: '600',
                minHeight: '2.3em'
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              Traditional<br/>
              Taste,{' '}
              <span 
                style={{ 
                  color: '#34D399', 
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #34D399 50%, #6EE7B7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline'
                }}
              >
                {displayText}
              </span>
              <span 
                style={{
                  display: 'inline-block',
                  width: '3.5px',
                  height: '0.85em',
                  backgroundColor: '#34D399',
                  marginLeft: '4px',
                  verticalAlign: '-0.05em',
                  boxShadow: '0 0 10px #34D399',
                  borderRadius: '2px'
                }}
                className="animate-pulse"
              />
            </h1>

            {/* Interactive Dynamic Tagline Selector Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {DYNAMIC_TAGLINES.map((item, idx) => {
                const isActive = idx === taglineIndex;
                return (
                  <button
                    key={item.badge}
                    type="button"
                    onClick={() => selectTagline(idx)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontFamily: 'system-ui, sans-serif',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      backgroundColor: isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#34D399' : 'rgba(255, 255, 255, 0.65)',
                      border: isActive ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isActive ? '0 0 12px rgba(52, 211, 153, 0.25)' : 'none'
                    }}
                  >
                    <span 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: isActive ? '#34D399' : 'rgba(255, 255, 255, 0.3)',
                        display: 'inline-block'
                      }} 
                    />
                    <span>{item.badge}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Dynamic Description matching active tagline */}
            <div style={{ minHeight: '60px', marginBottom: '24px' }}>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontFamily: "system-ui, sans-serif", color: '#A0B3A6', fontSize: '16px', lineHeight: '1.6', maxWidth: '480px', margin: 0 }}
                >
                  {DYNAMIC_TAGLINES[taglineIndex].desc}
                </motion.p>
              </AnimatePresence>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button 
                onClick={() => navigate('/menu')}
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', borderRadius: '30px', padding: '12px 28px', fontSize: '14px', pointerEvents: 'auto', cursor: 'pointer' }}
              >
                EXPLORE MENU <span style={{fontSize: '16px'}}>→</span>
              </button>

              <button 
                onClick={openResearcherModal}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  borderRadius: '30px', 
                  padding: '12px 24px', 
                  fontSize: '13px', 
                  fontWeight: '700',
                  color: '#062319', 
                  background: '#FFFFFF',
                  border: '1px solid #FFFFFF',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
                }}
              >
                <span>RESEARCH STUDIO</span>
                <span>✨</span>
              </button>
            </div>
          </div>

          {/* Right Side: Empty placeholder for sticky Dosa */}
          <div style={{ minHeight: '600px' }}></div>
        </section>

        <div className="poster-section" style={{paddingTop: '0', paddingBottom: '0'}}>
          <div className="dotted-divider"></div>
        </div>

        <section className="poster-section" style={{ padding: '80px 5%', maxWidth: '1440px', margin: '0 auto', minHeight: '90vh' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            
            {/* Left Side: Empty placeholder for sticky Dosa */}
            <div style={{ minHeight: '500px' }}></div>

            {/* Right Side: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              style={{ paddingRight: '40px' }}
            >
              <div className="text-eyebrow" style={{ color: '#A0B3A6', letterSpacing: '0.2em', fontSize: '13px', marginBottom: '16px' }}>
                AUTHENTIC SOUTH INDIAN FLAVOURS
              </div>
              
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: '1.2', color: '#FFFFFF', marginBottom: '30px', fontWeight: '600' }}>
                A Taste of South India, <span style={{ color: 'var(--color-tiger-gold)', fontStyle: 'italic' }}>Made Fresh.</span>
              </h2>
              
              <p style={{ fontFamily: "system-ui, sans-serif", color: '#E0E0E0', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
                At Kadappa Café, we bring the authentic flavours of South India to your table. From crispy golden dosas and soft idlis to flavourful vadas, wholesome thalis, and traditional filter coffee, every bite celebrates the comfort of South Indian cuisine.
              </p>
              
              <p style={{ fontFamily: "system-ui, sans-serif", color: '#E0E0E0', fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
                <strong style={{ color: '#FFFFFF' }}>Established in 2026</strong>, we're here to serve delicious food, warm hospitality, and a memorable dining experience.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-tiger-gold)', marginBottom: '40px', fontSize: '16px', fontWeight: '500' }}>
                📍 <span style={{ color: '#FFFFFF' }}>Kalinganagar, Bhubaneswar, Odisha</span>
              </div>
              
              <button 
                onClick={() => navigate('/menu')}
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', borderRadius: '30px', padding: '16px 32px', fontSize: '15px', cursor: 'pointer' }}
              >
                Discover Our Menu <span style={{fontSize: '18px'}}>→</span>
              </button>
            </motion.div>

          </div>
        </section>
      </div>

      <div className="poster-section" style={{paddingTop: '0', paddingBottom: '0'}}>
        <div className="dotted-divider"></div>
      </div>

      <section className="poster-section" style={{textAlign: 'center'}}>
        <h2 className="text-display" style={{fontSize: 'clamp(50px, 8vw, 100px)', marginBottom: '40px'}}>WATCH US</h2>
        <div style={{display: 'flex', gap: '50px', justifyContent: 'center', flexWrap: 'wrap'}}>
          {[
            "https://res.cloudinary.com/asqkllni/video/upload/v1791570798/Video-68969.mp4",
            "https://res.cloudinary.com/asqkllni/video/upload/v1791570982/Video-87756.mp4",
            "https://res.cloudinary.com/asqkllni/video/upload/v1791571009/Video-12119.mp4",
            "https://res.cloudinary.com/asqkllni/video/upload/v1791571071/Video-20911.mp4"
          ].map((src, idx) => (
            <div key={idx} className="surface-card" style={{width: '260px', height: '460px', padding: '0', overflow: 'hidden', position: 'relative', borderRadius: '16px'}}>
              <video 
                src={src} 
                autoPlay 
                muted 
                loop 
                playsInline
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="poster-section" style={{paddingTop: '0', paddingBottom: '0'}}>
        <div className="dotted-divider"></div>
      </div>

      <section className="poster-section" style={{textAlign: 'center', paddingBottom: '120px'}}>
        <h2 className="text-display" style={{fontSize: 'clamp(50px, 8vw, 100px)', marginBottom: '80px'}}>MUST TRY</h2>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'start', marginTop: '80px'}}>
          {[
            { id: "kdp-drink-01", img: getAssetUrl("/filtercoffe.png"), title: "Filter Coffee", desc: "Aromatic & Strong", price: "₹ 55", numericPrice: 55, category: "Filter Coffee & Beverages", text: "Authentic Kumbakonam degree coffee brewed fresh with pure cow's milk." },
            { id: "kdp-thali-01", img: getAssetUrl("/thali.png"), title: "South Thali", desc: "Authentic Meals", price: "₹ 260", numericPrice: 260, category: "Thalis & Traditional Meals", text: "A wholesome traditional meal served on a banana leaf with 12 delicious items." },
            { id: "kdp-dosa-01", img: getAssetUrl("/dosaSecond.png"), title: "Special Dosa", desc: "Crispy & Golden", price: "₹ 140", numericPrice: 140, category: "Signature Dosas", text: "Our signature crispy dosa stuffed with spicy potato masala and served with 3 chutneys." },
            { id: "kdp-idli-01", img: getAssetUrl("/idli.png"), title: "Soft Idli", desc: "Soft & Fluffy", price: "₹ 95", numericPrice: 95, category: "Steamed Classics & Vadas", text: "Melt-in-mouth steamed rice cakes served hot with sambar and fresh coconut chutney." },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ 
                position: 'relative',
                background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.85) 0%, rgba(11, 14, 22, 0.95) 100%)', 
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(214, 182, 111, 0.25)',
                borderRadius: '24px',
                padding: '0 30px 40px',
                marginTop: '60px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 20px rgba(214, 182, 111, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%'
              }}
            >
              {/* Image bursting out */}
              <div style={{ 
                width: '180px', height: '180px', 
                borderRadius: '50%', 
                backgroundColor: '#0F131A', 
                marginTop: '-60px',
                marginBottom: '25px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                position: 'relative',
                boxShadow: '0 15px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(214, 182, 111, 0.15)',
                border: '4px solid rgba(214, 182, 111, 0.3)'
              }}>
                <motion.img 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  src={item.img} 
                  alt={item.title} 
                  style={{width: '125%', height: '125%', objectFit: 'contain', filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.6))', position: 'absolute' }} 
                />
              </div>
              
              <div style={{ color: 'var(--color-tiger-gold)', fontFamily: "'Antonio', sans-serif", fontSize: '26px', fontWeight: '700', marginBottom: '15px', letterSpacing: '0.05em' }}>
                {item.price}
              </div>
              
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', color: '#FFFFFF', marginBottom: '10px', fontWeight: '600' }}>
                {item.title}
              </h3>
              
              <p style={{ fontFamily: "system-ui, sans-serif", color: 'var(--color-tiger-gold)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: '600', marginBottom: '16px' }}>
                {item.desc}
              </p>
              
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#A0B3A6', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
                {item.text}
              </p>
              
              <button 
                onClick={() => {
                  addToCart({
                    id: item.id,
                    name: item.title,
                    price: item.numericPrice,
                    category: item.category,
                    isVeg: true,
                    description: item.text,
                    image: item.img
                  });
                  setIsCartOpen(true);
                }}
                style={{ 
                  marginTop: 'auto',
                  backgroundColor: 'transparent',
                  border: '1px solid #FFFFFF',
                  color: '#FFFFFF',
                  borderRadius: '30px',
                  padding: '12px 28px',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#062319'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}
              >
                Add to Order +
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* KADAPPA CAFE EXPANSION & SYNTHETIC USER RESEARCH SECTION      */}
      {/* ============================================================== */}
      <section style={{ 
        padding: '100px 5%', 
        backgroundColor: '#062319', 
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        position: 'relative',
        zIndex: 5
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 18px', 
              borderRadius: '9999px', 
              backgroundColor: 'rgba(14, 61, 46, 0.7)', 
              border: '1px solid #34D399',
              color: '#34D399',
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              <span>🔬 REGALUX AI INTELLIGENCE LAB</span>
            </div>
            
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 'clamp(36px, 5vw, 60px)', 
              color: '#FFFFFF', 
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Validating Kadappa Cafe’s <span style={{ color: '#34D399', fontStyle: 'italic' }}>Smart Food Delivery</span>
            </h2>
            
            <p style={{ 
              fontFamily: "'Inter', sans-serif", 
              color: '#E6F4EA', 
              fontSize: '16px', 
              maxWidth: '680px', 
              margin: '0 auto', 
              lineHeight: '1.6' 
            }}>
              Simulate research with AI-generated customer personas across working professionals, corporate teams, and students before investing in full logistics deployment.
            </p>
          </div>

          {/* 5 Research Pillars Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px', 
            marginBottom: '50px' 
          }}>
            {[
              { num: '01', title: '30-Min Hot Dosa SLA', desc: 'Testing if corporate workers prioritize arrival predictability over extreme speed.' },
              { num: '02', title: 'Healthy Millet & Pure Veg', desc: 'Evaluating demand for dietician-certified low-glycemic breakfast options.' },
              { num: '03', title: 'Unlimited Breakfast Pass', desc: 'Measuring adoption intent for ₹199/mo subscription with zero delivery fees.' },
              { num: '04', title: 'Live Kitchen GPS Tracking', desc: 'Sub-meter tracking eliminating phone calls while working in meetings.' },
              { num: '05', title: '₹49–₹99 Delivery Fee', desc: 'Measuring price elasticity across budget employees vs corporate executives.' }
            ].map((pillar, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: 'rgba(14, 61, 46, 0.85)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ 
                  fontFamily: "'Antonio', sans-serif", 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#34D399', 
                  display: 'block', 
                  marginBottom: '8px' 
                }}>
                  HYPOTHESIS {pillar.num}
                </span>
                <h3 style={{ 
                  fontFamily: "'Playfair Display', serif", 
                  fontSize: '18px', 
                  color: '#FFFFFF', 
                  fontWeight: '600', 
                  marginBottom: '8px' 
                }}>
                  {pillar.title}
                </h3>
                <p style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontSize: '13px', 
                  color: '#E6F4EA', 
                  lineHeight: '1.6' 
                }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action Callout Box */}
          <div style={{ 
            backgroundColor: '#0A3324', 
            border: '1px solid rgba(255, 255, 255, 0.25)', 
            borderRadius: '20px', 
            padding: '36px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ maxWidth: '640px' }}>
              <span style={{ 
                color: '#34D399', 
                fontSize: '11px', 
                fontWeight: '700', 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase' 
              }}>
                RESEARCHER INTELLIGENCE PORTAL
              </span>
              <h3 style={{ 
                fontFamily: "'Cinzel', serif", 
                fontSize: '24px', 
                color: '#FFFFFF', 
                fontWeight: '700', 
                marginTop: '6px',
                marginBottom: '8px' 
              }}>
                Generate Personas & Simulate Research for Kadappa Cafe
              </h3>
              <p style={{ 
                fontFamily: "'Inter', sans-serif", 
                color: '#E6F4EA', 
                fontSize: '13px', 
                lineHeight: '1.6' 
              }}>
                Access the full intelligence studio to synthesize custom customer archetypes based on your exact budget, routine, and dietary inputs.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button 
                onClick={openResearcherModal}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF', 
                  color: '#062319', 
                  borderRadius: '30px', 
                  padding: '12px 24px', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  letterSpacing: '0.08em', 
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.25)'
                }}
              >
                <span>Synthesize Personas</span>
                <span>→</span>
              </button>

              <button 
                onClick={openResearcherModal}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#10B981', 
                  border: '1px solid #34D399',
                  color: '#FFFFFF', 
                  borderRadius: '30px', 
                  padding: '12px 24px', 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  letterSpacing: '0.08em', 
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                <span>Open Research Studio</span>
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Home;

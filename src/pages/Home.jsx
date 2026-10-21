import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { getAssetUrl } from '../utils/assets';
import FoodAdModal from '../components/FoodAdModal';

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
  const [is3DAdOpen, setIs3DAdOpen] = useState(false);

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
  const dosaX = useTransform(scrollYProgress, [0, 0.45, 1], ["0%", "-108%", "-108%"]);
  const dosaY = useTransform(scrollYProgress, [0, 0.45, 1], ["0%", "0%", "0%"]);
  const dosaScale = useTransform(scrollYProgress, [0, 0.45, 1], [1, 0.88, 0.88]);
  const dosaRotate = useTransform(scrollYProgress, [0, 0.45, 1], [0, 0, 0]);

  return (
    <>
      <div className="watermark-bg"></div>
      
      {/* Scroll Animation Wrapper */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        
        {/* Sticky Dosa Desktop Animation Track (strictly constrained within the 2-column grid) */}
        <div className="hidden md:block pointer-events-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
          <div 
            style={{ 
              position: 'sticky', 
              top: '12vh', 
              height: '600px', 
              maxWidth: '1440px', 
              margin: '0 auto', 
              paddingLeft: '5%', 
              paddingRight: '5%',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '2.5rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column in Sticky Track: Empty during Hero; receives Dosa when scrolling into Section 2 */}
            <div />

            {/* Right Column in Sticky Track: Showcases Dosa in Hero */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <motion.div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  x: dosaX,
                  y: dosaY,
                  scale: dosaScale,
                  rotate: dosaRotate
                }}
              >
                <img 
                  src={getAssetUrl('/dosa.png')} 
                  alt="Kadappa Cafe Dosa"
                  style={{ 
                    width: '100%', 
                    maxWidth: '520px', 
                    height: 'auto', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.85)) drop-shadow(0 0 35px rgba(52, 211, 153, 0.15))',
                  }} 
                />
              </motion.div>
            </div>
          </div>
        </div>

        <section className="hero-poster grid grid-cols-1 md:grid-cols-2 items-center pt-[100px] md:pt-[125px] pb-[40px] md:pb-[60px] px-[5%] max-w-[1440px] mx-auto gap-8 md:gap-10 min-h-[auto] md:min-h-[88vh]">
          
          {/* Left Side: Elegant Typography */}
          <div className="z-10 w-full max-w-[490px]">
            {/* Mobile Hero Dosa Image */}
            <div className="block md:hidden w-full my-6 flex justify-center">
              <img 
                src={getAssetUrl('/dosa.png')} 
                alt="Kadappa Cafe Dosa"
                className="w-full max-w-[320px] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />
            </div>
            
            {/* Eyebrow & Live Showcase Badge */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
              <div className="text-eyebrow" style={{ color: '#A0B3A6', letterSpacing: '0.2em', fontSize: '12px', fontWeight: '600' }}>
                AUTHENTIC SOUTH INDIAN FLAVOURS
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', backgroundColor: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.35)', fontSize: '10px', color: '#34D399', fontFamily: 'monospace', fontWeight: '600' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                <span>DYNAMIC SHOWCASE</span>
              </div>
            </div>
            
            {/* Dynamic Animated Heading */}
            <h1 
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: 'clamp(36px, 4.2vw, 62px)', 
                lineHeight: '1.14', 
                color: '#F4F4F4', 
                marginBottom: '20px', 
                fontWeight: '600',
                letterSpacing: '-0.02em',
                minHeight: '2.4em'
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <span style={{ display: 'block' }}>Traditional Taste,</span>
              <span style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
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
                    width: '3px',
                    height: '0.82em',
                    backgroundColor: '#34D399',
                    marginLeft: '6px',
                    verticalAlign: '-0.03em',
                    boxShadow: '0 0 10px #34D399',
                    borderRadius: '2px'
                  }}
                  className="animate-pulse"
                />
              </span>
            </h1>

            {/* Interactive Dynamic Tagline Selector Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '22px', maxWidth: '460px' }}>
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
                      padding: '5px 13px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontFamily: 'system-ui, sans-serif',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: isActive ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#34D399' : 'rgba(255, 255, 255, 0.7)',
                      border: isActive ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isActive ? '0 0 12px rgba(52, 211, 153, 0.25)' : 'none'
                    }}
                  >
                    <span 
                      style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: isActive ? '#34D399' : 'rgba(255, 255, 255, 0.35)',
                        display: 'inline-block',
                        boxShadow: isActive ? '0 0 6px #34D399' : 'none'
                      }} 
                    />
                    <span>{item.badge}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Dynamic Description matching active tagline */}
            <div style={{ minHeight: '62px', marginBottom: '26px', maxWidth: '480px' }}>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={taglineIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontFamily: "system-ui, sans-serif", color: '#A0B3A6', fontSize: '15px', lineHeight: '1.65', margin: 0 }}
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

          {/* Right Side: Empty placeholder for sticky Dosa on Desktop */}
          <div className="hidden md:block" style={{ minHeight: '550px' }}></div>
        </section>

        <div className="poster-section" style={{paddingTop: '0', paddingBottom: '0'}}>
          <div className="dotted-divider"></div>
        </div>

        <section className="poster-section" style={{ padding: '60px 5%', maxWidth: '1440px', margin: '0 auto', minHeight: 'auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            
            {/* Left Side: Empty placeholder for sticky Dosa on Desktop, clean image on mobile */}
            <div className="hidden md:block" style={{ minHeight: '520px' }}></div>
            <div className="block md:hidden w-full flex justify-center mb-4">
              <img 
                src={getAssetUrl('/dosaSecond.png')} 
                alt="Kadappa Dosa Special"
                className="w-full max-w-[320px] h-auto rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Right Side: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-full max-w-[560px]"
              style={{ paddingLeft: '10px' }}
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

      {/* 6-8s 360° Photorealistic 3D Food Advertisement Modal */}
      <FoodAdModal isOpen={is3DAdOpen} onClose={() => setIs3DAdOpen(false)} />
    </>
  );
};

export default Home;

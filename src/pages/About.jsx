import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Heart, Leaf } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

const About = () => {
  return (
    <>
      <div className="watermark-bg"></div>
      
      {/* Hero Section with Warm Cafe Interior Background */}
      <section 
        style={{ 
          position: 'relative',
          paddingTop: '160px', 
          paddingBottom: '110px', 
          textAlign: 'center', 
          paddingLeft: '5%', 
          paddingRight: '5%',
          backgroundImage: `url(${getAssetUrl('/about-bg.jpg')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden'
        }}
      >
        {/* Warm atmospheric vignette overlay for text legibility and smooth bottom transition */}
        <div 
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at center, rgba(4, 26, 19, 0.55) 0%, rgba(4, 26, 19, 0.8) 65%, rgba(4, 26, 19, 0.95) 100%),
              linear-gradient(to bottom, rgba(4, 26, 19, 0.4) 0%, transparent 25%, rgba(6, 35, 25, 0.75) 75%, #062319 100%)
            `,
            pointerEvents: 'none'
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="text-eyebrow" style={{ color: '#FFD166', letterSpacing: '0.25em', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
            OUR JOURNEY
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#FFD166', margin: '0 auto 22px', borderRadius: '1px' }}></div>
          <h1 className="text-display" style={{ fontSize: 'clamp(46px, 8.5vw, 105px)', lineHeight: '1.08', color: '#FFFFFF', marginBottom: '26px', fontWeight: '800', letterSpacing: '0.02em', textShadow: '0 4px 25px rgba(0,0,0,0.85)' }}>
            THE KADAPPA STORY
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: '18px', color: '#E0E7E2', maxWidth: '720px', margin: '0 auto', lineHeight: '1.7', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            A culinary expedition into the heart of South India, blending authentic traditions with a modern dining experience. We believe in serving more than just food; we serve memories.
          </p>
        </motion.div>
      </section>

      {/* Story Content Section */}
      <section style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          
          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-display" style={{ fontSize: 'clamp(32px, 4vw, 55px)', color: '#FFF', marginBottom: '24px', whiteSpace: 'nowrap', lineHeight: '1.1' }}>
              ROOTED IN <span style={{ color: 'var(--color-tiger-gold)' }}>TRADITION</span>
            </h2>
            <p style={{ fontFamily: "system-ui, sans-serif", color: '#E0E0E0', fontSize: '16px', lineHeight: '1.8', marginBottom: '20px' }}>
              Kadappa Café was born from a deep love for the rich, diverse flavors of South India. Established in 2026, our mission has always been to bring the warmth of traditional home-cooked meals to your table.
            </p>
            <p style={{ fontFamily: "system-ui, sans-serif", color: '#E0E0E0', fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
              Every spice is carefully selected, every batter fermented to perfection, and every filter coffee brewed to evoke the essence of an early morning in Chennai. We don't just cook; we craft experiences that linger on your palate.
            </p>
            
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ borderLeft: '2px solid var(--color-tiger-gold)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text-display" style={{ fontSize: '40px', color: 'var(--color-tiger-gold)', lineHeight: '1', marginBottom: '4px' }}>15+</div>
                <div style={{ fontSize: '12px', color: '#A0B3A6', letterSpacing: '0.1em', fontWeight: '500' }}>SIGNATURE DISHES</div>
              </div>
              <div style={{ borderLeft: '2px solid var(--color-tiger-gold)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text-display" style={{ fontSize: '40px', color: 'var(--color-tiger-gold)', lineHeight: '1', marginBottom: '4px' }}>100%</div>
                <div style={{ fontSize: '12px', color: '#A0B3A6', letterSpacing: '0.1em', fontWeight: '500' }}>FRESH INGREDIENTS</div>
              </div>
            </div>
          </motion.div>

          {/* Image Side (Glassmorphism Frame) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ position: 'relative' }}
          >
            <div style={{ 
              backgroundColor: 'rgba(10, 41, 17, 0.4)', 
              backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(255, 193, 7, 0.2)', 
              borderRadius: '24px', 
              padding: '20px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800" 
                alt="South Indian Spices" 
                style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px' }}
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '100px 5%', backgroundColor: 'rgba(5, 20, 8, 0.5)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-display" style={{ fontSize: '48px', color: '#FFF' }}>OUR CORE <span style={{ color: 'var(--color-tiger-gold)' }}>VALUES</span></h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { icon: <Leaf size={36} strokeWidth={1.5} />, title: "FRESH INGREDIENTS", desc: "We source the finest, freshest ingredients daily to ensure every bite is packed with pure, unadulterated flavor." },
              { icon: <Heart size={36} strokeWidth={1.5} />, title: "MADE WITH LOVE", desc: "Our recipes are passed down through generations, cooked slowly, and served with the warmth of a loving home." },
              { icon: <Coffee size={36} strokeWidth={1.5} />, title: "AUTHENTIC TASTE", desc: "No compromises. From our filter coffee to our idli batter, we stick strictly to traditional South Indian methods." }
            ].map((val, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -15, 
                  borderColor: 'rgba(255, 193, 7, 0.4)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
                style={{ 
                  backgroundColor: 'rgba(10, 41, 17, 0.6)', 
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '50px 30px',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  backgroundColor: 'rgba(255, 193, 7, 0.08)', 
                  border: '1px solid rgba(255, 193, 7, 0.2)',
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  marginBottom: '24px', 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'var(--color-tiger-gold)',
                  boxShadow: '0 0 20px rgba(255, 193, 7, 0.1)'
                }}>
                  {val.icon}
                </div>
                <h3 className="text-display" style={{ fontSize: '26px', color: '#FFF', marginBottom: '16px', letterSpacing: '0.05em' }}>{val.title}</h3>
                <p style={{ fontFamily: "system-ui, sans-serif", color: '#A0B3A6', fontSize: '15px', lineHeight: '1.7' }}>{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

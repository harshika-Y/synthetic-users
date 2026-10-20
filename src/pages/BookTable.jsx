import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, User, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

const BookTable = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <>
      <div className="watermark-bg"></div>
      
      {/* 
        Robust Split-Screen Layout 
        Ensures the image is flush left without any complex calc() that breaks object-fit. 
      */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 2,
        paddingTop: '80px' // for navbar
      }}>
        
        {/* LEFT SIDE: Seamless Image Container */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 80 }} // Moved a bit left from 150
          transition={{ duration: 0.8 }}
          style={{ 
            flex: '1 1 45%', 
            minWidth: '350px', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}
        >
          {/* Seamless Image without frame/shadows */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <img 
              src={getAssetUrl('/kathakali.png')} 
              alt="Kathakali Art" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain', 
                display: 'block' 
              }} 
            />

            {/* Text Below the Character */}
            <div style={{ 
              width: '100%',
              padding: '20px 0', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              textAlign: 'center',
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--color-tiger-gold)', 
                fontSize: '12px', 
                letterSpacing: '0.25em', 
                fontWeight: '700' 
              }}>
                <Sparkles size={14} />
                <span>EXPERIENCE CULTURE</span>
              </div>
              <div className="text-display" style={{ 
                fontSize: '32px', 
                color: '#FFF', 
                lineHeight: '1.2' 
              }}>
                AUTHENTIC SOUTH INDIAN VIBE
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Booking Form */}
        <div style={{ 
          flex: '1 1 55%', 
          minWidth: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 5%'
        }}>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <div style={{ marginBottom: '32px' }}>
              <div className="text-eyebrow" style={{ color: '#A0B3A6', letterSpacing: '0.2em', fontSize: '13px', marginBottom: '12px' }}>
                RESERVE YOUR SEAT
              </div>
              <h1 style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: 'clamp(36px, 4.5vw, 56px)', 
                lineHeight: '1.1', 
                color: '#F4F4F4', 
                fontWeight: '600' 
              }}>
                Book a <span style={{ color: 'var(--color-tiger-gold)', fontStyle: 'italic' }}>Table</span>
              </h1>
            </div>

            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  backgroundColor: 'rgba(255, 193, 7, 0.04)', 
                  border: '1px solid rgba(255, 193, 7, 0.2)', 
                  padding: '50px 40px', 
                  borderRadius: '20px', 
                  textAlign: 'center' 
                }}
              >
                <CheckCircle size={52} color="var(--color-tiger-gold)" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#FFF', marginBottom: '16px' }}>
                  Reservation Confirmed
                </h2>
                <p style={{ color: '#A0B3A6', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                  Your table at Kadappa Café is booked. We look forward to serving you authentic South Indian flavours!
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  style={{ 
                    backgroundColor: 'transparent', 
                    border: '1px solid var(--color-tiger-gold)', 
                    color: 'var(--color-tiger-gold)', 
                    padding: '12px 28px', 
                    borderRadius: '30px', 
                    fontSize: '13px', 
                    letterSpacing: '0.1em', 
                    fontWeight: '600', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s' 
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-tiger-gold)'; e.currentTarget.style.color = '#000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-tiger-gold)'; }}
                >
                  BOOK ANOTHER
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#FFF', fontSize: '11px', letterSpacing: '0.15em', fontWeight: '600' }}>FULL NAME</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-tiger-gold)' }} />
                      <input 
                        required 
                        type="text" 
                        placeholder="John Doe" 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '14px 14px 14px 45px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.15)', 
                          borderRadius: '10px', 
                          color: '#FFF', 
                          fontSize: '15px', 
                          outline: 'none', 
                          transition: 'border 0.3s' 
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-tiger-gold)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#FFF', fontSize: '11px', letterSpacing: '0.15em', fontWeight: '600' }}>PHONE NUMBER</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-tiger-gold)' }} />
                      <input 
                        required 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '14px 14px 14px 45px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.15)', 
                          borderRadius: '10px', 
                          color: '#FFF', 
                          fontSize: '15px', 
                          outline: 'none', 
                          transition: 'border 0.3s' 
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-tiger-gold)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#FFF', fontSize: '11px', letterSpacing: '0.15em', fontWeight: '600' }}>DATE</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-tiger-gold)' }} />
                      <input 
                        required 
                        type="date" 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '14px 14px 14px 45px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.15)', 
                          borderRadius: '10px', 
                          color: '#FFF', 
                          fontSize: '15px', 
                          outline: 'none', 
                          transition: 'border 0.3s', 
                          colorScheme: 'dark' 
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-tiger-gold)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#FFF', fontSize: '11px', letterSpacing: '0.15em', fontWeight: '600' }}>TIME</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-tiger-gold)' }} />
                      <input 
                        required 
                        type="time" 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '14px 14px 14px 45px', 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.15)', 
                          borderRadius: '10px', 
                          color: '#FFF', 
                          fontSize: '15px', 
                          outline: 'none', 
                          transition: 'border 0.3s', 
                          colorScheme: 'dark' 
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-tiger-gold)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: '#FFF', fontSize: '11px', letterSpacing: '0.15em', fontWeight: '600' }}>GUESTS</label>
                  <div style={{ position: 'relative' }}>
                    <Users size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-tiger-gold)' }} />
                    <select 
                      required 
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '14px 14px 14px 45px', 
                        backgroundColor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.15)', 
                        borderRadius: '10px', 
                        color: '#FFF', 
                        fontSize: '15px', 
                        outline: 'none', 
                        appearance: 'none', 
                        transition: 'border 0.3s' 
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-tiger-gold)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    >
                      <option value="" disabled selected style={{ backgroundColor: '#0a180f' }}>Select number of guests</option>
                      <option value="1" style={{ backgroundColor: '#0a180f' }}>1 Person</option>
                      <option value="2" style={{ backgroundColor: '#0a180f' }}>2 People</option>
                      <option value="3" style={{ backgroundColor: '#0a180f' }}>3 People</option>
                      <option value="4" style={{ backgroundColor: '#0a180f' }}>4 People</option>
                      <option value="5" style={{ backgroundColor: '#0a180f' }}>5+ People</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      fontSize: '14px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '10px', 
                      fontWeight: '700', 
                      letterSpacing: '0.15em' 
                    }}
                  >
                    CONFIRM RESERVATION
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BookTable;

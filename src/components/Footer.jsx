import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const GOOGLE_MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=Kadappa+Cafe,+Plot+1079%2F1110,+above+Lenskart,+Shampur,+Bhubaneswar,+Nuagan,+Odisha+751003";

  const handleGetDirections = (e) => {
    e.preventDefault();
    const destinationQuery = encodeURIComponent(
      "Kadappa Cafe, First Floor, Plot 1079/1110, above Lenskart, near HDFC Bank, Mouza, Shampur, Bhubaneswar, Nuagan, Odisha 751003"
    );

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destinationQuery}&travelmode=driving`,
            '_blank',
            'noopener,noreferrer'
          );
        },
        (err) => {
          setIsLocating(false);
          window.open(GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer');
        },
        { timeout: 6000 }
      );
    } else {
      window.open(GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email)) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    setNewsletterStatus('loading');
    setTimeout(() => {
      try {
        const existing = JSON.parse(localStorage.getItem('kadappa_newsletter_subscribers') || '[]');
        if (!existing.includes(email)) {
          existing.push(email);
          localStorage.setItem('kadappa_newsletter_subscribers', JSON.stringify(existing));
        }
      } catch (err) {}
      setNewsletterStatus('success');
      setNewsletterMsg('🎉 You\'re subscribed! Exclusive offer code KADAPPA100 is now active.');
      setNewsletterEmail('');
    }, 600);
  };

  return (
    <footer style={{ 
      position: 'relative',
      backgroundColor: 'var(--color-charred-clove)', 
      backgroundImage: 'url(/footer-backgound.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '100px 5% 40px', 
      marginTop: '80px',
      color: '#A0B3A6'
    }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '80px', maxWidth: '1400px', margin: '0 auto', alignItems: 'flex-start' }}>
        
        {/* Left: Connect & Newsletter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', marginTop: '20px' }}>
          <h3 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A0B3A6', marginBottom: '12px', fontWeight: '500' }}>CONNECT WITH US</h3>
          <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-tiger-gold)', marginBottom: '30px' }}></div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            <a href="#" style={{color: 'var(--color-tiger-gold)'}}>
              <div style={{width: '40px', height: '40px', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'}} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-tiger-gold)'; e.currentTarget.style.backgroundColor = 'rgba(255,193,7,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
            </a>
            <a href="#" style={{color: 'var(--color-tiger-gold)'}}>
              <div style={{width: '40px', height: '40px', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'}} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-tiger-gold)'; e.currentTarget.style.backgroundColor = 'rgba(255,193,7,0.1)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </div>
            </a>
            <a href="https://www.instagram.com/kadappacafe/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--color-tiger-gold)'}}>
              <div style={{width: '40px', height: '40px', border: '1px solid var(--color-tiger-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', backgroundColor: 'rgba(255,193,7,0.1)'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </a>
          </div>

          <h3 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A0B3A6', marginBottom: '12px', fontWeight: '500' }}>STAY UPDATED</h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', maxWidth: '280px', color: 'rgba(160, 179, 166, 0.7)' }}>
            Join our newsletter for exclusive offers, secret recipes, and new menu drops.
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
            <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus === 'error') setNewsletterStatus('idle');
                }}
                placeholder="Enter your email address" 
                style={{ 
                  width: '100%', 
                  padding: '12px 45px 12px 16px', 
                  backgroundColor: 'rgba(0,0,0,0.3)', 
                  border: newsletterStatus === 'error' ? '1px solid #F87171' : '1px solid rgba(255,255,255,0.15)', 
                  borderRadius: '30px', 
                  color: '#FFF', 
                  fontSize: '13px', 
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }} 
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading'}
                title="Subscribe to newsletter"
                style={{ 
                  position: 'absolute', 
                  right: '4px', 
                  top: '4px', 
                  bottom: '4px', 
                  width: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--color-tiger-gold)', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#000', 
                  cursor: newsletterStatus === 'loading' ? 'wait' : 'pointer', 
                  transition: 'transform 0.2s' 
                }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'} 
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {newsletterStatus === 'loading' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </div>

            {newsletterStatus === 'success' && (
              <div style={{ 
                marginTop: '10px', 
                padding: '8px 12px', 
                backgroundColor: 'rgba(52, 211, 153, 0.15)', 
                border: '1px solid #34D399', 
                borderRadius: '12px', 
                color: '#34D399', 
                fontSize: '11px', 
                lineHeight: '1.4', 
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                <span>{newsletterMsg}</span>
              </div>
            )}

            {newsletterStatus === 'error' && (
              <div style={{ 
                marginTop: '8px', 
                color: '#F87171', 
                fontSize: '11px', 
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{newsletterMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Center: Logo & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="Kadappa Cafe" style={{ height: '140px', width: 'auto', marginBottom: '25px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'var(--color-tiger-gold)'}}>
              <path d="M12 2L15 8C15 8 18 8 18 12C18 16 12 20 12 20C12 20 6 16 6 12C6 8 9 8 9 8L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A0B3A6', textTransform: 'uppercase', marginBottom: '20px' }}>AUTHENTIC SOUTH INDIAN FLAVOURS</p>
          
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(160, 179, 166, 0.8)', textAlign: 'center', maxWidth: '350px', marginBottom: '30px', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
            "A culinary journey through the heart of South India. Tradition served fresh every single day."
          </p>

          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', letterSpacing: '0.15em' }}>
            <a href="/" style={{ color: '#A0B3A6', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tiger-gold)'} onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}>HOME</a>
            <span style={{color: 'rgba(255,255,255,0.2)'}}>|</span>
            <a href="/about" style={{ color: '#A0B3A6', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tiger-gold)'} onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}>ABOUT</a>
            <span style={{color: 'rgba(255,255,255,0.2)'}}>|</span>
            <a href="/menu" style={{ color: '#A0B3A6', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tiger-gold)'} onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}>MENU</a>
            <span style={{color: 'rgba(255,255,255,0.2)'}}>|</span>
            <a href="/book" style={{ color: 'var(--color-tiger-gold)', textDecoration: 'none' }}>RESERVE</a>
          </div>
        </div>

        {/* Right: Address & Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px' }}>
          <h3 style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#A0B3A6', marginBottom: '12px', fontWeight: '500' }}>VISIT US</h3>
          <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-tiger-gold)', marginBottom: '30px' }}></div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <a 
              href={GOOGLE_MAPS_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Open location on Google Maps"
              style={{color: 'var(--color-tiger-gold)', width: '35px', height: '35px', minWidth: '35px', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,193,7,0.05)', transition: 'all 0.2s'}}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,193,7,0.15)'; e.currentTarget.style.borderColor = 'var(--color-tiger-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,193,7,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,193,7,0.3)'; }}
            >
              <MapPin size={16} />
            </a>
            <a 
              href={GOOGLE_MAPS_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Click to view route on Google Maps"
              style={{ color: '#A0B3A6', lineHeight: '1.7', maxWidth: '300px', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}
            >
              First Floor, Plot 1079/1110,<br/>
              above Lenskart, near HDFC Bank,<br/>
              Mouza, Shampur, Bhubaneswar,<br/>
              Nuagan, Odisha 751003
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px', paddingLeft: '51px' }}>
            <a href="tel:+919876543210" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A0B3A6', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tiger-gold)'} onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}>
              <Phone size={14} color="var(--color-tiger-gold)" /> +91 98765 43210
            </a>
            <a href="mailto:hello@kadappacafe.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A0B3A6', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-tiger-gold)'} onMouseLeave={e => e.currentTarget.style.color = '#A0B3A6'}>
              <Mail size={14} color="var(--color-tiger-gold)" /> hello@kadappacafe.com
            </a>
          </div>

          <a 
            href={GOOGLE_MAPS_URL} 
            onClick={handleGetDirections}
            target="_blank"
            rel="noopener noreferrer"
            title="Get instant GPS directions to Kadappa Café"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#000', backgroundColor: 'var(--color-tiger-gold)', textDecoration: 'none', borderRadius: '30px', padding: '12px 28px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255,193,7,0.3)', cursor: 'pointer' }} 
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,193,7,0.4)' }} 
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,193,7,0.3)' }}
          >
            {isLocating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> GETTING LOCATION...
              </>
            ) : (
              <>
                <Navigation size={14} /> GET DIRECTIONS
              </>
            )}
          </a>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1400px', 
        margin: '80px auto 0', 
        padding: '20px 40px',
        backgroundColor: 'rgba(5, 20, 8, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 193, 7, 0.15)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        fontSize: '12px', 
        color: '#A0B3A6',
        position: 'relative',
        zIndex: 10
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{color: 'var(--color-tiger-gold)'}}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ letterSpacing: '0.15em', marginBottom: '4px', fontSize: '11px' }}>OPEN DAILY</div>
            <div style={{ letterSpacing: '0.05em' }}>7:00 AM - 10:00 PM</div>
          </div>
        </div>

        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.15em' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'var(--color-tiger-gold)'}}>
            <path d="M12 2L15 8C15 8 18 8 18 12C18 16 12 20 12 20C12 20 6 16 6 12C6 8 9 8 9 8L12 2Z" fill="currentColor"/>
          </svg>
          &copy; 2026 KADAPPA CAFE. ALL RIGHTS RESERVED.
        </div>

        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

        <div style={{ letterSpacing: '0.15em', color: '#A0B3A6' }}>
          DOSA &nbsp;&nbsp;|&nbsp;&nbsp; IDLI &nbsp;&nbsp;|&nbsp;&nbsp; FILTER COFFEE
        </div>

      </div>
    </footer>
  );
};

export default Footer;

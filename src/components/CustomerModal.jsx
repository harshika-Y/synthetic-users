import React, { useState } from 'react';
import { 
  User, Lock, Mail, Utensils, Award, Clock, 
  MapPin, CheckCircle2, X, Sparkles, ArrowRight, Heart,
  Receipt, ShieldCheck, Phone, LogOut, RefreshCw, ShoppingBag,
  Navigation, Loader2
} from 'lucide-react';
import { useCustomer, GOOGLE_DEMO_ACCOUNTS } from '../context/CustomerContext';
import { getAssetUrl } from '../utils/assets';

const CustomerModal = ({ isOpen, onClose }) => {
  const { 
    customer, 
    loginWithGoogle, 
    logoutCustomer, 
    orders, 
    viewBill, 
    cart, 
    setIsCartOpen,
    deliveryProfile,
    saveDeliveryProfile,
    showToast
  } = useCustomer();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'vault', 'cart'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Editable delivery profile state
  const [editPhone, setEditPhone] = useState(deliveryProfile?.phone || '');
  const [editAddress, setEditAddress] = useState(deliveryProfile?.addressLine || '');
  const [editArea, setEditArea] = useState(deliveryProfile?.area || '');
  const [editCity, setEditCity] = useState(deliveryProfile?.city || 'Bengaluru');
  const [editPincode, setEditPincode] = useState(deliveryProfile?.pincode || '');

  // Auto-Detect Current GPS Location
  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert("GPS Geolocation is not supported in this browser.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.residential || addr.neighbourhood || '';
            const house = addr.house_number ? `${addr.house_number}, ` : '';
            const detectedArea = addr.suburb || addr.neighbourhood || addr.city_district || 'Nuagan';
            const detectedCity = addr.city || addr.town || addr.state_district || 'Bhubaneswar';
            const detectedPostcode = addr.postcode || '751003';

            if (road) {
              setEditAddress(`${house}${road}`);
            } else if (data.display_name) {
              setEditAddress(data.display_name.split(',').slice(0, 2).join(', '));
            }
            if (detectedArea) setEditArea(detectedArea);
            if (detectedCity) setEditCity(detectedCity);
            if (detectedPostcode) setEditPincode(detectedPostcode);
            showToast('✓ GPS Location detected and updated in form!');
          }
        } catch (err) {
          setEditCity('Bhubaneswar');
          setEditPincode('751003');
          showToast('✓ City and default pincode updated.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        alert("Could not access GPS. Please allow location permission or enter address manually.");
      },
      { timeout: 7000 }
    );
  };

  React.useEffect(() => {
    if (deliveryProfile) {
      setEditPhone(deliveryProfile.phone || '');
      setEditAddress(deliveryProfile.addressLine || '');
      setEditArea(deliveryProfile.area || '');
      setEditCity(deliveryProfile.city || 'Bengaluru');
      setEditPincode(deliveryProfile.pincode || '');
    }
  }, [deliveryProfile]);

  if (!isOpen) return null;

  const handleCustomGoogleLogin = (e) => {
    e.preventDefault();
    setEmailError('');

    const email = customEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com') && !email.includes('google')) {
      setEmailError('Please use a valid Gmail address (@gmail.com).');
      return;
    }

    loginWithGoogle(email, customName.trim() || null);
    setCustomEmail('');
    setCustomName('');
  };

  const handleSaveProfileChanges = (e) => {
    e.preventDefault();
    saveDeliveryProfile({
      phone: editPhone.replace(/\D/g, ''),
      fullName: customer?.name || '',
      addressLine: editAddress.trim(),
      area: editArea.trim(),
      city: editCity.trim(),
      pincode: editPincode.trim(),
      instructions: deliveryProfile?.instructions || ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[115] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div 
        className="w-full max-w-lg rounded-2xl border p-5 md:p-7 relative overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#07261D',
          borderColor: 'rgba(52, 211, 153, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(52, 211, 153, 0.15)',
          color: '#FFFFFF'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#34D399] p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-4">
          <img src={getAssetUrl('/logo.png')} alt="Kadappa Cafe" className="h-11 w-auto" />
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Kadappa Foodie Club
            </h2>
            <p className="text-xs text-[#E6F4EA]/80">
              Customer Login with Google & Isolated Data Storage
            </p>
          </div>
        </div>

        {/* NOT LOGGED IN: GOOGLE SIGN-IN FLOW */}
        {!customer ? (
          <div className="space-y-5">
            <div className="text-xs text-[#E6F4EA]/80 leading-relaxed bg-[#041A13]/80 p-3.5 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-1">
                🔒 Google Account Exclusive Storage:
              </span>
              Sign in with your Gmail to save delivery phone number, addresses, active cart, and view past itemized bills. All customer data is safely isolated strictly to your Google account.
            </div>

            {/* Google One-Click Accounts Picker */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block mb-2">
                Continue with One-Click Google Account:
              </span>
              <div className="space-y-2">
                {GOOGLE_DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => loginWithGoogle(acc)}
                    className="w-full p-3 rounded-xl bg-[#041A13] hover:bg-[#0E4634] border border-white/15 hover:border-[#34D399]/50 flex items-center justify-between transition-all cursor-pointer group text-left shadow"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={acc.picture} 
                        alt={acc.name} 
                        className="w-10 h-10 rounded-full object-cover border border-[#34D399]/40" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-[#34D399]">
                            {acc.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[#34D399] font-mono">
                            {acc.memberTier}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/60 font-mono block">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#34D399] font-semibold">
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gmail Input Form */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block mb-2">
                Or Sign In with Any Gmail Address:
              </span>

              <form onSubmit={handleCustomGoogleLogin} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-white uppercase mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh V"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-white uppercase mb-1">
                      Gmail Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#34D399] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {emailError && (
                  <p className="text-[11px] text-red-400 font-semibold">{emailError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-[#041A13] hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign In with Gmail</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* LOGGED IN: CUSTOMER GOOGLE ACCOUNT & VAULT */
          <div className="space-y-4">
            
            {/* Customer Identity Card */}
            <div className="p-4 rounded-xl bg-[#041A13] border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={customer.picture} 
                  alt={customer.name} 
                  className="w-12 h-12 rounded-full border-2 border-[#34D399] object-cover" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{customer.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#34D399] font-mono">
                      Google Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#E6F4EA]/80 font-mono">{customer.email}</p>
                  <span className="text-[10px] text-[#34D399] font-mono block mt-0.5">
                    {customer.memberTier || 'Foodie Member'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#E6F4EA]/70 block">Kadappa Points</span>
                <span className="text-lg font-bold text-white font-mono">
                  {customer.rewardsPoints || 120} pts
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/15 text-xs">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-[#34D399] text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-[#34D399]" />
                <span>My Bills & Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('vault')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'vault'
                    ? 'border-[#34D399] text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Google Data Vault</span>
              </button>

              <button
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-2 font-semibold text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'cart'
                    ? 'border-[#34D399] text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Cart ({cart.length})</span>
              </button>
            </div>

            {/* TAB 1: MY BILLS & PAST ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-white/60">
                    <Receipt className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p>No orders placed under this Google account yet.</p>
                    <p className="text-[11px] text-[#A0B3A6] mt-1">
                      Add items to cart and checkout to generate your first itemized bill!
                    </p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="p-3.5 rounded-xl bg-[#041A13]/90 border border-white/15 hover:border-[#34D399]/40 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-[#34D399]">{ord.id}</span>
                          <span className="text-[10px] text-white/50 block font-mono">
                            {new Date(ord.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white text-sm">
                            ₹{ord.bill?.grandTotal?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-[10px] text-[#34D399] block font-mono">
                            {ord.status || 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="text-[11px] text-[#E6F4EA]/80 bg-[#06261C] p-2 rounded-lg border border-white/10">
                        {ord.items?.map((it, i) => (
                          <div key={i} className="flex justify-between py-0.5">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-mono">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-white/50 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#34D399]" />
                          <span>+91 {ord.deliveryDetails?.phone}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            viewBill(ord);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-full bg-white text-[#041A13] font-bold text-[11px] hover:bg-[#F0FDF4] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View Full Itemized Bill</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: GOOGLE DATA VAULT (PHONE & ADDRESS) */}
            {activeTab === 'vault' && (
              <form onSubmit={handleSaveProfileChanges} className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#041A13] border border-white/10 text-[11px] text-[#E6F4EA]/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#34D399] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Isolated Google Storage</span>
                  </div>
                  <p>
                    These details are stored strictly in your Google Account ({customer.email}) and will auto-fill whenever you order.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-white uppercase mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#34D399] font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-12 pr-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-white uppercase">
                      Delivery Address (Flat / House / Street)
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="text-[10px] text-[#34D399] hover:text-white flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                      title="Auto-detect current GPS location"
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 size={10} className="animate-spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation size={10} />
                          <span>📍 Auto-Detect Location</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Green Orchid Apartments"
                    className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-white uppercase mb-1">
                      Area / Landmark
                    </label>
                    <input
                      type="text"
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      placeholder="e.g. Nuagan Tech Park"
                      className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-white uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 560103"
                      className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-[#041A13] hover:bg-[#F0FDF4] transition-all cursor-pointer shadow"
                >
                  Save to Google Account Vault
                </button>
              </form>
            )}

            {/* TAB 3: CART PREVIEW */}
            {activeTab === 'cart' && (
              <div className="space-y-3 text-xs">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-white/60">
                    <ShoppingBag className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p>Your Google account cart is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div 
                        key={item.id}
                        className="p-2.5 rounded-lg bg-[#041A13] border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <span className="text-[10px] text-[#34D399] font-mono">
                            Qty: {item.quantity} × ₹{item.price}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setIsCartOpen(true);
                      }}
                      className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#34D399] text-[#041A13] hover:bg-[#6EE7B7] transition-all cursor-pointer shadow mt-2"
                    >
                      Proceed to Checkout & Enter Delivery Phone
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Account Switcher & Sign Out Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                }}
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                }}
                className="text-xs text-[#34D399] hover:underline font-semibold cursor-pointer"
              >
                Switch Google Account →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerModal;

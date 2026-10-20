import React, { useState } from 'react';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  MapPin, Phone, User, ShieldCheck, Sparkles, Tag, Check, AlertCircle, Mail,
  Navigation, Loader2
} from 'lucide-react';
import { useCustomer, GOOGLE_DEMO_ACCOUNTS } from '../context/CustomerContext';

const CartDrawer = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    subtotal, 
    totalItemsCount,
    customer,
    loginWithGoogle,
    deliveryProfile,
    saveDeliveryProfile,
    placeOrder,
    setIsCustomerModalOpen,
    showToast
  } = useCustomer();

  // Local form state for checkout
  const [phone, setPhone] = useState(deliveryProfile?.phone || '');
  const [fullName, setFullName] = useState(deliveryProfile?.fullName || customer?.name || '');
  const [addressLine, setAddressLine] = useState(deliveryProfile?.addressLine || '');
  const [area, setArea] = useState(deliveryProfile?.area || '');
  const [city, setCity] = useState(deliveryProfile?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(deliveryProfile?.pincode || '');
  const [instructions, setInstructions] = useState(deliveryProfile?.instructions || '');
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Google Pay / UPI');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Detect Current GPS Location
  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorMsg("GPS Geolocation is not supported in this browser.");
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
              setAddressLine(`${house}${road}`);
            } else if (data.display_name) {
              setAddressLine(data.display_name.split(',').slice(0, 2).join(', '));
            }
            if (detectedArea) setArea(detectedArea);
            if (detectedCity) setCity(detectedCity);
            if (detectedPostcode) setPincode(detectedPostcode);
            showToast('✓ GPS Location detected and filled!');
          }
        } catch (err) {
          setCity('Bhubaneswar');
          setPincode('751003');
          showToast('✓ City and default pincode updated.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setErrorMsg("Could not access GPS. Please allow location permission or enter address manually.");
      },
      { timeout: 7000 }
    );
  };

  // Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.toUpperCase().trim();
    if (code === 'KADAPPA100') {
      setDiscount(100);
      setCouponApplied(true);
      setErrorMsg('');
      showToast('🎉 Newsletter subscriber coupon applied! ₹100 discount added.');
    } else if (code === 'GOOGLEVIP' || code === 'KADAPPA50') {
      setDiscount(50);
      setCouponApplied(true);
      setErrorMsg('');
      showToast('Coupon applied! ₹50 discount added.');
    } else {
      setErrorMsg('Invalid coupon. Try KADAPPA100, KADAPPA50, or GOOGLEVIP');
    }
  };

  // Sync if deliveryProfile loads from Google vault
  React.useEffect(() => {
    if (deliveryProfile) {
      if (deliveryProfile.phone) setPhone(deliveryProfile.phone);
      if (deliveryProfile.fullName) setFullName(deliveryProfile.fullName);
      if (deliveryProfile.addressLine) setAddressLine(deliveryProfile.addressLine);
      if (deliveryProfile.area) setArea(deliveryProfile.area);
      if (deliveryProfile.city) setCity(deliveryProfile.city);
      if (deliveryProfile.pincode) setPincode(deliveryProfile.pincode);
      if (deliveryProfile.instructions) setInstructions(deliveryProfile.instructions);
    }
  }, [deliveryProfile]);

  if (!isCartOpen) return null;

  // Calculations
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 35;
  const packagingFee = subtotal > 0 ? 20 : 0;
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = Math.max(0, subtotal + deliveryFee + packagingFee + taxes - discount);

  // Handle Checkout submission
  const handleCheckout = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Must be logged in with Google
    if (!customer) {
      setErrorMsg('Please sign in with your Google account first to store your order details securely.');
      return;
    }

    // 2. Validate phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit contact phone number for food delivery.');
      return;
    }

    // 3. Validate address
    if (!addressLine.trim() || !area.trim() || !pincode.trim()) {
      setErrorMsg('Please fill in complete delivery address details (Flat/Street, Area, and Pincode).');
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryDetails = {
        phone: cleanPhone,
        fullName: fullName || customer.name,
        addressLine: addressLine.trim(),
        area: area.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        instructions: instructions.trim()
      };

      if (saveToAccount) {
        saveDeliveryProfile(deliveryDetails);
      }

      placeOrder({
        deliveryDetails,
        paymentMethod,
        discountAmount: discount,
        couponCode: couponApplied ? couponCode.toUpperCase() : null
      });

    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md border-l flex flex-col shadow-2xl overflow-hidden"
          style={{
            backgroundColor: '#07261D',
            borderColor: 'rgba(52, 211, 153, 0.3)',
            color: '#FFFFFF'
          }}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#041A13]/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#0E4634] text-[#34D399]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Your Food Cart
                </h2>
                <p className="text-[11px] text-[#E6F4EA]/70">
                  {totalItemsCount} dish{totalItemsCount !== 1 ? 'es' : ''} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-white/50 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Clear Cart"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {/* GOOGLE LOGIN STATUS BANNER */}
            {!customer ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#06261C] to-[#041A13] border border-amber-400/40 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Google Customer Login Required
                    </h3>
                    <p className="text-[11px] text-[#E6F4EA]/80 mt-0.5 leading-relaxed">
                      To isolate and store your cart, delivery phone, and bills only in your Google account, sign in with your Gmail.
                    </p>
                  </div>
                </div>

                {/* Instant Google One-Click Accounts */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block">
                    Quick Sign-In with Google Account:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {GOOGLE_DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => loginWithGoogle(acc)}
                        className="w-full px-3 py-2 rounded-lg bg-[#0E4634]/70 hover:bg-[#0E4634] border border-white/15 text-left flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <img src={acc.picture} alt={acc.name} className="w-5 h-5 rounded-full object-cover" />
                          <div>
                            <span className="text-xs font-bold text-white group-hover:text-[#34D399] block leading-none">
                              {acc.name}
                            </span>
                            <span className="text-[10px] text-white/60 font-mono">{acc.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#34D399] font-semibold">Select →</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full mt-2 py-2 rounded-lg bg-white text-[#041A13] font-bold text-xs uppercase tracking-wider hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#041A13]" />
                    <span>Enter Custom Gmail Address</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Signed In Google Status Banner */
              <div className="p-3.5 rounded-xl bg-[#041A13] border border-[#34D399]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={customer.picture} 
                    alt={customer.name} 
                    className="w-8 h-8 rounded-full border border-[#34D399] object-cover" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{customer.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#34D399] font-mono">
                        Google
                      </span>
                    </div>
                    <span className="text-[10px] text-[#E6F4EA]/70 font-mono block">
                      {customer.email}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-[#34D399] font-mono block">Vault Active</span>
                  <span className="text-[10px] text-white/50">Data isolated</span>
                </div>
              </div>
            )}

            {/* CART ITEMS LIST */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#0E4634] flex items-center justify-center text-[#34D399]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white">Your Cart is Empty</h3>
                <p className="text-xs text-[#E6F4EA]/70 max-w-xs mx-auto">
                  Browse our mouthwatering dosas, degree filter coffee, and royal thalis to add items to your cart!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2 rounded-full bg-[#34D399] text-[#041A13] text-xs font-bold uppercase tracking-wider hover:bg-[#6EE7B7] transition-all cursor-pointer"
                >
                  Explore Delicious Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Selected Dishes</span>
                  <span className="text-[#34D399] font-mono text-[11px]">
                    Subtotal: ₹{subtotal}
                  </span>
                </div>

                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#041A13]/90 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-emerald-500 rounded-sm shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                          <span className="text-[11px] text-[#34D399] font-mono">
                            ₹{item.price} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-[#06261C] border border-white/20 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white/10 text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="w-14 text-right text-xs font-mono font-bold text-white">
                          ₹{item.price * item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free Delivery Bar */}
                <div className="p-2.5 rounded-lg bg-[#0E4634]/60 border border-[#34D399]/30 text-xs">
                  {subtotal >= 299 ? (
                    <div className="flex items-center gap-1.5 text-[#34D399] font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Congratulations! You qualify for FREE Express Delivery.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#E6F4EA]/80 flex items-center justify-between">
                      <span>Add ₹{299 - subtotal} more for <strong>FREE Delivery</strong></span>
                      <span className="text-[#34D399] font-mono">Standard ₹35</span>
                    </div>
                  )}
                </div>

                {/* REQUIRED DELIVERY INFORMATION FORM */}
                <form onSubmit={handleCheckout} className="space-y-4 pt-3 border-t border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Delivery Details (Required)</span>
                    </span>
                    <span className="text-[10px] text-[#34D399] font-mono">
                      Stored in Google Vault
                    </span>
                  </div>

                  {/* Phone Number Input (Required) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-white uppercase mb-1">
                      Customer Contact Phone No. <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#34D399] font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-12 pr-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      Delivery executive will call this number upon arrival.
                    </span>
                  </div>

                  {/* Address Line 1 / Flat / House (Required) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-white uppercase">
                        Delivery Address (Flat / House / Building) <span className="text-red-400">*</span>
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
                            <Loader2 size={11} className="animate-spin" />
                            <span>Detecting GPS...</span>
                          </>
                        ) : (
                          <>
                            <Navigation size={11} />
                            <span>📍 Auto-Detect Location</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Green Orchid Apartments, 12th Cross"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                    />
                  </div>

                  {/* Area / Locality and Pincode */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-white uppercase mb-1">
                        Area / Landmark <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nuagan Tech Park"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white uppercase mb-1">
                        Pincode <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 560103"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] font-mono"
                      />
                    </div>
                  </div>

                  {/* City & Special Instructions */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-white uppercase mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white focus:outline-none focus:border-[#34D399]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-white uppercase mb-1">
                        Cooking / Gate Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ring bell, extra chutney"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                      />
                    </div>
                  </div>

                  {/* Save to Google Account Vault checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveToVault"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-[#041A13] border-white/20 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="saveToVault" className="text-xs text-[#E6F4EA]/80 cursor-pointer">
                      Save phone & delivery address to my Google account
                    </label>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Coupon (e.g. KADAPPA50)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#041A13] border border-white/20 text-xs text-white uppercase font-mono placeholder:normal-case placeholder-white/40"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <span className="text-[10px] text-[#34D399] font-mono mt-1 block">
                        ✓ ₹50 discount applied!
                      </span>
                    )}
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="pt-2 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-white uppercase">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['Google Pay / UPI', 'Cash on Delivery'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMethod(mode)}
                          className={`py-2 px-3 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                            paymentMethod === mode
                              ? 'bg-[#0E4634] border-[#34D399] text-white shadow-md'
                              : 'bg-[#041A13] border-white/15 text-white/70 hover:border-white/30'
                          }`}
                        >
                          <span className="block">{mode}</span>
                          <span className="text-[9px] text-[#34D399] font-mono">
                            {mode.includes('Google') ? 'Instant Simulated' : 'Pay at door'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BILL BREAKDOWN PREVIEW */}
                  <div className="p-3.5 rounded-xl bg-[#041A13]/90 border border-white/15 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block mb-1">
                      Estimated Bill Summary
                    </span>
                    <div className="flex justify-between text-white/80">
                      <span>Dishes Subtotal</span>
                      <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Delivery Fee</span>
                      <span className="font-mono">
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Packaging & Bio-box</span>
                      <span className="font-mono">₹{packagingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white/60 text-[11px]">
                      <span>GST (5%)</span>
                      <span className="font-mono">₹{taxes.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#34D399]">
                        <span>Coupon Discount</span>
                        <span className="font-mono">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/20">
                      <span>Total Bill Amount</span>
                      <span className="font-mono text-base text-[#34D399]">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-900/40 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* FINAL CHECKOUT & BILL GENERATION BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-[#041A13] hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                  >
                    <span>{customer ? 'Generate Bill of Items & Place Order' : 'Sign in with Google to Order'}</span>
                    <ArrowRight className="w-4 h-4 text-[#041A13]" />
                  </button>

                  <div className="text-center text-[10px] text-white/50 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Your bill will be automatically archived in your Google account</span>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

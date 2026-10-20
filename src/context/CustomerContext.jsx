import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext(null);

export const GOOGLE_DEMO_ACCOUNTS = [
  {
    email: 'priya.sundaram@gmail.com',
    name: 'Priya Sundaram',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    googleId: 'google_1092837482',
    memberTier: 'Gold Foodie Member',
    rewardsPoints: 480,
    defaultPhone: '9876543210',
    defaultAddress: {
      phone: '9876543210',
      fullName: 'Priya Sundaram',
      addressLine: 'Flat 402, Green Orchid Apartments, 12th Cross',
      area: 'Nuagan Tech Corridor',
      city: 'Bengaluru',
      pincode: '560103',
      instructions: 'Ring doorbell twice, leave at doorstep'
    }
  },
  {
    email: 'rahul.sharma@gmail.com',
    name: 'Rahul Sharma',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    googleId: 'google_9928172641',
    memberTier: 'Silver Member',
    rewardsPoints: 210,
    defaultPhone: '9845012345',
    defaultAddress: {
      phone: '9845012345',
      fullName: 'Rahul Sharma',
      addressLine: 'Villa #18, Silicon Palm Woods',
      area: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      pincode: '560038',
      instructions: 'Hand over to security guard if unavailable'
    }
  },
  {
    email: 'ananya.iyer@gmail.com',
    name: 'Ananya Iyer',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    googleId: 'google_7726354189',
    memberTier: 'Platinum Connoisseur',
    rewardsPoints: 850,
    defaultPhone: '9741098765',
    defaultAddress: {
      phone: '9741098765',
      fullName: 'Ananya Iyer',
      addressLine: 'Apt 10-C, Heritage Palms, Temple Road',
      area: 'Mylapore',
      city: 'Chennai',
      pincode: '600004',
      instructions: 'Please do not honk near gate'
    }
  }
];

const getVaultKey = (email) => `kadappa_google_vault_${email.toLowerCase().trim()}`;

export const CustomerProvider = ({ children }) => {
  // Current logged in customer with Google
  const [customer, setCustomer] = useState(null);
  
  // Data stored exclusively under this Google user
  const [cart, setCart] = useState([]);
  const [deliveryProfile, setDeliveryProfile] = useState({
    phone: '',
    fullName: '',
    addressLine: '',
    area: '',
    city: 'Bengaluru',
    pincode: '',
    instructions: ''
  });
  const [orders, setOrders] = useState([]);

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [activeBillOrder, setActiveBillOrder] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to show brief toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 1. Initial Load: Check if there is an active Google Customer session
  useEffect(() => {
    try {
      const savedUserJson = localStorage.getItem('kadappa_active_google_customer');
      if (savedUserJson) {
        const userObj = JSON.parse(savedUserJson);
        loadGoogleUserData(userObj);
      }
    } catch (e) {
      console.warn("Failed to parse saved customer session", e);
    }
  }, []);

  // Load vault data belonging strictly to the specified Google account
  const loadGoogleUserData = (googleUser) => {
    setCustomer(googleUser);
    const vaultKey = getVaultKey(googleUser.email);
    const vaultDataRaw = localStorage.getItem(vaultKey);

    if (vaultDataRaw) {
      try {
        const vault = JSON.parse(vaultDataRaw);
        setCart(vault.cart || []);
        if (vault.deliveryProfile && Object.keys(vault.deliveryProfile).length > 0) {
          setDeliveryProfile(vault.deliveryProfile);
        } else {
          // Fallback to default if available in demo
          setDeliveryProfile({
            phone: googleUser.defaultPhone || '',
            fullName: googleUser.name || '',
            addressLine: '',
            area: '',
            city: 'Bengaluru',
            pincode: '',
            instructions: ''
          });
        }
        setOrders(vault.orders || []);
      } catch (err) {
        console.error("Error loading user vault", err);
      }
    } else {
      // First time login for this Google account: initialize empty vault
      const initialProfile = googleUser.defaultAddress || {
        phone: googleUser.defaultPhone || '',
        fullName: googleUser.name || '',
        addressLine: '',
        area: '',
        city: 'Bengaluru',
        pincode: '',
        instructions: ''
      };

      // Seed initial sample order for rich experience if Priya
      let initialOrders = [];
      if (googleUser.email === 'priya.sundaram@gmail.com') {
        initialOrders = [
          {
            id: 'KDP-2026-8941',
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            status: 'Delivered',
            customer: {
              name: googleUser.name,
              email: googleUser.email,
              phone: '9876543210'
            },
            deliveryDetails: {
              phone: '9876543210',
              fullName: googleUser.name,
              addressLine: 'Flat 402, Green Orchid Apartments, 12th Cross',
              area: 'Nuagan Tech Corridor',
              city: 'Bengaluru',
              pincode: '560103',
              instructions: 'Ring doorbell twice'
            },
            items: [
              { id: 'kdp-dosa-01', name: 'Ghee Podi Masala Dosa', price: 140, quantity: 1, isVeg: true },
              { id: 'kdp-drink-01', name: 'Kumbakonam Degree Filter Coffee', price: 55, quantity: 2, isVeg: true }
            ],
            bill: {
              subtotal: 250,
              deliveryFee: 0,
              packagingFee: 20,
              cgst: 6.25,
              sgst: 6.25,
              totalGst: 12.5,
              discount: 0,
              grandTotal: 282.5
            },
            paymentMethod: 'UPI / Google Pay (Success)'
          }
        ];
      }

      setCart([]);
      setDeliveryProfile(initialProfile);
      setOrders(initialOrders);

      // Save initial state to this user's Google vault
      saveToVault(googleUser.email, [], initialProfile, initialOrders);
    }
  };

  // Helper to persist only in this specific Google user's storage key
  const saveToVault = (email, cartData, profileData, ordersData) => {
    if (!email) return;
    const vaultKey = getVaultKey(email);
    const payload = {
      email,
      lastUpdated: new Date().toISOString(),
      cart: cartData,
      deliveryProfile: profileData,
      orders: ordersData
    };
    localStorage.setItem(vaultKey, JSON.stringify(payload));
  };

  // Sign in with Google (either picked demo or custom Gmail)
  const loginWithGoogle = (emailOrAccount, customName = null) => {
    let googleUser;
    if (typeof emailOrAccount === 'object' && emailOrAccount.email) {
      googleUser = {
        ...emailOrAccount,
        isGoogleAuth: true
      };
    } else {
      const email = emailOrAccount.trim();
      const existingDemo = GOOGLE_DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase()
      );
      if (existingDemo) {
        googleUser = { ...existingDemo, isGoogleAuth: true };
      } else {
        const namePart = email.split('@')[0].replace(/[._]/g, ' ');
        const formattedName = customName || namePart.charAt(0).toUpperCase() + namePart.slice(1);
        googleUser = {
          email,
          name: formattedName,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=06261c,0e4634`,
          googleId: `google_${Date.now()}`,
          isGoogleAuth: true,
          memberTier: 'Registered Google Foodie',
          rewardsPoints: 50,
          defaultPhone: '',
          defaultAddress: null
        };
      }
    }

    // Persist current session
    localStorage.setItem('kadappa_active_google_customer', JSON.stringify(googleUser));
    loadGoogleUserData(googleUser);
    showToast(`Signed in with Google as ${googleUser.email}`);
    return googleUser;
  };

  // Sign out customer: clears memory state so next user cannot see their data!
  const logoutCustomer = () => {
    const prevEmail = customer?.email;
    localStorage.removeItem('kadappa_active_google_customer');
    setCustomer(null);
    setCart([]);
    setDeliveryProfile({
      phone: '',
      fullName: '',
      addressLine: '',
      area: '',
      city: 'Bengaluru',
      pincode: '',
      instructions: ''
    });
    setOrders([]);
    showToast(`Signed out of Google account (${prevEmail || ''})`);
  };

  // Add Item to Cart (tied to current Google user)
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.id === item.id);
      let updated;
      if (existing) {
        updated = prevCart.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        updated = [...prevCart, { ...item, quantity: 1 }];
      }

      // If logged in with Google, save immediately to their Google vault
      if (customer?.email) {
        saveToVault(customer.email, updated, deliveryProfile, orders);
      }
      return updated;
    });

    showToast(`Added ${item.name} to cart!`);
  };

  // Remove Item from Cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((ci) => ci.id !== itemId);
      if (customer?.email) {
        saveToVault(customer.email, updated, deliveryProfile, orders);
      }
      return updated;
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) => {
      const updated = prevCart.map((ci) =>
        ci.id === itemId ? { ...ci, quantity: newQty } : ci
      );
      if (customer?.email) {
        saveToVault(customer.email, updated, deliveryProfile, orders);
      }
      return updated;
    });
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    if (customer?.email) {
      saveToVault(customer.email, [], deliveryProfile, orders);
    }
  };

  // Save Delivery Profile (Phone & Address) exclusively to user's Google vault
  const saveDeliveryProfile = (newProfile) => {
    setDeliveryProfile(newProfile);
    if (customer?.email) {
      saveToVault(customer.email, cart, newProfile, orders);
      showToast("Delivery details saved to your Google account!");
    }
  };

  // Calculate Subtotal & Totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Place Order & Generate Itemized Bill
  const placeOrder = ({ deliveryDetails, paymentMethod = 'UPI / Google Pay', discountAmount = 0, couponCode = '' }) => {
    if (!customer) {
      throw new Error("Please sign in with your Google account to place orders.");
    }
    if (!deliveryDetails.phone || deliveryDetails.phone.trim().length < 10) {
      throw new Error("A valid 10-digit delivery phone number is required.");
    }
    if (!deliveryDetails.addressLine || !deliveryDetails.area || !deliveryDetails.pincode) {
      throw new Error("Full delivery address (street, area, and pincode) is required.");
    }
    if (cart.length === 0) {
      throw new Error("Your cart is empty. Please add items before checking out.");
    }

    const orderSubtotal = subtotal;
    const packagingFee = 20;
    const deliveryFee = orderSubtotal >= 299 ? 0 : 35;
    const cgst = Number((orderSubtotal * 0.025).toFixed(2));
    const sgst = Number((orderSubtotal * 0.025).toFixed(2));
    const totalGst = Number((cgst + sgst).toFixed(2));
    const finalAmount = Math.max(0, Number((orderSubtotal + packagingFee + deliveryFee + totalGst - discountAmount).toFixed(2)));

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `KDP-2026-${randomNum}`;

    const newOrder = {
      id: newOrderId,
      date: new Date().toISOString(),
      status: 'Order Confirmed - Kitchen Dispatch Pending',
      customer: {
        name: customer.name,
        email: customer.email,
        phone: deliveryDetails.phone,
        googleId: customer.googleId
      },
      deliveryDetails: { ...deliveryDetails },
      items: [...cart],
      bill: {
        subtotal: orderSubtotal,
        packagingFee,
        deliveryFee,
        cgst,
        sgst,
        totalGst,
        discount: discountAmount,
        couponCode: couponCode || null,
        grandTotal: finalAmount
      },
      paymentMethod,
      fssaiLicense: '11224334000189',
      gstin: '29AAACK1234F1Z8'
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    
    // Save updated delivery profile
    setDeliveryProfile(deliveryDetails);

    // Save exclusively to user's Google vault
    saveToVault(customer.email, [], deliveryDetails, updatedOrders);

    // Clear cart after placing order
    setCart([]);

    // Open Bill Modal
    setActiveBillOrder(newOrder);
    setIsBillOpen(true);
    setIsCartOpen(false);

    showToast(`Order #${newOrderId} placed successfully! Bill generated.`);
    return newOrder;
  };

  const viewBill = (order) => {
    setActiveBillOrder(order);
    setIsBillOpen(true);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        loginWithGoogle,
        logoutCustomer,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemsCount,
        deliveryProfile,
        setDeliveryProfile,
        saveDeliveryProfile,
        orders,
        placeOrder,
        viewBill,
        activeBillOrder,
        setActiveBillOrder,
        isCartOpen,
        setIsCartOpen,
        isBillOpen,
        setIsBillOpen,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        toastMessage,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border"
          style={{
            backgroundColor: '#06261C',
            borderColor: '#34D399',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(52, 211, 153, 0.3)'
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse"></div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

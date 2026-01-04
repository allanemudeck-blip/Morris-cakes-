
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, CartItem } from './types';
import { PRODUCTS, CONTACT_INFO, LOGO_URL, SLOGAN, MISSION, VISION } from './constants';
import CartDrawer from './components/CartDrawer';
import { getCakeRecommendation } from './services/geminiService';

interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string; // Added to ensure all details are captured
  date: string;
  items: string;
  total: string;
  status: 'Processing' | 'Delivered' | 'Cancelled';
}

interface UserProfile {
  name: string;
  phone: string;
  location: string;
  orders: OrderRecord[];
}

const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`relative overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center ${className}`}>
    <img 
      src={LOGO_URL} 
      alt="Morris Cakes Logo" 
      className="w-full h-full object-cover" 
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://img.freepik.com/premium-vector/bakery-logo-design-bread-confectionery-concept_622159-251.jpg';
      }} 
    />
  </div>
);

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [regForm, setRegForm] = useState<UserProfile>({ name: '', phone: '', location: '', orders: [] });

  // Global Data for "Backend" simulation
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);
  const [allCustomers, setAllCustomers] = useState<UserProfile[]>([]);

  // Master Baker Consultation State
  const [consultOccasion, setConsultOccasion] = useState('');
  const [consultPreference, setConsultPreference] = useState('');
  const [chefSuggestion, setChefSuggestion] = useState<string | null>(null);
  const [isChefThinking, setIsChefThinking] = useState(false);

  useEffect(() => {
    // Load User from Session
    const savedUser = localStorage.getItem('morris_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.name) {
          setUser(parsedUser);
          setRegForm(parsedUser);
        }
      } catch (e) {
        localStorage.removeItem('morris_user');
      }
    }

    // Load Global Records (for Owner/Admin view)
    const savedOrders = localStorage.getItem('morris_global_orders');
    const savedCustomers = localStorage.getItem('morris_global_customers');
    if (savedOrders) setAllOrders(JSON.parse(savedOrders));
    if (savedCustomers) setAllCustomers(JSON.parse(savedCustomers));
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.phone.trim()) return;
    
    const userData = { ...regForm, orders: user?.orders || [] };
    localStorage.setItem('morris_user', JSON.stringify(userData));
    setUser(userData);

    const updatedGlobalCustomers = [...allCustomers];
    const existingIdx = updatedGlobalCustomers.findIndex(c => c.phone === userData.phone);
    if (existingIdx > -1) {
      updatedGlobalCustomers[existingIdx] = userData;
    } else {
      updatedGlobalCustomers.push(userData);
    }
    localStorage.setItem('morris_global_customers', JSON.stringify(updatedGlobalCustomers));
    setAllCustomers(updatedGlobalCustomers);
    
    setIsRegisterModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('morris_user');
    setUser(null);
    setRegForm({ name: '', phone: '', location: '', orders: [] });
    setIsProfileModalOpen(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Verification Key
    if (adminPass === 'morris2024') {
      setIsAdminAuthenticated(true);
    } else {
      alert('Unauthorized access. Please contact Chef Morris.');
    }
  };

  const categories: Category[] = ['All', 'Cakes', 'Bakery', 'Snacks', 'Fast Food', 'Chicken', 'Pizza', 'Local Delights'];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const directWhatsAppOrder = (product: Product) => {
    const message = `Hello Morris Cakes UG! I'd like to order: *${product.name}* (Price: ${product.price.toLocaleString()} UGX). Please let me know how to proceed.`;
    window.open(`https://wa.me/${CONTACT_INFO.whatsappMTN}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleChefConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultOccasion) return;
    setIsChefThinking(true);
    const suggestion = await getCakeRecommendation(consultOccasion, consultPreference);
    setChefSuggestion(suggestion || "Based on the occasion, I recommend our signature Midnight Cocoa Forest Cake!");
    setIsChefThinking(false);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!user) {
      setIsRegisterModalOpen(true);
      return;
    }
    
    setIsSubmittingOrder(true);
    const totalAmount = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderItemsSummary = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const orderId = `MOR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      const newOrder: OrderRecord = {
        id: orderId,
        customerName: user.name,
        customerPhone: user.phone,
        customerLocation: user.location,
        date: new Date().toLocaleString(),
        items: orderItemsSummary,
        total: `${totalAmount.toLocaleString()} UGX`,
        status: 'Processing'
      };

      const updatedUser = { ...user, orders: [newOrder, ...user.orders] };
      localStorage.setItem('morris_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      const updatedGlobalOrders = [newOrder, ...allOrders];
      localStorage.setItem('morris_global_orders', JSON.stringify(updatedGlobalOrders));
      setAllOrders(updatedGlobalOrders);

      const waMessageText = `*OFFICIAL ORDER RECEIPT: ${orderId}*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${user.name}\n` +
        `Phone: ${user.phone}\n` +
        `Delivery Area: ${user.location}\n\n` +
        `*Order Summary:*\n${cartItems.map(i => `• ${i.quantity}x ${i.name} — ${(i.price * i.quantity).toLocaleString()} UGX`).join('\n')}\n\n` +
        `*GRAND TOTAL: ${totalAmount.toLocaleString()} UGX*\n\n` +
        `_Chef Morris will confirm your order shortly. Thank you for choosing excellence._`;
      
      const encodedWa = encodeURIComponent(waMessageText);
      
      // Submission of ALL checkout details to Formspree
      await fetch('https://formspree.io/f/maqwvpja', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Order Receipt: ${orderId} from ${user.name}`,
          orderId: orderId,
          customerName: user.name,
          customerPhone: user.phone,
          customerLocation: user.location,
          orderDate: newOrder.date,
          orderItems: orderItemsSummary,
          totalAmount: newOrder.total,
          orderDetails: cartItems.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.price * i.quantity
          }))
        })
      });

      setCartItems([]);
      setIsCartOpen(false);
      window.open(`https://wa.me/${CONTACT_INFO.whatsappMTN}?text=${encodedWa}`, '_blank');
    } catch (error) {
      console.error("Order Submission Error:", error);
      alert("There was an issue processing your request. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-lime-200 overflow-x-hidden antialiased">
      {/* Top Professional Banner */}
      <div className="bg-slate-950 text-white py-3 px-4 flex flex-wrap justify-center gap-x-12 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] z-[60] border-b border-white/5 sticky top-0 md:relative">
        <a href={`https://wa.me/${CONTACT_INFO.whatsappMTN}`} target="_blank" className="flex items-center gap-2 hover:text-lime-400 transition-all transform hover:scale-105">
          <svg className="w-4 h-4 text-lime-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.606.073-1.779-.396-1.503-.603-2.431-2.122-2.506-2.221-.075-.1-.622-.827-.622-1.58 0-.753.386-1.121.531-1.272.145-.15.312-.188.416-.188.104 0 .208.001.301.004.098.003.225-.041.35.26.126.301.426 1.036.464 1.112.038.075.063.164.013.264-.05.099-.075.163-.15.251-.075.09-.157.201-.225.271-.075.076-.154.158-.066.309.087.15.388.641.834 1.036.574.51 1.058.669 1.208.744.15.075.238.063.325-.038.087-.101.375-.438.476-.588.101-.15.201-.126.338-.075.138.051.876.413 1.026.489.15.075.25.112.287.176.038.062.038.361-.106.766zM12 2C6.486 2 2 6.486 2 12c0 1.892.531 3.655 1.446 5.162L2 22l4.943-1.3c1.474.832 3.174 1.3 5.057 1.3 5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18c-1.72 0-3.328-.483-4.704-1.32L4.416 19.53l.867-3.178C4.417 14.981 4 13.541 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
          WhatsApp Support: {CONTACT_INFO.whatsappMTN}
        </a>
      </div>

      <header className="bg-white border-b border-slate-100 sticky top-0 md:top-0 z-50 h-36 shadow-sm transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo className="w-24 h-24 group-hover:scale-110 transition-transform duration-500 shadow-xl" />
            <div className="flex flex-col">
              <h1 className="text-4xl font-display font-bold text-slate-900 leading-tight tracking-tight">Morris cakes & confectionery UG</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="w-12 h-[2px] bg-lime-600 rounded-full"></span>
                <p className="text-[12px] font-black text-lime-600 uppercase tracking-[0.5em] italic">{SLOGAN}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-16 hidden lg:block">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="What can we bake for you today?..."
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-5 px-14 focus:ring-2 focus:ring-lime-500 transition-all text-sm outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-6 h-6 absolute left-5 top-5 text-slate-400 group-focus-within:text-lime-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setIsProfileModalOpen(true)}>
                <div className="text-right hidden sm:block">
                  <p className="text-base font-bold text-slate-900 group-hover:text-lime-600 transition-colors">{user.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Portal</p>
                </div>
                <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-bold uppercase transition-all group-hover:bg-lime-600 ring-4 ring-slate-100 shadow-lg">{user.name[0]}</div>
              </div>
            ) : (
              <button onClick={() => setIsRegisterModalOpen(true)} className="hidden md:block bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-lime-600 transition-all shadow-2xl active:scale-95">Register Now</button>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-5 bg-white border border-slate-200 rounded-[1.5rem] text-slate-700 hover:border-lime-500 transition-all group shadow-sm">
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-lime-600 text-white text-[11px] font-black w-8 h-8 flex items-center justify-center rounded-full border-[3px] border-white animate-bounce shadow-xl">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Area */}
        <section className="relative h-[90vh] min-h-[750px] flex items-center bg-slate-950 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=2000" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-30 transform scale-105 animate-slow-zoom" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-4xl space-y-12">
              <div className="inline-flex items-center gap-5 bg-white/5 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
                <span className="text-lime-400 text-[12px] font-black uppercase tracking-[0.5em]">{SLOGAN}</span>
              </div>
              <h2 className="text-8xl md:text-[11rem] font-display font-bold text-white leading-[0.75] tracking-tighter">
                Crafting <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-400 italic">Sweet Legacies.</span>
              </h2>
              <p className="text-2xl md:text-3xl text-slate-300 font-light max-w-3xl leading-relaxed">
                Uganda's premier destination for artisanal bakes. Every bite is a testament to our dedication to quality, flavor, and community.
              </p>
              <div className="flex flex-wrap gap-8 pt-10">
                <a href="#products" className="bg-lime-600 text-white px-20 py-10 rounded-[3rem] font-black text-xl hover:bg-lime-500 transition-all shadow-[0_30px_80px_rgba(101,163,13,0.45)] flex items-center gap-5 group active:scale-95">
                  Browse Menu
                  <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                {!user && (
                   <button onClick={() => setIsRegisterModalOpen(true)} className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-20 py-10 rounded-[3rem] font-black text-xl hover:bg-white/20 transition-all active:scale-95 shadow-2xl">Register Now</button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Registration & WhatsApp Section */}
        {!user && (
          <section id="registration" className="py-48 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/10 blur-[150px] rounded-full -mr-80 -mt-80"></div>
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="bg-slate-950 p-24 md:p-40 rounded-[6rem] shadow-5xl border border-white/10 relative overflow-hidden group">
                <div className="relative z-10 max-w-5xl mx-auto space-y-16">
                  <div className="inline-block p-6 bg-white/5 rounded-[2.5rem] border border-white/15 mb-8 shadow-2xl transform group-hover:rotate-6 transition-transform">
                    <Logo className="w-20 h-20" />
                  </div>
                  <h2 className="text-6xl md:text-[9rem] font-display font-bold text-white tracking-tight leading-none">Ready to Order? <br/><span className="text-lime-500 italic">Join the VIP Circle.</span></h2>
                  <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-4xl mx-auto">
                    Registered clients of <span className="text-white font-black italic">Morris cakes & confectionery UG</span> receive priority delivery and exclusive daily offers. Start your excellence journey today.
                  </p>
                  
                  <div className="pt-16 flex flex-col sm:flex-row items-center justify-center gap-10">
                    <button 
                      onClick={() => setIsRegisterModalOpen(true)}
                      className="w-full sm:w-auto bg-white text-slate-900 px-20 py-10 rounded-[3.5rem] font-black text-2xl hover:bg-lime-500 transition-all shadow-5xl active:scale-95 flex items-center justify-center gap-6 group"
                    >
                      <svg className="w-10 h-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                      Register Member
                    </button>
                    
                    <a 
                      href={`https://wa.me/${CONTACT_INFO.whatsappMTN}`}
                      target="_blank"
                      className="w-full sm:w-auto bg-lime-600 text-white px-20 py-10 rounded-[3.5rem] font-black text-2xl hover:bg-lime-500 transition-all flex items-center justify-center gap-6 group shadow-[0_40px_100px_rgba(101,163,13,0.5)] active:scale-95"
                    >
                      <svg className="w-10 h-10 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.606.073-1.779-.396-1.503-.603-2.431-2.122-2.506-2.221-.075-.1-.622-.827-.622-1.58 0-.753.386-1.121.531-1.272.145-.15.312-.188.416-.188.104 0 .208.001.301.004.098.003.225-.041.35.26.126.301.426 1.036.464 1.112.038.075.063.164.013.264-.05.099-.075.163-.15.251-.075.09-.157.201-.225.271-.075.076-.154.158-.066.309.087.15.388.641.834 1.036.574.51 1.058.669 1.208.744.15.075.238.063.325-.038.087-.101.375-.438.476-.588.101-.15.201-.126.338-.075.138.051.876.413 1.026.489.15.075.25.112.287.176.038.062.038.361-.106.766z"/>
                      </svg>
                      Direct WhatsApp
                    </a>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-white/5 rounded-full -mr-40 -mb-40 group-hover:scale-110 transition-transform duration-[4s] opacity-20"></div>
                <div className="absolute top-1/2 left-0 w-32 h-32 bg-lime-500/10 rounded-full -ml-16 -translate-y-1/2 blur-2xl opacity-40"></div>
              </div>
            </div>
          </section>
        )}

        {/* Master Catalog */}
        <section id="products" className="py-48 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-40 gap-16">
              <div className="space-y-8 text-left">
                <span className="text-lime-600 font-black uppercase tracking-[0.5em] text-[12px]">The Master's Collection</span>
                <h2 className="text-7xl md:text-[10rem] font-display font-bold text-slate-900 tracking-tighter leading-[0.75]">Our Daily <br/><span className="italic">Menu.</span></h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar snap-x">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`px-14 py-8 rounded-[2rem] whitespace-nowrap font-black text-[12px] uppercase tracking-[0.35em] transition-all snap-start ${activeCategory === cat ? 'bg-slate-900 text-white shadow-5xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shadow-sm'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white rounded-[4.5rem] p-7 border border-transparent hover:border-slate-50 hover:shadow-5xl transition-all duration-1000 flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[3.5rem] bg-slate-50 mb-12 shadow-inner">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                    
                    {/* Floating Controls */}
                    <div className="absolute bottom-10 inset-x-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-8 group-hover:translate-y-0">
                      <button 
                        onClick={() => addToCart(product)} 
                        className="flex-1 bg-white text-slate-900 h-20 rounded-[1.75rem] shadow-4xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
                      >
                        Add To Basket
                      </button>
                      <button 
                        onClick={() => directWhatsAppOrder(product)} 
                        className="w-20 bg-lime-600 text-white h-20 rounded-[1.75rem] shadow-4xl flex items-center justify-center hover:bg-lime-500 transition-all"
                        title="Order via WhatsApp"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.606.073-1.779-.396-1.503-.603-2.431-2.122-2.506-2.221-.075-.1-.622-.827-.622-1.58 0-.753.386-1.121.531-1.272.145-.15.312-.188.416-.188.104 0 .208.001.301.004.098.003.225-.041.35.26.126.301.426 1.036.464 1.112.038.075.063.164.013.264-.05.099-.075.163-.15.251-.075.09-.157.201-.225.271-.075.076-.154.158-.066.309.087.15.388.641.834 1.036.574.51 1.058.669 1.208.744.15.075.238.063.325-.038.087-.101.375-.438.476-.588.101-.15.201-.126.338-.075.138.051.876.413 1.026.489.15.075.25.112.287.176.038.062.038.361-.106.766z"/></svg>
                      </button>
                    </div>

                    {product.featured && (
                      <div className="absolute top-10 left-10 bg-slate-900/90 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.4em] px-7 py-3 rounded-full shadow-2xl">Signature Pick</div>
                    )}
                  </div>
                  <div className="flex-1 px-4 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[12px] font-black text-lime-600 uppercase tracking-widest">{product.category}</span>
                      <span className="text-3xl font-black text-slate-900">{(product.price / 1000).toFixed(0)}k <span className="text-[11px] text-slate-400">UGX</span></span>
                    </div>
                    <h4 className="text-3xl font-display font-bold text-slate-800 leading-tight mb-6 group-hover:text-lime-600 transition-all">{product.name}</h4>
                    <p className="text-lg text-slate-500 leading-relaxed line-clamp-2 font-light">{product.description}</p>
                    <div className="mt-auto pt-10 sm:hidden">
                       <button 
                        onClick={() => addToCart(product)} 
                        className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-widest hover:bg-lime-600 transition-all active:scale-95 shadow-xl"
                      >
                        Add to Basket
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Consultation Section */}
        <section id="chef-consultant" className="py-48 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-48 items-center">
              <div className="space-y-20">
                <div className="space-y-10">
                  <span className="text-lime-400 font-black uppercase tracking-[0.6em] text-[13px]">Master Craftsmanship Consultation</span>
                  <h2 className="text-8xl md:text-[10rem] font-display font-bold tracking-tighter leading-[0.8]">Artistry In <br/><span className="text-lime-500 italic">Every Recommendation.</span></h2>
                  <p className="text-2xl text-slate-400 font-light leading-relaxed max-w-2xl italic">"Our creations aren't just cakes; they are memories in the making. Let me guide you to the perfect selection for your special moment."</p>
                </div>
                
                <form onSubmit={handleChefConsult} className="space-y-12 max-w-lg">
                  <div className="space-y-5">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-8">Occasion Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Wedding, High-Profile Corporate Gala" 
                      className="w-full bg-white/5 border border-white/10 rounded-[2.75rem] p-10 outline-none focus:ring-2 focus:ring-lime-500 transition-all font-bold text-2xl shadow-inner"
                      value={consultOccasion}
                      onChange={(e) => setConsultOccasion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-5">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-8">Palate Preferences</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Salted caramel accents, gluten-conscious" 
                      className="w-full bg-white/5 border border-white/10 rounded-[2.75rem] p-10 outline-none focus:ring-2 focus:ring-lime-500 transition-all font-bold text-2xl shadow-inner"
                      value={consultPreference}
                      onChange={(e) => setConsultPreference(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={isChefThinking}
                    className="w-full bg-lime-600 text-white py-11 rounded-[3.5rem] font-black text-2xl hover:bg-lime-500 transition-all shadow-5xl shadow-lime-900/40 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-6"
                  >
                    {isChefThinking ? 'Consulting Master Records...' : 'Request Chef Consultation'}
                    <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.166a2 2 0 00.51 2.214l1.688 1.688a2 2 0 002.828 0l1.688-1.688a2 2 0 00.51-2.214l-.722-2.166zM15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                </form>
              </div>

              <div className="relative">
                {chefSuggestion ? (
                  <div className="bg-white text-slate-900 p-24 md:p-40 rounded-[7rem] shadow-5xl animate-scale-in relative border-[16px] border-slate-50">
                    <div className="absolute -top-16 -left-16 w-40 h-40 bg-lime-600 rounded-full flex items-center justify-center text-white border-[12px] border-slate-950 shadow-5xl z-20">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex items-center gap-6 mb-16">
                      <span className="font-black uppercase tracking-[0.6em] text-sm text-lime-600">The Master's Professional Verdict</span>
                    </div>
                    <p className="text-5xl font-display font-bold leading-tight text-slate-800 italic">"{chefSuggestion}"</p>
                    <button onClick={() => setChefSuggestion(null)} className="mt-20 text-[14px] font-black uppercase tracking-[0.6em] text-slate-400 hover:text-slate-900 transition-all border-b-2 border-slate-100 pb-3">Initiate New Request</button>
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-white rounded-[7rem] overflow-hidden group shadow-5xl flex items-center justify-center p-16 border-[20px] border-white/5 relative">
                    <img src={LOGO_URL} className="w-full h-full object-contain transition-all duration-[3s] transform group-hover:scale-110" alt="Morris Cakes Official Branding" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-24">
                      <div className="space-y-2">
                        <p className="text-lime-500 text-[14px] font-black uppercase tracking-[0.7em] mb-4">Master Baker Excellence</p>
                        <h4 className="text-7xl font-display font-bold">Morris Ejakait</h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Global Footer */}
        <footer className="bg-slate-950 text-white pt-64 pb-28 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-48 mb-64">
              <div className="col-span-1 md:col-span-2 space-y-20">
                <Logo className="w-32 h-32 shadow-2xl" />
                <h2 className="text-8xl font-display font-bold leading-none tracking-tighter">Morris Cakes &<br/><span className="text-lime-500">Confectionery UG.</span></h2>
                <div className="space-y-8">
                  <p className="text-lime-500 text-[16px] font-black uppercase tracking-[0.7em]">{SLOGAN}</p>
                  <p className="text-slate-400 text-3xl font-light leading-relaxed max-w-2xl">The golden standard of Ugandan confectionery since 2018. Quality you can trust, taste you won't forget.</p>
                </div>
              </div>
              <div className="space-y-16">
                <h4 className="text-[16px] font-black uppercase tracking-[0.6em] text-lime-500">Site Links</h4>
                <nav className="flex flex-col gap-10 text-slate-400 font-bold text-xl">
                  <a href="#products" className="hover:text-white transition-all transform hover:translate-x-4">Artisanal Menu</a>
                  <a href="#chef-consultant" className="hover:text-white transition-all transform hover:translate-x-4">Consultation Hub</a>
                  <button onClick={() => setIsRegisterModalOpen(true)} className="text-left hover:text-white transition-all transform hover:translate-x-4">Member Portal</button>
                  <button onClick={() => setIsAdminModalOpen(true)} className="text-left text-slate-900/50 hover:text-lime-600 transition-all font-black uppercase text-sm tracking-widest">Admin Logic</button>
                </nav>
              </div>
              <div className="space-y-16">
                <h4 className="text-[16px] font-black uppercase tracking-[0.6em] text-lime-500">Contact Hub</h4>
                <div className="text-slate-400 font-bold text-xl space-y-10">
                  <a href={`https://wa.me/${CONTACT_INFO.whatsappMTN}`} target="_blank" className="flex items-center gap-8 hover:text-lime-400 group transition-all">
                    <div className="w-16 h-16 bg-lime-500/10 rounded-2xl flex items-center justify-center text-lime-500 group-hover:bg-lime-500 group-hover:text-white transition-all shadow-xl">
                      <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.606.073-1.779-.396-1.503-.603-2.431-2.122-2.506-2.221-.075-.1-.622-.827-.622-1.58 0-.753.386-1.121.531-1.272.145-.15.312-.188.416-.188.104 0 .208.001.301.004.098.003.225-.041.35.26.126.301.426 1.036.464 1.112.038.075.063.164.013.264-.05.099-.075.163-.15.251-.075.09-.157.201-.225.271-.075.076-.154.158-.066.309.087.15.388.641.834 1.036.574.51 1.058.669 1.208.744.15.075.238.063.325-.038.087-.101.375-.438.476-.588.101-.15.201-.126.338-.075.138.051.876.413 1.026.489.15.075.25.112.287.176.038.062.038.361-.106.766z"/></svg>
                    </div>
                    {CONTACT_INFO.whatsappMTN}
                  </a>
                  <a href={`tel:${CONTACT_INFO.callsAirtel}`} className="flex items-center gap-8 hover:text-red-400 group transition-all">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-xl">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    {CONTACT_INFO.callsAirtel}
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-32 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-16 text-[12px] font-black uppercase tracking-[0.7em] text-slate-700">
              <p>&copy; {new Date().getFullYear()} Morris cakes & confectionery UG. Premium Hospitality Logic.</p>
              <div className="flex gap-24">
                <span className="hover:text-white cursor-pointer transition-all">Privacy Strategy</span>
                <span className="hover:text-white cursor-pointer transition-all">Service Protocols</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Logic Verification Modal (Admin) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl animate-fade-in" onClick={() => setIsAdminModalOpen(false)} />
          <div className="relative w-full max-w-7xl bg-white rounded-[6rem] shadow-5xl animate-scale-in max-h-[92vh] flex flex-col overflow-hidden">
            {!isAdminAuthenticated ? (
              <div className="p-32 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-slate-900 rounded-[3rem] flex items-center justify-center text-white mb-16 shadow-5xl animate-bounce-slow">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <h2 className="text-7xl font-display font-bold text-slate-900 mb-10 tracking-tight">System Integrity Check</h2>
                <p className="text-slate-500 mb-20 text-2xl font-light max-w-2xl mx-auto">Access restricted to authorized Morris Cakes personnel. Please enter your protocol key.</p>
                <form onSubmit={handleAdminLogin} className="w-full max-w-md space-y-8">
                  <input 
                    type="password" 
                    placeholder="ENTER PROTOCOL KEY" 
                    className="w-full p-10 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-slate-900/5 transition-all text-center font-black tracking-[0.3em] text-3xl"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="w-full py-10 bg-slate-900 text-white rounded-[3rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-slate-800 transition-all shadow-5xl active:scale-95">Verify Authentication</button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-20 border-b flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                  <div>
                    <h2 className="text-6xl font-display font-bold text-slate-900">Operations Intelligence</h2>
                    <p className="text-[12px] text-lime-600 font-black uppercase tracking-[0.6em] mt-4 flex items-center gap-4 italic">
                      <span className="w-3 h-3 bg-lime-500 rounded-full animate-pulse"></span>
                      Active Hosting Logic Verified
                    </p>
                  </div>
                  <div className="flex gap-10">
                    <button onClick={() => { setIsAdminAuthenticated(false); setAdminPass(''); }} className="px-12 py-6 bg-slate-50 text-slate-600 rounded-3xl font-black text-[12px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Sign Out</button>
                    <button onClick={() => setIsAdminModalOpen(false)} className="p-6 bg-slate-900 text-white rounded-full hover:rotate-90 transition-all shadow-xl"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-20 space-y-24 no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {[
                      { label: 'Cumulative Orders', val: allOrders.length, color: 'bg-lime-50 text-lime-700 border-lime-100' },
                      { label: 'Unique Customers', val: allCustomers.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { label: 'Live Catalog Items', val: PRODUCTS.length, color: 'bg-orange-50 text-orange-700 border-orange-100' },
                      { label: 'Gross Potential (K)', val: (allOrders.reduce((acc, o) => acc + parseInt(o.total.replace(/,/g, '')), 0) / 1000).toFixed(0), color: 'bg-slate-900 text-white border-slate-800 shadow-2xl' }
                    ].map((s, i) => (
                      <div key={i} className={`${s.color} p-16 rounded-[4.5rem] border shadow-md transform hover:scale-105 transition-transform duration-500`}>
                        <p className="text-[12px] font-black uppercase tracking-[0.3em] mb-8 opacity-80">{s.label}</p>
                        <h4 className="text-7xl font-black tracking-tighter">{s.val}</h4>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-16">
                    <h3 className="text-4xl font-display font-bold text-slate-900">Transaction Buffer</h3>
                    <div className="overflow-hidden rounded-[5rem] border border-slate-100 shadow-xl bg-white">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">
                            <th className="px-16 py-12">Tracking ID / Date</th>
                            <th className="px-16 py-12">Client Profile</th>
                            <th className="px-16 py-12">Manifest</th>
                            <th className="px-16 py-12 text-right">Settlement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {allOrders.length > 0 ? allOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-all duration-300">
                              <td className="px-16 py-12">
                                <p className="font-black text-slate-900 text-2xl">{order.id}</p>
                                <p className="text-[12px] text-slate-400 mt-3 font-medium">{order.date}</p>
                              </td>
                              <td className="px-16 py-12">
                                <p className="font-bold text-slate-800 text-2xl">{order.customerName}</p>
                                <p className="text-[14px] text-lime-600 font-black tracking-widest uppercase mt-3">{order.customerPhone}</p>
                              </td>
                              <td className="px-16 py-12 max-w-sm">
                                <p className="text-base text-slate-500 font-light truncate leading-relaxed">{order.items}</p>
                              </td>
                              <td className="px-16 py-12 text-right">
                                <span className="font-black text-slate-900 text-3xl">{order.total}</span>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="px-16 py-40 text-center text-slate-400 font-light text-3xl italic">Archives are currently empty...</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Logic Verified */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl animate-fade-in" onClick={() => setIsProfileModalOpen(false)} />
          <div className="relative w-full max-w-5xl bg-white rounded-[6rem] p-24 shadow-5xl animate-scale-in max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-24">
              <div className="space-y-4">
                <h2 className="text-7xl font-display font-bold text-slate-900 tracking-tight leading-none">Your Tasting Vault</h2>
                <p className="text-slate-400 font-light text-2xl">Excellence has a history, {user.name.split(' ')[0]}.</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-6 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
               {[
                 { label: 'Client Contact', val: user.phone },
                 { label: 'Base Sector', val: user.location },
                 { label: 'Session Count', val: `${user.orders.length} events` }
               ].map((d, i) => (
                 <div key={i} className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{d.label}</p>
                    <p className="font-bold text-slate-900 text-2xl">{d.val}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-16">
              <h3 className="text-4xl font-display font-bold text-slate-900 flex items-center gap-6">
                <div className="w-16 h-16 bg-lime-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                Legacy Orders
              </h3>
              {user.orders.length > 0 ? (
                <div className="space-y-10">
                  {user.orders.map((order) => (
                    <div key={order.id} className="bg-white border border-slate-100 p-12 rounded-[4rem] hover:shadow-4xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-3 h-full bg-lime-600 transform translate-x-full group-hover:translate-x-0 transition-transform"></div>
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 italic">Auth ID: {order.id}</p>
                          <p className="text-xl font-bold text-slate-900">{order.date}</p>
                        </div>
                        <span className="bg-lime-50 text-lime-700 text-[12px] font-black px-8 py-4 rounded-full uppercase tracking-widest group-hover:bg-lime-600 group-hover:text-white transition-all shadow-sm">{order.status}</span>
                      </div>
                      <p className="text-slate-500 font-light leading-relaxed text-xl mb-10 italic">"{order.items}"</p>
                      <p className="text-4xl font-black text-slate-900">{order.total}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-slate-50 rounded-[5rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                  <Logo className="w-16 h-16 opacity-20 mb-8" />
                  <p className="text-slate-400 font-light text-2xl italic">Ready to scribe your first gourmet experience?</p>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="mt-24 w-full py-10 bg-red-50 text-red-600 rounded-[3.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm">Terminate Session</button>
          </div>
        </div>
      )}

      {/* User Registration Verified */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-3xl animate-fade-in" onClick={() => setIsRegisterModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[6rem] p-24 shadow-5xl animate-scale-in">
            <div className="text-center space-y-8 mb-20">
              <h2 className="text-7xl font-display font-bold text-slate-900 tracking-tight leading-none">Register For Excellence</h2>
              <p className="text-slate-400 font-light text-2xl leading-relaxed">Exclusive access to Chef Morris's finest bakes.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-12">
              <div className="space-y-5">
                 <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 ml-8">Full Name / Business Identity</label>
                 <input type="text" required placeholder="Name on the box" className="w-full p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none font-bold text-2xl focus:ring-4 focus:ring-lime-500/5 transition-all shadow-inner" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} />
              </div>
              <div className="space-y-5">
                 <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 ml-8">WhatsApp / Mobile Connection</label>
                 <input type="tel" required placeholder="+256..." className="w-full p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none font-bold text-2xl focus:ring-4 focus:ring-lime-500/5 transition-all shadow-inner" value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} />
              </div>
              <div className="space-y-5">
                 <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 ml-8">Delivery Destination</label>
                 <input type="text" required placeholder="e.g. Plot 4, Kyadondo, Kampala" className="w-full p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] outline-none font-bold text-2xl focus:ring-4 focus:ring-lime-500/5 transition-all shadow-inner" value={regForm.location} onChange={(e) => setRegForm({...regForm, location: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-11 rounded-[3.5rem] font-black text-2xl hover:bg-lime-600 transition-all shadow-5xl active:scale-95">Complete Membership</button>
            </form>
          </div>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onRemove={removeFromCart} 
        onCheckout={handleCheckout} 
        isSubmitting={isSubmittingOrder}
      />
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        .animate-scale-in { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slow-zoom { animation: slowZoom 40s infinite alternate linear; }
        .animate-bounce-slow { animation: bounce 4s infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .shadow-4xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.15); }
        .shadow-5xl { box-shadow: 0 60px 150px -30px rgba(0, 0, 0, 0.3); }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default App;

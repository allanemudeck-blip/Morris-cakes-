
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, CartItem } from './types';
import { PRODUCTS, CONTACT_INFO, CHEF_IMAGE, LOGO_URL } from './constants';
import CartDrawer from './components/CartDrawer';

interface UserProfile {
  name: string;
  phone: string;
  location: string;
}

const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <div className={`relative overflow-hidden rounded-2xl border-4 border-white shadow-xl bg-white flex items-center justify-center ${className}`}>
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
  const [directMsg, setDirectMsg] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regForm, setRegForm] = useState<UserProfile>({ name: '', phone: '', location: '' });

  useEffect(() => {
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
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) return;
    localStorage.setItem('morris_user', JSON.stringify(regForm));
    setUser(regForm);
    setIsRegisterModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('morris_user');
    setUser(null);
    setRegForm({ name: '', phone: '', location: '' });
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

  const handleDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsg.trim()) return;
    const waMessage = encodeURIComponent(directMsg);
    window.open(`https://wa.me/${CONTACT_INFO.whatsappMTN.replace('+', '')}?text=${waMessage}`, '_blank');
    setDirectMsg('');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmittingOrder(true);
    const totalAmount = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderItemsSummary = cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    
    try {
      const response = await fetch('https://formspree.io/f/maqwvpja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          customer: user?.name || "Guest",
          phone: user?.phone || "N/A",
          location: user?.location || "N/A",
          order: orderItemsSummary,
          total: `${totalAmount.toLocaleString()} UGX`
        })
      });

      const waMessage = `Hello Morris Cakes! I'd like to place an order:%0A%0A${orderItemsSummary.replace(/,/g, '%0A')}%0A%0A*Total: ${totalAmount.toLocaleString()} UGX*`;
      
      if (response.ok) {
        setCartItems([]);
        setIsCartOpen(false);
        window.open(`https://wa.me/${CONTACT_INFO.whatsappMTN.replace('+', '')}?text=${waMessage}`, '_blank');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Contact Bar */}
      <div className="bg-slate-900 text-white py-2 px-4 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] z-50">
        <span className="flex items-center gap-2">WhatsApp: {CONTACT_INFO.whatsappMTN}</span>
        <span className="flex items-center gap-2">Calls: {CONTACT_INFO.callsAirtel}</span>
      </div>

      <header className="bg-white/90 backdrop-blur-md border-b border-lime-100 sticky top-0 z-40 h-24 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-16 h-16" />
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-lime-700 leading-none">Morris Cakes</h1>
              <span className="text-[10px] text-lime-600 font-bold tracking-[0.1em] uppercase mt-1">Baked with love and passion</span>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-1 mx-12">
            <div className="relative w-full max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="Find your favorite treats..."
                className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3 px-12 focus:ring-2 focus:ring-lime-500 focus:bg-white outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-sm font-bold text-slate-800">{user.name}</span>
                <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:text-red-500 transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsRegisterModalOpen(true)} className="hidden sm:block bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Join Club</button>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[600px] h-[80vh] flex items-center bg-slate-900 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1920" alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="relative max-w-7xl mx-auto px-4 w-full">
            <h2 className="text-6xl md:text-9xl font-display font-bold text-white mb-10 leading-[0.9] tracking-tighter opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
              Taste the <br/><span className="text-lime-500 italic">Excellence.</span>
            </h2>
            <div className="flex flex-wrap gap-6 opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards]">
              <a href="#products" className="bg-lime-600 text-white px-12 py-6 rounded-3xl font-black text-lg hover:bg-lime-700 transition-all shadow-2xl shadow-lime-900/40">Explore Menu</a>
              <a href="#client-hub" className="bg-white text-slate-900 px-12 py-6 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all shadow-xl">Client Hub</a>
            </div>
          </div>
        </section>

        {/* Mission/Vision Section */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="p-12 md:p-16 bg-slate-50 rounded-[4rem] border border-slate-100 group hover:bg-lime-50 transition-all duration-500">
                <div className="w-16 h-16 bg-lime-600 rounded-2xl flex items-center justify-center mb-10">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 className="text-4xl font-display font-bold mb-6 text-slate-900">Our Mission</h3>
                <p className="text-xl text-slate-600 leading-relaxed font-light">
                  To provide high-quality baked goods and fast foods crafted with care, consistency, and creativity, while building long-lasting relationships with our customers.
                </p>
              </div>
              <div className="p-12 md:p-16 bg-slate-900 text-white rounded-[4rem] shadow-2xl group hover:bg-black transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10">
                  <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 className="text-4xl font-display font-bold mb-6 text-lime-400">Our Vision</h3>
                <p className="text-xl text-slate-300 leading-relaxed font-light">
                  To become Uganda's most loved bakery brand, known for exceptional taste, quality, and community care, serving sweet moments every day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <section id="products" className="py-32 bg-slate-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
              <h2 className="text-7xl font-display font-bold text-slate-900 tracking-tighter">Fresh Menu</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar max-w-full">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-4 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm ${activeCategory === cat ? 'bg-lime-600 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-lime-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-white rounded-[3rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-100">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-slate-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => addToCart(product)} className="bg-white text-slate-900 p-6 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-lime-600 uppercase tracking-widest">{product.category}</span>
                    <h4 className="text-2xl font-display font-bold mt-2 text-slate-800">{product.name}</h4>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900">{product.price.toLocaleString()} <span className="text-[10px] text-slate-400">UGX</span></span>
                    <button onClick={() => addToCart(product)} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-lime-600 transition-all md:hidden">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Hub Section */}
        <section id="client-hub" className="py-32 bg-slate-900 text-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-lime-500 font-black uppercase tracking-[0.4em] text-xs">Join the Community</h3>
                  <h2 className="text-6xl md:text-7xl font-display font-bold tracking-tighter">Client Hub.</h2>
                </div>
                
                {user ? (
                  <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex items-center gap-8">
                    <div className="w-24 h-24 bg-lime-500 rounded-full flex items-center justify-center text-4xl font-black text-slate-900 shadow-2xl">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold">{user.name}</h4>
                      <p className="text-slate-400 italic mt-1">{user.location}</p>
                      <button onClick={handleLogout} className="text-red-400 text-xs font-bold mt-4 hover:underline">Log Out</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-lime-600 p-12 rounded-[3.5rem] shadow-3xl transform hover:scale-[1.02] transition-transform">
                    <h4 className="text-3xl font-bold mb-4">Member Benefits</h4>
                    <p className="text-lime-50 mb-8 text-lg font-light">Register to unlock special discounts, track orders, and experience faster checkouts.</p>
                    <button onClick={() => setIsRegisterModalOpen(true)} className="w-full bg-white text-lime-700 py-6 rounded-3xl font-black text-xl hover:shadow-2xl transition-all">Register Now</button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Airtel Calls</span>
                    <p className="text-xl font-bold mt-2">{CONTACT_INFO.callsAirtel}</p>
                  </div>
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">WhatsApp MTN</span>
                    <p className="text-xl font-bold mt-2">{CONTACT_INFO.whatsappMTN}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white text-slate-900 p-12 md:p-16 rounded-[4rem] shadow-3xl">
                <h3 className="text-4xl font-display font-bold mb-8">Send a Message</h3>
                <form onSubmit={handleDirectMessage} className="space-y-8">
                  <textarea 
                    required 
                    placeholder="Tell us what you're craving..." 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 min-h-[180px] outline-none font-medium text-lg focus:ring-2 focus:ring-lime-500 transition-all"
                    value={directMsg}
                    onChange={(e) => setDirectMsg(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-lime-600 transition-all shadow-xl flex items-center justify-center gap-4">
                    Message via WhatsApp
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
            <Logo className="w-20 h-20 mx-auto" />
            <div className="space-y-2">
               <h2 className="text-4xl font-display font-bold">Morris Cakes</h2>
               <p className="text-lime-500 font-bold tracking-widest uppercase text-xs italic">Baked with love and passion</p>
            </div>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              Premier Ugandan bakery and food hub. Delivering excellence in every bite across the region.
            </p>
            <div className="pt-12 border-t border-white/5 text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
              &copy; {new Date().getFullYear()} Morris Cakes & Confectionery UG
            </div>
          </div>
        </footer>
      </main>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsRegisterModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[3.5rem] p-12 shadow-3xl">
            <h2 className="text-4xl font-display font-bold mb-10 text-center">Join the Club</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <input type="text" required placeholder="Full Name" className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} />
              <input type="tel" required placeholder="Phone Number" className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={regForm.phone} onChange={(e) => setRegForm({...regForm, phone: e.target.value})} />
              <input type="text" required placeholder="Location" className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={regForm.location} onChange={(e) => setRegForm({...regForm, location: e.target.value})} />
              <button type="submit" className="w-full bg-lime-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-lime-700 transition-all">Get Started</button>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;

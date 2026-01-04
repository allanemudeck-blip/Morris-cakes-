
import React from 'react';
import { CartItem } from '../types';
import { LOGO_URL, SLOGAN } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isSubmitting?: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isSubmitting = false,
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose} 
      />
      
      <div 
        className={`fixed top-0 right-0 z-[60] w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 border-b bg-white sticky top-0 z-20">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm bg-slate-50">
                <img 
                  src={LOGO_URL} 
                  alt="Morris Cakes" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://img.freepik.com/premium-vector/bakery-logo-design-bread-confectionery-concept_622159-251.jpg';
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-slate-900 leading-tight">Morris cakes & confectionery UG</h2>
                <p className="text-[9px] font-black text-lime-600 uppercase tracking-widest mt-1">{SLOGAN}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <h3 className="text-3xl font-display font-bold text-slate-900">Your Basket</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="text-lg font-medium">Your basket is currently empty.</p>
              <button onClick={onClose} className="mt-4 text-lime-600 font-black uppercase tracking-widest text-xs hover:underline">Start Exploring</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-6 group items-center">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.name}</h3>
                  <p className="text-sm font-black text-lime-600 mt-1">{item.price.toLocaleString()} UGX</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 rounded-xl px-2 py-1 border border-slate-100">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-black hover:text-lime-600">-</button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-black hover:text-lime-600">+</button>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t bg-slate-50 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
              <span className="text-3xl font-black text-slate-900">{total.toLocaleString()} UGX</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-4 py-6 rounded-3xl font-black text-xl transition-all shadow-2xl ${
                isSubmitting ? 'bg-slate-400 text-white cursor-wait' : 'bg-lime-600 text-white hover:bg-lime-700 shadow-lime-900/20 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
            <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.3em]">Direct WhatsApp Processing</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

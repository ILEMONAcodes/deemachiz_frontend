'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Trash2, ArrowRight, Loader2 } from 'lucide-react';

export default function CartDrawer() {
  const { isOpen, closeCart, cart, itemCount, subtotal, removeItem, clearCart, setItemQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping & billing form data
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Nigeria',
    state: 'Lagos',
    city: '',
    address: '',
    deliveryNote: '',
  });

  // Auto-fill user details from AuthContext when available
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setShippingData((prev) => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }
    setStep('checkout');
    setErrorMessage('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Cannot complete checkout. Your shopping cart is empty.');
      setStep('cart');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        shipping_address: {
          first_name: shippingData.firstName,
          last_name: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
          country: shippingData.country,
          state: shippingData.state,
          city: shippingData.city,
          address: shippingData.address,
          delivery_note: shippingData.deliveryNote,
        },
      };

      const response = (await apiClient('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      })) as { payment_url?: string };

      clearCart();
      closeCart();

      if (response && response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        router.push('/orders');
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeCart} />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header Navigation */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div className="text-xs font-bold text-slate-500 space-x-1.5">
              <button 
                onClick={() => setStep('cart')}
                className={`hover:text-slate-900 transition-colors ${step === 'cart' ? 'text-slate-900 underline font-black' : ''}`}
              >
                Cart ({itemCount})
              </button>
              {step === 'checkout' && (
                <>
                  <span>&gt;</span>
                  <span className="text-slate-900 underline font-black">Checkout</span>
                </>
              )}
            </div>
            <button onClick={closeCart} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
              ✕
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: CART ITEMS VIEW */}
            {step === 'cart' && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Review Your Cart</h2>
                  {cart.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-16">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900">{item.title || item.name}</h4>
                          <p className="text-xs font-medium text-amber-600">₦{item.price.toLocaleString()}</p>
                          
                          {/* Quantity Adjuster */}
                          <div className="flex items-center border border-slate-200 rounded-lg w-24 overflow-hidden mt-2">
                            <button
                              onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm font-black text-slate-900">
                      <span>Subtotal:</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full py-4 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CHECKOUT / SHIPPING & PAYSTACK TRIGGER */}
            {step === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Shipping Details</h3>
                  <button 
                    type="button" 
                    onClick={() => setStep('cart')} 
                    className="text-[11px] text-amber-600 font-bold hover:underline"
                  >
                    ← Back to Cart
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Ikeja"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Street address or apartment"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm font-black text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-amber-600">₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-4 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Securely via Paystack'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
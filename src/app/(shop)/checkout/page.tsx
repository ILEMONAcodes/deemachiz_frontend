'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, itemCount } = useCart();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: 'Nigeria',
    state: '',
    city: '',
    address: '',
    deliveryNote: '',
  });

  // Protect route & auto-fill customer details
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const nameParts = (user.name || '').split(' ');
    setFormData((prev) => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email || '',
      phoneNumber: user.phone || user.phone_number || '',
    }));
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Format payload for backend integration
      const orderPayload = {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          delivery_note: formData.deliveryNote,
        },
        total_amount: subtotal,
      };

      // Send order request to backend endpoint
      await apiClient('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      // Clear local state cart & redirect customer to their orders page
      clearCart();
      router.push('/orders?success=true');
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-28">
      <div className="flex items-center gap-2 mb-8 text-xs font-bold text-slate-500">
        <span>Cart</span> &gt; <span className="text-slate-950 underline font-black">Secure Checkout</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="md:col-span-2 space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Billing & Shipping Details</h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Secure Checkout
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Phone Number</label>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} required placeholder="e.g. Lagos" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="e.g. Ikeja" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Street address or apartment number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Note (Optional)</label>
            <textarea name="deliveryNote" rows={2} value={formData.deliveryNote} onChange={handleInputChange} placeholder="Gate code or instructions" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900" />
          </div>

          <button type="submit" disabled={isSubmitting || cart.length === 0} className="w-full py-4 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Place Order Securely'}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6 h-fit">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Order Summary ({itemCount})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-600 truncate max-w-[140px]">{item.title || item.name} × {item.quantity}</span>
                <span className="font-bold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2">
              <span>Total</span>
              <span className="text-amber-600">₦{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
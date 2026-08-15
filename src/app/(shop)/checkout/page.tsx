'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CreditCard, 
  Loader2, 
  Truck, 
  MapPin, 
  Phone, 
  User 
} from 'lucide-react';

interface OrderResponse {
  id: number;
  payment_url?: string;
  access_code?: string;
  reference?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: isCartLoading, clearCartState } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'Lagos',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cart || cart.items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send checkout request to backend to create order & generate Paystack payment link/ref
      const payload = {
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
      };

      const response = await apiClient<OrderResponse>('/orders/checkout', {
        method: 'POST',
        body: payload,
      });

      // 2. Clear local cart state upon successful order creation
      clearCartState();

      // 3. If backend returns a Paystack direct URL, redirect the user
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        // Fallback or direct confirmation route
        router.push(`/orders/${response.id}`);
      }
    } catch (err: unknown) {
      console.error('Checkout failed:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message || 'Failed to process checkout. Please try again.');
      } else {
        setErrorMessage('Failed to process checkout. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Sign In to Complete Order</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Please log in to your account to complete your purchase securely.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-500">Preparing checkout...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mt-2">Add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Provide delivery details and make payment via Paystack
          </p>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Shipping Form Left */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              Shipping & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08012345678"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Luxury Way, Victoria Island"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ikeja"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja (FCT)</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Kano">Kano</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Delta">Delta</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Order Overview */}
        <div className="lg:col-span-5 bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Order Overview</h2>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                <div className="relative w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.title}
                      fill
                      sizes="48px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.product.title}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-xs font-bold text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(cart?.total_price || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-xs font-semibold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-md">
                Complimentary
              </span>
            </div>
          </div>

          <div className="flex justify-between text-base font-black text-gray-900">
            <span>Total Payable</span>
            <span className="text-brand-900">
              {formatCurrency(cart?.total_price || 0)}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Paystack...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay Now • {formatCurrency(cart?.total_price || 0)}
              </>
            )}
          </button>

          <div className="flex items-center gap-2 justify-center text-xs text-gray-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Encrypted & Secured by Paystack</span>
          </div>
        </div>

      </form>
    </div>
  );
}
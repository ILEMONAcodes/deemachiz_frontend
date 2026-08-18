'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const { authenticated } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!authenticated) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          You need to be logged in to view your shopping cart and manage your items.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
        >
          Log In to Continue
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-brand-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEmpty
              ? 'Your cart is currently empty'
              : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {isEmpty ? (
        /* Empty Cart State */
        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">Your cart is empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Looks like you haven't added any luxury bedding to your cart yet.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        /* Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Item List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-base font-bold text-gray-900 hover:text-brand-600 transition-colors truncate block"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">
                      {formatCurrency(item.product.price)} each
                    </p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-200 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(cart?.total_price || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-xs font-semibold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded-md">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex justify-between text-base font-black text-gray-900">
              <span>Total</span>
              <span className="text-brand-900">
                {formatCurrency(cart?.total_price || 0)}
              </span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm active:scale-[0.99]"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-gray-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Secured Paystack Payment Gateway</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
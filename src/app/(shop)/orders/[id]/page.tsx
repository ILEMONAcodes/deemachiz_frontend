'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  ArrowLeft 
} from 'lucide-react';

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
}

interface OrderDetail {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  total_amount: number;
  created_at: string;
  shipping_address?: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.id as string;
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 1. Optional payment verification call if Paystack redirects back with a reference
  const verifyPayment = useCallback(async (ref: string) => {
    setIsVerifying(true);
    try {
      await apiClient(`/orders/verify-payment`, {
        method: 'POST',
        body: { reference: ref, order_id: orderId },
      });
    } catch (err) {
      console.error('Payment verification warning:', err);
    } finally {
      setIsVerifying(false);
    }
  }, [orderId]);

  // 2. Fetch Order Details from API
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (reference) {
        await verifyPayment(reference);
      }
      const data = await apiClient<OrderDetail>(`/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setErrorMessage('Failed to load order details. Please verify your order ID.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, reference, verifyPayment]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, fetchOrderDetails]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Sign In to View Order</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Please log in to your account to view your order receipt and status.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-brand-600">
          <Loader2 className="w-10 h-10 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {isVerifying ? 'Verifying payment with Paystack...' : 'Retrieving order receipt...'}
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
          <XCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            We couldn't retrieve the details for order #{orderId}.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';
  const isPending = order.status === 'PENDING';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Status Banner */}
        <div className="text-center mb-10">
          {isPaid ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isPending ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full text-amber-600 mb-4">
              <Clock className="w-10 h-10" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full text-red-600 mb-4">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isPaid ? 'Thank You for Your Order!' : isPending ? 'Order Received' : 'Payment Unsuccessful'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Order Reference: <span className="font-mono font-bold text-gray-800">#{order.id}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
          
          {/* Card Header Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-gray-400">Date Placed</p>
              <p className="text-xs font-semibold text-gray-800 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-gray-400">Payment Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                  isPaid
                    ? 'bg-green-100 text-green-700'
                    : isPending
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-gray-400">Total Amount</p>
              <p className="text-sm font-black text-brand-900 mt-0.5">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="p-6 divide-y divide-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Ordered Items
            </h3>
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.product.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(item.unit_price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Address Section */}
          {order.shipping_address && (
            <div className="bg-gray-50/50 border-t border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  Recipient
                </h4>
                <p className="text-sm font-bold text-gray-900">{order.shipping_address.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.shipping_address.phone}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  Delivery Destination
                </h4>
                <p className="text-sm text-gray-700">
                  {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>

      </main>
    </div>
  );
}
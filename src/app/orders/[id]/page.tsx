'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Phone,
  User,
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: {
    title: string;
    image_url?: string;
  };
}

interface Order {
  id: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  shipping_address?: {
    full_name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<Order>(`/orders/${orderId}`);
      setOrder(data);
    } catch (err: unknown) {
      console.error('Failed to fetch order details:', err);
      setError('We could not find an order matching that ID. Please double-check your order number.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Status timeline definition
  const steps = [
    { key: 'PENDING', label: 'Order Placed', description: 'Awaiting payment confirmation' },
    { key: 'PAID', label: 'Payment Confirmed', description: 'Preparing items for shipping' },
    { key: 'SHIPPED', label: 'Out for Delivery', description: 'Package is on its way' },
    { key: 'DELIVERED', label: 'Delivered', description: 'Order successfully delivered' },
  ];

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    if (order.status === 'CANCELLED') return 'cancelled';

    const orderStatusOrder = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'];
    const currentIndex = orderStatusOrder.indexOf(order.status);
    const stepIndex = orderStatusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-900" />
        <p className="text-xs font-medium">Fetching order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Order Not Found</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {error || 'The requested order does not exist or has been removed.'}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Order #{order.id}
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold ${
                isCancelled
                  ? 'bg-red-50 text-red-700'
                  : order.status === 'DELIVERED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {order.status}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <button
          onClick={fetchOrderDetails}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>

      {/* Fulfillment Status Tracker */}
      {isCancelled ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>This order has been cancelled. If you have questions, please reach out to support.</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Fulfillment Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {steps.map((step) => {
              const status = getStepStatus(step.key);
              const isDone = status === 'completed';
              const isCurrent = status === 'current';

              return (
                <div
                  key={step.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : isDone
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-white text-slate-900'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <Clock className="w-4 h-4" /> : <Package className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <p className={`text-xs font-bold ${isCurrent ? 'text-white' : isDone ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {step.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 leading-tight ${isCurrent ? 'text-slate-300' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Items & Shipping details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Purchased Items List */}
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            Order Items ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title || 'Product Image'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {item.product?.title || `Product #${item.product_id}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                </div>

                <p className="text-xs font-extrabold text-slate-900">
                  {formatCurrency(item.quantity * item.unit_price)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Paid</span>
            <span className="text-base font-black text-slate-900">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Shipping & Payment Details */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Delivery Details
            </h2>

            {order.shipping_address ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {order.shipping_address.full_name}
                </p>
                <p className="text-slate-500 leading-relaxed">
                  {order.shipping_address.address}, {order.shipping_address.city},{' '}
                  {order.shipping_address.state}
                </p>
                <p className="text-slate-500 font-mono flex items-center gap-1.5 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.shipping_address.phone}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No shipping address recorded.</p>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-300" />
              Need Assistance?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have any questions regarding delivery timeframes or need to update your address, contact our support team with your order ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
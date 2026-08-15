'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  ChevronRight, 
  Loader2, 
  ShoppingBag, 
  Calendar 
} from 'lucide-react';

interface OrderItemSummary {
  id: number;
  product: {
    id: number;
    title: string;
    image_url?: string;
  };
  quantity: number;
  unit_price: number;
}

interface OrderSummary {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  total_amount: number;
  created_at: string;
  items: OrderItemSummary[];
}

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiClient<OrderSummary[]>('/orders/');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setErrorMessage('Failed to retrieve your order history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Sign In to View Orders</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Please log in to your account to review your purchase history and track order statuses.
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

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
          Order History
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all your past bedding orders
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-brand-600">
          <Loader2 className="w-10 h-10 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-500">Fetching your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty Orders State */
        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Orders Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            You haven't placed any orders with us yet. Start exploring our luxury collection today!
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const isPaid = order.status === 'PAID';
            const isPending = order.status === 'PENDING';

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-all overflow-hidden"
              >
                {/* Card Top Banner */}
                <div className="bg-gray-50/80 border-b border-gray-100 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Order Ref</span>
                      <span className="text-xs font-mono font-bold text-gray-900">#{order.id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Date</span>
                      <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(order.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        isPaid
                          ? 'bg-green-100 text-green-700'
                          : isPending
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Total</span>
                      <span className="text-sm font-black text-brand-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content (Items) */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 sm:pb-0">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100"
                        title={item.product.title}
                      >
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
                    ))}

                    {order.items.length > 4 && (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <Link
                    href={`/orders/${order.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    View Receipt & Details
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
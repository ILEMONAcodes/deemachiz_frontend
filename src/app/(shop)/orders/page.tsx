'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Loader2, PackageCheck, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await apiClient<Order[]>('/orders/my-orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-28">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pt-28 space-y-6">
      <h1 className="text-2xl font-black text-slate-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400">Order ID: </span>
                  <span className="font-black text-slate-900">#{order.id}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400">Date: </span>
                  <span className="font-medium text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 font-bold rounded-full uppercase text-[10px]">
                  {order.status || 'Processing'}
                </span>
              </div>

              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                    <span>{item.product_name} (×{item.quantity})</span>
                    <span className="font-bold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-amber-600">₦{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
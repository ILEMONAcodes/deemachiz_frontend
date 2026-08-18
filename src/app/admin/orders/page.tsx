'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: any;
  items: any[];
}

export default function AdminOrdersDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    async function fetchAllOrders() {
      try {
        const data = await apiClient<AdminOrder[]>('/admin/orders');
        setOrders(data);
      } catch (err: any) {
        console.error('Unauthorized or failed to fetch admin orders:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    fetchAllOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiClient(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center pt-28">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-32 space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-500">You must be logged in as an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pt-28 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Admin Orders Dashboard</h1>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">Total Orders: {orders.length}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-black text-slate-900">#{order.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{order.customer_name || order.shipping_address?.first_name}</p>
                    <p className="text-[10px] text-slate-500">{order.customer_email || order.shipping_address?.email}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    {order.items?.length || 0} item(s)
                  </td>
                  <td className="p-4 font-black text-slate-900">₦{order.total_amount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full uppercase text-[10px]">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="p-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[11px] text-slate-900 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
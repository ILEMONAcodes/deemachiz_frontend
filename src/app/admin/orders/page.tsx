'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Loader2, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronDown,
  User,
  MapPin,
  Calendar
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
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<Order[]>('/orders/');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    setUpdatingId(orderId);
    try {
      await apiClient(`/orders/${orderId}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.shipping_address?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders & Fulfillment</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track customer purchases, review shipping details, and update order statuses
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-xs font-medium">Fetching orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-100 rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-slate-200"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900">
                    Order #{order.id}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                  <div className="relative">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusUpdate(order.id, e.target.value as Order['status'])
                      }
                      className={`text-xs font-bold px-3 py-1 rounded-lg border outline-none cursor-pointer appearance-none pr-7 ${
                        order.status === 'PAID'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : order.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none opacity-60" />
                  </div>
                </div>
              </div>

              {/* Order Info Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Shipping Details */}
                <div className="bg-slate-50/50 p-3 rounded-xl space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {order.shipping_address?.full_name || 'Guest User'}
                  </p>
                  {order.shipping_address && (
                    <p className="text-slate-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      {order.shipping_address.address}, {order.shipping_address.city},{' '}
                      {order.shipping_address.state} • {order.shipping_address.phone}
                    </p>
                  )}
                </div>

                {/* Total & Summary */}
                <div className="bg-slate-50/50 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Items</p>
                    <p className="font-bold text-slate-800">{order.items?.length || 0} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Amount</p>
                    <p className="font-black text-sm text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
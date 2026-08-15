'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';

interface RecentOrder {
  id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
  total_amount: number;
  created_at: string;
  shipping_address?: {
    full_name: string;
  };
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orders, products] = await Promise.all([
        apiClient<RecentOrder[]>('/orders/').catch(() => []),
        apiClient<any[]>('/products/').catch(() => []),
      ]);

      const paidOrders = orders.filter((o) => o.status === 'PAID');
      const revenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const pending = orders.filter((o) => o.status === 'PENDING').length;

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        pendingOrders: pending,
      });

      // Show top 5 most recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs font-medium">Loading store analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Products in Catalog',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metric summary for sales, catalog, and fulfillments
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-400">Latest customer purchases</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No orders registered yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const isPaid = order.status === 'PAID';
              const isPending = order.status === 'PENDING';

              return (
                <div
                  key={order.id}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl text-xs font-bold ${
                        isPaid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {order.shipping_address?.full_name || `Order #${order.id}`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid
                          ? 'bg-green-50 text-green-700'
                          : isPending
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>

                    <span className="text-xs font-black text-slate-900 min-w-[80px] text-right">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
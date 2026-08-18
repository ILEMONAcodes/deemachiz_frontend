'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  PackagePlus, 
  ShoppingBag, 
  Store, 
  LogOut,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const role = String(user?.role || '').toUpperCase().trim();
      const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATOR';

      if (!user || !isAdmin) {
        router.push('/login?callbackUrl=' + encodeURIComponent(pathname));
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p className="text-xs font-semibold tracking-wide">Verifying admin session...</p>
      </div>
    );
  }

  const role = String(user?.role || '').toUpperCase().trim();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATOR';

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products Catalog', href: '/admin/products', icon: PackagePlus },
    { name: 'Customer Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen fixed inset-y-0 left-0 flex flex-col justify-between p-4 z-10">
        <div className="space-y-6">
          {/* Brand / Logo Section */}
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">Deemachiz</h2>
                <p className="text-[10px] font-mono text-slate-400">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <Link
            href="/products"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>View Live Store</span>
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
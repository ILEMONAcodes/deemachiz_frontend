'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, LogOut, Menu, X, Package, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const { user, logout } = useAuth();
  const { itemCount, openCart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use transparent style ONLY if we are on the Home Page AND at the very top of scroll
  const isTransparent = isHomePage && !isScrolled;

  // Normalized role check to safely support different backend capitalizations
  const role = String(user?.role || '').toUpperCase().trim();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATOR';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isTransparent
          ? 'bg-transparent text-white'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span
                className={`text-xl font-black tracking-tight transition-colors ${
                  isTransparent ? 'text-white' : 'text-gray-900'
                }`}
              >
                DEEMACHIZ
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block transition-colors ${
                  isTransparent
                    ? 'bg-white/20 text-white backdrop-blur-sm border border-white/20'
                    : 'bg-brand-50 text-brand-700'
                }`}
              >
                Beddings
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-8 text-sm font-medium">
              <Link
                href="/"
                className={`transition-colors ${
                  isTransparent ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`transition-colors ${
                  isTransparent ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                Explore Products
              </Link>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Cart Trigger Button */}
            <button
              onClick={openCart || undefined}
              className={`relative p-2 transition-colors rounded-full ${
                isTransparent ? 'text-white hover:text-amber-300' : 'text-gray-700 hover:text-brand-600'
              }`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold leading-none text-white bg-brand-600 rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth Dropdown or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-full transition-all text-sm font-medium border ${
                    isTransparent
                      ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                      : 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline-block">
                    {user?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {/* Click-outside backdrop overlay */}
                {userDropdownOpen && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)} 
                  />
                )}

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1 z-50 text-gray-900 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user?.full_name || 'Valued Customer'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 transition-colors ${
                isTransparent ? 'text-white' : 'text-gray-700 hover:text-brand-600'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 text-gray-900 shadow-xl">
          <Link
            href="/"
            className="block py-2 text-sm font-semibold text-gray-800 hover:text-brand-600 border-b border-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block py-2 text-sm font-semibold text-gray-800 hover:text-brand-600 border-b border-gray-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore Products
          </Link>

          {user ? (
            <div className="pt-2 space-y-2">
              <div className="px-2 py-1 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-900">{user?.full_name}</p>
                <p className="text-[11px] text-gray-500">{user?.email}</p>
              </div>
              
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 py-2 px-2 text-xs font-bold text-amber-800 bg-amber-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  Admin Dashboard
                </Link>
              )}

              <Link
                href="/orders"
                className="flex items-center gap-2 py-2 px-2 text-sm font-medium text-gray-700 hover:text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 py-2 px-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full text-center py-2.5 px-4 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
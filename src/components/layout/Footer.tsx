'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-cart-drawer'));
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block text-xl font-black tracking-tight text-white">
              DEEMACHIZ <span className="text-brand-500">BEDDINGS</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crafting premium luxury bedsheets, duvets, and pillows designed for comfort and restful sleep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=duvets" className="hover:text-white transition-colors">
                  Duvets
                </Link>
              </li>
              <li>
                <Link href="/products?category=bedsheets" className="hover:text-white transition-colors">
                  Bedsheets
                </Link>
              </li>
              <li>
                <Link href="/products?category=pillows" className="hover:text-white transition-colors">
                  Pillows
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCartClick}
                  className="hover:text-white transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-sm font-normal text-slate-300"
                >
                  Cart View
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@deemachiz.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} DEEMACHIZ BEDDINGS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
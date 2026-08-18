'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Decode optional callback URL query parameter
  const rawCallback = searchParams.get('callbackUrl');
  const callbackUrl = rawCallback ? decodeURIComponent(decodeURIComponent(rawCallback)) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Prepare OAuth2 URL-encoded form data required by FastAPI
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      // 2. Authenticate against FastAPI backend
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Incorrect email or password');
      }

      const token = data.access_token;

      // 3. Fetch authenticated user profile details from /auth/me
      const userRes = await fetch('http://localhost:8000/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let userData = null;
      if (userRes.ok) {
        userData = await userRes.json();
      }

      console.log('Login successful. Fetched user profile:', userData);

      // 4. Update local auth context session
      login(token, userData);

      // 5. Determine user role and perform hard redirect
      const userRole = String(userData?.role || '').toLowerCase().trim();

      if (callbackUrl && callbackUrl.startsWith('/')) {
        window.location.href = callbackUrl;
      } else if (userRole === 'admin' || userRole === 'administrator') {
        window.location.href = '/admin';
      } else {
        // Fallback route for regular users
        window.location.href = '/admin'; 
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-brand-900 group-hover:text-brand-600 transition-colors">
              DEEMACHIZ
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase tracking-wider">
              Beddings
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to access your account, track orders, and manage your cart
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-2xl sm:px-10">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 mt-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [statusMessage, setStatusMessage] = useState('Listening for payment confirmation...');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setStatusMessage('Invalid order reference.');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const eventSource = new EventSource(`${baseUrl}/orders/${orderId}/stream`, {
      withCredentials: true,
    });

    // Handle SSE payment status events
    eventSource.addEventListener('payment_update', (event) => {
      const paymentStatus = event.data;

      if (paymentStatus === 'PAID') {
        setStatus('success');
        setStatusMessage('Your order has been placed and confirmed.');
        clearCart(); // Clear local cart state on successful payment
        eventSource.close();
      } else if (paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') {
        setStatus('failed');
        setStatusMessage('Payment was declined or timed out.');
        eventSource.close();
      }
    });

    eventSource.onerror = () => {
      console.warn('SSE connection closed unexpectedly');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [orderId, clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full space-y-6 border border-slate-100">
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 animate-spin text-slate-900 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-base font-extrabold text-slate-900">Verifying Payment</h1>
              <p className="text-xs text-slate-400">{statusMessage}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-slate-900">Payment Successful!</h1>
              <p className="text-xs text-slate-500">{statusMessage}</p>
              <p className="text-[11px] font-mono text-slate-400 pt-2">
                Order ID: #{orderId}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-lg font-extrabold text-slate-900">Payment Failed</h1>
              <p className="text-xs text-slate-500">{statusMessage}</p>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              Return to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
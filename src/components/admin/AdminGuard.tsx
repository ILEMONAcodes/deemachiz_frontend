'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const role = (user?.role || '').toLowerCase();
      if (!user || role !== 'admin') {
        router.push('/login?callbackUrl=%2Fadmin');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || (user?.role || '').toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <p className="text-sm animate-pulse">Verifying Admin Authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
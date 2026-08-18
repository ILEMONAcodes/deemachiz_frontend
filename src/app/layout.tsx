import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Deemachiz Store',
  description: 'E-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
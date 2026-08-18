// src/app/layout.tsx
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar'; // Adjust path if your navbar is located elsewhere (e.g., @/components/layout/Navbar)
import Footer from '@/components/layout/Footer'; // Adjust path if your footer is located elsewhere
import CartDrawer from '@/components/cart/CartDrawer';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          {/* Global Navigation Bar */}
          <Navbar />

          {/* Main Page Container */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Global Footer */}
          <Footer />
          
          {/* Global Slide-out Cart Sidebar */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
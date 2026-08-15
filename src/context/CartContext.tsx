'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartResponse } from '@/types/api';
import { apiClient, CustomApiError } from '@/lib/api-client';
import { useAuth } from './AuthContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
  Loader2,
} from 'lucide-react';

interface CartContextType {
  cart: CartResponse | null;
  isLoading: boolean;
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  updateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCartState: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // GET /cart/
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient<CartResponse>('/cart/');
      setCart(data);
    } catch (error) {
      if (error instanceof CustomApiError && error.status === 401) {
        setCart(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch cart automatically when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, fetchCart]);

  // POST /cart/items
  const addItem = async (productId: number, quantity: number = 1): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to your cart.');
    }

    setIsLoading(true);
    try {
      const updatedCart = await apiClient<CartResponse>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      setCart(updatedCart);
      openCart();
    } finally {
      setIsLoading(false);
    }
  };

  // PUT /cart/items/{product_id}
  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    setIsLoading(true);
    try {
      const updatedCart = await apiClient<CartResponse>(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      setCart(updatedCart);
    } catch {
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE /cart/items/{product_id}
  const removeItem = async (productId: number): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const updatedCart = await apiClient<CartResponse>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setCart(updatedCart);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartState = () => {
    setCart(null);
  };

  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  // Calculates total using product.price or item.price safely
  const cartTotal =
    cart?.items.reduce((total, item) => {
      const price = item.product?.price ?? (item as unknown as { price?: number }).price ?? 0;
      return total + price * item.quantity;
    }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        isOpen,
        openCart,
        closeCart,
        cartTotal,
        fetchCart,
        addItem,
        updateQuantity,
        updateItemQuantity: updateQuantity,
        removeItem,
        clearCartState,
      }}
    >
      {children}

      {/* Slide-over Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeCart}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Your Cart ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100">
              {isLoading && !cart ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                  <p className="text-xs font-medium">Updating cart...</p>
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Your cart is empty</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Explore our luxury bedding collection to add items to your cart.
                  </p>
                </div>
              ) : (
                cart.items.map((item) => {
                  const price = item.product?.price ?? (item as unknown as { price?: number }).price ?? 0;
                  const title = item.product?.title || `Product #${item.product_id}`;
                  const imageUrl = item.product?.image_url;

                  return (
                    <div key={item.product_id} className="pt-4 first:pt-0 flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 relative overflow-hidden shrink-0 border border-slate-100">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {title}
                        </h3>
                        <p className="text-xs font-black text-slate-900">
                          {formatCurrency(price)}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              disabled={isLoading}
                              className="p-1 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-[11px] font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              disabled={isLoading}
                              className="p-1 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product_id)}
                            disabled={isLoading}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart && cart.items.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Subtotal</span>
                  <span className="text-sm font-black">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Taxes and delivery fees calculated at checkout.
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

export interface CartItem {
  id: number;            
  cart_item_id?: number; 
  title?: string;
  name?: string;
  price: number;
  image_url?: string;
  category?: string;
  quantity: number;
}

interface CartResponse {
  id: number;
  user_id: number;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
      image_url?: string;
      category?: string;
      [key: string]: any;
    };
  }[];
  total_price: number;
}

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productOrId: any, quantity?: number) => Promise<void>;
  addToCart: (productOrId: any, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  setItemQuantity: (productId: number, newQuantity: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function flattenCart(data: CartResponse): CartItem[] {
  return data.items.map((item) => ({
    id: item.product_id,
    cart_item_id: item.id,
    title: item.product?.name,
    name: item.product?.name,
    price: item.product?.price ?? 0,
    image_url: item.product?.image_url,
    category: item.product?.category,
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const isAuthenticated = !!user;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Listen for global custom events to open the cart (e.g. from the Footer)
  useEffect(() => {
    const handleOpenCartEvent = () => setIsOpen(true);
    window.addEventListener('open-cart-drawer', handleOpenCartEvent);
    return () => {
      window.removeEventListener('open-cart-drawer', handleOpenCartEvent);
    };
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCart([]);
      setSubtotal(0);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient<CartResponse>('/cart/');
      setCart(flattenCart(data));
      setSubtotal(data.total_price);
    } catch (err) {
      console.error('Failed to load cart from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productOrData: any, quantity: number = 1): Promise<void> => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const productId =
      typeof productOrData === 'object' && productOrData !== null
        ? productOrData.id
        : Number(productOrData);

    const qtyToAdd =
      typeof productOrData === 'object' && productOrData !== null && productOrData.quantity
        ? productOrData.quantity
        : quantity;

    if (qtyToAdd <= 0) {
      console.warn('addItem called with a non-positive quantity.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient<CartResponse>('/cart/items', {
        method: 'POST',
        body: { product_id: productId, quantity: qtyToAdd },
      });
      setCart(flattenCart(data));
      setSubtotal(data.total_price);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: number): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const data = await apiClient<CartResponse>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setCart(flattenCart(data));
      setSubtotal(data.total_price);
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setItemQuantity = async (productId: number, newQuantity: number): Promise<void> => {
    if (newQuantity <= 0) {
      await removeItem(productId);
      return;
    }
    await removeItem(productId);
    await addItem(productId, newQuantity);
  };

  const clearCart = () => {
    setCart([]);
    setSubtotal(0);
  };

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        addItem,
        addToCart: addItem,
        removeItem,
        setItemQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
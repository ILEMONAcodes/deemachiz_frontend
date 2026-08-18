'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Loader2, Check, ShieldCheck, Truck } from 'lucide-react';

interface Product {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  stock_quantity?: number;
}

const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await apiClient<Product>(`/products/${productId}`);
      setProduct(data);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);

    try {
      const displayTitle = product.title || product.name || 'Untitled Product';
      
      // Let CartContext exclusively handle adding and opening the drawer
      await addItem({
        id: product.id,
        title: displayTitle,
        name: displayTitle,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        quantity: quantity,
      });

      setIsAdding(false);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setIsAdding(false);
    }
  };

  const handleOrderNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <p className="text-xs font-medium text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const displayTitle = product.title || product.name || 'Untitled Product';
  const hasValidImage = isValidImageUrl(product.image_url);
  const inStock = product.in_stock ?? (product.stock_quantity ? product.stock_quantity > 0 : true);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
      {/* Breadcrumb / Back button */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Product Image Section */}
        <div className="aspect-square bg-slate-100 rounded-3xl relative overflow-hidden border border-slate-200 shadow-sm">
          {hasValidImage ? (
            <Image
              src={product.image_url!}
              alt={displayTitle}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
              <ShoppingBag className="w-12 h-12" />
              <span className="text-xs uppercase font-bold tracking-wider">No Preview Available</span>
            </div>
          )}

          {product.category && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase">
              {product.category}
            </span>
          )}
        </div>

        {/* Product Information & Actions */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayTitle}
            </h1>
            <p className="text-xl font-black text-amber-600 mt-2">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="border-t border-b border-slate-200 py-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'No detailed description available for this luxury bedding item.'}
            </p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-xs font-bold text-slate-700">
              {inStock ? 'In Stock & Ready for Shipping' : 'Currently Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quantity</label>
            <div className="flex items-center max-w-[140px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors text-sm"
              >
                -
              </button>
              <span className="flex-1 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* SIDE-BY-SIDE ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !inStock}
              className="w-full py-3.5 px-4 bg-white border-2 border-slate-900 text-slate-900 text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Added!
                </>
              ) : isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add to Cart'
              )}
            </button>

            <button
              onClick={handleOrderNow}
              disabled={!inStock}
              className="w-full py-3.5 px-4 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              Order Now
            </button>
          </div>

          {/* Guarantee / Perks */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Fast Delivery</h4>
                <p className="text-[10px] text-slate-500">Nationwide shipping</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Premium Quality</h4>
                <p className="text-[10px] text-slate-500">100% hotel-grade comfort</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
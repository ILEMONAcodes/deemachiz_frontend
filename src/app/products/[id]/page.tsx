'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Minus,
  Plus,
} from 'lucide-react';

interface Product {
  id: number;
  title?: string;
  name?: string; // Fallback field name for backend compatibility
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock_quantity?: number;
}

// Helper to validate whether an image URL is safe for next/image
const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<Product>(`/products/${productId}`);
      setProduct(data);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setError('Product details could not be found or are currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-900" />
        <p className="text-xs font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Product Not Found</h1>
        <p className="text-xs text-slate-500">{error || 'The requested product does not exist.'}</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const displayTitle = product.title || product.name || 'Untitled Product';
  const hasValidImage = isValidImageUrl(product.image_url);
  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </Link>
      </div>

      {/* Product Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Product Image Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm overflow-hidden relative aspect-square">
          {hasValidImage ? (
            <Image
              src={product.image_url!}
              alt={displayTitle}
              fill
              className="object-cover rounded-2xl"
              priority
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Package className="w-12 h-12" />
              <span className="text-xs font-semibold">No Image Available</span>
            </div>
          )}
        </div>

        {/* Right: Product Specification & Actions */}
        <div className="space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            {product.category && (
              <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayTitle}
            </h1>
            <p className="text-2xl font-black text-slate-900 pt-1">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description || 'No detailed description available for this item.'}
            </p>
          </div>

          {/* Stock Indicator & Quantity Selector */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Availability</span>
              <span
                className={`font-bold inline-flex items-center gap-1 ${
                  inStock ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {inStock ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Out of Stock
                  </>
                )}
              </span>
            </div>

            {inStock && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 py-1.5 font-bold text-slate-900 bg-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart CTA */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                addedToCart
                  ? 'bg-emerald-600 text-white'
                  : inStock
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {addedToCart ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Added to Cart ({quantity})
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart ({formatCurrency(product.price * quantity)})
                </>
              )}
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-600 leading-tight">
                Fast doorstep delivery nationwide
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-600 leading-tight">
                100% Guaranteed authentic quality
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 text-sm">
              No Image
            </div>
          )}

          {/* Stock Tag */}
          {isOutOfStock && (
            <span className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs uppercase font-semibold text-brand-600 tracking-wider mb-1">
            {product.category || 'Bedding'}
          </p>
          <Link href={`/products/${product.id}`} className="focus:outline-none">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {product.description || 'Luxury quality bedding crafted for comfort.'}
          </p>
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
        <div className="pt-2">
          <p className="text-lg font-black text-brand-900">
            {formatCurrency(product.price)}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            justAdded
              ? 'bg-green-600 text-white'
              : isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              {isAdding ? 'Adding...' : 'Add'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
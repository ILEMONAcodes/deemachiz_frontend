'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Search, SlidersHorizontal, ShoppingBag, ArrowRight, Loader2, Package } from 'lucide-react';

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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');

  // Sync URL category query parameter with filter state on load or change
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.toUpperCase());
    }
  }, [categoryParam]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<Product[]>('/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const defaultCategories = ['ALL', 'DUVETS', 'BEDSHEETS', 'PILLOWS', 'BEDSPREADS'];
  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category?.toUpperCase()).filter(Boolean))
  ) as string[];
  
  const categories = Array.from(new Set([...defaultCategories, ...dynamicCategories]));

  const filteredProducts = products.filter((product) => {
    const titleText = (product.title || product.name || '').toLowerCase();
    const descriptionText = (product.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = titleText.includes(query) || descriptionText.includes(query);
    const matchesCategory =
      selectedCategory === 'ALL' ||
      product.category?.toUpperCase() === selectedCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') {
      const nameA = a.title || a.name || '';
      const nameB = b.title || b.name || '';
      return nameA.localeCompare(nameB);
    }
    return b.id - a.id;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Explore Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our complete collection of luxury bedsheets, duvets, pillows, and more.
          </p>
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900 bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap uppercase ${
                selectedCategory.toUpperCase() === cat.toUpperCase()
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-900 shadow-sm"
          >
            <option value="latest">Latest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          <p className="text-xs font-medium">Loading catalog inventory...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Products Available</h3>
          <p className="text-xs text-slate-500">
            We couldn't find any items matching your filter criteria. Try resetting your search or category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="text-xs font-bold text-slate-900 underline pt-2 inline-block"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const displayTitle = product.title || product.name || 'Untitled Product';
            const hasValidImage = isValidImageUrl(product.image_url);
            const inStock = product.in_stock ?? (product.stock_quantity ? product.stock_quantity > 0 : true);

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {hasValidImage ? (
                    <Image
                      src={product.image_url!}
                      alt={displayTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 space-y-2">
                      <ShoppingBag className="w-8 h-8" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        No Preview
                      </span>
                    </div>
                  )}

                  {product.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase">
                      {product.category}
                    </span>
                  )}

                  {!inStock && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {displayTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || 'No description provided for this luxury bedding item.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
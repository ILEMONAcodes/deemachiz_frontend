'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import {
  ShoppingBag,
  Search,
  Package,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Product {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock_quantity?: number;
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Egyptian Cotton Duvet Sets',
    subtitle: '1000-Thread Count Ultra Luxury. Pure breathability and hotel-grade elegance for perfect rest.',
    category: 'DUVETS',
    buttonText: 'EXPLORE DUVETS',
    buttonLink: '/products?category=duvets',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Silk & Satin Bed Sheets',
    subtitle: 'Silky smooth bedding sets tailored to transform your bedroom into a sanctuary.',
    category: 'BEDSHEETS',
    buttonText: 'EXPLORE BEDSHEETS',
    buttonLink: '/products?category=bedsheets',
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Ergonomic Support Pillows',
    subtitle: 'Designed for optimal neck alignment and cloud-like plush softness every night.',
    category: 'PILLOWS',
    buttonText: 'DISCOVER PILLOWS',
    buttonLink: '/products?category=pillows',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200',
  },
  {
    id: 4,
    title: 'Luxury Velvet Bedspreads',
    subtitle: 'Handcrafted premium bed covers made for warmth, comfort, and timeless beauty.',
    category: 'BEDSPREADS',
    buttonText: 'EXPLORE BEDSPREADS',
    buttonLink: '/products?category=bedspreads',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop',
  },
];

const SLIDE_DURATION = 6000;

// Helper to validate whether an image URL is safe for next/image
const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<Product[]>('/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  const activeSlide = HERO_SLIDES[currentSlide];

  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category?.toUpperCase()).filter(Boolean))
  ) as string[];

  const categories = ['ALL', ...dynamicCategories];

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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* Dynamic Hero Slideshow */}
      <section className="relative w-full h-[82vh] min-h-[580px] max-h-[850px] overflow-hidden bg-black text-white">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
              } transition-transform duration-[7000ms]`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
            </div>
          );
        })}

        <div className="relative z-20 h-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-between py-10">
          <div className="flex justify-end pt-2">
            <div className="text-xl font-light tracking-widest text-white/90 font-mono">
              <span className="font-bold text-white">0{currentSlide + 1}</span>
              <span className="text-white/40"> / 0{HERO_SLIDES.length}</span>
            </div>
          </div>

          <div className="max-w-xl my-auto space-y-5">
            <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest rounded-md backdrop-blur-md">
              {activeSlide.category}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight transition-all">
              {activeSlide.title}
            </h1>

            <p className="text-xs sm:text-sm text-gray-200 font-normal leading-relaxed line-clamp-3">
              {activeSlide.subtitle}
            </p>

            <div className="pt-2">
              <Link
                href={activeSlide.buttonLink}
                className="inline-flex items-center justify-center px-7 py-3.5 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg rounded-sm active:scale-95"
              >
                {activeSlide.buttonText}
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="w-full max-w-md relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, materials, or sizes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden transition-all"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div
                      className={`h-full bg-amber-500 transition-all ${
                        idx === currentSlide
                          ? isPlaying
                            ? 'w-full duration-[6000ms] linear'
                            : 'w-full'
                          : 'w-0 duration-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="catalog-section" className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {selectedCategory === 'ALL'
                ? 'Featured Collection'
                : `${selectedCategory.charAt(0) + selectedCategory.slice(1).toLowerCase()} Collection`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory.toUpperCase() === cat.toUpperCase()
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            <p className="text-xs font-medium">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any items matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-xs font-bold text-slate-900 underline pt-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const displayTitle = product.title || product.name || 'Untitled Product';
              const hasValidImage = isValidImageUrl(product.image_url);

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
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {displayTitle}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || 'No product description available.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
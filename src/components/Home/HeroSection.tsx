'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

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
    imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Silk & Satin Bed Sheets',
    subtitle: 'Silky smooth bedding sets tailored to transform your bedroom into a sanctuary.',
    category: 'BEDSHEETS',
    buttonText: 'SHOP BEDSHEETS',
    buttonLink: '/products?category=bedsheets',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Ergonomic Support Pillows',
    subtitle: 'Designed for optimal neck alignment and cloud-like plush softness every night.',
    category: 'PILLOWS',
    buttonText: 'DISCOVER PILLOWS',
    buttonLink: '/products?category=pillows',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Luxury Velvet Bedspreads',
    subtitle: 'Handcrafted premium bed covers made for warmth, comfort, and timeless beauty.',
    category: 'BEDSPREADS',
    buttonText: 'VIEW BEDSPREADS',
    buttonLink: '/products?category=bedspreads',
    imageUrl: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80&w=2071&auto=format&fit=crop',
  },
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-black text-white">
      
      {/* Background Slideshow Images */}
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
            {/* Dark Overlays for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* Main Content Container */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-12">
        
        {/* Top Floating Counter (Sarkinmota Style) */}
        <div className="flex justify-end pt-4">
          <div className="text-2xl font-light tracking-widest text-white/90 font-mono">
            <span className="font-bold text-white">0{currentSlide + 1}</span>
            <span className="text-white/40"> / 0{HERO_SLIDES.length}</span>
          </div>
        </div>

        {/* Middle Content */}
        <div className="max-w-2xl my-auto space-y-6">
          <span className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest rounded-md backdrop-blur-md">
            {activeSlide.category}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] transition-all">
            {activeSlide.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed line-clamp-3">
            {activeSlide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={activeSlide.buttonLink}
              className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-amber-400 transition-all transform hover:-translate-y-0.5 shadow-lg"
            >
              {activeSlide.buttonText}
            </Link>
          </div>
        </div>

        {/* Bottom Search & Slide Navigation Controls */}
        <div className="space-y-6">
          
          {/* Integrated Search Bar */}
          <div className="max-w-md">
            <form action="/products" method="GET" className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search duvets, bedsheets, pillows..."
                className="w-full pl-11 pr-4 py-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </form>
          </div>

          {/* Progress Bars & Controls Bar */}
          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            
            {/* Slide Progress Lines */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden transition-all group"
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

            {/* Play/Pause & Prev/Next Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
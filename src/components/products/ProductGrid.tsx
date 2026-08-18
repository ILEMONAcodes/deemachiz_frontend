'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/api';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        
        const data = await res.json();

        if (Array.isArray(data)) {
          const formattedProducts: Product[] = data.map((item: any) => {
            let imageUrl = '';
            const rawImage = item.image || item.image_url || item.images?.[0];

            if (typeof rawImage === 'string') {
              if (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/')) {
                imageUrl = rawImage;
              }
            } else if (rawImage && typeof rawImage === 'object' && typeof rawImage.url === 'string') {
              if (rawImage.url.startsWith('http://') || rawImage.url.startsWith('https://') || rawImage.url.startsWith('/')) {
                imageUrl = rawImage.url;
              }
            }

            return {
              ...item,
              id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
              title: item.title || item.name || 'Untitled Product',
              stock: item.stock ?? item.quantity ?? 0,
              image_url: imageUrl || item.image_url,
              image: imageUrl,
            };
          });

          setProducts(formattedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <p className="text-center py-10 text-gray-600 font-medium">Loading luxury collection...</p>;
  }

  if (products.length === 0) {
    return <p className="text-center py-10 text-gray-500">No products available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
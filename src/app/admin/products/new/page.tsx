'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'Bedding',
  });

  // Handle successful Cloudinary upload
  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      console.log('Cloudinary Image URL:', result.info.secure_url);
      setImageUrl(result.info.secure_url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      alert('Please upload a product image first.');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const payload = {
        title: formData.title,
        name: formData.title, // Fallback key for FastAPI schema
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        quantity: parseInt(formData.stock, 10), // Fallback key for FastAPI schema
        category: formData.category,
        image_url: imageUrl,
        image: imageUrl, // Fallback key for FastAPI schema
      };

      const res = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to create product');
      }

      router.push('/products');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating product:', err);
      alert(err.message || 'Failed to save product. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add New Bedding Product</h2>
          <p className="text-xs text-gray-500 mt-1">
            Fill in the details below to publish a new item to your store catalogue.
          </p>
        </div>

        {/* Cloudinary Widget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image <span className="text-red-500">*</span>
          </label>
          
          {imageUrl ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
              <Image src={imageUrl} alt="Uploaded product" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={handleUploadSuccess}
            >
              {({ open }: { open?: () => void }) => (
                <button
                  type="button"
                  onClick={() => open?.()}
                  className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Upload Image via Cloudinary
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        {/* Product Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Luxury Silk Sheet Set"
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Crafted from 100% long-staple Egyptian cotton..."
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="45000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { X, Upload, Loader2, Sparkles, Layers } from 'lucide-react';

export default function AddProductModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'Duvets',
  });

  // Exact categories matching your store filter tabs
  const categories = [
    'Duvets',
    'Bedsheets',
    'Pillows',
  ];

  const handleUploadSuccess = (result: any) => {
    setUploadingImage(false);
    if (result?.info?.secure_url) {
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
      
      console.log('Using Token for Request:', token ? `${token.substring(0, 10)}...` : 'NONE FOUND');

      const payload = {
        name: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock, 10),
        category: formData.category,
        image_url: imageUrl,
      };

      const res = await fetch(`${baseUrl}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Server responded with status ${res.status}`);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Error creating product:', err);
      alert(err.message || 'Failed to save product. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Add New Store Product</h2>
              <p className="text-xs text-slate-500">Publish a new item directly to your store catalog.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto">
          
          {/* Cloudinary Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Product Image <span className="text-red-500">*</span>
            </label>
            
            {imageUrl ? (
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                <Image src={imageUrl} alt="Uploaded product preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow hover:bg-red-700 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset="deemachiz"
                onUploadAdded={() => setUploadingImage(true)}
                onSuccess={handleUploadSuccess}
              >
                {({ open }: { open?: () => void }) => (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadingImage(true);
                      open?.();
                    }}
                    disabled={uploadingImage}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all text-slate-600 group"
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-xs font-medium text-slate-500">Opening uploader & processing...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white shadow-sm rounded-xl text-slate-700 group-hover:scale-105 transition-transform mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800">Click to upload image</span>
                        <span className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP up to 10MB</span>
                      </>
                    )}
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          {/* Product Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="e.g., Luxury Duvet Set"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Layers className="w-4 h-4 text-slate-400 mr-1" />
                <span>Product Category</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
              placeholder="Crafted from premium threads..."
            />
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (NGN)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="45000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                placeholder="10"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Publishing...' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
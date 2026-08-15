'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Loader2, PackagePlus } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: 'Bedding Sets',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await apiClient('/products/', {
        method: 'POST',
        body: {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
        },
      });

      // Redirect back to admin products list upon success
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error('Failed to create product:', err);
      if (err instanceof Error) {
        setErrorMessage(err.message || 'Failed to create product. Please try again.');
      } else {
        setErrorMessage('Failed to create product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-slate-700" />
            Create New Product
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add a new product to your store catalog
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
            Product Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Royal Silk Duvet Set"
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Price (NGN)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="any"
              value={formData.price}
              onChange={handleChange}
              placeholder="45000"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              required
              min="0"
              value={formData.stock}
              onChange={handleChange}
              placeholder="10"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 bg-white transition-all"
            >
              <option value="Bedding Sets">Bedding Sets</option>
              <option value="Pillows & Cushions">Pillows & Cushions</option>
              <option value="Duvets & Comforters">Duvets & Comforters</option>
              <option value="Bedsheets">Bedsheets</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://res.cloudinary.com/..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detail on thread count, materials, and features..."
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-all"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
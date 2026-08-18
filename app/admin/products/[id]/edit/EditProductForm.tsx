'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct } from '@/app/admin/actions';

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateProduct(product.id, null, formData);
    
    if (result.success) {
      router.push('/admin/products');
    } else {
      alert(result.message || 'Error updating product');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={product.name}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input 
                  type="text" 
                  name="slug"
                  defaultValue={product.slug}
                  className="w-full p-2 border rounded-md bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea 
                  name="shortDescription"
                  rows={2}
                  defaultValue={product.shortDescription || ''}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description</label>
                <textarea 
                  name="description"
                  rows={6}
                  defaultValue={product.description || ''}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input 
                  type="text" 
                  name="brand"
                  defaultValue={product.brand || 'Miracle Tree'}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Status & Pricing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" defaultValue={product.status} className="w-full p-2 border rounded-md">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  name="featured" 
                  defaultChecked={product.featured}
                  className="w-4 h-4 rounded text-brand-green-600 focus:ring-brand-green-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Show in Essentials (Homepage)</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01"
                  defaultValue={product.price}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  name="stock"
                  defaultValue={product.stock}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white border-t z-10 flex justify-end px-8">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-brand-forest-700 text-white px-8 py-2.5 rounded-md font-medium hover:bg-brand-forest-800 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

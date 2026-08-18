'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBundle } from '@/app/admin/actions';
import { Upload, X, Search, Plus } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function CollectionForm({ availableProducts }: { availableProducts: Product[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const addProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedProducts.find(sp => sp.id === p.id)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('bundleItems', JSON.stringify(selectedProducts.map(p => p.id)));
    
    const result = await createBundle(null, formData);
    if (result.success) {
      router.push('/admin/collections');
    } else {
      alert(result.message || 'Error creating collection');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Collection Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Collection Name *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. The Immunity Bundle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  name="description"
                  rows={4}
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe this collection..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Included Products</h2>
            
            {/* Selected Products List */}
            <div className="space-y-3">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    {product.images[0]?.url && (
                      <div className="w-12 h-12 relative rounded overflow-hidden">
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeProduct(product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedProducts.length === 0 && (
                <p className="text-sm text-gray-500 italic py-4">No products added to this collection yet.</p>
              )}
            </div>

            {/* Product Search */}
            <div className="border-t pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search products to add..."
                  className="w-full pl-9 p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {searchTerm && (
                <div className="mt-2 border rounded-md max-h-60 overflow-y-auto divide-y">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                         {product.images[0]?.url && (
                          <div className="w-8 h-8 relative rounded overflow-hidden">
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { addProduct(product); setSearchTerm(''); }}
                        className="text-brand-forest-700 bg-brand-forest-700/10 hover:bg-brand-forest-700/20 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="p-3 text-sm text-gray-500 text-center">No matching products found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pricing & Image */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Pricing & Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" className="w-full p-2 border rounded-md">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Selling Price *</label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01"
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Compare At Price (Actual Price)</label>
                <input 
                  type="number" 
                  name="compareAtPrice"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold">Cover Image</h2>
            
            <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative h-48 overflow-hidden">
              {coverImage ? (
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Click to upload image</p>
                </>
              )}
              <input 
                type="file" 
                name="images"
                accept="image/*"
                className="hidden" 
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white border-t z-10 flex justify-end px-8">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-brand-forest-700 text-white px-8 py-2.5 rounded-md font-medium hover:bg-brand-forest-800 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Collection'}
        </button>
      </div>
    </form>
  );
}

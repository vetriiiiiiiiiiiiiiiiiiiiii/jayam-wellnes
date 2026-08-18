'use client';

import { useState } from 'react';
import { updateStock } from '@/app/admin/actions';
import Image from 'next/image';

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.728-5.657l-1.414 1.414M7.072 17.657l-1.414 1.414m12.728 0l-1.414-1.414M7.072 6.343L5.658 4.929" />
  </svg>
);

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  images: { url: string }[];
}

export default function InventoryTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStockChange = (id: string, newStock: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const saveStock = async (id: string, newStock: number) => {
    setUpdating(id);
    const result = await updateStock(id, newStock);
    if (result.success) {
      setSuccess(id);
      setTimeout(() => setSuccess(null), 2000);
    } else {
      alert('Failed to update stock');
    }
    setUpdating(null);
  };

  return (
    <table className="w-full text-left">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Product</th>
          <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
          <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Available Stock</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {products.map((product) => {
          const isLowStock = product.stock <= product.lowStockThreshold;
          const isOutOfStock = product.stock === 0;

          return (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  {product.images[0]?.url ? (
                    <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 relative rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {product.sku || '-'}
              </td>
              <td className="px-6 py-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Stock
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                    onBlur={(e) => {
                       const val = parseInt(e.target.value) || 0;
                       if (val !== initialProducts.find(p => p.id === product.id)?.stock) {
                         saveStock(product.id, val);
                       }
                    }}
                    className={`w-24 p-2 text-right border rounded-md font-medium outline-none transition-colors focus:border-brand-forest-700 ${isOutOfStock ? 'text-red-600 border-red-200' : isLowStock ? 'text-yellow-600 border-yellow-200' : 'text-gray-900 border-gray-200'}`}
                  />
                  <div className="w-6 h-6 flex items-center justify-center">
                    {updating === product.id && <Loader2 className="w-4 h-4 text-brand-forest-700 animate-spin" />}
                    {success === product.id && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
        {products.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
              No products found in inventory.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

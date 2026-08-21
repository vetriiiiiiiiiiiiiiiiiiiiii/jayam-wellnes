import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    isPublished: true,
    addToHomeScreen: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
        withCredentials: true
      });
      setProducts(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/account');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      alert('You can only upload up to 5 images max.');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear input value to allow uploading the same file again if removed
    e.target.value = null;
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '', price: '', stockQuantity: '', isPublished: true, addToHomeScreen: false });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const toggleHomeScreen = async (id, currentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, 
        { addToHomeScreen: !currentStatus }, 
        { withCredentials: true }
      );
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('stockQuantity', formData.stockQuantity);
      data.append('isPublished', formData.isPublished);
      data.append('addToHomeScreen', formData.addToHomeScreen);
      
      selectedImages.forEach((file) => {
        data.append('images', file);
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/products`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, {
        withCredentials: true
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <div className="p-8 text-center pt-32 min-h-screen">Loading products...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto pt-32 min-h-screen flex gap-8">
      
      {/* Sidebar for navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 pr-8">
         <h2 className="text-2xl font-serif text-brand-forest-700 mb-8">Admin</h2>
         <nav className="space-y-4">
            <Link to="/admin" className="block text-gray-500 hover:text-brand-dark transition-colors">Dashboard</Link>
            <Link to="/admin/orders" className="block text-gray-500 hover:text-brand-dark transition-colors">Orders</Link>
            <Link to="/admin/products" className="block text-brand-dark font-bold transition-colors">Products</Link>
            <Link to="/admin/users" className="block text-gray-500 hover:text-brand-dark transition-colors">Users</Link>
         </nav>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-serif text-gray-900">Manage Products</h1>
           <button onClick={() => setIsModalOpen(true)} className="bg-brand-forest-700 text-white px-4 py-2 rounded-lg text-sm uppercase tracking-wider font-bold shadow hover:bg-brand-forest-800 transition-colors">
              + Add Product
           </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Image</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Product</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Price</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Home Screen</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                       {product.images?.length > 0 ? (
                         <div className="relative w-12 h-12">
                           <img src={product.images[0].url} alt={product.name} loading="lazy" className="w-12 h-12 object-cover rounded shadow-sm border border-gray-100" />
                           {product.images.length > 1 && (
                             <span className="absolute -top-2 -right-2 bg-brand-forest-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                               +{product.images.length - 1}
                             </span>
                           )}
                         </div>
                       ) : (
                         <img src="/placeholder.png" alt={product.name} loading="lazy" className="w-12 h-12 object-cover rounded shadow-sm border border-gray-100" />
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-gray-900 font-medium">{product.name}</p>
                       <p className="text-xs text-gray-400">{product.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">₹{product.price}</td>
                    <td className="px-6 py-4 text-gray-600">{product.stockQuantity || 0}</td>
                    <td className="px-6 py-4">
                      {product.isPublished ? (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Published</span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleHomeScreen(product.id, product.addToHomeScreen)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${product.addToHomeScreen ? 'bg-brand-forest-700' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.addToHomeScreen ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 font-semibold text-xs uppercase tracking-wider hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
             <button 
               type="button"
               onClick={closeModal}
               className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 text-xl font-bold"
             >✕</button>
             <h2 className="text-2xl font-serif mb-6">Add New Product</h2>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Name</label>
                   <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-forest-700" />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                   <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-forest-700" rows="3"></textarea>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price (₹)</label>
                      <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-forest-700" />
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stock</label>
                      <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-forest-700" />
                   </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Product Images (Max 5)</label>
                  <div className="flex flex-col items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max. 5 images)</p>
                      </div>
                      <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative flex-shrink-0 group">
                          <img src={preview} alt={`Preview ${index}`} loading="lazy" className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 pt-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 text-brand-forest-700 bg-gray-100 border-gray-300 rounded focus:ring-brand-forest-700" />
                     <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" name="addToHomeScreen" checked={formData.addToHomeScreen} onChange={handleChange} className="w-4 h-4 text-brand-forest-700 bg-gray-100 border-gray-300 rounded focus:ring-brand-forest-700" />
                     <span className="text-sm font-medium text-gray-700">Add to Home Screen</span>
                   </label>
                </div>
             </div>

             <div className="mt-8">
                <button type="submit" className="w-full bg-brand-forest-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-forest-800 transition-colors shadow-md">
                   Save Product
                </button>
             </div>
          </form>
        </div>
      )}

    </div>
  );
}


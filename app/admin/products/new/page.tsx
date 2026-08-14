'use client';

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import { createProduct } from "../../actions";

const TABS = [
  { id: 'basic', label: 'Basic Information' },
  { id: 'media', label: 'Product Media' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'specs', label: 'Specifications & Ingredients' },
  { id: 'nutrition', label: 'Nutrition & Benefits' },
  { id: 'certs', label: 'Certifications & Lab Tests' },
  { id: 'seo', label: 'SEO & Relations' }
];

export default function NewProductPage() {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Category-aware state
  const [category, setCategory] = useState('');
  const isConsumable = category === 'moringa-powder' || category === 'tea' || category === 'supplements';

  // Dynamic Array States
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);
  const [benefits, setBenefits] = useState([{ title: '', description: '' }]);
  const [certifications, setCertifications] = useState([{ name: '', issuingOrganization: '' }]);
  const [labTests, setLabTests] = useState([{ testName: '', laboratoryName: '' }]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const limitedFiles = files.slice(0, 15);
    const previews = limitedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20">
      <form action={formAction}>
        {/* Hidden inputs to pass dynamic JSON arrays to the server action */}
        <input type="hidden" name="specifications" value={JSON.stringify(specifications)} />
        <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />
        <input type="hidden" name="certifications" value={JSON.stringify(certifications)} />
        <input type="hidden" name="labTests" value={JSON.stringify(labTests)} />

        {/* Header (Sticky) */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-serif text-gray-900 leading-none">Add New Product</h1>
              <p className="text-xs text-gray-500 mt-1">Unsaved Draft</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select name="status" className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-gray-900 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>

        {state?.message && (
          <div className="m-8 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
            {state.message}
          </div>
        )}

        <div className="max-w-[1400px] mx-auto px-8 mt-8 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-32">
              {TABS.map((tab) => {
                if (!isConsumable && (tab.id === 'nutrition' || tab.id === 'specs')) return null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-gray-200 text-gray-900' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            
            {/* TAB 1: Basic Info */}
            <div className={`p-8 ${activeTab === 'basic' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" name="name" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Premium Organic Moringa Powder" />
                  {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea name="shortDescription" rows={2} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Brief summary for listings..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea name="description" rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Rich product details..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      name="categoryId" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      <option value="moringa-powder">Moringa Powder</option>
                      <option value="tea">Tea</option>
                      <option value="supplements">Supplements</option>
                      <option value="merchandise">Merchandise</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input type="text" name="brand" defaultValue="Miracle Tree" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                    <input type="text" name="slug" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="organic-moringa-powder" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma Separated)</label>
                    <input type="text" name="tags" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="Organic, Superfood, Powder" />
                  </div>
                </div>
                <div className="flex gap-6 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="featured" className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900" />
                    <span className="text-sm text-gray-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isBestSeller" className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900" />
                    <span className="text-sm text-gray-700">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isNew" className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900" />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                </div>
              </div>
            </div>

            {/* TAB 2: Media */}
            <div className={`p-8 ${activeTab === 'media' ? 'block' : 'hidden'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Product Media</h2>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">Max 15 Images</span>
              </div>
              
              <input type="file" name="images" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

              {imagePreviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="aspect-square relative rounded-xl border border-gray-200 overflow-hidden group">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-brand-dark/80 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                    {imagePreviews.length < 15 && (
                      <div onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <span className="text-xs font-medium text-gray-500">Add More</span>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => {setImagePreviews([]); if(fileInputRef.current) fileInputRef.current.value = '';}} className="text-sm text-red-600 font-medium hover:underline">
                    Clear all images
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:bg-gray-50 cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="text-sm text-brand-green-600 font-medium">Add files</span>
                  <span className="text-sm text-gray-500"> or drag and drop</span>
                </div>
              )}
            </div>

            {/* TAB 3: Pricing */}
            <div className={`p-8 ${activeTab === 'pricing' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Pricing</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                  <input type="number" step="0.01" name="price" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compare-at Price / MRP (₹)</label>
                  <input type="number" step="0.01" name="compareAtPrice" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per item (₹)</label>
                  <input type="number" step="0.01" name="costPrice" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input type="number" step="0.01" name="taxRate" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="5" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" name="taxInclusive" className="w-4 h-4 rounded text-gray-900 focus:ring-gray-900" defaultChecked />
                  <label className="text-sm font-medium text-gray-700">Price includes tax</label>
                </div>
              </div>
            </div>

            {/* TAB 4: Inventory */}
            <div className={`p-8 ${activeTab === 'inventory' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Inventory</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" name="sku" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (EAN/UPC)</label>
                  <input type="text" name="barcode" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input type="number" name="stock" defaultValue={0} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input type="number" name="lowStockThreshold" defaultValue={5} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" name="batchNumber" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                  <input type="text" name="warehouse" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
                  <input type="date" name="manufacturingDate" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" name="expiryDate" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
            </div>

            {/* TAB 5: Specs & Ingredients */}
            <div className={`p-8 ${activeTab === 'specs' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Specifications & Ingredients</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (Rich Text)</label>
                  <textarea name="ingredients" rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="100% Organic Moringa Oleifera Leaf Powder..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                    <input type="text" name="allergens" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="None" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preservatives / Additives</label>
                    <input type="text" name="preservatives" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="No Artificial Additives" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Custom Specifications</h3>
                    <button type="button" onClick={() => setSpecifications([...specifications, { name: '', value: '' }])} className="text-sm text-brand-green-600 font-medium hover:underline">+ Add Specification</button>
                  </div>
                  <div className="space-y-3">
                    {specifications.map((spec, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <input type="text" placeholder="Name (e.g. Form)" value={spec.name} onChange={e => { const newSpecs = [...specifications]; newSpecs[i].name = e.target.value; setSpecifications(newSpecs); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <input type="text" placeholder="Value (e.g. Powder)" value={spec.value} onChange={e => { const newSpecs = [...specifications]; newSpecs[i].value = e.target.value; setSpecifications(newSpecs); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <button type="button" onClick={() => { const newSpecs = [...specifications]; newSpecs.splice(i, 1); setSpecifications(newSpecs); }} className="text-red-500 hover:text-red-700 p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 6: Nutrition */}
            <div className={`p-8 ${activeTab === 'nutrition' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Nutrition Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size</label>
                  <input type="text" name="nutr_servingSize" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="1 Teaspoon (5g)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Energy / Calories</label>
                  <input type="text" name="nutr_energy" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="15 kcal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein</label>
                  <input type="text" name="nutr_protein" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="1.2g" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbohydrates</label>
                  <input type="text" name="nutr_carbohydrates" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="2.0g" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Fat</label>
                  <input type="text" name="nutr_totalFat" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="0.3g" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Fibre</label>
                  <input type="text" name="nutr_dietaryFibre" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" placeholder="1.0g" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Benefits</h3>
                  <button type="button" onClick={() => setBenefits([...benefits, { title: '', description: '' }])} className="text-sm text-brand-green-600 font-medium hover:underline">+ Add Benefit</button>
                </div>
                <div className="space-y-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1 space-y-3">
                        <input type="text" placeholder="Title (e.g. Rich in Nutrients)" value={benefit.title} onChange={e => { const newB = [...benefits]; newB[i].title = e.target.value; setBenefits(newB); }} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <textarea placeholder="Description" rows={2} value={benefit.description} onChange={e => { const newB = [...benefits]; newB[i].description = e.target.value; setBenefits(newB); }} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                      </div>
                      <button type="button" onClick={() => { const newB = [...benefits]; newB.splice(i, 1); setBenefits(newB); }} className="text-red-500 hover:text-red-700 mt-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TAB 7: Certs */}
            <div className={`p-8 ${activeTab === 'certs' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Certifications & Lab Tests</h2>
              <div className="space-y-8">
                
                {/* Certifications Builder */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Certifications</h3>
                    <button type="button" onClick={() => setCertifications([...certifications, { name: '', issuingOrganization: '' }])} className="text-sm text-brand-green-600 font-medium hover:underline">+ Add Certification</button>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((cert, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <input type="text" placeholder="Name (e.g. USDA Organic)" value={cert.name} onChange={e => { const newC = [...certifications]; newC[i].name = e.target.value; setCertifications(newC); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <input type="text" placeholder="Issuer (e.g. USDA)" value={cert.issuingOrganization} onChange={e => { const newC = [...certifications]; newC[i].issuingOrganization = e.target.value; setCertifications(newC); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <button type="button" onClick={() => { const newC = [...certifications]; newC.splice(i, 1); setCertifications(newC); }} className="text-red-500 hover:text-red-700 p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Tests Builder */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-900">Lab Tests</h3>
                    <button type="button" onClick={() => setLabTests([...labTests, { testName: '', laboratoryName: '' }])} className="text-sm text-brand-green-600 font-medium hover:underline">+ Add Lab Test</button>
                  </div>
                  <div className="space-y-3">
                    {labTests.map((test, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <input type="text" placeholder="Test Name (e.g. Heavy Metals)" value={test.testName} onChange={e => { const newT = [...labTests]; newT[i].testName = e.target.value; setLabTests(newT); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <input type="text" placeholder="Lab Name (e.g. Eurofins)" value={test.laboratoryName} onChange={e => { const newT = [...labTests]; newT[i].laboratoryName = e.target.value; setLabTests(newT); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                        <button type="button" onClick={() => { const newT = [...labTests]; newT.splice(i, 1); setLabTests(newT); }} className="text-red-500 hover:text-red-700 p-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* TAB 8: SEO */}
            <div className={`p-8 ${activeTab === 'seo' ? 'block' : 'hidden'}`}>
              <h2 className="text-xl font-medium text-gray-900 mb-6">Search Engine Optimization</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input type="text" name="seoTitle" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea name="seoDescription" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keywords</label>
                  <input type="text" name="focusKeywords" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                  <input type="text" name="canonicalUrl" className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

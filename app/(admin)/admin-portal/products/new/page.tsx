"use client"
import { useState } from "react"
import { ImageCropper } from "@/components/image-cropper"
import { createProductAction } from "@/lib/actions/product.actions"
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamically load quill to prevent SSR window errors
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function NewProductPage() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [description, setDescription] = useState("")

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-black">Add New Product</h1>
      
      <form action={createProductAction} className="space-y-8">
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-black">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Product Name</label>
              <input required name="name" type="text" className="w-full border border-gray-300 rounded p-2 text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Price (₹)</label>
              <input required name="price" type="number" step="0.01" className="w-full border border-gray-300 rounded p-2 text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <label className="flex items-center mt-2 cursor-pointer">
                <input type="checkbox" name="isPublished" className="mr-2 h-4 w-4" defaultChecked />
                <span className="text-gray-700">Published</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Product Description</label>
            <input type="hidden" name="description" value={description} />
            <div className="bg-white text-black">
               <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-64 mb-12" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-black">Product Image</h2>
          <p className="text-sm text-gray-500 mb-4">Upload and crop a primary image for this product (3:4 aspect ratio recommended).</p>
          <input type="hidden" name="imageUrl" value={imageUrl} />
          
          {imageUrl ? (
            <div className="relative w-64 h-80 rounded overflow-hidden shadow">
               <img src={imageUrl} alt="Uploaded product" className="object-cover w-full h-full" />
               <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1 shadow hover:bg-gray-100">
                  ✕
               </button>
            </div>
          ) : (
            <ImageCropper onUploadComplete={(url) => setImageUrl(url)} aspectRatio={3/4} />
          )}
        </div>

        <button type="submit" className="w-full bg-black text-white p-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition">
          Create Product
        </button>
      </form>
    </div>
  )
}

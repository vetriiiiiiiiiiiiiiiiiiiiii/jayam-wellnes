"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise(resolve => {
    image.onload = resolve;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
    }, 'image/jpeg');
  });
};
export function ImageCropper({
  onUploadComplete,
  aspectRatio = 3 / 4
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0
  });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const onFileChange = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const compressedFile = await imageCompression(new File([croppedImage], "upload.jpg", {
        type: "image/jpeg"
      }), {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      });
      const formData = new FormData();
      formData.append('file', compressedFile);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        onUploadComplete(data.url);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };
  return <div className="w-full">
      {!imageSrc ? <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:bg-gray-50 transition">
          <input type="file" accept="image/*" onChange={onFileChange} className="hidden" id="image-upload" />
          <label htmlFor="image-upload" className="cursor-pointer text-sm font-medium text-gray-700 block">
            Click to upload or drag image here
          </label>
        </div> : <div className="relative h-96 w-full bg-black rounded overflow-hidden">
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={aspectRatio} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-4">
            <button type="button" onClick={() => setImageSrc(null)} className="px-4 py-2 bg-white text-black rounded font-medium shadow" disabled={isUploading}>
              Cancel
            </button>
            <button type="button" onClick={handleUpload} className="px-4 py-2 bg-black text-white rounded font-medium shadow" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Crop & Save'}
            </button>
          </div>
        </div>}
    </div>;
}
function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
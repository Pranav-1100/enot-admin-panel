import { useState } from 'react';
import { productsAPI } from '@/lib/api';
import { handleAPIError } from '@/lib/utils';

export default function ImageUploadSections({ productId, onImagesUploaded }) {
  const [uploading, setUploading] = useState({
    hero: false,
    gallery: false,
    description: false
  });

  const handleUpload = async (type, files) => {
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      await productsAPI.uploadImages(productId, formData, type);
      alert(`${type} images uploaded successfully!`);
      if (onImagesUploaded) onImagesUploaded();
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Product Images</h3>

      {/* Hero Images */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Hero Images (Main Product Photos)
          </h4>
          <p className="text-sm text-gray-500">
            Upload 1-3 main product photos. These appear on product cards, search results, and cart. First image is the primary image.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Max 3 images • Where they appear: Product listings, featured sections, shopping cart
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload('hero', e.target.files)}
          disabled={uploading.hero}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
        {uploading.hero && (
          <p className="mt-2 text-sm text-blue-600">Uploading hero images...</p>
        )}
      </div>

      {/* Gallery Images */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Gallery Images (Detail & Angle Photos)
          </h4>
          <p className="text-sm text-gray-500">
            Upload detail shots from multiple angles. These appear in the product gallery for customers to zoom and view details.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Unlimited • Where they appear: Product detail page gallery, zoom view, image carousel
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload('gallery', e.target.files)}
          disabled={uploading.gallery}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100
            disabled:opacity-50"
        />
        {uploading.gallery && (
          <p className="mt-2 text-sm text-green-600">Uploading gallery images...</p>
        )}
      </div>

      {/* Description Images */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Description Images (Lifestyle & Usage Photos)
          </h4>
          <p className="text-sm text-gray-500">
            Upload lifestyle photos, usage instructions, ingredient benefits. These appear within the product description section.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Unlimited • Where they appear: Product description section, "How to Use", benefits/features
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload('description', e.target.files)}
          disabled={uploading.description}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100
            disabled:opacity-50"
        />
        {uploading.description && (
          <p className="mt-2 text-sm text-purple-600">Uploading description images...</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-900 mb-2">📸 Image Tips:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Hero:</strong> Clear, well-lit product shots on white/neutral background</li>
          <li>• <strong>Gallery:</strong> Show product from all angles (front, back, side, top)</li>
          <li>• <strong>Description:</strong> Show product being used, benefits, or lifestyle context</li>
          <li>• Recommended size: At least 1000x1000px for best quality</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  );
}

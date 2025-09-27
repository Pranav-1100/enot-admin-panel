import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { validateFile, generateSlug, handleAPIError } from '@/lib/utils';

export default function ProductForm({ 
  product = null, 
  categories = [], 
  brands = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      shortDescription: product?.shortDescription || '',
      categoryId: product?.categoryId || '',
      brandId: product?.brandId || '',
      price: product?.price ? (product.price / 100).toString() : '',
      comparePrice: product?.comparePrice ? (product.comparePrice / 100).toString() : '',
      sku: product?.sku || '',
      gender: product?.gender || 'unisex',
      fragranceFamily: product?.fragranceFamily || '',
      concentration: product?.concentration || 'eau_de_parfum',
      sizeMl: product?.sizeMl?.toString() || '',
      isFeatured: product?.isFeatured || false,
      isActive: product?.isActive !== false,
      requiresShipping: product?.requiresShipping !== false,
      trackQuantity: product?.trackQuantity !== false,
      quantity: product?.quantity?.toString() || '',
      lowStockThreshold: product?.lowStockThreshold?.toString() || '',
      metaTitle: product?.metaTitle || '',
      metaDescription: product?.metaDescription || '',
      tags: Array.isArray(product?.tags) ? product.tags.join(', ') : ''
    }
  });

  const watchName = watch('name');
  const watchTrackQuantity = watch('trackQuantity');

  // Auto-generate SKU and meta title when name changes
  useEffect(() => {
    if (watchName && !product) {
      const slug = generateSlug(watchName).toUpperCase();
      setValue('sku', slug);
      setValue('metaTitle', watchName);
    }
  }, [watchName, setValue, product]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = [];

    files.forEach(file => {
      const error = validateFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      alert(newErrors.join('\n'));
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      price: Math.round(parseFloat(data.price) * 100),
      comparePrice: data.comparePrice ? Math.round(parseFloat(data.comparePrice) * 100) : null,
      quantity: data.trackQuantity ? parseInt(data.quantity) || 0 : null,
      lowStockThreshold: data.lowStockThreshold ? parseInt(data.lowStockThreshold) : null,
      sizeMl: data.sizeMl ? parseInt(data.sizeMl) : null,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    onSubmit({
      productData: formData,
      newImages: selectedImages,
      existingImages: existingImages
    });
  };

  const genderOptions = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const fragranceFamilyOptions = [
    { value: '', label: 'Select fragrance family' },
    { value: 'floral', label: 'Floral' },
    { value: 'oriental', label: 'Oriental' },
    { value: 'woody', label: 'Woody' },
    { value: 'fresh', label: 'Fresh' },
    { value: 'citrus', label: 'Citrus' },
    { value: 'fruity', label: 'Fruity' }
  ];

  const concentrationOptions = [
    { value: 'eau_de_parfum', label: 'Eau de Parfum' },
    { value: 'eau_de_toilette', label: 'Eau de Toilette' },
    { value: 'eau_de_cologne', label: 'Eau de Cologne' },
    { value: 'parfum', label: 'Parfum' }
  ];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  type="text"
                  {...register('name', { 
                    required: 'Product name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <input
                  type="text"
                  {...register('shortDescription')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  rows={4}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                  })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="Detailed product description"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  {...register('gender')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fragrance Family</label>
                <select
                  {...register('fragranceFamily')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {fragranceFamilyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Concentration</label>
                <select
                  {...register('concentration')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {concentrationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Size (ml)</label>
                <input
                  type="number"
                  {...register('sizeMl', { 
                    min: { value: 1, message: 'Size must be at least 1ml' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="50"
                />
                {errors.sizeMl && <p className="mt-1 text-sm text-red-600">{errors.sizeMl.message}</p>}
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <input
                  type="text"
                  {...register('metaTitle')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <textarea
                  rows={3}
                  {...register('metaDescription')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="SEO description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  {...register('tags')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="perfume, luxury, fragrance (comma separated)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            
            <div className="space-y-4">
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {existingImages.length > 0 ? 'Add New Images' : 'Upload Images'}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {selectedImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.categoryId ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Brand *</label>
                <select
                  {...register('brandId', { required: 'Brand is required' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.brandId ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId.message}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { 
                      required: 'Price is required',
                      min: { value: 0.01, message: 'Price must be greater than 0' }
                    })}
                    className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.price ? 'border-red-300' : ''
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Compare at Price</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('comparePrice')}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU *</label>
                <input
                  type="text"
                  {...register('sku', { required: 'SKU is required' })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.sku ? 'border-red-300' : ''
                  }`}
                  placeholder="Product SKU"
                />
                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('trackQuantity')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Track quantity
                </label>
              </div>

              {watchTrackQuantity && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      {...register('quantity', { 
                        required: watchTrackQuantity ? 'Quantity is required when tracking quantity' : false,
                        min: { value: 0, message: 'Quantity cannot be negative' }
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.quantity ? 'border-red-300' : ''
                      }`}
                      placeholder="100"
                    />
                    {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                    <input
                      type="number"
                      {...register('lowStockThreshold')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Featured product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('requiresShipping')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Requires shipping
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading && <LoadingSpinner size="sm" />}
          {product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
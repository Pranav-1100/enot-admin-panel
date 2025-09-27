import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { validateFile, handleAPIError } from '@/lib/utils';

export default function BrandForm({ 
  brand = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState(brand?.logo || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: brand?.name || '',
      description: brand?.description || '',
      websiteUrl: brand?.websiteUrl || '',
      country: brand?.country || '',
      foundedYear: brand?.foundedYear || '',
      isActive: brand?.isActive !== false
    }
  });

  const currentYear = new Date().getFullYear();

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    });

    if (error) {
      alert(error);
      return;
    }

    setSelectedLogo(file);
  };

  const removeNewLogo = () => {
    setSelectedLogo(null);
  };

  const removeExistingLogo = () => {
    setExistingLogo(null);
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null
    };

    onSubmit({
      brandData: formData,
      newLogo: selectedLogo,
      existingLogo: existingLogo
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Information</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Name *</label>
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Brand name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter brand name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={4}
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell the story of this brand, its heritage, and what makes it special..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website URL</label>
                  <input
                    type="url"
                    {...register('websiteUrl', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.websiteUrl ? 'border-red-300' : ''
                    }`}
                    placeholder="https://brandname.com"
                  />
                  {errors.websiteUrl && <p className="mt-1 text-sm text-red-600">{errors.websiteUrl.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      {...register('country')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="France"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Founded Year</label>
                    <input
                      type="number"
                      min="1800"
                      max={currentYear}
                      {...register('foundedYear', {
                        min: { value: 1800, message: 'Year must be after 1800' },
                        max: { value: currentYear, message: `Year cannot be in the future` }
                      })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.foundedYear ? 'border-red-300' : ''
                      }`}
                      placeholder="1920"
                    />
                    {errors.foundedYear && <p className="mt-1 text-sm text-red-600">{errors.foundedYear.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand History & Story */}
            {brand && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Overview</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {brand.productsCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Products</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {brand.activeProductsCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Active Products</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {brand.reviewsCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Reviews</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {brand.averageRating ? brand.averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-500">Avg Rating</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Logo */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Logo</h3>
              
              <div className="space-y-4">
                {existingLogo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                    <div className="relative">
                      <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <img
                          src={existingLogo.url}
                          alt="Brand logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeExistingLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {existingLogo ? 'Replace Logo' : 'Upload Logo'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WEBP, SVG up to 5MB
                  </p>
                </div>

                {selectedLogo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Logo Preview</label>
                    <div className="relative">
                      <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <img
                          src={URL.createObjectURL(selectedLogo)}
                          alt="New brand logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeNewLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {!existingLogo && !selectedLogo && (
                  <div className="w-full h-32 bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <BuildingStorefrontIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  </div>
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
                <p className="text-xs text-gray-500">
                  Inactive brands will be hidden from the storefront
                </p>
              </div>
            </div>

            {/* Brand Info */}
            {brand && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Details</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug:</span>
                    <span className="font-mono text-xs">{brand.slug}</span>
                  </div>
                  
                  {brand.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(brand.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {brand.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated:</span>
                      <span>{new Date(brand.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Brand Guidelines</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Use high-quality logos (preferably SVG or PNG)</li>
                <li>• Ensure logo has transparent background</li>
                <li>• Include brand story and heritage in description</li>
                <li>• Verify website URL is correct and accessible</li>
                <li>• Keep brand information up to date</li>
              </ul>
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
            {brand ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
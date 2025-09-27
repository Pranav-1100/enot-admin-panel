import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { validateFile, generateSlug, handleAPIError } from '@/lib/utils';

export default function CategoryForm({ 
  category = null, 
  categories = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(category?.image || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || '',
      sortOrder: category?.sortOrder || 0,
      metaTitle: category?.metaTitle || '',
      metaDescription: category?.metaDescription || '',
      isActive: category?.isActive !== false
    }
  });

  const watchName = watch('name');

  // Auto-generate meta title when name changes
  useEffect(() => {
    if (watchName && !category) {
      setValue('metaTitle', `${watchName} - E° ENOT`);
    }
  }, [watchName, setValue, category]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFile(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (error) {
      alert(error);
      return;
    }

    setSelectedImage(file);
  };

  const removeNewImage = () => {
    setSelectedImage(null);
  };

  const removeExistingImage = () => {
    setExistingImage(null);
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      sortOrder: parseInt(data.sortOrder) || 0
    };

    onSubmit({
      categoryData: formData,
      newImage: selectedImage,
      existingImage: existingImage
    });
  };

  // Filter out current category from parent options to prevent circular reference
  const availableParentCategories = categories.filter(cat => 
    cat.id !== category?.id && !cat.parentId
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Name *</label>
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Category name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={4}
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Category description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                    <select
                      {...register('parentId')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">None (Root Category)</option>
                      {availableParentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a parent category to create a subcategory
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      {...register('sortOrder', {
                        min: { value: 0, message: 'Sort order cannot be negative' }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0"
                    />
                    {errors.sortOrder && <p className="mt-1 text-sm text-red-600">{errors.sortOrder.message}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input
                    type="text"
                    {...register('metaTitle', {
                      maxLength: { value: 60, message: 'Meta title should be under 60 characters' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="SEO title for search engines"
                  />
                  {errors.metaTitle && <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea
                    rows={3}
                    {...register('metaDescription', {
                      maxLength: { value: 160, message: 'Meta description should be under 160 characters' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="SEO description for search engines"
                  />
                  {errors.metaDescription && <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Image */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Image</h3>
              
              <div className="space-y-4">
                {existingImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    <div className="relative">
                      <img
                        src={existingImage.url}
                        alt="Category"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeExistingImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {existingImage ? 'Replace Image' : 'Upload Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>

                {selectedImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Image Preview</label>
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="New category image"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
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
                  Inactive categories will be hidden from the storefront
                </p>
              </div>
            </div>

            {/* Category Info */}
            {category && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Info</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Products:</span>
                    <span className="font-medium">{category.productsCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug:</span>
                    <span className="font-mono text-xs">{category.slug}</span>
                  </div>
                  
                  {category.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {category.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Updated:</span>
                      <span>{new Date(category.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {category ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
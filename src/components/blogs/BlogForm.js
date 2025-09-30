import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BlogEditor from './BlogEditor';
import { validateFile, generateSlug, handleAPIError } from '@/lib/utils';

export default function BlogForm({ 
  blog = null, 
  categories = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(blog?.featuredImage || '');
  const [content, setContent] = useState(blog?.content || '');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    categoryId: blog?.categoryId || '',
    featuredImageAlt: blog?.featuredImageAlt || '',
    metaTitle: blog?.metaTitle || '',
    metaDescription: blog?.metaDescription || '',
    focusKeyword: blog?.focusKeyword || '',
    isFeatured: blog?.isFeatured || false,
    status: blog?.status || 'draft'
  });

  // Auto-generate meta title from title
  useEffect(() => {
    if (formData.title && !formData.metaTitle && !blog) {
      setFormData(prev => ({
        ...prev,
        metaTitle: formData.title
      }));
    }
  }, [formData.title, blog]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

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
    setExistingImage(''); // Clear existing image if new one is selected
  };

  const removeImage = () => {
    setSelectedImage(null);
    setExistingImage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, status) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert image to base64 if new image is selected
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        onSubmit({
          ...formData,
          content,
          featuredImage: reader.result,
          status
        });
      };
      reader.readAsDataURL(selectedImage);
    } else {
      onSubmit({
        ...formData,
        content,
        featuredImage: existingImage,
        status
      });
    }
  };

  return (
    <form className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter blog title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  SEO-friendly slug will be auto-generated
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content *</label>
                <BlogEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog content here..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                <textarea
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Short summary (optional, auto-generated if empty)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to auto-generate from content
                </p>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.metaTitle.length}/60 characters)
                  </span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  maxLength={60}
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Defaults to blog title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.metaDescription.length}/160 characters)
                  </span>
                </label>
                <textarea
                  name="metaDescription"
                  rows={3}
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Defaults to excerpt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Focus Keyword</label>
                <input
                  type="text"
                  name="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., best men's cologne 2025"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
            
            <div className="space-y-4">
              {(existingImage || selectedImage) && (
                <div className="relative">
                  <img
                    src={selectedImage ? URL.createObjectURL(selectedImage) : existingImage}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {!existingImage && !selectedImage && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">No image selected</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">Image Alt Text</label>
                <input
                  type="text"
                  name="featuredImageAlt"
                  value={formData.featuredImageAlt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the image"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Uncategorized</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Featured post
                </label>
              </div>

              {blog && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Reading time will be auto-calculated
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    View count: {blog.viewCount || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        
        {(!blog || blog.status === 'draft') && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" />}
            Save as Draft
          </button>
        )}
        
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'published')}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <LoadingSpinner size="sm" />}
          {blog ? 'Update & Publish' : 'Publish'}
        </button>
      </div>
    </form>
  );
}
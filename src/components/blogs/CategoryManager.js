import { useState } from 'react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';

export default function CategoryManager({ 
  categories = [], 
  onRefresh,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    sortOrder: 0,
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      sortOrder: 0,
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const categoryData = {
        name: formData.name,
        isActive: formData.isActive
      };

      // Add optional fields only if they have values
      if (formData.description) categoryData.description = formData.description;
      if (formData.metaTitle) categoryData.metaTitle = formData.metaTitle;
      if (formData.metaDescription) categoryData.metaDescription = formData.metaDescription;
      if (formData.sortOrder) categoryData.sortOrder = parseInt(formData.sortOrder);

      if (editingId) {
        await onUpdateCategory(editingId, categoryData);
        alert('Category updated successfully!');
      } else {
        await onCreateCategory(categoryData);
        alert('Category created successfully!');
      }
      
      resetForm();
      onRefresh();
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await onDeleteCategory(categoryId);
      alert('Category deleted successfully!');
      onRefresh();
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="e.g., Fragrance Guides"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Category description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  maxLength={60}
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="SEO title (60 chars)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="metaDescription"
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="SEO description (160 chars)"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <LoadingSpinner size="sm" />}
                {editingId ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sort Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 font-mono">
                    {category.slug}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {category.postCount || 0}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {category.sortOrder || 0}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Category"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Category"
                      disabled={category.postCount > 0}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
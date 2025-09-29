import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { categoriesAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getStatusColor, formatRelativeTime, handleAPIError } from '@/lib/utils';

export default function CategoriesIndex() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll({ flat: false, includeInactive: true });
      
      // FIX 1: Handle nested data structure correctly
      const categoriesData = response.data.data?.categories || response.data.categories || [];
      console.log('Categories fetched:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesAPI.delete(categoryId);
      await fetchCategories();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const CategoryForm = ({ category, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || '',
      sortOrder: category?.sortOrder || 0,
      metaTitle: category?.metaTitle || '',
      metaDescription: category?.metaDescription || '',
      isActive: category?.isActive !== false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        // FIX 2: Convert empty string to null for parentId
        const submitData = {
          ...formData,
          parentId: formData.parentId || null,  // Convert empty string to null
          sortOrder: parseInt(formData.sortOrder) || 0
        };

        if (category) {
          await categoriesAPI.update(category.id, submitData);
        } else {
          await categoriesAPI.create(submitData);
        }
        onSuccess();
        onClose();
      } catch (error) {
        alert(handleAPIError(error));
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {category ? 'Edit Category' : 'Create Category'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">None (Root Category)</option>
                {categories.filter(cat => cat.id !== category?.id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                {category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCategories = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ marginLeft: `${level * 20}px` }}>
              <div className="flex-shrink-0 h-12 w-12">
                {category.image ? (
                  <img
                    className="h-12 w-12 rounded-lg object-cover"
                    src={category.image.url}
                    alt={category.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {category.productsCount || category.productCount || 0} products
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              getStatusColor(category.isActive ? 'active' : 'inactive')
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatRelativeTime(category.createdAt)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button
              onClick={() => setEditingCategory(category)}
              className="text-blue-600 hover:text-blue-900"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </td>
        </tr>
        {category.children && category.children.length > 0 && 
          renderCategories(category.children, level + 1)
        }
      </div>
    ));
  };

  return (
    <>
      <Head>
        <title>Categories - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-700">Organize your products into categories</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Category
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderCategories(categories.filter(cat => !cat.parentId))}
                </tbody>
              </table>

              {categories.length === 0 && (
                <div className="text-center py-12">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                      Add Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CategoryForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchCategories}
        />
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={fetchCategories}
        />
      )}
    </>
  );
}
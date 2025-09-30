import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { blogCategoriesAPI } from '@/lib/api';
import CategoryManager from '@/components/blogs/CategoryManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';

export default function BlogCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await blogCategoriesAPI.getAll({ includeInactive: true });
      const categoriesData = response.data.data?.categories || response.data.categories || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    await blogCategoriesAPI.create(categoryData);
  };

  const handleUpdateCategory = async (id, categoryData) => {
    await blogCategoriesAPI.update(id, categoryData);
  };

  const handleDeleteCategory = async (id) => {
    await blogCategoriesAPI.delete(id);
  };

  return (
    <>
      <Head>
        <title>Blog Categories - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/blogs" 
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Blog Categories</h1>
              <p className="mt-1 text-sm text-gray-600">
                Organize your blog posts with categories
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Category Management</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Categories help organize blog posts by topic</li>
                  <li>SEO-friendly slugs are auto-generated from category names</li>
                  <li>Categories with existing posts cannot be deleted</li>
                  <li>Sort order determines display order on your site</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Categories</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {categories.length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Categories</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              {categories.filter(c => c.isActive).length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Posts</div>
            <div className="mt-2 text-3xl font-semibold text-blue-600">
              {categories.reduce((sum, c) => sum + (c.postCount || 0), 0)}
            </div>
          </div>
        </div>

        {/* Category Manager */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <CategoryManager
            categories={categories}
            onRefresh={fetchCategories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>
    </>
  );
}
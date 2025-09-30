import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { blogsAPI, blogCategoriesAPI } from '@/lib/api';
import BlogTable from '@/components/blogs/BlogTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { debounce, handleAPIError } from '@/lib/utils';

export default function BlogsIndex() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // Changed from '' to 'all' to show both drafts and published
    categoryId: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build params object, only include non-empty values
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      // Only add filters if they have values
      if (filters.status) params.status = filters.status;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.featured) params.featured = filters.featured;

      const response = await blogsAPI.getAll(params);
      
      console.log('Blogs API response:', response.data);
      
      // Handle nested response structure: response.data.data.data
      const blogsData = response.data.data?.data || response.data.data || [];
      const paginationData = response.data.data?.pagination || response.data.pagination || {};
      
      setBlogs(blogsData);
      setPagination(prev => ({
        ...prev,
        total: paginationData.totalItems || 0,
        totalPages: paginationData.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await blogCategoriesAPI.getAll();
      const categoriesData = response.data.data?.categories || response.data.categories || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (blogId) => {
    try {
      await blogsAPI.delete(blogId);
      await fetchBlogs();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handlePublish = async (blogId) => {
    try {
      await blogsAPI.publish(blogId);
      await fetchBlogs();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handleUnpublish = async (blogId) => {
    try {
      // Update blog status to draft
      await blogsAPI.update(blogId, { status: 'draft' });
      await fetchBlogs();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      categoryId: '',
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <Head>
        <title>Blog Posts - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your blog content ({pagination.total} total)
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/blogs/categories"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Categories
            </Link>
            <Link
              href="/blogs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Blog Post
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Featured</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
              >
                <option value="">All Posts</option>
                <option value="true">Featured Only</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Posts</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">{pagination.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Published</div>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              {blogs.filter(b => b.status === 'published').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">On this page</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Drafts</div>
            <div className="mt-2 text-3xl font-semibold text-yellow-600">
              {blogs.filter(b => b.status === 'draft').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">On this page</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Featured</div>
            <div className="mt-2 text-3xl font-semibold text-purple-600">
              {blogs.filter(b => b.isFeatured).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">On this page</div>
          </div>
        </div>

        {/* Blog Table */}
        <BlogTable
          blogs={blogs}
          loading={loading}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
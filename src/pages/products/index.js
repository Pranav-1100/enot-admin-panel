import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { productsAPI, categoriesAPI, brandsAPI, tagsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, getStatusColor, debounce, handleAPIError } from '@/lib/utils';

export default function ProductsIndex() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // Backend expects: newest, oldest, price_low, price_high, rating, featured
  const [filters, setFilters] = useState({
    categoryId: '',
    brandId: '',
    tagId: '',
    isActive: '',
    isFeatured: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        sortBy, // Backend expects: newest, oldest, price_low, price_high, rating, featured
        ...filters
      };

      const response = await productsAPI.getAll(params);
      
      console.log('Products API response:', response.data);
      
      // FIX: Handle the correct response structure
      const productsData = response.data.data || response.data.products || [];
      const paginationData = response.data.pagination || {};
      
      setProducts(productsData);
      setPagination(prev => ({
        ...prev,
        total: paginationData.totalItems || 0,
        totalPages: paginationData.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, sortBy, filters]);

  const fetchFiltersData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes, tagsRes] = await Promise.all([
        categoriesAPI.getAll({ flat: true }),
        brandsAPI.getAll({ limit: 100 }),
        tagsAPI.getAll()
      ]);

      // Handle nested data structures
      const categoriesData = categoriesRes.data.data?.categories || categoriesRes.data.categories || [];
      const brandsData = brandsRes.data.data?.brands || brandsRes.data.data || brandsRes.data.brands || [];
      const tagsData = tagsRes.data.tags || tagsRes.data.data?.tags || [];

      setCategories(categoriesData);
      setBrands(brandsData);
      setTags(tagsData.filter(t => t.type === 'product' || t.type === 'both'));
    } catch (error) {
      console.error('Error fetching filters data:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchProducts();
    }, 500);

    if (searchQuery !== undefined) {
      debouncedSearch();
    }
  }, [searchQuery]);

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.delete(productId);
      await fetchProducts();
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
      categoryId: '',
      brandId: '',
      tagId: '',
      isActive: '',
      isFeatured: ''
    });
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <>
      <Head>
        <title>Products - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your product catalog ({pagination.total} total)
            </p>
          </div>
          <Link
            href="/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {/* First Row - Search and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="inline h-4 w-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name, SKU, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ArrowsUpDownIcon className="inline h-4 w-4 mr-1" />
                Sort By
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          {/* Second Row - Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FunnelIcon className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.brandId}
                onChange={(e) => handleFilterChange('brandId', e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.tagId}
                onChange={(e) => handleFilterChange('tagId', e.target.value)}
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || filters.categoryId || filters.brandId || filters.tagId || filters.isActive) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                </span>
              )}
              {filters.categoryId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Category: {categories.find(c => c.id === filters.categoryId)?.name}
                </span>
              )}
              {filters.brandId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Brand: {brands.find(b => b.id === filters.brandId)?.name}
                </span>
              )}
              {filters.tagId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  Tag: {tags.find(t => t.id === filters.tagId)?.name}
                </span>
              )}
              {filters.isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                  Status: {filters.isActive === 'true' ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category / Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
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
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              {product.images?.[0] ? (
                                <img
                                  className="h-16 w-16 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                SKU: {product.sku}
                              </div>
                              {product.sizeMl && (
                                <div className="text-xs text-gray-400">
                                  {product.sizeMl}ml
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.category?.name || 'No Category'}
                          </div>
                          {product.brand && (
                            <div className="text-xs text-gray-500">
                              {product.brand.name}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <>
                              <div className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.comparePrice)}
                              </div>
                              <div className="text-xs text-green-600">
                                {Math.round((1 - product.price / product.comparePrice) * 100)}% off
                              </div>
                            </>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center text-xs">
                              <span className="font-medium">{product.gender || 'N/A'}</span>
                            </div>
                            {product.fragranceFamily && (
                              <div className="text-xs text-gray-400 capitalize">
                                {product.fragranceFamily}
                              </div>
                            )}
                            {product.concentration && (
                              <div className="text-xs text-gray-400 capitalize">
                                {product.concentration.replace(/_/g, ' ')}
                              </div>
                            )}
                            {product.inStock !== undefined && (
                              <div className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusColor(product.isActive ? 'active' : 'inactive')
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                            
                            {product.isFeatured && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                            
                            {product.averageRating && parseFloat(product.averageRating) > 0 && (
                              <div className="text-xs text-gray-500">
                                ⭐ {parseFloat(product.averageRating).toFixed(1)} ({product.reviewCount})
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Product"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Product"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || filters.categoryId || filters.brandId
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating a new product.'}
                  </p>
                  {!searchQuery && !filters.categoryId && !filters.brandId && (
                    <div className="mt-6">
                      <Link
                        href="/products/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Product
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={pagination.page <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={pagination.page >= pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
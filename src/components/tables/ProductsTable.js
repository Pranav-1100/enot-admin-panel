import { useState } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon,
  EyeIcon,
  StarIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, getStatusColor, handleAPIError, truncate } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductsTable({ 
  products = [], 
  loading = false,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  showActions = true,
  showBulkActions = false,
  pagination = null,
  onPageChange
}) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      alert('Please select products first');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      await onBulkAction(action, selectedProducts);
      setSelectedProducts([]);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      await onDelete(productId);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {showBulkActions && selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} products selected
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50"
              >
                {bulkActionLoading && <LoadingSpinner size="sm" />}
                Activate
              </button>
              
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
              >
                {bulkActionLoading && <LoadingSpinner size="sm" />}
                Deactivate
              </button>
              
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
              >
                {bulkActionLoading && <LoadingSpinner size="sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showBulkActions && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {showBulkActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.primaryImage ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.primaryImage}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {truncate(product.name, 40)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          SKU: {product.sku}
                          <button
                            onClick={() => copyToClipboard(product.sku)}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                            title="Copy SKU"
                          >
                            <ClipboardDocumentIcon className="h-3 w-3" />
                          </button>
                        </div>
                        {product.shortDescription && (
                          <div className="text-xs text-gray-400 mt-1">
                            {truncate(product.shortDescription, 50)}
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
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.comparePrice)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.trackQuantity ? (
                        <span className={product.quantity <= (product.lowStockThreshold || 10) ? 'text-red-600' : ''}>
                          {product.quantity || 0}
                        </span>
                      ) : (
                        <span className="text-green-600">∞</span>
                      )}
                    </div>
                    {product.trackQuantity && product.quantity <= (product.lowStockThreshold || 10) && (
                      <div className="text-xs text-red-500">Low stock</div>
                    )}
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
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.averageRating ? (
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-900">
                          {product.averageRating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">
                          ({product.reviewsCount || 0})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No reviews</span>
                    )}
                  </td>
                  
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {onView && (
                          <button
                            onClick={() => onView(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Product"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        {onEdit && (
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        )}
                        
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
              Get started by creating a new product.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && onPageChange && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
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
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
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
      </div>
    </div>
  );
}
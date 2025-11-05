import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, productsAPI } from '@/lib/api';
import {
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CubeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function InventoryIndex() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, low-stock, out-of-stock
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    recentMovements: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInventoryData();
  }, [currentPage, activeTab, searchQuery]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Fetch products with inventory data
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      };

      // Add stock filters based on active tab
      if (activeTab === 'low-stock') {
        params.lowStock = true;
      } else if (activeTab === 'out-of-stock') {
        params.outOfStock = true;
      }

      const response = await productsAPI.getAll(params);
      const data = response.data.data || response.data;

      setProducts(data.products || data.items || data);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / itemsPerPage));
      setTotalItems(data.total || 0);

      // Fetch inventory stats
      try {
        const statsResponse = await inventoryAPI.getStats();
        const statsData = statsResponse.data.data || statsResponse.data;
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setAdjustModalOpen(true);
  };

  const handleViewMovements = async (product) => {
    setSelectedProduct(product);
    try {
      const response = await inventoryAPI.getMovements(product.id);
      const data = response.data.data || response.data;
      setMovements(data.movements || data);
      setMovementsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movements:', error);
      setMovements([]);
      setMovementsModalOpen(true);
    }
  };

  const getStockStatus = (product) => {
    const stock = product.stock || 0;
    const lowStockThreshold = product.lowStockThreshold || 10;

    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (stock <= lowStockThreshold) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage product stock levels
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                  <dd className="text-lg font-semibold text-yellow-600">{stats.lowStockCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArchiveBoxIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                  <dd className="text-lg font-semibold text-red-600">{stats.outOfStockCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recent Movements</dt>
                  <dd className="text-lg font-semibold text-blue-600">{stats.recentMovements}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveTab('low-stock')}
            className={`${
              activeTab === 'low-stock'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Low Stock
            {stats.lowStockCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs font-medium">
                {stats.lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('out-of-stock')}
            className={`${
              activeTab === 'out-of-stock'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            Out of Stock
            {stats.outOfStockCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs font-medium">
                {stats.outOfStockCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Low Stock Alert</th>
                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-8 text-center text-sm text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <tr key={product.id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex items-center">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-gray-500">${product.price}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {product.sku || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className="font-medium text-gray-900">{product.stock || 0}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {product.lowStockThreshold || 10} units
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                            <button
                              onClick={() => handleAdjustStock(product)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Adjust Stock
                            </button>
                            <button
                              onClick={() => handleViewMovements(product)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> products
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedProduct && (
        <AdjustStockModal
          product={selectedProduct}
          onClose={() => {
            setAdjustModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            fetchInventoryData();
            setAdjustModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Movements Modal */}
      {movementsModalOpen && selectedProduct && (
        <MovementsModal
          product={selectedProduct}
          movements={movements}
          onClose={() => {
            setMovementsModalOpen(false);
            setSelectedProduct(null);
            setMovements([]);
          }}
        />
      )}
    </div>
  );
}

// Adjust Stock Modal Component
function AdjustStockModal({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    adjustment: '',
    reason: 'restock',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { value: 'restock', label: 'Restock' },
    { value: 'sale', label: 'Sale' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'return', label: 'Return' },
    { value: 'adjustment', label: 'Manual Adjustment' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const adjustment = parseInt(formData.adjustment);
    if (isNaN(adjustment) || adjustment === 0) {
      setError('Please enter a valid adjustment amount');
      return;
    }

    const newStock = (product.stock || 0) + adjustment;
    if (newStock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      setSaving(true);
      await inventoryAPI.adjustStock(product.id, {
        adjustment,
        reason: formData.reason,
        notes: formData.notes,
        newStock
      });
      onSuccess();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError(error.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  const adjustment = parseInt(formData.adjustment) || 0;
  const newStock = (product.stock || 0) + adjustment;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Adjust Stock - {product.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="text-lg font-semibold text-gray-900">{product.stock || 0}</span>
              </div>
              {adjustment !== 0 && (
                <>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Adjustment:</span>
                    <span className={`text-lg font-semibold ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adjustment > 0 ? '+' : ''}{adjustment}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900">New Stock:</span>
                    <span className="text-lg font-bold text-indigo-600">{newStock}</span>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.adjustment}
                    onChange={(e) => setFormData({ ...formData, adjustment: e.target.value })}
                    placeholder="Use + for increase, - for decrease"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter positive number to increase stock, negative to decrease
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <select
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {reasons.map(reason => (
                      <option key={reason.value} value={reason.value}>{reason.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Optional notes about this adjustment..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.adjustment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Movements Modal Component
function MovementsModal({ product, movements, onClose }) {
  const getMovementTypeColor = (type) => {
    const colors = {
      restock: 'bg-green-100 text-green-800',
      sale: 'bg-blue-100 text-blue-800',
      damaged: 'bg-red-100 text-red-800',
      return: 'bg-yellow-100 text-yellow-800',
      adjustment: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Stock Movement History - {product.name}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              {movements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No movement history available</p>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Change</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">New Stock</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {movements.map((movement, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(movement.createdAt || movement.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getMovementTypeColor(movement.reason || movement.type)}`}>
                              {movement.reason || movement.type}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`font-medium ${movement.adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.adjustment > 0 ? '+' : ''}{movement.adjustment}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                            {movement.newStock}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {movement.notes || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {movement.user?.name || movement.userName || 'System'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

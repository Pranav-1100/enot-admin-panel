import { useState, useEffect, useCallback } from "react";

import Head from "next/head";

import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

import { inventoryAPI } from "@/lib/api";

import LoadingSpinner from "@/components/common/LoadingSpinner";

import { formatDate, handleAPIError } from "@/lib/utils";

export default function InventoryIndex() {
  const [inventory, setInventory] = useState([]);

  const [lowStockItems, setLowStockItems] = useState([]);

  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all"); // all, low-stock, movements

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    categoryId: "",

    brandId: "",

    sortBy: "name",

    sortOrder: "asc",
  });

  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const [bulkAdjustMode, setBulkAdjustMode] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,

    limit: 50,

    total: 0,

    totalPages: 0,
  });

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,

        limit: pagination.limit,

        search: searchQuery,

        ...filters,
      };

      const response = await inventoryAPI.getAll(params);

      console.log('Inventory API response:', response.data);

      // FIX: Correct data path - response.data.data.data
      const inventoryData =
        response.data.data?.data || response.data.data?.inventory || response.data.inventory || [];

      const paginationData =
        response.data.data?.pagination || response.data.pagination || {};

      // Map the field names from API to what the UI expects
      const mappedInventory = inventoryData.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.productName, // API uses productName, UI expects name
        sku: item.sku,
        stock: item.availableQuantity, // API uses availableQuantity, UI expects stock
        quantity: item.quantity,
        reservedQuantity: item.reservedQuantity,
        availableQuantity: item.availableQuantity,
        trackQuantity: item.trackQuantity,
        lowStockThreshold: item.lowStockThreshold,
        isLowStock: item.isLowStock,
        category: item.category,
        brand: item.brand,
        updatedAt: item.updatedAt
      }));

      setInventory(mappedInventory);

      setPagination((prev) => ({
        ...prev,

        total: paginationData.totalItems || mappedInventory.length,

        totalPages: paginationData.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching inventory:", error);

      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await inventoryAPI.getLowStock();

      const lowStockData =
        response.data.data?.data || response.data.data?.products || response.data.products || [];

      // Map field names for low stock items
      const mappedLowStock = lowStockData.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.productName || item.name,
        sku: item.sku,
        stock: item.availableQuantity || item.stock,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        category: item.category,
        brand: item.brand
      }));

      setLowStockItems(mappedLowStock);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  }, []);

  const fetchMovements = useCallback(async () => {
    try {
      const params = { limit: 100, sortBy: "createdAt", sortOrder: "desc" };

      const response = await inventoryAPI.getMovements(params);

      const movementsData =
        response.data.data?.movements || response.data.movements || [];

      setMovements(movementsData);
    } catch (error) {
      console.error("Error fetching movements:", error);
    }
  }, []);

  useEffect(() => {
    fetchInventory();

    fetchLowStock();
  }, [fetchInventory, fetchLowStock]);

  useEffect(() => {
    if (activeTab === "movements") {
      fetchMovements();
    }
  }, [activeTab, fetchMovements]);

  const handleAdjustStock = async (productId, adjustment, reason) => {
    try {
      await inventoryAPI.adjustStock({
        productId,

        adjustment,

        reason,
      });

      await fetchInventory();

      await fetchLowStock();

      if (activeTab === "movements") await fetchMovements();

      setAdjustingProduct(null);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handleBulkAdjust = async (adjustment, reason) => {
    if (selectedProducts.length === 0) {
      alert("Please select products to adjust");

      return;
    }

    try {
      await inventoryAPI.bulkAdjust({
        productIds: selectedProducts,

        adjustment,

        reason,
      });

      await fetchInventory();

      await fetchLowStock();

      setSelectedProducts([]);

      setBulkAdjustMode(false);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const StockAdjustModal = ({ product, onClose, onAdjust }) => {
    const [adjustment, setAdjustment] = useState("");

    const [reason, setReason] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      setIsLoading(true);

      await onAdjust(product.id, parseInt(adjustment), reason);

      setIsLoading(false);
    };

    const newStock = (product.stock || 0) + parseInt(adjustment || 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Adjust Stock: {product.name}
          </h3>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Current Stock</div>

            <div className="text-2xl font-bold text-gray-900">
              {product.stock || 0} units
            </div>

            {product.lowStockThreshold && (
              <div className="text-xs text-gray-500 mt-1">
                Low stock threshold: {product.lowStockThreshold}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adjustment *
              </label>

              <input
                type="number"
                required
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter positive or negative number"
              />

              <p className="mt-1 text-xs text-gray-500">
                Use positive numbers to add stock, negative to reduce
              </p>
            </div>

            {adjustment && (
              <div
                className={`p-3 rounded-lg ${
                  newStock >= 0 ? "bg-blue-50" : "bg-red-50"
                }`}
              >
                <div className="text-sm font-medium">
                  New Stock:{" "}
                  <span
                    className={newStock >= 0 ? "text-blue-700" : "text-red-700"}
                  >
                    {newStock} units
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason *
              </label>

              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select reason...</option>

                <option value="restock">Restock/Replenishment</option>

                <option value="sale">Sale/Order Fulfillment</option>

                <option value="damaged">Damaged/Defective</option>

                <option value="lost">Lost/Missing</option>

                <option value="return">Customer Return</option>

                <option value="correction">Inventory Correction</option>

                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
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
                Adjust Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getStockStatus = (product) => {
    const stock = product.stock || 0;

    const threshold = product.lowStockThreshold || 10;

    if (stock === 0)
      return { color: "bg-red-100 text-red-800", label: "Out of Stock" };

    if (stock <= threshold)
      return { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" };

    return { color: "bg-green-100 text-green-800", label: "In Stock" };
  };

  return (
    <>
      <Head>
        <title>Inventory Management - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Inventory Management
          </h1>

          <p className="mt-2 text-sm text-gray-700">
            Track stock levels, adjust inventory, and monitor movements
          </p>
        </div>

        {/* Stats Cards */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Total Products
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {pagination.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Low Stock Items
                </div>

                <div className="text-2xl font-semibold text-yellow-600">
                  {lowStockItems.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Out of Stock
                </div>

                <div className="text-2xl font-semibold text-red-600">
                  {inventory.filter((p) => (p.stock || 0) === 0).length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ArrowPathIcon className="h-8 w-8 text-green-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Recent Movements
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {movements.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}

        <div className="bg-white shadow sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("all")}
                className={`${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Inventory
              </button>

              <button
                onClick={() => setActiveTab("low-stock")}
                className={`${
                  activeTab === "low-stock"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                Low Stock Alerts
                {lowStockItems.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                    {lowStockItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("movements")}
                className={`${
                  activeTab === "movements"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Stock Movements
              </button>
            </nav>
          </div>

          {/* Tab Content */}

          <div className="p-6">
            {activeTab === "all" && (
              <div className="space-y-4">
                {/* Search */}

                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <input
                        type="text"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    onClick={() => setBulkAdjustMode(!bulkAdjustMode)}
                    className={`ml-4 px-4 py-2 border rounded-md text-sm font-medium ${
                      bulkAdjustMode
                        ? "border-blue-500 text-blue-700 bg-blue-50"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {bulkAdjustMode ? "Cancel Bulk Adjust" : "Bulk Adjust"}
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {bulkAdjustMode && (
                            <th className="px-6 py-3 text-left">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts(
                                      inventory.map((p) => p.id)
                                    );
                                  } else {
                                    setSelectedProducts([]);
                                  }
                                }}
                                checked={
                                  selectedProducts.length === inventory.length
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                          )}

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
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
                        {inventory.map((product) => {
                          const status = getStockStatus(product);

                          return (
                            <tr key={product.id} className="hover:bg-gray-50">
                              {bulkAdjustMode && (
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(
                                      product.id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProducts([
                                          ...selectedProducts,
                                          product.id,
                                        ]);
                                      } else {
                                        setSelectedProducts(
                                          selectedProducts.filter(
                                            (id) => id !== product.id
                                          )
                                        );
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                </td>
                              )}

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {product.images?.[0] ? (
                                      <img
                                        className="h-10 w-10 rounded object-cover"
                                        src={product.images[0].url}
                                        alt={product.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                        <PhotoIcon className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {product.sku}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {product.stock || 0} units
                                </div>

                                {product.lowStockThreshold && (
                                  <div className="text-xs text-gray-500">
                                    Threshold: {product.lowStockThreshold}
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}
                                >
                                  {status.label}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => setAdjustingProduct(product)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Adjust Stock
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {inventory.length === 0 && (
                      <div className="text-center py-12">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />

                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No inventory items
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Products will appear here as they are added.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "low-stock" && (
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />

                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          {lowStockItems.length} product
                          {lowStockItems.length !== 1 ? "s" : ""} running low on
                          stock
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lowStockItems.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {product.images?.[0] ? (
                            <img
                              className="h-12 w-12 rounded object-cover"
                              src={product.images[0].url}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {product.sku}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setAdjustingProduct(product)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Restock
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {product.stock || 0}
                          </div>

                          <div className="text-xs text-gray-500">
                            units remaining
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">Threshold</div>

                          <div className="text-sm font-medium text-gray-900">
                            {product.lowStockThreshold}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {lowStockItems.length === 0 && (
                  <div className="text-center py-12 bg-green-50 rounded-lg">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-green-400" />

                    <h3 className="mt-2 text-sm font-medium text-green-900">
                      All good!
                    </h3>

                    <p className="mt-1 text-sm text-green-700">
                      No products are running low on stock.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "movements" && (
              <div className="space-y-4">
                {movements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Adjustment
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            By
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(movement.createdAt)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {movement.product?.name || "Unknown Product"}
                              </div>

                              <div className="text-xs text-gray-500">
                                {movement.product?.sku}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 text-sm font-semibold rounded-full ${
                                  movement.adjustment > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {movement.adjustment > 0 ? "+" : ""}
                                {movement.adjustment}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {movement.reason?.replace("_", " ") || "N/A"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {movement.user?.firstName}{" "}
                              {movement.user?.lastName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />

                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No movements yet
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Stock movements will appear here when adjustments are
                      made.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}

      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onAdjust={handleAdjustStock}
        />
      )}
    </>
  );
}

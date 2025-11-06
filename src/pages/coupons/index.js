import { useState, useEffect, useCallback } from "react";

import Head from "next/head";

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { couponsAPI } from "@/lib/api";

import LoadingSpinner from "@/components/common/LoadingSpinner";

import {
  formatCurrency,
  formatDate,
  handleAPIError,
  getStatusColor,
} from "@/lib/utils";

export default function CouponsIndex() {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    type: "",

    isActive: "",

    sortBy: "created_at",

    sortOrder: "desc",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const [viewingStats, setViewingStats] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,

    limit: 20,

    total: 0,

    totalPages: 0,
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,

        limit: pagination.limit,

        search: searchQuery,

        ...filters,
      };

      const response = await couponsAPI.getAll(params);

      const couponsData =
        response.data.data?.coupons || response.data.coupons || [];

      const paginationData =
        response.data.data?.pagination || response.data.pagination || {};

      setCoupons(couponsData);

      setPagination((prev) => ({
        ...prev,

        total: paginationData.totalItems || couponsData.length,

        totalPages: paginationData.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching coupons:", error);

      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await couponsAPI.delete(couponId);

      await fetchCoupons();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",

      isActive: "",

      sortBy: "created_at",

      sortOrder: "desc",
    });

    setSearchQuery("");
  };

  const CouponForm = ({ coupon, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      code: coupon?.code || "",

      type: coupon?.type || "percentage",

      value: coupon?.value || "",

      minPurchase: coupon?.minPurchase || "",

      maxDiscount: coupon?.maxDiscount || "",

      usageLimit: coupon?.usageLimit || "",

      expiresAt: coupon?.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",

      isActive: coupon?.isActive !== false,

      description: coupon?.description || "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      setIsLoading(true);

      try {
        const submitData = {
          ...formData,

          value: parseFloat(formData.value),

          minPurchase: formData.minPurchase
            ? parseFloat(formData.minPurchase)
            : null,

          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,

          usageLimit: formData.usageLimit
            ? parseInt(formData.usageLimit)
            : null,

          expiresAt: formData.expiresAt || null,
        };

        if (coupon) {
          await couponsAPI.update(coupon.id, submitData);
        } else {
          await couponsAPI.create(submitData);
        }

        await fetchCoupons();

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
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {coupon ? "Edit Coupon" : "Create Coupon"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Coupon Code *
                </label>

                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                  placeholder="SUMMER25"
                  disabled={!!coupon}
                />

                {coupon && (
                  <p className="mt-1 text-xs text-gray-500">
                    Code cannot be changed after creation
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type *
                </label>

                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage Discount</option>

                  <option value="fixed_amount">Fixed Amount Discount</option>

                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            {formData.type !== "free_shipping" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.type === "percentage"
                      ? "Discount Percentage *"
                      : "Discount Amount *"}
                  </label>

                  <div className="mt-1 relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.type === "percentage" ? "1" : "0.01"}
                      max={formData.type === "percentage" ? "100" : undefined}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-12"
                      placeholder={
                        formData.type === "percentage" ? "25" : "500"
                      }
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {formData.type === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                </div>

                {formData.type === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Discount (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxDiscount: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Optional max discount cap"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Purchase Amount (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minPurchase: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Optional min purchase required"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Usage Limit
                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>

              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiresAt: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Leave empty for no expiry
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Internal description for this coupon"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />

              <label className="ml-2 block text-sm text-gray-900">Active</label>
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

                {coupon ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getCouponTypeDisplay = (type) => {
    const types = {
      percentage: "Percentage",

      fixed_amount: "Fixed Amount",

      free_shipping: "Free Shipping",
    };

    return types[type] || type;
  };

  const getCouponValue = (coupon) => {
    if (coupon.type === "free_shipping") return "Free Shipping";

    if (coupon.type === "percentage") return `${coupon.value}% OFF`;

    return formatCurrency(coupon.value);
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;

    return new Date(expiresAt) < new Date();
  };

  const isUsageLimitReached = (coupon) => {
    if (!coupon.usageLimit) return false;

    return coupon.usageCount >= coupon.usageLimit;
  };

  return (
    <>
      <Head>
        <title>Coupons - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Coupons</h1>

            <p className="mt-2 text-sm text-gray-700">
              Manage discount coupons and promotional codes
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Coupon
          </button>
        </div>

        {/* Filters */}

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>

              <div className="mt-1 relative">
                <input
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search coupon codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Type Filter */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>

              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>

                <option value="percentage">Percentage</option>

                <option value="fixed_amount">Fixed Amount</option>

                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            {/* Status Filter */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}

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
                      Coupon Code
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type / Value
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
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
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TicketIcon className="h-5 w-5 text-gray-400 mr-3" />

                          <div>
                            <div className="text-sm font-mono font-bold text-gray-900">
                              {coupon.code}
                            </div>

                            {coupon.description && (
                              <div className="text-xs text-gray-500">
                                {coupon.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCouponTypeDisplay(coupon.type)}
                        </div>

                        <div className="text-sm font-semibold text-green-600">
                          {getCouponValue(coupon)}
                        </div>

                        {coupon.minPurchase > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: {formatCurrency(coupon.minPurchase)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usageCount || 0}

                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </div>

                        {isUsageLimitReached(coupon) && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Limit Reached
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.expiresAt ? (
                          <div>
                            <div>{formatDate(coupon.expiresAt)}</div>

                            {isExpired(coupon.expiresAt) && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                        ) : (
                          "No Expiry"
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            coupon.isActive &&
                              !isExpired(coupon.expiresAt) &&
                              !isUsageLimitReached(coupon)
                              ? "active"
                              : "inactive"
                          )}`}
                        >
                          {coupon.isActive &&
                          !isExpired(coupon.expiresAt) &&
                          !isUsageLimitReached(coupon)
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingCoupon(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Coupon"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Coupon"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {coupons.length === 0 && (
                <div className="text-center py-12">
                  <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />

                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No coupons found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || filters.type
                      ? "Try adjusting your filters."
                      : "Get started by creating a new coupon."}
                  </p>

                  {!searchQuery && !filters.type && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Coupon
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}

      {showCreateModal && (
        <CouponForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}

      {editingCoupon && (
        <CouponForm
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onSuccess={() => setEditingCoupon(null)}
        />
      )}
    </>
  );
}

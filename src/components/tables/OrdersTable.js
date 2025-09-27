import { useState } from 'react';
import Link from 'next/link';
import { 
  EyeIcon, 
  DocumentTextIcon,
  TruckIcon,
  ClipboardDocumentIcon,
  UserIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, getStatusColor, formatDate, handleAPIError } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrdersTable({ 
  orders = [], 
  loading = false,
  onStatusUpdate,
  onView,
  showActions = true,
  pagination = null,
  onPageChange
}) {
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!confirm(`Are you sure you want to change the order status to "${newStatus.replace('_', ' ')}"?`)) {
      return;
    }

    try {
      setUpdatingOrder(orderId);
      await onStatusUpdate(orderId, newStatus);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setUpdatingOrder(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const StatusSelect = ({ order }) => {
    const statusOptions = [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'processing', label: 'Processing', color: 'blue' },
      { value: 'shipped', label: 'Shipped', color: 'purple' },
      { value: 'delivered', label: 'Delivered', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];

    return (
      <select
        value={order.status}
        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
        disabled={updatingOrder === order.id}
        className={`text-xs border-0 bg-transparent focus:ring-0 font-semibold rounded-full px-2 py-1 ${
          getStatusColor(order.status)
        } ${updatingOrder === order.id ? 'opacity-50' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const PaymentStatusBadge = ({ status }) => (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      getStatusColor(status)
    }`}>
      {status ? status.replace('_', ' ') : 'Unknown'}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      #{order.orderNumber}
                      <button
                        onClick={() => copyToClipboard(order.orderNumber)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        title="Copy Order Number"
                      >
                        <ClipboardDocumentIcon className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items?.length || 0} items
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-blue-600 flex items-center mt-1">
                        <TruckIcon className="h-3 w-3 mr-1" />
                        {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {order.user?.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={order.user.avatar.url}
                          alt={`${order.user.firstName} ${order.user.lastName}`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </div>
                  {order.estimatedDeliveryDate && (
                    <div className="text-xs text-gray-500">
                      Est. delivery: {formatDate(order.estimatedDeliveryDate)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {updatingOrder === order.id ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-1 text-sm text-gray-500">Updating...</span>
                      </div>
                    ) : (
                      <StatusSelect order={order} />
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    {order.paymentMethod && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <BanknotesIcon className="h-3 w-3 mr-1" />
                        {order.paymentMethod.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="text-xs text-green-600">
                      -{formatCurrency(order.discountAmount)} discount
                    </div>
                  )}
                  {order.shippingAmount > 0 && (
                    <div className="text-xs text-gray-500">
                      +{formatCurrency(order.shippingAmount)} shipping
                    </div>
                  )}
                </td>
                
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Order Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Orders will appear here once customers start placing orders.
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
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {pagination.page} of {pagination.totalPages}
                </span>
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
  );
}
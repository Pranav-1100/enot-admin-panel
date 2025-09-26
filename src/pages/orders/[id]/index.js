import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeftIcon, 
  TruckIcon, 
  CreditCardIcon, 
  UserIcon,
  MapPinIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { ordersAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, getStatusColor, formatDate, handleAPIError } from '@/lib/utils';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusUpdateModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
      status: order?.status || '',
      notes: '',
      trackingNumber: order?.trackingNumber || '',
      estimatedDeliveryDate: order?.estimatedDeliveryDate || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdating(true);

      try {
        await ordersAPI.updateStatus(order.id, formData);
        await fetchOrder();
        onClose();
      } catch (error) {
        alert(handleAPIError(error));
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {(formData.status === 'shipped' || formData.status === 'delivered') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={formData.estimatedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add notes about this status update..."
              />
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
                disabled={updating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {updating && <LoadingSpinner size="sm" />}
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
        <Link href="/orders" className="text-blue-600 hover:text-blue-800">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Order #{order.orderNumber} - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/orders"
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Update Status
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex-shrink-0 h-16 w-16">
                      {item.product?.images?.[0] ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={item.product.images[0].url}
                          alt={item.product.name}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className="text-sm text-gray-500">SKU: {item.product?.sku}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-900">
                      Qty: {item.quantity}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {order.statusHistory.map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== order.statusHistory.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                getStatusColor(event.status).replace('text-', 'bg-').replace('100', '500')
                              }`}>
                                <TruckIcon className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Order status changed to{' '}
                                  <span className="font-medium text-gray-900">{event.status}</span>
                                </p>
                                {event.notes && (
                                  <p className="mt-1 text-sm text-gray-600">{event.notes}</p>
                                )}
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatDate(event.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getStatusColor(order.status)
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getStatusColor(order.paymentStatus)
                  }`}>
                    {order.paymentStatus?.replace('_', ' ')}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tracking</span>
                    <span className="text-sm font-medium text-gray-900">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Customer
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {order.user?.firstName} {order.user?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{order.user?.email}</div>
                  {order.user?.phoneNumber && (
                    <div className="text-sm text-gray-500">{order.user.phoneNumber}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </div>
                  <div>{order.shippingAddress.streetAddress}</div>
                  {order.shippingAddress.streetAddress2 && (
                    <div>{order.shippingAddress.streetAddress2}</div>
                  )}
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                  <div>{order.shippingAddress.country}</div>
                  {order.shippingAddress.phone && (
                    <div className="mt-2">{order.shippingAddress.phone}</div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="text-gray-900">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getStatusColor(order.paymentStatus)
                  }`}>
                    {order.paymentStatus?.replace('_', ' ')}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="text-gray-900 font-mono text-xs">{order.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal onClose={() => setShowStatusModal(false)} />
      )}
    </>
  );
}
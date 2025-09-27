import { useState } from 'react';
import { 
  UserIcon, 
  EyeIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { getStatusColor, formatDate, handleAPIError, getUserDisplayName } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function UsersTable({ 
  users = [], 
  loading = false,
  onStatusUpdate,
  onView,
  showActions = true,
  pagination = null,
  onPageChange
}) {
  const [updatingUser, setUpdatingUser] = useState(null);

  const handleStatusUpdate = async (userId, isActive, userType) => {
    try {
      setUpdatingUser(userId);
      await onStatusUpdate(userId, isActive, userType);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setUpdatingUser(null);
    }
  };

  const UserRoleSelect = ({ user }) => {
    const roleOptions = [
      { value: 'customer', label: 'Customer', color: 'blue' },
      { value: 'seller', label: 'Seller', color: 'green' },
      { value: 'admin', label: 'Admin', color: 'purple' }
    ];

    return (
      <select
        value={user.userType}
        onChange={(e) => handleStatusUpdate(user.id, user.isActive, e.target.value)}
        disabled={updatingUser === user.id}
        className={`text-xs border-0 bg-transparent focus:ring-0 font-medium ${
          updatingUser === user.id ? 'opacity-50' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {roleOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const UserStatusToggle = ({ user }) => {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStatusUpdate(user.id, !user.isActive, user.userType);
        }}
        disabled={updatingUser === user.id}
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          getStatusColor(user.isActive ? 'active' : 'inactive')
        } hover:opacity-80 ${updatingUser === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {updatingUser === user.id ? (
          <LoadingSpinner size="sm" />
        ) : (
          user.isActive ? 'Active' : 'Inactive'
        )}
      </button>
    );
  };

  const UserAvatarCell = ({ user }) => (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-12 w-12">
        {user.avatar ? (
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={user.avatar.url}
            alt={getUserDisplayName(user)}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <UserCircleIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">
          {getUserDisplayName(user)}
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <EnvelopeIcon className="h-3 w-3 mr-1" />
          {user.email}
        </div>
        {user.phoneNumber && (
          <div className="text-xs text-gray-400 flex items-center mt-1">
            <PhoneIcon className="h-3 w-3 mr-1" />
            {user.phoneNumber}
          </div>
        )}
      </div>
    </div>
  );

  const UserStatsCell = ({ user }) => (
    <div className="text-sm space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Orders:</span>
        <span className="font-medium">{user.ordersCount || 0}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Reviews:</span>
        <span className="font-medium">{user.reviewsCount || 0}</span>
      </div>
      {user.totalSpent && (
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Spent:</span>
          <span className="font-medium text-green-600">
            ${(user.totalSpent / 100).toFixed(2)}
          </span>
        </div>
      )}
    </div>
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
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserAvatarCell user={user} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserRoleSelect user={user} />
                    {user.userType === 'admin' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                    {user.userType === 'seller' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Seller
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatusToggle user={user} />
                  {!user.emailVerified && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Email not verified
                      </span>
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {user.lastLoginAt ? (
                      <div className="flex items-center text-xs">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        Last login: {formatDate(user.lastLoginAt)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Never logged in</div>
                    )}
                    
                    {user.isOnline && (
                      <div className="flex items-center text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Online now
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatsCell user={user} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    {formatDate(user.createdAt)}
                  </div>
                  {user.source && (
                    <div className="text-xs text-gray-400 mt-1">
                      via {user.source}
                    </div>
                  )}
                </td>
                
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View User Details"
                        >
                          <EyeIcon className="h-4 w-4" />
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
      {users.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Users will appear here as they sign up for your platform.
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

      {/* User Summary Stats */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {users.filter(u => u.userType === 'customer').length}
            </div>
            <div className="text-xs text-gray-500">Customers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {users.filter(u => u.userType === 'seller').length}
            </div>
            <div className="text-xs text-gray-500">Sellers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {users.filter(u => u.lastLoginAt && 
                new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-xs text-gray-500">Active (30d)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
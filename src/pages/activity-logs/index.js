import { useState, useEffect, useCallback } from "react";

import Head from "next/head";

import {
  MagnifyingGlassIcon,
  ClockIcon,
  UserCircleIcon,
  DocumentTextIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { activityLogsAPI, usersAPI } from "@/lib/api";

import LoadingSpinner from "@/components/common/LoadingSpinner";

import { formatDate, handleAPIError, capitalize } from "@/lib/utils";

export default function ActivityLogsIndex() {
  const [logs, setLogs] = useState([]);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    userId: "",

    action: "",

    entityType: "",

    startDate: "",

    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,

    limit: 50,

    total: 0,

    totalPages: 0,
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,

        limit: pagination.limit,

        search: searchQuery,

        ...filters,
      };

      // Remove empty filters

      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const response = await activityLogsAPI.getAll(params);

      const logsData =
        response.data.data?.logs ||
        response.data.logs ||
        response.data.data ||
        [];

      const paginationData =
        response.data.data?.pagination || response.data.pagination || {};

      setLogs(logsData);

      setPagination((prev) => ({
        ...prev,

        total: paginationData.totalItems || logsData.length,

        totalPages: paginationData.totalPages || 1,
      }));
    } catch (error) {
      console.error("Error fetching activity logs:", error);

      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getAll({ userType: "admin", limit: 100 });

      const usersData = response.data.users || [];

      setUsers(
        usersData.filter(
          (u) => u.userType === "admin" || u.userType === "seller"
        )
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      userId: "",

      action: "",

      entityType: "",

      startDate: "",

      endDate: "",
    });

    setSearchQuery("");
  };

  const getActionColor = (action) => {
    const colors = {
      create: "bg-green-100 text-green-800",

      update: "bg-blue-100 text-blue-800",

      delete: "bg-red-100 text-red-800",

      login: "bg-purple-100 text-purple-800",

      logout: "bg-gray-100 text-gray-800",
    };

    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getEntityIcon = (entityType) => {
    // Return appropriate icon based on entity type

    return DocumentTextIcon;
  };

  const actions = [
    "create",

    "update",

    "delete",

    "login",

    "logout",

    "approve",

    "reject",

    "publish",

    "unpublish",
  ];

  const entityTypes = [
    "product",

    "category",

    "brand",

    "order",

    "user",

    "review",

    "blog_post",

    "blog_category",

    "coupon",

    "tag",

    "setting",
  ];

  return (
    <>
      <Head>
        <title>Activity Logs - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Activity Logs
          </h1>

          <p className="mt-2 text-sm text-gray-700">
            Track all admin and seller actions across the platform
          </p>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Total Activities
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {pagination.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-green-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Active Users
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {users.length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  Today&apos;s Actions
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {
                    logs.filter((log) => {
                      const logDate = new Date(log.createdAt);

                      const today = new Date();

                      return logDate.toDateString() === today.toDateString();
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-500" />

              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">
                  This Week
                </div>

                <div className="text-2xl font-semibold text-gray-900">
                  {
                    logs.filter((log) => {
                      const logDate = new Date(log.createdAt);

                      const weekAgo = new Date();

                      weekAgo.setDate(weekAgo.getDate() - 7);

                      return logDate >= weekAgo;
                    }).length
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>

              <div className="mt-1 relative">
                <input
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* User Filter */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                User
              </label>

              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              >
                <option value="">All Users</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Action
              </label>

              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
              >
                <option value="">All Actions</option>

                {actions.map((action) => (
                  <option key={action} value={action}>
                    {capitalize(action)}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Type Filter */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Entity
              </label>

              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.entityType}
                onChange={(e) =>
                  handleFilterChange("entityType", e.target.value)
                }
              >
                <option value="">All Entities</option>

                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {capitalize(type.replace("_", " "))}
                  </option>
                ))}
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

          {/* Date Range */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>

              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>

              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}

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
                        Timestamp
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.createdAt)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />

                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user?.firstName} {log.user?.lastName}
                              </div>

                              <div className="text-xs text-gray-500">
                                {log.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(
                              log.action
                            )}`}
                          >
                            {capitalize(log.action)}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {capitalize(
                              log.entityType?.replace("_", " ") || "N/A"
                            )}
                          </div>

                          {log.entityId && (
                            <div className="text-xs text-gray-500">
                              ID: {log.entityId}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {log.details || log.description || "No details"}
                          </div>

                          {log.changes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Object.keys(log.changes).length} field(s) changed
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {logs.length === 0 && (
                  <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />

                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No activity logs found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery || Object.values(filters).some(Boolean)
                        ? "Try adjusting your filters."
                        : "Activity logs will appear here as actions are performed."}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}

              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        results
                      </p>
                    </div>

                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={pagination.page <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>

                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          {pagination.page} of {pagination.totalPages}
                        </span>

                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
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

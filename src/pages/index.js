import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  CubeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminAPI, ordersAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  // Define complete class strings for Tailwind JIT compiler
  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColorClasses[color] || 'text-gray-600'}`} aria-hidden="true" />
          </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                  )}
                  <span className="ml-1">{change}</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
  );
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard overview - handle each API call separately
      try {
        const dashboardResponse = await adminAPI.getDashboard();
        // Backend returns data in response.data.data format
        setDashboardData(dashboardResponse.data?.data || dashboardResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty dashboard data to avoid crashes
        setDashboardData({
          productsCount: 0,
          ordersCount: 0,
          usersCount: 0,
          totalRevenue: 0,
          recentOrders: []
        });
      }

      // Fetch order stats - commented out as endpoint doesn't exist yet
      // TODO: Uncomment when /api/admin/orders/stats endpoint is implemented
      // try {
      //   const statsResponse = await ordersAPI.getStats({ groupBy: 'day' });
      //   // Backend returns data in response.data.data format
      //   setOrderStats(statsResponse.data?.data || statsResponse.data);
      // } catch (error) {
      //   console.error('Error fetching order stats:', error);
      //   // Don't crash if stats endpoint doesn't exist
      //   setOrderStats(null);
      // }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: dashboardData?.productsCount || 0,
      change: '+12%',
      changeType: 'increase',
      icon: CubeIcon,
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.ordersCount || 0,
      change: '+8%',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      color: 'green'
    },
    {
      title: 'Total Users',
      value: dashboardData?.usersCount || 0,
      change: '+5%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      change: '+15%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'yellow'
    }
  ];

  // Sample chart data (in real app, this would come from API)
  const chartData = [
    { name: 'Jan', orders: 400, revenue: 2400 },
    { name: 'Feb', orders: 300, revenue: 1398 },
    { name: 'Mar', orders: 200, revenue: 9800 },
    { name: 'Apr', orders: 278, revenue: 3908 },
    { name: 'May', orders: 189, revenue: 4800 },
    { name: 'Jun', orders: 239, revenue: 3800 },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - E° ENOT Admin</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome to the E° ENOT admin panel. Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Orders Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest orders and updates</p>
          </div>
          <ul className="divide-y divide-gray-200">
            {dashboardData?.recentOrders?.slice(0, 5).map((order) => (
              <li key={order.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.firstName} {order.user?.lastName} • {formatRelativeTime(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900 mr-4">
                      {formatCurrency(order.total)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </li>
            )) || (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No recent orders
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
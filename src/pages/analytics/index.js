import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { adminAPI, ordersAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [dashboardResponse, orderStatsResponse] = await Promise.all([
        adminAPI.getDashboard(),
        ordersAPI.getStats({ period: timeRange, groupBy: 'day' })
      ]);
      const dashData = dashboardResponse.data.data || dashboardResponse.data;
      const statsData = orderStatsResponse.data.data || orderStatsResponse.data;
      setAnalyticsData(dashData);
      setOrderStats(statsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set empty data to prevent errors
      setAnalyticsData({});
      setOrderStats({});
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration - replace with real API data
  const revenueData = [
    { name: 'Jan', revenue: 45000, orders: 120, customers: 80 },
    { name: 'Feb', revenue: 52000, orders: 145, customers: 95 },
    { name: 'Mar', revenue: 48000, orders: 130, customers: 85 },
    { name: 'Apr', revenue: 61000, orders: 170, customers: 110 },
    { name: 'May', revenue: 55000, orders: 155, customers: 100 },
    { name: 'Jun', revenue: 67000, orders: 185, customers: 125 },
  ];

  const productCategoryData = [
    { name: 'Men\'s Fragrances', value: 35, color: '#3B82F6' },
    { name: 'Women\'s Fragrances', value: 45, color: '#EF4444' },
    { name: 'Unisex Fragrances', value: 20, color: '#10B981' },
  ];

  const topProductsData = [
    { name: 'Chanel No. 5', sales: 45, revenue: 12500 },
    { name: 'Dior Sauvage', sales: 38, revenue: 9800 },
    { name: 'Tom Ford Black Orchid', sales: 32, revenue: 11200 },
    { name: 'Creed Aventus', sales: 28, revenue: 15400 },
    { name: 'YSL Black Opium', sales: 25, revenue: 7500 },
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics - E° ENOT Admin</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your business performance and growth metrics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analyticsData?.totalRevenue || 234500)}
            change="+12.5%"
            changeType="increase"
            icon={CurrencyDollarIcon}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={analyticsData?.ordersCount || 1234}
            change="+8.2%"
            changeType="increase"
            icon={ShoppingBagIcon}
            color="blue"
          />
          <StatCard
            title="Active Customers"
            value={analyticsData?.activeCustomers || 892}
            change="+15.3%"
            changeType="increase"
            icon={UsersIcon}
            color="purple"
          />
          <StatCard
            title="Avg. Order Value"
            value={formatCurrency(18750)}
            change="-2.1%"
            changeType="decrease"
            icon={ChartBarIcon}
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="customers">New Customers</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => chartType === 'revenue' ? formatCurrency(value) : value}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartType} 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProductsData.map((product, index) => (
                    <tr key={product.name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sales} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Conversion Rate */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conversion Rate</span>
                  <span className="text-lg font-semibold text-gray-900">3.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Cart Abandonment</span>
                  <span className="text-lg font-semibold text-red-600">68.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Return Rate</span>
                  <span className="text-lg font-semibold text-gray-900">2.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Customer Lifetime Value</span>
                  <span className="text-lg font-semibold text-green-600">{formatCurrency(45600)}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">New order #12345</span>
                  <span className="ml-auto text-gray-400">2 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Product review added</span>
                  <span className="ml-auto text-gray-400">5 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">New user registered</span>
                  <span className="ml-auto text-gray-400">12 min ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Inventory alert</span>
                  <span className="ml-auto text-gray-400">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-green-900">Revenue Growth</h4>
              <p className="text-xs text-green-700 mt-1">
                Your revenue has increased by 12.5% compared to last month. Keep up the great work!
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-blue-900">Customer Acquisition</h4>
              <p className="text-xs text-blue-700 mt-1">
                New customer registrations are up 15.3%. Consider loyalty programs to retain them.
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <FunnelIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-yellow-900">Conversion Optimization</h4>
              <p className="text-xs text-yellow-700 mt-1">
                Cart abandonment is at 68.5%. Consider implementing exit-intent popups or email reminders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
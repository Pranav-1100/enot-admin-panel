import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Cog6ToothIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';
import { settingsAPI } from '@/lib/api';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'E° ENOT',
    siteDescription: 'Luxury Fragrance Marketplace',
    siteUrl: 'https://enot.com',
    contactEmail: 'contact@enot.com',
    timezone: 'UTC',
    currency: 'USD',
    
    // Notification Settings
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      newReviews: true,
      newUsers: false,
      systemUpdates: true
    },
    pushNotifications: {
      orderUpdates: true,
      inventoryAlerts: true,
      securityAlerts: true
    },
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    ipWhitelist: '',
    
    // Business Settings
    taxRate: 8.5,
    shippingRate: 9.99,
    freeShippingThreshold: 75.00,
    returnWindow: 30,
    
    // Analytics Settings
    googleAnalytics: '',
    facebookPixel: '',
    trackingEnabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      const settingsData = response.data.data?.settings || response.data.settings || response.data;
      if (settingsData && Object.keys(settingsData).length > 0) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleDirectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'business', name: 'Business', icon: CreditCardIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  const GeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Site Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleDirectChange('siteName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleDirectChange('siteUrl', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => handleDirectChange('siteDescription', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleDirectChange('contactEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleDirectChange('timezone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('emailNotifications', key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(settings.pushNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('pushNotifications', key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="mt-2 text-sm text-yellow-700">
              Changing security settings affects all admin users. Please proceed with caution.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.sessionTimeout}
            onChange={(e) => handleDirectChange('sessionTimeout', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password Expiry (days)</label>
          <input
            type="number"
            min="30"
            max="365"
            value={settings.passwordExpiry}
            onChange={(e) => handleDirectChange('passwordExpiry', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
            <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleDirectChange('twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const BusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Tax</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={settings.taxRate}
              onChange={(e) => handleDirectChange('taxRate', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleDirectChange('currency', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Standard Shipping Rate ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.shippingRate}
              onChange={(e) => handleDirectChange('shippingRate', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Free Shipping Threshold ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.freeShippingThreshold}
              onChange={(e) => handleDirectChange('freeShippingThreshold', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Return Window (days)</label>
        <input
          type="number"
          min="0"
          max="365"
          value={settings.returnWindow}
          onChange={(e) => handleDirectChange('returnWindow', parseInt(e.target.value))}
          className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const AnalyticsSettings = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Enable Tracking</span>
            <p className="text-xs text-gray-500">Allow collection of analytics data</p>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={settings.trackingEnabled}
              onChange={(e) => handleDirectChange('trackingEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Analytics Tracking ID</label>
          <input
            type="text"
            value={settings.googleAnalytics}
            onChange={(e) => handleDirectChange('googleAnalytics', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
          <input
            type="text"
            value={settings.facebookPixel}
            onChange={(e) => handleDirectChange('facebookPixel', e.target.value)}
            placeholder="123456789012345"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <GlobeAltIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Privacy Notice</h3>
            <p className="mt-2 text-sm text-blue-700">
            Analytics tracking helps improve your store&apos;s performance. All data is processed according to privacy regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      case 'business': return <BusinessSettings />;
      case 'analytics': return <AnalyticsSettings />;
      default: return <GeneralSettings />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your store configuration and preferences
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <LoadingSpinner size="sm" />}
            {saved ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
            {/* Sidebar */}
            <aside className="py-6 lg:col-span-3">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-900 hover:bg-gray-50'
                    } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                  >
                    <tab.icon
                      className={`${
                        activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    />
                    <span className="truncate">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="divide-y divide-gray-200 lg:col-span-9">
              <div className="py-6 px-4 sm:p-6 lg:pb-8">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Save Notice */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Settings saved successfully!
            </div>
          </div>
        )}
      </div>
    </>
  );
}
import { useState, useEffect } from "react";
import Head from "next/head";
import {
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { siteSettingsAPI } from "@/lib/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { handleAPIError } from "@/lib/utils";

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // Site Info
    site_name: "",
    site_tagline: "",
    site_description: "",
    meta_description: "",

    // Contact Info
    contact_email: "",
    contact_phone: "",
    contact_address: "",

    // Social Media
    instagram_url: "",
    facebook_url: "",
    twitter_url: "",
    youtube_url: "",
    tiktok_url: "",

    // Newsletter
    newsletter_enabled: true,
    newsletter_provider: "",
    newsletter_api_key: "",

    // Footer
    copyright_text: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await siteSettingsAPI.get();
      const settingsData = response.data.data || {};
      if (settingsData.id) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      // Continue with empty settings
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsAPI.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Site Settings - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your public website configuration
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-8">
            {/* Site Information */}
            <div>
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Site Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.site_name || ""}
                    onChange={(e) => handleChange("site_name", e.target.value)}
                    placeholder="E° ENOT"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.site_tagline || ""}
                    onChange={(e) => handleChange("site_tagline", e.target.value)}
                    placeholder="The Art of Fragrance"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Site Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.site_description || ""}
                    onChange={(e) => handleChange("site_description", e.target.value)}
                    placeholder="A luxury fragrance marketplace..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.meta_description || ""}
                    onChange={(e) => handleChange("meta_description", e.target.value)}
                    placeholder="SEO meta description..."
                    maxLength={160}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.meta_description?.length || 0}/160 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <PhoneIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(e) => handleChange("contact_email", e.target.value)}
                    placeholder="contact@enot.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contact_phone || ""}
                    onChange={(e) => handleChange("contact_phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.contact_address || ""}
                    onChange={(e) => handleChange("contact_address", e.target.value)}
                    placeholder="123 Luxury Lane, New York, NY 10001"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Social Media URLs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.instagram_url || ""}
                    onChange={(e) => handleChange("instagram_url", e.target.value)}
                    placeholder="https://instagram.com/enot"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.facebook_url || ""}
                    onChange={(e) => handleChange("facebook_url", e.target.value)}
                    placeholder="https://facebook.com/enot"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={settings.twitter_url || ""}
                    onChange={(e) => handleChange("twitter_url", e.target.value)}
                    placeholder="https://twitter.com/enot"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.youtube_url || ""}
                    onChange={(e) => handleChange("youtube_url", e.target.value)}
                    placeholder="https://youtube.com/@enot"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    value={settings.tiktok_url || ""}
                    onChange={(e) => handleChange("tiktok_url", e.target.value)}
                    placeholder="https://tiktok.com/@enot"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Newsletter Settings */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Newsletter Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Enable Newsletter Signup
                    </span>
                    <p className="text-xs text-gray-500">
                      Show newsletter signup form on the website
                    </p>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.newsletter_enabled || false}
                      onChange={(e) => handleChange("newsletter_enabled", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Newsletter Provider
                    </label>
                    <input
                      type="text"
                      value={settings.newsletter_provider || ""}
                      onChange={(e) => handleChange("newsletter_provider", e.target.value)}
                      placeholder="Mailchimp, SendGrid, etc."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settings.newsletter_api_key || ""}
                      onChange={(e) => handleChange("newsletter_api_key", e.target.value)}
                      placeholder="Enter API key..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <MapPinIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Footer</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={settings.copyright_text || ""}
                  onChange={(e) => handleChange("copyright_text", e.target.value)}
                  placeholder="© 2025 E° ENOT. All rights reserved."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
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

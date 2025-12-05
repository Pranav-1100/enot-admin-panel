import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { themeAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateTheme() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Colors
    primary_color: '#D97706',
    secondary_color: '#92400E',
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
    // Typography
    heading_font: 'Inter',
    body_font: 'Inter',
    font_size_base: '16px',
    // Buttons
    button_style: 'solid',
    button_radius: '6px',
    // Layout
    container_max_width: '1280px',
    spacing_scale: '1',
    // Cards
    card_style: 'elevated',
    card_radius: '8px',
    card_shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    card_hover_effect: 'lift',
    // Advanced
    custom_css: '',
    custom_js: '',
    is_active: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await themeAPI.create(formData);
      toast.success('Theme created successfully!');
      router.push('/theme');
    } catch (error) {
      console.error('Error creating theme:', error);
      toast.error(error.response?.data?.message || 'Failed to create theme');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Head>
        <title>Create Theme - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/theme"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Theme Manager
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Theme</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new theme preset for your website
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Theme Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="Modern Amber Theme"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="A modern theme with warm amber tones..."
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Color Palette</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="h-10 w-20 rounded border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="#D97706"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="h-10 w-20 rounded border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="#92400E"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        className="h-10 w-20 rounded border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accent_color}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => handleColorChange('background_color', e.target.value)}
                        className="h-10 w-20 rounded border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) => handleColorChange('background_color', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => handleColorChange('text_color', e.target.value)}
                        className="h-10 w-20 rounded border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.text_color}
                        onChange={(e) => handleColorChange('text_color', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Typography</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="heading_font" className="block text-sm font-medium text-gray-700">
                        Heading Font
                      </label>
                      <select
                        id="heading_font"
                        value={formData.heading_font}
                        onChange={(e) => setFormData(prev => ({ ...prev, heading_font: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="body_font" className="block text-sm font-medium text-gray-700">
                        Body Font
                      </label>
                      <select
                        id="body_font"
                        value={formData.body_font}
                        onChange={(e) => setFormData(prev => ({ ...prev, body_font: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="font_size_base" className="block text-sm font-medium text-gray-700">
                      Base Font Size
                    </label>
                    <input
                      type="text"
                      id="font_size_base"
                      value={formData.font_size_base}
                      onChange={(e) => setFormData(prev => ({ ...prev, font_size_base: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="16px"
                    />
                    <p className="mt-1 text-xs text-gray-500">Base font size for body text (e.g., 16px, 1rem)</p>
                  </div>
                </div>
              </div>

              {/* Button Styling */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Button Styling</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="button_style" className="block text-sm font-medium text-gray-700">
                        Button Style
                      </label>
                      <select
                        id="button_style"
                        value={formData.button_style}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_style: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        <option value="solid">Solid</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="button_radius" className="block text-sm font-medium text-gray-700">
                        Button Radius
                      </label>
                      <input
                        type="text"
                        id="button_radius"
                        value={formData.button_radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_radius: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="6px"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Layout Settings</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="container_max_width" className="block text-sm font-medium text-gray-700">
                        Container Max Width
                      </label>
                      <input
                        type="text"
                        id="container_max_width"
                        value={formData.container_max_width}
                        onChange={(e) => setFormData(prev => ({ ...prev, container_max_width: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="1280px"
                      />
                      <p className="mt-1 text-xs text-gray-500">Maximum width for content containers</p>
                    </div>

                    <div>
                      <label htmlFor="spacing_scale" className="block text-sm font-medium text-gray-700">
                        Spacing Scale
                      </label>
                      <select
                        id="spacing_scale"
                        value={formData.spacing_scale}
                        onChange={(e) => setFormData(prev => ({ ...prev, spacing_scale: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        <option value="0.75">Compact (0.75x)</option>
                        <option value="1">Normal (1x)</option>
                        <option value="1.25">Comfortable (1.25x)</option>
                        <option value="1.5">Spacious (1.5x)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Overall spacing multiplier</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Styling */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Card Styling</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card_style" className="block text-sm font-medium text-gray-700">
                        Card Style
                      </label>
                      <select
                        id="card_style"
                        value={formData.card_style}
                        onChange={(e) => setFormData(prev => ({ ...prev, card_style: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      >
                        <option value="elevated">Elevated (with shadow)</option>
                        <option value="outlined">Outlined</option>
                        <option value="filled">Filled</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="card_radius" className="block text-sm font-medium text-gray-700">
                        Card Border Radius
                      </label>
                      <input
                        type="text"
                        id="card_radius"
                        value={formData.card_radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, card_radius: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="8px"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="card_shadow" className="block text-sm font-medium text-gray-700">
                      Card Shadow
                    </label>
                    <input
                      type="text"
                      id="card_shadow"
                      value={formData.card_shadow}
                      onChange={(e) => setFormData(prev => ({ ...prev, card_shadow: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="0 1px 3px 0 rgb(0 0 0 / 0.1)"
                    />
                    <p className="mt-1 text-xs text-gray-500">CSS box-shadow value</p>
                  </div>

                  <div>
                    <label htmlFor="card_hover_effect" className="block text-sm font-medium text-gray-700">
                      Card Hover Effect
                    </label>
                    <select
                      id="card_hover_effect"
                      value={formData.card_hover_effect}
                      onChange={(e) => setFormData(prev => ({ ...prev, card_hover_effect: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                      <option value="">None</option>
                      <option value="lift">Lift (elevate on hover)</option>
                      <option value="glow">Glow</option>
                      <option value="scale">Scale</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="custom_css" className="block text-sm font-medium text-gray-700">
                      Custom CSS
                    </label>
                    <textarea
                      id="custom_css"
                      rows={8}
                      value={formData.custom_css}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_css: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm font-mono text-xs"
                      placeholder=".custom-class { color: red; }"
                    />
                    <p className="mt-1 text-xs text-gray-500">Add custom CSS rules (use with caution)</p>
                  </div>

                  <div>
                    <label htmlFor="custom_js" className="block text-sm font-medium text-gray-700">
                      Custom JavaScript
                    </label>
                    <textarea
                      id="custom_js"
                      rows={8}
                      value={formData.custom_js}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_js: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm font-mono text-xs"
                      placeholder="console.log('Custom JS');"
                    />
                    <p className="mt-1 text-xs text-gray-500">Add custom JavaScript code (use with caution)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>

                <div
                  className="border rounded-lg p-4 space-y-3"
                  style={{ backgroundColor: formData.background_color }}
                >
                  {/* Color Swatches */}
                  <div className="flex gap-2">
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: formData.primary_color }}
                      title="Primary"
                    />
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: formData.secondary_color }}
                      title="Secondary"
                    />
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: formData.accent_color }}
                      title="Accent"
                    />
                  </div>

                  {/* Typography Preview */}
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{
                        fontFamily: formData.heading_font,
                        color: formData.text_color
                      }}
                    >
                      Heading Preview
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{
                        fontFamily: formData.body_font,
                        fontSize: formData.font_size_base,
                        color: formData.text_color
                      }}
                    >
                      Body text preview with selected font
                    </p>
                  </div>

                  {/* Button Preview */}
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 text-sm font-medium text-white"
                    style={{
                      backgroundColor: formData.primary_color,
                      borderRadius: formData.button_radius
                    }}
                  >
                    Button Preview
                  </button>

                  {/* Card Preview */}
                  <div
                    className="p-3 border"
                    style={{
                      borderRadius: formData.card_radius,
                      boxShadow: formData.card_style === 'elevated' ? formData.card_shadow : 'none',
                      backgroundColor: formData.background_color
                    }}
                  >
                    <p className="text-xs" style={{ color: formData.text_color }}>
                      Card Preview
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Set as Active Theme
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    This will deactivate any currently active theme
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Theme'}
                </button>
                <Link
                  href="/theme"
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

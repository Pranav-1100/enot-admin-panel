import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { heroAPI } from '../../../lib/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function EditHero() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    background_image: '',
    background_video: '',
    overlay_opacity: 40,
    overlay_color: '#000000',
    text_color: '#FFFFFF',
    text_align: 'center',
    cta_primary_text: '',
    cta_primary_url: '',
    cta_primary_color: '#D4AF37',
    cta_primary_text_color: '#000000',
    cta_secondary_text: '',
    cta_secondary_url: '',
    cta_secondary_color: 'transparent',
    cta_secondary_text_color: '#FFFFFF',
    height_desktop: '100vh',
    height_mobile: '70vh',
    enable_animations: true,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    if (id) {
      fetchHeroSection();
    }
  }, [id]);

  const fetchHeroSection = async () => {
    try {
      setLoading(true);
      const response = await heroAPI.getById(id);
      const hero = response.data.heroSection;

      setFormData({
        title: hero.title || '',
        subtitle: hero.subtitle || '',
        description: hero.description || '',
        background_image: hero.background_image || '',
        background_video: hero.background_video || '',
        overlay_opacity: hero.overlay_opacity || 40,
        overlay_color: hero.overlay_color || '#000000',
        text_color: hero.text_color || '#FFFFFF',
        text_align: hero.text_align || 'center',
        cta_primary_text: hero.cta_primary_text || '',
        cta_primary_url: hero.cta_primary_url || '',
        cta_primary_color: hero.cta_primary_color || '#D4AF37',
        cta_primary_text_color: hero.cta_primary_text_color || '#000000',
        cta_secondary_text: hero.cta_secondary_text || '',
        cta_secondary_url: hero.cta_secondary_url || '',
        cta_secondary_color: hero.cta_secondary_color || 'transparent',
        cta_secondary_text_color: hero.cta_secondary_text_color || '#FFFFFF',
        height_desktop: hero.height_desktop || '100vh',
        height_mobile: hero.height_mobile || '70vh',
        enable_animations: hero.enable_animations !== false,
        is_active: hero.is_active !== false,
        display_order: hero.display_order || 0
      });

      if (hero.background_image) {
        setImagePreview(hero.background_image);
      }
    } catch (error) {
      console.error('Error fetching hero section:', error);
      toast.error('Failed to load hero section');
      router.push('/hero');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, background_image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await heroAPI.update(id, formData);
      toast.success('Hero section updated successfully!');
      router.push('/hero');
    } catch (error) {
      console.error('Error updating hero section:', error);
      toast.error(error.response?.data?.message || 'Failed to update hero section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Hero Section - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/hero"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Hero Sections
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Hero Section</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your homepage hero section content and styling
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="E°"
                    />
                  </div>

                  <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="PERFECTION TO THE HIGHEST DEGREE"
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
                      placeholder="Discover our collection of luxury fragrances"
                    />
                  </div>
                </div>
              </div>

              {/* Background Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Background</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mx-auto h-48 w-auto rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData(prev => ({ ...prev, background_image: '' }));
                              }}
                              className="mt-2 text-sm text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="background-upload"
                                className="relative cursor-pointer rounded-md bg-white font-medium text-amber-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 hover:text-amber-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="background-upload"
                                  name="background-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleImageUpload}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="background_video" className="block text-sm font-medium text-gray-700">
                      Background Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="background_video"
                      value={formData.background_video}
                      onChange={(e) => setFormData(prev => ({ ...prev, background_video: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="overlay_color" className="block text-sm font-medium text-gray-700">
                        Overlay Color
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="color"
                          id="overlay_color"
                          value={formData.overlay_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, overlay_color: e.target.value }))}
                          className="h-10 w-14 rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.overlay_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, overlay_color: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="overlay_opacity" className="block text-sm font-medium text-gray-700">
                        Overlay Opacity ({formData.overlay_opacity}%)
                      </label>
                      <input
                        type="range"
                        id="overlay_opacity"
                        min="0"
                        max="100"
                        value={formData.overlay_opacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, overlay_opacity: parseInt(e.target.value) }))}
                        className="mt-3 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Styling */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Text Styling</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="text_color" className="block text-sm font-medium text-gray-700">
                      Text Color
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="color"
                        id="text_color"
                        value={formData.text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                        className="h-10 w-14 rounded border-gray-300"
                      />
                      <input
                        type="text"
                        value={formData.text_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="text_align" className="block text-sm font-medium text-gray-700">
                      Text Alignment
                    </label>
                    <select
                      id="text_align"
                      value={formData.text_align}
                      onChange={(e) => setFormData(prev => ({ ...prev, text_align: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Call-to-Action Buttons</h2>

                {/* Primary CTA */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Primary Button</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={formData.cta_primary_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_text: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Button URL</label>
                      <input
                        type="text"
                        value={formData.cta_primary_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_url: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        placeholder="/products"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.cta_primary_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_color: e.target.value }))}
                          className="h-8 w-12 rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.cta_primary_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_color: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.cta_primary_text_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_text_color: e.target.value }))}
                          className="h-8 w-12 rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.cta_primary_text_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, cta_primary_text_color: e.target.value }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Secondary Button (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={formData.cta_secondary_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_secondary_text: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        placeholder="Learn More"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Button URL</label>
                      <input
                        type="text"
                        value={formData.cta_secondary_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_secondary_url: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        placeholder="/about"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-6">
              {/* Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
                      Display Order
                    </label>
                    <input
                      type="number"
                      id="display_order"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Set as Active
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_animations"
                      checked={formData.enable_animations}
                      onChange={(e) => setFormData(prev => ({ ...prev, enable_animations: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="enable_animations" className="ml-2 block text-sm text-gray-900">
                      Enable Animations
                    </label>
                  </div>
                </div>
              </div>

              {/* Height Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Height</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="height_desktop" className="block text-sm font-medium text-gray-700">
                      Desktop Height
                    </label>
                    <input
                      type="text"
                      id="height_desktop"
                      value={formData.height_desktop}
                      onChange={(e) => setFormData(prev => ({ ...prev, height_desktop: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="100vh"
                    />
                  </div>

                  <div>
                    <label htmlFor="height_mobile" className="block text-sm font-medium text-gray-700">
                      Mobile Height
                    </label>
                    <input
                      type="text"
                      id="height_mobile"
                      value={formData.height_mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, height_mobile: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="70vh"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href="/hero"
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

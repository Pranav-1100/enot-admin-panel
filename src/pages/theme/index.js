import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, SwatchIcon } from '@heroicons/react/24/outline';

import { themeAPI } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ThemeManager() {
  const router = useRouter();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await themeAPI.getAll();
      setThemes(response.data.themes || []);
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await themeAPI.delete(id);
      toast.success('Theme deleted successfully');
      fetchThemes();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast.error(error.response?.data?.message || 'Failed to delete theme');
    }
  };

  const handleActivate = async (id) => {
    try {
      await themeAPI.activate(id);
      toast.success('Theme activated successfully');
      fetchThemes();
    } catch (error) {
      console.error('Error activating theme:', error);
      toast.error('Failed to activate theme');
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
        <title>Theme Manager - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Theme Manager</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage website themes, colors, fonts, and styling presets
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/theme/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Theme
            </Link>
          </div>
        </div>

        {/* Themes List */}
        <div className="mt-8">
          {themes.length === 0 ? (
            <div className="text-center py-12">
              <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No themes</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new theme preset.</p>
              <div className="mt-6">
                <Link
                  href="/theme/create"
                  className="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Theme
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className="relative rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Active Badge */}
                  {theme.is_active && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                        Active
                      </span>
                    </div>
                  )}

                  {/* Theme Preview */}
                  <div className="p-6" style={{ backgroundColor: theme.background_color || '#FFFFFF' }}>
                    {/* Color Palette Preview */}
                    <div className="flex gap-2 mb-4">
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: theme.primary_color || '#D97706' }}
                        title={`Primary: ${theme.primary_color || '#D97706'}`}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: theme.secondary_color || '#92400E' }}
                        title={`Secondary: ${theme.secondary_color || '#92400E'}`}
                      />
                      <div
                        className="h-12 w-12 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: theme.accent_color || '#F59E0B' }}
                        title={`Accent: ${theme.accent_color || '#F59E0B'}`}
                      />
                    </div>

                    {/* Theme Name & Description */}
                    <h3 className="text-lg font-bold mb-2" style={{ color: theme.text_color || '#1F2937' }}>
                      {theme.name}
                    </h3>
                    {theme.description && (
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.text_color || '#6B7280' }}>
                        {theme.description}
                      </p>
                    )}

                    {/* Typography Preview */}
                    <div className="space-y-2 mb-4">
                      <div
                        className="text-sm font-medium"
                        style={{
                          fontFamily: theme.heading_font || 'Inter',
                          color: theme.text_color || '#1F2937'
                        }}
                      >
                        Heading Font: {theme.heading_font || 'Inter'}
                      </div>
                      <div
                        className="text-sm"
                        style={{
                          fontFamily: theme.body_font || 'Inter',
                          color: theme.text_color || '#6B7280'
                        }}
                      >
                        Body Font: {theme.body_font || 'Inter'}
                      </div>
                    </div>

                    {/* Button Preview */}
                    <div className="mb-4">
                      <button
                        type="button"
                        disabled
                        className="text-sm font-medium px-4 py-2 shadow-sm"
                        style={{
                          backgroundColor: theme.primary_color || '#D97706',
                          color: '#FFFFFF',
                          borderRadius: theme.button_radius || '6px',
                          cursor: 'default'
                        }}
                      >
                        Button Preview
                      </button>
                    </div>

                    {/* Additional Details */}
                    <div className="text-xs space-y-1" style={{ color: theme.text_color || '#6B7280' }}>
                      <div>Button Style: {theme.button_style || 'solid'}</div>
                      <div>Card Style: {theme.card_style || 'elevated'}</div>
                      <div>Card Radius: {theme.card_radius || '8px'}</div>
                      {theme.card_hover_effect && (
                        <div>Hover: {theme.card_hover_effect}</div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="text-xs">
                        {new Date(theme.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/theme/${theme.id}/edit`}
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ show: true, id: theme.id })}
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                      {!theme.is_active && (
                        <button
                          onClick={() => handleActivate(theme.id)}
                          className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteModal({ show: false, id: null })} />

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Theme</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this theme? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(deleteModal.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

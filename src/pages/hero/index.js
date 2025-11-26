import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { heroAPI } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function HeroManager() {
  const router = useRouter();
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchHeroSections();
  }, []);

  const fetchHeroSections = async () => {
    try {
      setLoading(true);
      const response = await heroAPI.getAll();
      setHeroSections(response.data.heroSections || []);
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      toast.error('Failed to load hero sections');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await heroAPI.delete(id);
      toast.success('Hero section deleted successfully');
      fetchHeroSections();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      console.error('Error deleting hero section:', error);
      toast.error(error.response?.data?.message || 'Failed to delete hero section');
    }
  };

  const handleActivate = async (id) => {
    try {
      await heroAPI.update(id, { is_active: true });
      toast.success('Hero section activated');
      fetchHeroSections();
    } catch (error) {
      console.error('Error activating hero section:', error);
      toast.error('Failed to activate hero section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hero Section Manager - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hero Section Manager</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your homepage hero section content and appearance
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/hero/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Hero Section
            </Link>
          </div>
        </div>

        {/* Hero Sections List */}
        <div className="mt-8">
          {heroSections.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hero sections</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new hero section.</p>
              <div className="mt-6">
                <Link
                  href="/hero/create"
                  className="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Hero Section
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {heroSections.map((hero) => (
                <div
                  key={hero.id}
                  className="relative rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Active Badge */}
                  {hero.is_active && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        <CheckCircleIcon className="mr-1 h-4 w-4" />
                        Active
                      </span>
                    </div>
                  )}

                  {/* Background Preview */}
                  <div className="relative h-48 bg-gray-900">
                    {hero.background_image ? (
                      <img
                        src={hero.background_image}
                        alt={hero.title}
                        className="h-full w-full object-cover"
                        style={{ opacity: 1 - hero.overlay_opacity / 100 }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">No background image</p>
                      </div>
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: hero.overlay_color || '#000000',
                        opacity: hero.overlay_opacity / 100
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <h2
                        className="text-3xl font-bold mb-2"
                        style={{ color: hero.text_color || '#FFFFFF' }}
                      >
                        {hero.title}
                      </h2>
                      {hero.subtitle && (
                        <p
                          className="text-sm"
                          style={{ color: hero.text_color || '#FFFFFF' }}
                        >
                          {hero.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {hero.title}
                    </h3>
                    {hero.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {hero.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>Order: {hero.display_order}</span>
                      <span className="text-xs">
                        {new Date(hero.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/hero/${hero.id}/edit`}
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ show: true, id: hero.id })}
                          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                      {!hero.is_active && (
                        <button
                          onClick={() => handleActivate(hero.id)}
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Hero Section</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this hero section? This action cannot be undone.
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

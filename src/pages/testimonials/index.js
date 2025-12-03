import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { testimonialsAPI } from '../../lib/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TestimonialsManager() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [filters, setFilters] = useState({
    is_active: true,
    is_featured: null,
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchTestimonials();
  }, [filters]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialsAPI.getAll(filters);
      setTestimonials(response.data.data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await testimonialsAPI.delete(id);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to delete testimonial');
    }
  };

  const toggleFeature = async (id, currentStatus) => {
    try {
      await testimonialsAPI.update(id, { is_featured: !currentStatus });
      toast.success(currentStatus ? 'Removed from featured' : 'Added to featured');
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
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
        <title>Testimonials Manager - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonials Manager</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage customer testimonials and reviews
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/testimonials/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Testimonial
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex gap-4">
          <select
            value={filters.is_active ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value === '' ? null : e.target.value === 'true' }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.is_featured ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, is_featured: e.target.value === '' ? null : e.target.value === 'true' }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
          >
            <option value="">All Testimonials</option>
            <option value="true">Featured Only</option>
            <option value="false">Not Featured</option>
          </select>
        </div>

        {/* Testimonials List */}
        <div className="mt-8">
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No testimonials</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new testimonial.</p>
              <div className="mt-6">
                <Link
                  href="/testimonials/create"
                  className="inline-flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Testimonial
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {testimonials.map((testimonial) => (
                  <li key={testimonial.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {/* Customer Photo */}
                            {testimonial.customer_photo ? (
                              <img
                                src={testimonial.customer_photo}
                                alt={testimonial.customer_name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium text-lg">
                                  {testimonial.customer_name.charAt(0)}
                                </span>
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {testimonial.customer_name}
                                </h3>
                                {testimonial.is_verified_purchase && (
                                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                    <CheckCircleIcon className="mr-1 h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                                {testimonial.is_featured && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                    Featured
                                  </span>
                                )}
                                {!testimonial.is_active && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              {testimonial.customer_title && (
                                <p className="text-xs text-gray-500">{testimonial.customer_title}</p>
                              )}
                              <div className="mt-1">
                                {renderStars(testimonial.rating)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {testimonial.content}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {testimonial.location && (
                              <span>📍 {testimonial.location}</span>
                            )}
                            {testimonial.source && (
                              <span>Source: {testimonial.source}</span>
                            )}
                            <span>
                              {new Date(testimonial.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex items-center gap-2">
                          <button
                            onClick={() => toggleFeature(testimonial.id, testimonial.is_featured)}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ${
                              testimonial.is_featured
                                ? 'bg-amber-50 text-amber-700 ring-amber-600 hover:bg-amber-100'
                                : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <StarIcon className="h-4 w-4 mr-1" />
                            {testimonial.is_featured ? 'Featured' : 'Feature'}
                          </button>
                          <Link
                            href={`/testimonials/${testimonial.id}/edit`}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, id: testimonial.id })}
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Testimonial</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this testimonial? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                <button
                  onClick={() => handleDelete(deleteModal.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
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

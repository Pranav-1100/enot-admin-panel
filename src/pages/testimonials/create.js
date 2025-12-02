import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { testimonialsAPI, productsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateTestimonial() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_title: '',
    customer_photo: '',
    content: '',
    rating: 5,
    product_id: '',
    location: '',
    testimonial_date: new Date().toISOString().split('T')[0],
    is_verified_purchase: false,
    is_featured: false,
    is_active: true,
    display_order: 0,
    source: 'Website',
    video_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ page: 1, limit: 100 });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, customer_photo: reader.result }));
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await testimonialsAPI.create(formData);
      toast.success('Testimonial created successfully!');
      router.push('/testimonials');
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to create testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Testimonial - ENOT Admin</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/testimonials"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Testimonials
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Testimonial</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new customer testimonial or review
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        id="customer_name"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="customer_title" className="block text-sm font-medium text-gray-700">
                        Title/Role
                      </label>
                      <input
                        type="text"
                        id="customer_title"
                        value={formData.customer_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_title: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="Fashion Designer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="New York, USA"
                      />
                    </div>

                    <div>
                      <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                        Source
                      </label>
                      <input
                        type="text"
                        id="source"
                        value={formData.source}
                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="Website, Google, Instagram"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Photo
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-24 w-24 rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setFormData(prev => ({ ...prev, customer_photo: '' }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Testimonial Content</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                      Rating *
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`h-8 w-8 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({formData.rating} stars)</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Testimonial Text *
                    </label>
                    <textarea
                      id="content"
                      required
                      rows={5}
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="This product is absolutely amazing..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.content.length} / 2000 characters
                    </p>
                  </div>

                  <div>
                    <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                      Video Testimonial URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="https://youtube.com/..."
                    />
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
                    <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
                      Related Product (Optional)
                    </label>
                    <select
                      id="product_id"
                      value={formData.product_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                      <option value="">None</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="testimonial_date" className="block text-sm font-medium text-gray-700">
                      Testimonial Date
                    </label>
                    <input
                      type="date"
                      id="testimonial_date"
                      value={formData.testimonial_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, testimonial_date: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>

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

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_verified_purchase"
                        checked={formData.is_verified_purchase}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_verified_purchase: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="is_verified_purchase" className="ml-2 block text-sm text-gray-900">
                        Verified Purchase
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                        Feature on Homepage
                      </label>
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
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Testimonial'}
                </button>
                <Link
                  href="/testimonials"
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

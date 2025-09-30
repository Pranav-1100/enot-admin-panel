import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { blogsAPI, blogCategoriesAPI } from '@/lib/api';
import BlogForm from '@/components/blogs/BlogForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';

export default function CreateBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await blogCategoriesAPI.getAll();
      const categoriesData = response.data.data?.categories || response.data.categories || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories. Please refresh the page.');
    } finally {
      setFetchingCategories(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // Build blog data
      const blogData = {
        title: formData.title,
        content: formData.content,
        status: formData.status
      };

      // Add optional fields only if they have values
      if (formData.excerpt) blogData.excerpt = formData.excerpt;
      if (formData.categoryId) blogData.categoryId = formData.categoryId;
      if (formData.featuredImage) blogData.featuredImage = formData.featuredImage;
      if (formData.featuredImageAlt) blogData.featuredImageAlt = formData.featuredImageAlt;
      if (formData.metaTitle) blogData.metaTitle = formData.metaTitle;
      if (formData.metaDescription) blogData.metaDescription = formData.metaDescription;
      if (formData.focusKeyword) blogData.focusKeyword = formData.focusKeyword;
      
      blogData.isFeatured = formData.isFeatured;

      console.log('Creating blog with:', blogData);

      const response = await blogsAPI.create(blogData);
      console.log('Blog created:', response.data);

      alert(formData.status === 'published' ? 'Blog published successfully!' : 'Blog saved as draft!');
      router.push('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Discard changes and go back?')) {
      router.push('/blogs');
    }
  };

  if (fetchingCategories) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Blog Post - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/blogs" 
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Blog Post</h1>
              <p className="mt-1 text-sm text-gray-600">
                Write and publish a new blog post
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Auto-generated fields</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>SEO-friendly URL slug will be generated from title</li>
                  <li>Reading time will be calculated from content</li>
                  <li>Excerpt will be extracted if not provided</li>
                  <li>Meta fields will default to title and excerpt if empty</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Warning */}
        {categories.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No categories available</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You can still create blog posts, but consider{' '}
                  <Link href="/blogs/categories" className="font-medium underline">
                    creating categories
                  </Link>{' '}
                  for better organization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blog Form */}
        <BlogForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </>
  );
}
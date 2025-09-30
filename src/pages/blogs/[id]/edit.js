import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { blogsAPI, blogCategoriesAPI } from '@/lib/api';
import BlogForm from '@/components/blogs/BlogForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';

export default function EditBlog() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [blog, setBlog] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setFetchingData(true);
      
      console.log('Fetching blog with ID:', id);
      
      let blogData = null;
      let categoriesData = [];
      
      // Try to fetch blog first
      try {
        console.log('Calling blogsAPI.getById...');
        const blogResponse = await blogsAPI.getById(id);
        console.log('Blog API response:', blogResponse.data);
        blogData = blogResponse.data.data?.blog || blogResponse.data.blog || blogResponse.data;
      } catch (blogError) {
        console.error('Blog fetch error:', blogError);
        console.error('Blog error response:', blogError.response?.data);
        throw new Error(`Failed to fetch blog: ${blogError.response?.data?.error?.message || blogError.message}`);
      }
      
      // Try to fetch categories
      try {
        console.log('Calling blogCategoriesAPI.getAll...');
        const categoriesResponse = await blogCategoriesAPI.getAll();
        console.log('Categories API response:', categoriesResponse.data);
        categoriesData = categoriesResponse.data.data?.categories || categoriesResponse.data.categories || [];
      } catch (categoriesError) {
        console.error('Categories fetch error:', categoriesError);
        // Categories are optional, so don't fail completely
        categoriesData = [];
      }
      
      if (!blogData) {
        throw new Error('Blog not found in response');
      }
      
      setBlog(blogData);
      setCategories(categoriesData);
      
      console.log('Successfully loaded blog:', blogData.title);
    } catch (error) {
      console.error('Error loading blog:', error);
      alert(`Error loading blog: ${error.message}`);
      router.push('/blogs');
    } finally {
      setFetchingData(false);
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

      console.log('Updating blog with:', blogData);

      const response = await blogsAPI.update(id, blogData);
      console.log('Blog updated:', response.data);

      alert('Blog updated successfully!');
      router.push('/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
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

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Blog not found</p>
        <Link href="/blogs" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Blog - {blog.title} - E° ENOT Admin</title>
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
              <h1 className="text-2xl font-semibold text-gray-900">Edit Blog Post</h1>
              <p className="mt-1 text-sm text-gray-600">{blog.title}</p>
            </div>
          </div>
        </div>

        {/* Blog Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  blog.status === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {blog.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Views</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {blog.viewCount || 0}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Reading Time</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {blog.readingTime || 0} min
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-500">Slug</div>
              <div className="mt-1 text-sm text-gray-900 truncate" title={blog.slug}>
                {blog.slug}
              </div>
            </div>
          </div>

          {blog.status === 'published' && blog.publishedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Published on {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preview Link */}
        {blog.status === 'published' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Live Blog Post</h3>
                <p className="mt-1 text-sm text-blue-700">
                  This post is currently published and visible to users
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || ''}/blog/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                View on Site
              </a>
            </div>
          </div>
        )}

        {/* Blog Form */}
        <BlogForm
          blog={blog}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </>
  );
}
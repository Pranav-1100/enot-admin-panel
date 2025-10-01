import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  EyeIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { blogsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError } from '@/lib/utils';

export default function BlogPreview() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug();
    }
  }, [slug]);

  const fetchBlogBySlug = async () => {
    try {
      setLoading(true);
      
      // Fetch all blogs and find by slug
      const response = await blogsAPI.getAll({ status: 'all' });
      const blogs = response.data.data?.data || [];
      const foundBlog = blogs.find(b => b.slug === slug);
      
      if (!foundBlog) {
        throw new Error('Blog not found');
      }
      
      setBlog(foundBlog);
      
      // Get related posts (same category)
      if (foundBlog.category) {
        const related = blogs
          .filter(b => b.id !== foundBlog.id && b.category?.id === foundBlog.category.id && b.status === 'published')
          .slice(0, 3);
        setRelatedPosts(related);
      }
      
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert(handleAPIError(error));
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Blog not found</h2>
          <p className="mt-2 text-gray-600">The blog post you're looking for doesn't exist.</p>
          <Link 
            href="/blogs" 
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{blog.metaTitle || blog.title} - E° ENOT</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        {blog.focusKeyword && <meta name="keywords" content={blog.focusKeyword} />}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
        <meta property="og:type" content="article" />
      </Head>

      {/* Preview Banner */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-500 px-3 py-1 rounded-full text-sm font-medium mr-3">
              PREVIEW
            </div>
            <span className="text-sm">
              This is how your blog post will appear on the main website
            </span>
          </div>
          <Link
            href="/blogs"
            className="flex items-center text-blue-100 hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Category Badge */}
          {blog.category && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <TagIcon className="h-4 w-4 mr-1" />
                {blog.category.name}
              </span>
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            
            {blog.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
              {blog.author && (
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  <span>By {blog.author.name}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              
              {blog.readingTime && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{blog.readingTime} min read</span>
                </div>
              )}
              
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{blog.viewCount || 0} views</span>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="mb-8">
                <img
                  src={blog.featuredImage}
                  alt={blog.featuredImageAlt || blog.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
                {blog.featuredImageAlt && (
                  <p className="text-sm text-gray-500 mt-2 text-center italic">
                    {blog.featuredImageAlt}
                  </p>
                )}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div 
              className="prose prose-lg prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: '#374151'
              }}
            />
          </div>

          {/* Article Footer */}
          <footer className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share this article</h3>
                <div className="flex space-x-4">
                  <button className="text-blue-600 hover:text-blue-800">Facebook</button>
                  <button className="text-blue-400 hover:text-blue-600">Twitter</button>
                  <button className="text-blue-700 hover:text-blue-900">LinkedIn</button>
                </div>
              </div>
              
              {blog.author && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Written by</p>
                  <p className="font-semibold text-gray-900">{blog.author.name}</p>
                </div>
              )}
            </div>
          </footer>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`} className="block">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-lg mb-3 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                      
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {post.title}
                      </h4>
                      
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{post.readingTime} min read</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>

      {/* Global Styles for Content */}
      <style jsx global>{`
        .prose h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        
        .prose p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        
        .prose ul, .prose ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
        
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .prose a:hover {
          color: #1d4ed8;
        }
        
        .prose img {
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          max-width: 100%;
          height: auto;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
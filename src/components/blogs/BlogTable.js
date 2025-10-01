import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { getStatusColor, handleAPIError, truncate } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BlogTable({ 
  blogs = [], 
  loading = false,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  showActions = true,
  pagination = null,
  onPageChange
}) {
  const handleDelete = async (blogId, blogTitle) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"?`)) return;
    
    try {
      await onDelete(blogId);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handlePublish = async (blogId, blogTitle) => {
    if (!confirm(`Publish "${blogTitle}"?`)) return;
    
    try {
      await onPublish(blogId);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const handleUnpublish = async (blogId, blogTitle) => {
    if (!confirm(`Unpublish "${blogTitle}" and convert to draft?`)) return;
    
    try {
      await onUnpublish(blogId);
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      {blog.featuredImage ? (
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <Link
                          href={`/blogs/${blog.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline cursor-pointer"
                        >
                          {truncate(blog.title, 60)}
                        </Link>
                        {blog.excerpt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {truncate(blog.excerpt, 80)}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Slug: {blog.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {blog.category?.name || 'Uncategorized'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      
                      {blog.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{blog.viewCount || 0} views</span>
                      </div>
                      {blog.readingTime && (
                        <div className="text-xs text-gray-500 mt-1">
                          {blog.readingTime} min read
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {blog.status === 'published' && blog.publishedAt
                        ? formatDate(blog.publishedAt)
                        : formatDate(blog.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {blog.status === 'published' ? 'Published' : 'Created'}
                    </div>
                    {blog.author && (
                      <div className="text-xs text-gray-400 mt-1">
                        by {blog.author.name}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {blog.status === 'published' && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || ''}/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                          title="View on site"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </a>
                      )}
                      
                      <Link
                        href={`/blogs/preview/${blog.id}`}
                        target="_blank"
                        className="text-purple-600 hover:text-purple-900"
                        title={`Preview: ${blog.title}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      
                      <Link
                        href={`/blogs/${blog.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Blog"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      
                      {blog.status === 'draft' && onPublish && (
                        <button
                          onClick={() => handlePublish(blog.id, blog.title)}
                          className="text-green-600 hover:text-green-900"
                          title="Publish Blog"
                        >
                          <RocketLaunchIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {blog.status === 'published' && onUnpublish && (
                        <button
                          onClick={() => handleUnpublish(blog.id, blog.title)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Unpublish Blog"
                        >
                          <EyeSlashIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(blog.id, blog.title)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Blog"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blog posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new blog post.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && onPageChange && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
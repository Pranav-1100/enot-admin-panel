import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { categoriesAPI } from '@/lib/api';
import CategoryForm from '@/components/forms/CategoryForm';
import { handleAPIError } from '@/lib/utils';

export default function CreateCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      // Handle nested data structure correctly
      const categoriesData = response.data.data?.categories || response.data.categories || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async ({ categoryData, newImage }) => {
    try {
      setLoading(true);

      const response = await categoriesAPI.create(categoryData);
      // Handle different response structures
      const category = response.data.category || response.data.data?.category || response.data.data;
      const categoryId = category.id;

      // Upload image if provided
      if (newImage && categoryId) {
        const imageFormData = new FormData();
        imageFormData.append('image', newImage);
        await categoriesAPI.uploadImage(categoryId, imageFormData);
      }

      router.push('/categories');
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return (
    <>
      <Head>
        <title>Create Category - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/categories"
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Category</h1>
              <p className="mt-1 text-sm text-gray-600">
                Add a new category to organize your products
              </p>
            </div>
          </div>
        </div>

        {/* Category Form */}
        <CategoryForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </>
  );
}
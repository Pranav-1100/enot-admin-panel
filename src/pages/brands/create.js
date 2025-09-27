import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { brandsAPI } from '@/lib/api';
import BrandForm from '@/components/forms/BrandForm';
import { handleAPIError } from '@/lib/utils';

export default function CreateBrand() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ brandData, newLogo }) => {
    try {
      setLoading(true);

      const response = await brandsAPI.create(brandData);
      const brandId = response.data.brand.id;

      // Upload logo if provided
      if (newLogo) {
        const logoFormData = new FormData();
        logoFormData.append('logo', newLogo);
        await brandsAPI.uploadLogo(brandId, logoFormData);
      }

      router.push('/brands');
    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/brands');
  };

  return (
    <>
      <Head>
        <title>Create Brand - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/brands"
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Brand</h1>
              <p className="mt-1 text-sm text-gray-600">
                Add a new brand to your marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Brand Form */}
        <BrandForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { brandsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getStatusColor, formatRelativeTime, handleAPIError } from '@/lib/utils';

export default function BrandsIndex() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandsAPI.getAll({ 
        includeInactive: true,
        search: searchQuery 
      });
      
      console.log('Brands API response:', response.data);
      
      // Handle nested data structure correctly - try multiple possible paths
      const brandsData = response.data.data?.brands || 
                        response.data.data || 
                        response.data.brands || 
                        [];
      
      console.log('Brands data extracted:', brandsData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await brandsAPI.delete(brandId);
      await fetchBrands();
    } catch (error) {
      alert(handleAPIError(error));
    }
  };

  const BrandForm = ({ brand, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
      name: brand?.name || '',
      description: brand?.description || '',
      websiteUrl: brand?.websiteUrl || '',
      country: brand?.country || '',
      foundedYear: brand?.foundedYear || '',
      isActive: brand?.isActive !== false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        let createdBrand;
        
        if (brand) {
          await brandsAPI.update(brand.id, formData);
          createdBrand = { id: brand.id };
        } else {
          const response = await brandsAPI.create(formData);
          // Handle different response structures
          createdBrand = response.data.brand || 
                        response.data.data?.brand || 
                        response.data.data || 
                        response.data;
        }

        // Upload logo if provided
        if (logoFile && createdBrand.id) {
          const logoFormData = new FormData();
          logoFormData.append('logo', logoFile);
          await brandsAPI.uploadLogo(createdBrand.id, logoFormData);
        }

        onSuccess();
        onClose();
      } catch (error) {
        alert(handleAPIError(error));
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {brand ? 'Edit Brand' : 'Create Brand'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brand description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://brand.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Founded Year</label>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.foundedYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="1920"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {logoFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo preview"
                    className="h-16 w-16 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                {brand ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Brands - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Brands</h1>
            <p className="mt-2 text-sm text-gray-700">Manage product brands and manufacturers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Brand
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700">Search Brands</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by name or country..."
            />
          </div>
        </div>

        {/* Brands Grid */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-16 w-16">
                        {brand.logo ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={brand.logo.url}
                            alt={brand.name}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {brand.name}
                        </h3>
                        {brand.country && (
                          <p className="text-sm text-gray-500">{brand.country}</p>
                        )}
                        {brand.foundedYear && (
                          <p className="text-xs text-gray-400">Founded {brand.foundedYear}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingBrand(brand)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {brand.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                      {brand.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getStatusColor(brand.isActive !== false ? 'active' : 'inactive')
                    }`}>
                      {brand.isActive !== false ? 'Active' : 'Inactive'}
                    </span>

                    <div className="text-xs text-gray-500">
                      {brand.productCount || brand.productsCount || 0} products
                    </div>
                  </div>

                  {brand.websiteUrl && (
                    <div className="mt-3">
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-400">
                    Created {formatRelativeTime(brand.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'No brands found' : 'No brands'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 
                  'Try adjusting your search terms.' : 
                  'Get started by creating a new brand.'
                }
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add Brand
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <BrandForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchBrands}
        />
      )}

      {/* Edit Modal */}
      {editingBrand && (
        <BrandForm
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onSuccess={fetchBrands}
        />
      )}
    </>
  );
}
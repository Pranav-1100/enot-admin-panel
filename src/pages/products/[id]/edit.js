import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { productsAPI, categoriesAPI, brandsAPI, tagsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError, validateFile } from '@/lib/utils';
import ImageUploadSections from '@/components/products/ImageUploadSections';
import VariantsManager from '@/components/products/VariantsManager';
import TagSelector from '@/components/products/TagSelector';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Dropdowns data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    brandId: '',
    price: '',
    comparePrice: '',
    gender: 'unisex',
    fragranceFamily: '',
    concentration: '',
    sizeMl: '',
    requiresShipping: true,
    weight: '',
    isFeatured: false,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    tagIds: [],
    metadata: '{}'
  });

  const [variants, setVariants] = useState([]);
  const [currentImages, setCurrentImages] = useState({ hero: [], gallery: [], description: [] });

  // Load data
  useEffect(() => {
    if (id) {
      loadProduct();
      loadDropdownData();
    }
  }, [id]);

  const loadDropdownData = async () => {
    try {
      const [catRes, brandRes, tagRes] = await Promise.all([
        categoriesAPI.getAll({ flat: true }), // Use flat parameter instead of limit
        brandsAPI.getAll({ limit: 100 }), // Max limit is 100
        tagsAPI.getAll() // Tags API doesn't support limit parameter
      ]);

      // Extract data from responses
      const categoriesData = catRes.data.data?.categories || catRes.data.categories || [];
      const brandsData = brandRes.data.data?.brands || brandRes.data.data || brandRes.data.brands || [];
      const tagsData = tagRes.data.tags || tagRes.data.data?.tags || [];

      console.log('Loaded data:', {
        categories: categoriesData.length,
        brands: brandsData.length,
        tags: tagsData.length
      });

      setCategories(categoriesData);
      setBrands(brandsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      alert('Failed to load categories, brands, or tags. Please refresh the page.');
    }
  };

  const loadProduct = async () => {
    try {
      setFetching(true);
      const response = await productsAPI.getById(id);
      const product = response.data.data?.product || response.data.product;

      // Set form data
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        categoryId: product.category?.id || '',
        brandId: product.brand?.id || '',
        price: product.price ? (product.price / 100).toFixed(2) : '',
        comparePrice: product.comparePrice ? (product.comparePrice / 100).toFixed(2) : '',
        gender: product.gender || 'unisex',
        fragranceFamily: product.fragranceFamily || '',
        concentration: product.concentration || '',
        sizeMl: product.sizeMl || '',
        requiresShipping: product.requiresShipping !== false,
        weight: product.weight || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        tagIds: product.tags?.map(t => t.id) || [],
        metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '{}'
      });

      // Set variants
      setVariants(product.variants || []);

      // Set images
      if (product.images) {
        setCurrentImages(product.images);
      }

    } catch (error) {
      alert(handleAPIError(error));
      router.push('/products');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse metadata JSON
      let metadata = null;
      if (formData.metadata && formData.metadata.trim() !== '{}') {
        try {
          metadata = JSON.parse(formData.metadata);
        } catch (err) {
          alert('Invalid JSON in metadata field');
          setLoading(false);
          return;
        }
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        price: Math.round(parseFloat(formData.price) * 100),
        comparePrice: formData.comparePrice ? Math.round(parseFloat(formData.comparePrice) * 100) : null,
        gender: formData.gender,
        fragranceFamily: formData.fragranceFamily,
        concentration: formData.concentration,
        sizeMl: formData.sizeMl ? parseInt(formData.sizeMl) : null,
        requiresShipping: formData.requiresShipping,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        tagIds: formData.tagIds,
        metadata: metadata
      };

      // Update product
      await productsAPI.update(id, productData);

      // Upload new images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach(file => {
          imageFormData.append('images', file);
        });
        await productsAPI.uploadImages(id, imageFormData);
      }

      alert('Product updated successfully!');
      router.push('/products');

    } catch (error) {
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, tagIds: selected }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = [];

    files.forEach(file => {
      const error = validateFile(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      alert(newErrors.join('\n'));
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    // Prepare preview data with current form values
    const previewData = {
      id: id,
      name: formData.name || 'Untitled Product',
      sku: formData.sku,
      description: formData.description,
      shortDescription: formData.shortDescription,
      price: parseFloat(formData.price) || 0,
      compareAtPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      category: categories.find(c => c.id === formData.categoryId),
      brand: brands.find(b => b.id === formData.brandId),
      tags: tags.filter(t => formData.tagIds.includes(t.id)),
      gender: formData.gender,
      fragranceFamily: formData.fragranceFamily,
      concentration: formData.concentration,
      sizeMl: formData.sizeMl,
      quantity: parseInt(formData.quantity),
      trackQuantity: formData.trackQuantity,
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      requiresShipping: formData.requiresShipping,
      weight: formData.weight,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      images: formData.images || [],  // Use existing images
      variants: formData.variants || variants,
      metadata: formData.metadata ? JSON.parse(formData.metadata || '{}') : {},
      seo: {
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription
      }
    };

    // Store in sessionStorage
    sessionStorage.setItem('productPreview', JSON.stringify(previewData));

    // Open preview in new tab
    window.open('/products/preview', '_blank');
  };

  if (fetching) {
    return (
      <>
        <Head>
          <title>Loading... - E° ENOT Admin</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Product - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/products" className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
              <p className="mt-1 text-sm text-gray-600">Update product information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout: Main content + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  SKU (read-only)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Description (HTML supported)
                </label>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Perfume Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Perfume Details</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fragrance Family
                </label>
                <select
                  name="fragranceFamily"
                  value={formData.fragranceFamily}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select family</option>
                  <option value="floral">Floral</option>
                  <option value="oriental">Oriental</option>
                  <option value="woody">Woody</option>
                  <option value="fresh">Fresh</option>
                  <option value="citrus">Citrus</option>
                  <option value="aquatic">Aquatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Concentration
                </label>
                <select
                  name="concentration"
                  value={formData.concentration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select concentration</option>
                  <option value="parfum">Parfum</option>
                  <option value="eau_de_parfum">Eau de Parfum (EDP)</option>
                  <option value="eau_de_toilette">Eau de Toilette (EDT)</option>
                  <option value="eau_de_cologne">Eau de Cologne (EDC)</option>
                  <option value="attar">Attar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Size (ML)
                </label>
                <input
                  type="number"
                  name="sizeMl"
                  value={formData.sizeMl}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white shadow rounded-lg p-6">
            <TagSelector
              tags={tags.filter(t => t.type === 'product' || t.type === 'both')}
              selectedTagIds={formData.tagIds}
              onChange={(newTagIds) => setFormData(prev => ({ ...prev, tagIds: newTagIds }))}
              label="Product Tags"
            />
          </div>

          {/* Variants */}
          <div className="bg-white shadow rounded-lg p-6">
            <VariantsManager
              variants={variants}
              onChange={setVariants}
            />
            <p className="mt-2 text-xs text-gray-500">
              Note: Variant changes are saved when you update the product
            </p>
          </div>

          {/* Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Advanced Metadata (Optional)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add custom product data as valid JSON. This can include fragrance details, seasonal info, etc.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <p className="text-xs font-medium text-blue-900 mb-1">Example Format:</p>
              <pre className="text-xs text-blue-800 overflow-x-auto">{`{
  "longevity_hours": "6-8",
  "sillage": "moderate",
  "season": ["spring", "summer"],
  "occasion": ["casual", "office"]
}`}</pre>
            </div>
            <textarea
              name="metadata"
              rows={8}
              value={formData.metadata}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              placeholder='Enter valid JSON or leave as {}'
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Leave as <code className="bg-gray-100 px-1 rounded">{'{}'}</code> if you don't need custom metadata
            </p>
          </div>

          {/* SEO */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">SEO</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
            </div>
            {/* End Left Column */}

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
                <ImageUploadSections
                  productId={id}
                  onImagesUploaded={loadProduct}
                />

                {/* Show current images summary */}
                {(currentImages.hero.length > 0 || currentImages.gallery.length > 0 || currentImages.description.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-700 mb-1">Current Images:</p>
                    <ul className="text-gray-600 space-y-1">
                      {currentImages.hero.length > 0 && <li>• Hero: {currentImages.hero.length} images</li>}
                      {currentImages.gallery.length > 0 && <li>• Gallery: {currentImages.gallery.length} images</li>}
                      {currentImages.description.length > 0 && <li>• Description: {currentImages.description.length} images</li>}
                    </ul>
                  </div>
                )}
              </div>

              {/* Organization */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Organization</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Compare Price ($)
                    </label>
                    <input
                      type="number"
                      name="comparePrice"
                      step="0.01"
                      value={formData.comparePrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active (visible to customers)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Featured on homepage
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresShipping"
                      checked={formData.requiresShipping}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Requires shipping
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* End Right Column */}
          </div>
          {/* End Grid */}

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
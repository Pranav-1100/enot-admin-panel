import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { productsAPI, categoriesAPI, brandsAPI, tagsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError, generateSlug, validateFile } from '@/lib/utils';
import ImageUploadSections from '@/components/products/ImageUploadSections';
import VariantsManager from '@/components/products/VariantsManager';
import TagSelector from '@/components/products/TagSelector';

export default function CreateProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
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
    concentration: 'eau_de_parfum',
    sizeMl: '',
    quantity: 100,
    trackQuantity: true,
    lowStockThreshold: 5,
    requiresShipping: true,
    weight: '',
    isFeatured: false,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    tagIds: [],
    metadata: '{}', // JSON string
    // NEW: Enhanced product page fields
    addToHomepage: false,
    temperature: '',
    color: '',
    longDescription: '',
    concept: '',
    longevityHours: '',
    concentrationPercentage: '',
    specifications: '{}', // JSON string
    trustBadges: '[]', // JSON array string
    recommendations: '{}' // JSON string
  });

  const [variants, setVariants] = useState([]);

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Auto-generate SKU and metaTitle from name
  useEffect(() => {
    if (formData.name && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        metaTitle: formData.name
      }));
    }
    if (formData.name && !formData.sku) {
      setFormData(prev => ({
        ...prev,
        sku: generateSlug(formData.name).toUpperCase()
      }));
    }
  }, [formData.name]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse JSON fields
      let metadata = null;
      let specifications = null;
      let trustBadges = null;
      let recommendations = null;

      if (formData.metadata && formData.metadata.trim() !== '{}') {
        try {
          metadata = JSON.parse(formData.metadata);
        } catch (err) {
          alert('Invalid JSON in metadata field');
          setLoading(false);
          return;
        }
      }

      if (formData.specifications && formData.specifications.trim() !== '{}') {
        try {
          specifications = JSON.parse(formData.specifications);
        } catch (err) {
          alert('Invalid JSON in specifications field');
          setLoading(false);
          return;
        }
      }

      if (formData.trustBadges && formData.trustBadges.trim() !== '[]') {
        try {
          trustBadges = JSON.parse(formData.trustBadges);
        } catch (err) {
          alert('Invalid JSON in trust badges field');
          setLoading(false);
          return;
        }
      }

      if (formData.recommendations && formData.recommendations.trim() !== '{}') {
        try {
          recommendations = JSON.parse(formData.recommendations);
        } catch (err) {
          alert('Invalid JSON in recommendations field');
          setLoading(false);
          return;
        }
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        comparePrice: formData.comparePrice ? Math.round(parseFloat(formData.comparePrice) * 100) : null,
        gender: formData.gender,
        fragranceFamily: formData.fragranceFamily,
        concentration: formData.concentration,
        sizeMl: formData.sizeMl ? parseInt(formData.sizeMl) : null,
        quantity: parseInt(formData.quantity),
        trackQuantity: formData.trackQuantity,
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        requiresShipping: formData.requiresShipping,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        isFeatured: formData.isFeatured,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        tagIds: formData.tagIds,
        metadata: metadata,
        // NEW: Enhanced product page fields
        addToHomepage: formData.addToHomepage,
        temperature: formData.temperature || null,
        color: formData.color || null,
        longDescription: formData.longDescription || null,
        concept: formData.concept || null,
        longevityHours: formData.longevityHours || null,
        concentrationPercentage: formData.concentrationPercentage || null,
        specifications: specifications,
        trustBadges: trustBadges,
        recommendations: recommendations
      };

      // Create product
      const response = await productsAPI.create(productData);
      const newProductId = response.data.data?.product?.id || response.data.product?.id;

      // Upload inline images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach(file => {
          imageFormData.append('images', file);
        });
        await productsAPI.uploadImages(newProductId, imageFormData);
        alert('Product and images created successfully!');
        router.push('/products');
      } else {
        // Show 3-type image upload section
        setCreatedProductId(newProductId);
        alert('Product created successfully! Now you can upload images in 3 categories.');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }

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
      images: selectedImages.map(file => URL.createObjectURL(file)),
      variants: variants,
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

  return (
    <>
      <Head>
        <title>Create Product - E° ENOT Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/products" className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Product</h1>
              <p className="mt-1 text-sm text-gray-600">Add a new product with all features</p>
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
                  placeholder="e.g., Luxe Perfume"
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
                  placeholder="Brief description for product cards (1-2 sentences)"
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
                  placeholder="Detailed product description. You can use HTML tags."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Long Description (Extended Story)
                </label>
                <textarea
                  name="longDescription"
                  rows={8}
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Extended product story and detailed description for product detail page"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Concept / Tagline
                </label>
                <textarea
                  name="concept"
                  rows={3}
                  value={formData.concept}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "EN 252° - IGNITION embodies the fierce temperature at which passion ignites into pure energy..."'
                />
              </div>
            </div>
          </div>

          {/* Enhanced Product Page Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Enhanced Product Page</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Temperature Display
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "252° - The Boiling Point of Fire"'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Theme Color (Hex)
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="#dc2626"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Longevity Hours
                </label>
                <input
                  type="text"
                  name="longevityHours"
                  value={formData.longevityHours}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "8-12h" or "All Day"'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Concentration Percentage
                </label>
                <input
                  type="text"
                  name="concentrationPercentage"
                  value={formData.concentrationPercentage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "20%" or "15-20%"'
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="addToHomepage"
                    checked={formData.addToHomepage}
                    onChange={(e) => setFormData(prev => ({ ...prev, addToHomepage: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Display on Homepage Carousel
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Enable this to feature this product in the homepage featured section
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications (JSON)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`{"size": "50ml", "longevity": "8-12h", "concentration": "20%", "sillage": "Moderate"}`}</pre>
                </div>
                <textarea
                  name="specifications"
                  rows={4}
                  value={formData.specifications}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  placeholder="{}"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trust Badges (JSON Array)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`["Free Shipping", "100% Authentic", "30-Day Returns", "Luxury Packaging"]`}</pre>
                </div>
                <textarea
                  name="trustBadges"
                  rows={3}
                  value={formData.trustBadges}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  placeholder="[]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendations (JSON)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`{"featured": ["product-id-1", "product-id-2"], "similar": ["product-id-3"]}`}</pre>
                </div>
                <textarea
                  name="recommendations"
                  rows={4}
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  placeholder="{}"
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
                  placeholder="50"
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
              Note: Variants are saved separately after product creation
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images (Optional)</h2>
                <p className="text-sm text-gray-500 mb-4">Upload images after creation for better organization</p>
                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />

                  {selectedImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selected ({selectedImages.length})</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                    {categories.length === 0 && (
                      <p className="mt-1 text-xs text-yellow-600">
                        ⚠️ No categories available. Create one first.
                      </p>
                    )}
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
                      placeholder="99.90"
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
                      placeholder="149.90"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      required
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., LUX-001"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="trackQuantity"
                      checked={formData.trackQuantity}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Track inventory quantity
                    </label>
                  </div>

                  {formData.trackQuantity && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          required
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          name="lowStockThreshold"
                          value={formData.lowStockThreshold}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
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
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>

        {/* 3-Type Image Upload Sections - Show after product is created */}
        {createdProductId && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Product Images (3 Types)</h2>
            <p className="text-sm text-gray-500 mb-6">
              Now upload images for your product in 3 different categories.
            </p>
            <ImageUploadSections
              productId={createdProductId}
              onImagesUploaded={() => {
                alert('Images uploaded successfully! Redirecting to products list...');
                router.push('/products');
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

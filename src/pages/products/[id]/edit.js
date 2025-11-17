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
    metadata: '{}',
    // Enhanced product page fields
    addToHomepage: false,
    temperature: '',
    color: '',
    longDescription: '',
    concept: '',
    longevityHours: '',
    concentrationPercentage: '',
    specifications: '{}',
    trustBadges: '[]',
    recommendations: '{}',
    // Fragrance notes (structured)
    fragranceNotesTop: '',
    fragranceNotesHeart: '',
    fragranceNotesBase: '',
    // Additional backend fields
    costPrice: '',
    vendor: '',
    productType: '',
    dimensions: '{}',
    publishedAt: '' // Date when product went live
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

      // Parse fragrance notes
      const topNotes = product.fragranceNotes?.top ? product.fragranceNotes.top.join(', ') : '';
      const heartNotes = product.fragranceNotes?.heart || product.fragranceNotes?.middle ?
        (product.fragranceNotes.heart || product.fragranceNotes.middle).join(', ') : '';
      const baseNotes = product.fragranceNotes?.base ? product.fragranceNotes.base.join(', ') : '';

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
        metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '{}',
        // Enhanced product page fields
        addToHomepage: product.addToHomepage || false,
        temperature: product.temperature || '',
        color: product.color || '',
        longDescription: product.longDescription || '',
        concept: product.concept || '',
        longevityHours: product.longevityHours || '',
        concentrationPercentage: product.concentrationPercentage || '',
        specifications: product.specifications ? JSON.stringify(product.specifications, null, 2) : '{}',
        trustBadges: product.trustBadges ? JSON.stringify(product.trustBadges, null, 2) : '[]',
        recommendations: product.recommendations ? JSON.stringify(product.recommendations, null, 2) : '{}',
        // Fragrance notes (structured)
        fragranceNotesTop: topNotes,
        fragranceNotesHeart: heartNotes,
        fragranceNotesBase: baseNotes,
        // Additional backend fields
        costPrice: product.costPrice ? (product.costPrice / 100).toFixed(2) : '',
        vendor: product.vendor || '',
        productType: product.productType || '',
        dimensions: product.dimensions ? JSON.stringify(product.dimensions, null, 2) : '{}',
        publishedAt: product.publishedAt ? new Date(product.publishedAt).toISOString().slice(0, 16) : ''
      });

      // Set variants
      setVariants(product.variants || []);

      // Set images - group by type
      if (product.images && Array.isArray(product.images)) {
        const groupedImages = {
          hero: product.images.filter(img => img.imageType === 'hero'),
          gallery: product.images.filter(img => img.imageType === 'gallery'),
          description: product.images.filter(img => img.imageType === 'description')
        };
        setCurrentImages(groupedImages);
      } else {
        // Ensure currentImages always has the correct structure
        setCurrentImages({ hero: [], gallery: [], description: [] });
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
      // Parse JSON fields
      let metadata = null;
      let specifications = null;
      let trustBadges = null;
      let recommendations = null;
      let dimensions = null;

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

      if (formData.dimensions && formData.dimensions.trim() !== '{}') {
        try {
          dimensions = JSON.parse(formData.dimensions);
        } catch (err) {
          alert('Invalid JSON in dimensions field');
          setLoading(false);
          return;
        }
      }

      // Build fragrance notes object
      const fragranceNotes = {};
      if (formData.fragranceNotesTop) {
        fragranceNotes.top = formData.fragranceNotesTop.split(',').map(s => s.trim()).filter(s => s);
      }
      if (formData.fragranceNotesHeart) {
        fragranceNotes.heart = formData.fragranceNotesHeart.split(',').map(s => s.trim()).filter(s => s);
      }
      if (formData.fragranceNotesBase) {
        fragranceNotes.base = formData.fragranceNotesBase.split(',').map(s => s.trim()).filter(s => s);
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
        costPrice: formData.costPrice ? Math.round(parseFloat(formData.costPrice) * 100) : null,
        gender: formData.gender,
        fragranceFamily: formData.fragranceFamily,
        concentration: formData.concentration,
        sizeMl: formData.sizeMl ? parseInt(formData.sizeMl) : null,
        fragranceNotes: Object.keys(fragranceNotes).length > 0 ? fragranceNotes : null,
        vendor: formData.vendor || null,
        productType: formData.productType || null,
        requiresShipping: formData.requiresShipping,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: dimensions,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        tagIds: formData.tagIds,
        metadata: metadata,
        // Enhanced product page fields
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

          {/* Enhanced Product Page Fields */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Enhanced Product Page</h2>
            <p className="text-sm text-gray-500 mb-4">
              These fields customize the product detail page experience
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Long Description (Extended Story)
                </label>
                <textarea
                  name="longDescription"
                  rows={4}
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  placeholder="Extended product story and detailed description for product detail page..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Concept / Tagline
                </label>
                <textarea
                  name="concept"
                  rows={2}
                  value={formData.concept}
                  onChange={handleInputChange}
                  placeholder="e.g., 'The temperature of combustion - where passion meets fire'"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Temperature Display
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="e.g., '252° - The Boiling Point of Fire'"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Theme Color (Hex)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="color"
                    value={formData.color || '#000000'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-16 rounded-l-md border border-gray-300"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="#dc2626"
                    className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Longevity (Display)
                </label>
                <input
                  type="text"
                  name="longevityHours"
                  value={formData.longevityHours}
                  onChange={handleInputChange}
                  placeholder="e.g., '8-12h' or 'All Day'"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Concentration % (Display)
                </label>
                <input
                  type="text"
                  name="concentrationPercentage"
                  value={formData.concentrationPercentage}
                  onChange={handleInputChange}
                  placeholder="e.g., '20%' or '15-20%'"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifications (JSON)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example Format:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`{
  "size": "50ml",
  "longevity": "8-12h",
  "concentration": "20%",
  "sillage": "Moderate"
}`}</pre>
                </div>
                <textarea
                  name="specifications"
                  rows={6}
                  value={formData.specifications}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trust Badges (JSON Array)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example Format:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`[
  "Free Shipping",
  "100% Authentic",
  "30-Day Returns",
  "Luxury Packaging"
]`}</pre>
                </div>
                <textarea
                  name="trustBadges"
                  rows={4}
                  value={formData.trustBadges}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Products (JSON)
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example Format:</p>
                  <pre className="text-xs text-blue-800 overflow-x-auto">{`{
  "featured": ["product-uuid-1", "product-uuid-2"],
  "similar": ["product-uuid-3", "product-uuid-4"]
}`}</pre>
                </div>
                <textarea
                  name="recommendations"
                  rows={5}
                  value={formData.recommendations}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
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

            {/* Fragrance Notes */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-4">Fragrance Notes</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter fragrance notes separated by commas (e.g., &quot;Bergamot, Lemon, Pink Pepper&quot;)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">✨</span>
                      Top Notes
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fragranceNotesTop"
                    value={formData.fragranceNotesTop}
                    onChange={handleInputChange}
                    placeholder="e.g., Bergamot, Lemon, Pink Pepper"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Initial notes that you smell first (5-15 min)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">💛</span>
                      Heart/Middle Notes
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fragranceNotesHeart"
                    value={formData.fragranceNotesHeart}
                    onChange={handleInputChange}
                    placeholder="e.g., Rose, Jasmine, Iris"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Core notes that form the character (15 min - 1 hour)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center">
                      <span className="mr-2">🔥</span>
                      Base Notes
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fragranceNotesBase"
                    value={formData.fragranceNotesBase}
                    onChange={handleInputChange}
                    placeholder="e.g., Sandalwood, Musk, Amber"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Long-lasting notes that linger (1 hour+)</p>
                </div>
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
              💡 Leave as <code className="bg-gray-100 px-1 rounded">{'{}'}</code> if you don&apos;t need custom metadata
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
                {currentImages && (currentImages.hero?.length > 0 || currentImages.gallery?.length > 0 || currentImages.description?.length > 0) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-700 mb-1">Current Images:</p>
                    <ul className="text-gray-600 space-y-1">
                      {currentImages.hero?.length > 0 && <li>• Hero: {currentImages.hero.length} images</li>}
                      {currentImages.gallery?.length > 0 && <li>• Gallery: {currentImages.gallery.length} images</li>}
                      {currentImages.description?.length > 0 && <li>• Description: {currentImages.description.length} images</li>}
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
                    <p className="mt-1 text-xs text-gray-500">Original price for showing discounts</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cost Price ($) <span className="text-xs text-gray-500">(Admin Only)</span>
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Your cost price for profit calculations</p>
                  </div>
                </div>
              </div>

              {/* Vendor & Product Type */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Vendor & Type</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vendor/Supplier
                    </label>
                    <input
                      type="text"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleInputChange}
                      placeholder="e.g., Fragrance Wholesale Inc."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Supplier name (different from brand)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Type
                    </label>
                    <input
                      type="text"
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      placeholder="e.g., Perfume & Cologne, Gift Set, Body Spray"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Product type classification</p>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 250"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions (JSON)
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-xs font-medium text-blue-900 mb-1">Example Format (in cm):</p>
                      <pre className="text-xs text-blue-800 overflow-x-auto">{`{
  "length": 10,
  "width": 5,
  "height": 15
}`}</pre>
                    </div>
                    <textarea
                      name="dimensions"
                      rows={4}
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
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
                      name="addToHomepage"
                      checked={formData.addToHomepage}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Add to homepage carousel
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

                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      name="publishedAt"
                      value={formData.publishedAt}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to publish immediately when activated
                    </p>
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
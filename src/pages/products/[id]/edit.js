import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { productsAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { handleAPIError, generateSlug, validateFile } from '@/lib/utils';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    brandId: '',
    price: '',
    comparePrice: '',
    sku: '',
    gender: 'unisex',
    fragranceFamily: '',
    concentration: 'eau_de_parfum',
    sizeMl: '',
    isFeatured: false,
    isActive: true,
    requiresShipping: true,
    trackQuantity: true,
    quantity: '',
    lowStockThreshold: '',
    metaTitle: '',
    metaDescription: '',
    tags: ''
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchFiltersData();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await productsAPI.getById(id);
      
      console.log('Edit product response:', response.data);
      
      // FIX: Handle nested response structure
      const product = response.data.product || response.data.data?.product || response.data.data;
      
      if (!product) {
        throw new Error('Product not found in response');
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        price: product.price ? (product.price / 100).toString() : '',
        comparePrice: product.comparePrice ? (product.comparePrice / 100).toString() : '',
        sku: product.sku || '',
        gender: product.gender || 'unisex',
        fragranceFamily: product.fragranceFamily || '',
        concentration: product.concentration || 'eau_de_parfum',
        sizeMl: product.sizeMl?.toString() || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        requiresShipping: product.requiresShipping !== false,
        trackQuantity: product.trackQuantity !== false,
        quantity: product.quantity?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : ''
      });

      setExistingImages(product.images || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert(handleAPIError(error));
      router.push('/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoriesAPI.getAll(),
        brandsAPI.getAll()
      ]);
      
      // Handle nested data structures
      const categoriesData = categoriesRes.data.data?.categories || categoriesRes.data.categories || [];
      const brandsData = brandsRes.data.data?.brands || brandsRes.data.data || brandsRes.data.brands || [];
      
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching filters data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.brandId) newErrors.brandId = 'Brand is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.trim().length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters';
    }

    if (formData.trackQuantity && !formData.quantity) {
      newErrors.quantity = 'Quantity is required when track quantity is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix all validation errors');
      return;
    }

    try {
      setLoading(true);

      // Build product data - only include fields with actual values
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        price: Math.round(parseFloat(formData.price) * 100),
        sku: formData.sku,
        gender: formData.gender,
        concentration: formData.concentration,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        requiresShipping: formData.requiresShipping,
        trackQuantity: formData.trackQuantity
      };

      // Add optional fields only if they have values (not null/empty)
      if (formData.shortDescription) productData.shortDescription = formData.shortDescription;
      if (formData.comparePrice) productData.comparePrice = Math.round(parseFloat(formData.comparePrice) * 100);
      if (formData.fragranceFamily) productData.fragranceFamily = formData.fragranceFamily;
      if (formData.sizeMl) productData.sizeMl = parseInt(formData.sizeMl);
      if (formData.metaTitle) productData.metaTitle = formData.metaTitle;
      if (formData.metaDescription) productData.metaDescription = formData.metaDescription;
      
      // Handle quantity tracking
      if (formData.trackQuantity) {
        productData.quantity = parseInt(formData.quantity);
        if (formData.lowStockThreshold) {
          productData.lowStockThreshold = parseInt(formData.lowStockThreshold);
        }
      }
      
      // Handle tags
      if (formData.tags) {
        const tagArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        if (tagArray.length > 0) {
          productData.tags = tagArray;
        }
      }

      console.log('Updating product with:', productData);

      await productsAPI.update(id, productData);

      // Upload new images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach(file => {
          imageFormData.append('images', file);
        });
        await productsAPI.uploadImages(id, imageFormData);
      }

      router.push('/products');
    } catch (error) {
      console.error('Update error:', error);
      alert(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.description ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fragrance Family</label>
                    <select name="fragranceFamily" value={formData.fragranceFamily} onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="">Select fragrance family</option>
                      <option value="floral">Floral</option>
                      <option value="oriental">Oriental</option>
                      <option value="woody">Woody</option>
                      <option value="fresh">Fresh</option>
                      <option value="citrus">Citrus</option>
                      <option value="fruity">Fruity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Concentration</label>
                    <select name="concentration" value={formData.concentration} onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="eau_de_parfum">Eau de Parfum</option>
                      <option value="eau_de_toilette">Eau de Toilette</option>
                      <option value="eau_de_cologne">Eau de Cologne</option>
                      <option value="parfum">Parfum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size (ml)</label>
                    <input type="number" name="sizeMl" value={formData.sizeMl} onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Product Images */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
                
                <div className="space-y-4">
                  {existingImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                      <div className="grid grid-cols-2 gap-2">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative">
                            <img src={image.url} alt="Product" className="w-full h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeExistingImage(image.id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Add New Images</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageSelect}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>

                  {selectedImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Images</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                              <XMarkIcon className="h-4 w-4" />
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.categoryId ? 'border-red-300' : ''
                      }`}>
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand *</label>
                    <select name="brandId" value={formData.brandId} onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.brandId ? 'border-red-300' : ''
                      }`}>
                      <option value="">Select brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange}
                        className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                          errors.price ? 'border-red-300' : ''
                        }`} />
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Compare Price</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input type="number" step="0.01" name="comparePrice" value={formData.comparePrice} onChange={handleInputChange}
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU * (min 3 chars)</label>
                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.sku ? 'border-red-300' : ''
                      }`} />
                    {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" name="trackQuantity" checked={formData.trackQuantity} onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label className="ml-2 text-sm text-gray-900">Track quantity</label>
                  </div>

                  {formData.trackQuantity && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                            errors.quantity ? 'border-red-300' : ''
                          }`} />
                        {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                        <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
                
                <div className="space-y-3">
                  {['isActive', 'isFeatured', 'requiresShipping'].map(field => (
                    <div key={field} className="flex items-center">
                      <input type="checkbox" name={field} checked={formData[field]} onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label className="ml-2 text-sm text-gray-900">
                        {field === 'isActive' ? 'Active' : field === 'isFeatured' ? 'Featured' : 'Requires Shipping'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/products" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading && <LoadingSpinner size="sm" />}
              Update Product
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
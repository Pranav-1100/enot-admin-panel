import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  XMarkIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ProductPreview() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    // Get preview data from sessionStorage
    const previewData = sessionStorage.getItem('productPreview');
    if (previewData) {
      const data = JSON.parse(previewData);
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    }
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price || 0;
  const compareAtPrice = selectedVariant?.compareAtPrice || product.compareAtPrice;

  return (
    <>
      <Head>
        <title>{product.name || 'Product'} - Preview | E° ENOT Admin</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-amber-500 text-sm font-medium">Preview Mode</p>
              </div>
              <button
                onClick={() => window.close()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url || product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingBagIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">No image available</p>
                    </div>
                  </div>
                )}

                {/* Image Badge */}
                {product.isFeatured && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    FEATURED
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    INACTIVE
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={img?.url || img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              {/* Title & Category */}
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  {product.category && (
                    <span className="px-3 py-1 bg-gray-800/80 text-amber-500 text-xs font-medium rounded-full border border-amber-500/30">
                      {product.category.name}
                    </span>
                  )}
                  {product.brand && (
                    <span className="px-3 py-1 bg-gray-800/80 text-gray-300 text-xs font-medium rounded-full border border-gray-700">
                      {product.brand.name}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {product.name || 'Untitled Product'}
                </h1>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 4.5)
                            ? 'text-amber-500 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {product.rating || '4.5'} ({product.reviewCount || '0'} reviews)
                  </span>
                </div>

                {product.description && (
                  <p className="text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                {compareAtPrice && compareAtPrice > currentPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${compareAtPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded">
                      {Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedVariant?.name === variant.name
                            ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-sm font-medium">{variant.name}</div>
                        {variant.price !== currentPrice && (
                          <div className="text-xs text-gray-400">${variant.price}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${tag.color || '#gray'}20`,
                        color: tag.color || '#gray',
                        border: `1px solid ${tag.color || '#gray'}40`
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-300">Quantity:</label>
                  <div className="flex items-center border border-gray-700 rounded-lg bg-gray-800/50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-white font-medium min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {product.trackQuantity && product.quantity !== undefined && (
                    <span className="text-sm text-gray-400">
                      {product.quantity} available
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 flex items-center justify-center space-x-2">
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className="p-4 border-2 border-gray-700 hover:border-amber-500 rounded-xl transition-all"
                  >
                    {wishlist ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-center">
                  <TruckIcon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <div className="text-xs text-gray-300 font-medium">Free Shipping</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-center">
                  <ShieldCheckIcon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <div className="text-xs text-gray-300 font-medium">Authentic</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-center">
                  <ArrowPathIcon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <div className="text-xs text-gray-300 font-medium">Easy Returns</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Details */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Product Details</h3>
                <div className="space-y-3">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO & Additional Info */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Additional Information</h3>
              <div className="space-y-3">
                {product.sku && (
                  <div className="flex justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">SKU</span>
                    <span className="text-white font-medium font-mono">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">Weight</span>
                    <span className="text-white font-medium">{product.weight}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">Dimensions</span>
                    <span className="text-white font-medium">{product.dimensions}</span>
                  </div>
                )}
                {product.seo?.metaTitle && (
                  <div className="py-2">
                    <div className="text-gray-400 text-sm mb-1">Meta Title</div>
                    <div className="text-white text-sm">{product.seo.metaTitle}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-gray-800 mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-gray-500 text-sm">
              This is a preview of how your product will appear. Close this tab to return to editing.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

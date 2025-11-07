import { useState } from 'react';

export default function VariantsManager({ variants = [], onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    comparePrice: '',
    sizeMl: '',
    concentration: '',
    position: 0
  });

  const handleAdd = () => {
    if (!formData.name || !formData.sku || !formData.price) {
      alert('Please fill in name, SKU, and price');
      return;
    }

    const newVariants = [...variants, {
      ...formData,
      price: parseFloat(formData.price) * 100, // Convert to cents
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) * 100 : null,
      position: variants.length
    }];

    onChange(newVariants);
    resetForm();
  };

  const handleUpdate = () => {
    const updatedVariants = [...variants];
    updatedVariants[editingIndex] = {
      ...formData,
      price: parseFloat(formData.price) * 100,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) * 100 : null
    };
    onChange(updatedVariants);
    resetForm();
  };

  const handleDelete = (index) => {
    if (confirm('Delete this variant?')) {
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
    }
  };

  const handleEdit = (index) => {
    const variant = variants[index];
    setFormData({
      ...variant,
      price: (variant.price / 100).toFixed(2),
      comparePrice: variant.comparePrice ? (variant.comparePrice / 100).toFixed(2) : ''
    });
    setEditingIndex(index);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: '',
      comparePrice: '',
      sizeMl: '',
      concentration: '',
      position: 0
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <p className="text-sm text-gray-500">
            Offer different sizes or concentrations at different prices
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            + Add Variant
          </button>
        )}
      </div>

      {/* Existing Variants List */}
      {variants.length > 0 && (
        <div className="border rounded-lg divide-y">
          {variants.map((variant, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">{variant.name}</span>
                  <span className="text-sm text-gray-500">{variant.sku}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${(variant.price / 100).toFixed(2)}
                  </span>
                  {variant.comparePrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ${(variant.comparePrice / 100).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {variant.sizeMl && `${variant.sizeMl}ml`}
                  {variant.concentration && ` • ${variant.concentration}`}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit Variant' : 'Add New Variant'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Variant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 12 ML, 50 ML, Pack of 3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., LUX-001-12ML"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="39.90"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Compare Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.comparePrice}
                onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                placeholder="59.90"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Size (ML)
              </label>
              <input
                type="number"
                value={formData.sizeMl}
                onChange={(e) => setFormData({ ...formData, sizeMl: e.target.value })}
                placeholder="12"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Concentration
              </label>
              <select
                value={formData.concentration}
                onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
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
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editingIndex !== null ? handleUpdate : handleAdd}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editingIndex !== null ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {variants.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">
            No variants added yet. Click "Add Variant" to offer different sizes or options.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Example: Add variants for 5.5ML, 12ML, 50ML sizes with different prices
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TagSelector({ tags = [], selectedTagIds = [], onChange, label = "Tags" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tags;
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  // Get selected tags
  const selectedTags = useMemo(() => {
    return tags.filter(tag => selectedTagIds.includes(tag.id));
  }, [tags, selectedTagIds]);

  // Toggle tag selection
  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  // Remove tag
  const removeTag = (tagId) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  // Clear all tags
  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {selectedTagIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-2 inline-flex items-center hover:opacity-70"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="block text-sm text-gray-700">
          {selectedTagIds.length > 0
            ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? 's' : ''} selected`
            : 'Select tags...'}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Tags List */}
            <div className="max-h-60 overflow-y-auto p-2">
              {filteredTags.length > 0 ? (
                <div className="space-y-1">
                  {filteredTags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 flex items-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color || '#3B82F6' }}
                        />
                        <span className="text-sm text-gray-900">{tag.name}</span>
                        {tag.type && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({tag.type})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-8 text-center text-sm text-gray-500">
                  {searchTerm ? 'No tags found' : 'No tags available'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-500">
                {selectedTagIds.length} of {tags.length} selected
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Select one or more tags to categorize this product
      </p>
    </div>
  );
}

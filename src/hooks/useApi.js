import { useState, useEffect, useCallback } from 'react';
import { handleAPIError } from '@/lib/utils';

// Generic API hook for data fetching with loading, error states, and pagination
export function useApi(apiFunction, dependencies = [], options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    initialData = null,
    immediate = true,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const responseData = response.data;
      
      setData(responseData);
      onSuccess?.(responseData);
      
      return responseData;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [...dependencies]);

  const refetch = useCallback((...args) => {
    return fetchData(...args);
  }, [fetchData]);

  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate
  };
}

// Hook specifically for paginated data
export function usePaginatedApi(apiFunction, dependencies = [], options = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    initialPage = 1,
    initialLimit = 20,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const requestParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params
      };

      const response = await apiFunction(requestParams);
      const responseData = response.data;

      setData(responseData.data || responseData.items || responseData);
      setPagination(prev => ({
        ...prev,
        total: responseData.total || 0,
        totalPages: responseData.totalPages || Math.ceil((responseData.total || 0) / prev.limit)
      }));

      onSuccess?.(responseData);
      return responseData;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, pagination.page, pagination.limit, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, ...dependencies]);

  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const refetch = useCallback((params) => {
    return fetchData(params);
  }, [fetchData]);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0
    });
    setData([]);
    setError(null);
  }, [initialPage, initialLimit]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    refetch,
    reset
  };
}

// Hook for CRUD operations
export function useCrudApi(baseApiFunction, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    onSuccess,
    onError
  } = options;

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await baseApiFunction.create(data);
      const newItem = response.data;
      
      setItems(prev => [newItem, ...prev]);
      onSuccess?.('create', newItem);
      
      return newItem;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.('create', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseApiFunction, onSuccess, onError]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await baseApiFunction.update(id, data);
      const updatedItem = response.data;
      
      setItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updatedItem } : item
        )
      );
      
      onSuccess?.('update', updatedItem);
      return updatedItem;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.('update', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseApiFunction, onSuccess, onError]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await baseApiFunction.delete(id);
      
      setItems(prev => prev.filter(item => item.id !== id));
      onSuccess?.('delete', id);
      
      return true;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.('delete', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseApiFunction, onSuccess, onError]);

  const fetchAll = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await baseApiFunction.getAll(params);
      const data = response.data;
      
      setItems(data.items || data.data || data);
      onSuccess?.('fetch', data);
      
      return data;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.('fetch', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseApiFunction, onSuccess, onError]);

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    fetchAll,
    setItems
  };
}

// Hook for search functionality with debouncing
export function useSearch(searchFunction, debounceMs = 500) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await searchFunction(query);
        setResults(response.data || response);
      } catch (err) {
        const errorMessage = handleAPIError(err);
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchFunction, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch
  };
}

// Hook for file uploads
export function useUpload(uploadFunction, options = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    onProgress,
    onSuccess,
    onError
  } = options;

  const upload = useCallback(async (file, additionalData = {}) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setUploadedFile(null);

      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await uploadFunction(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          onProgress?.(percentCompleted);
        }
      });

      const uploadResult = response.data;
      setUploadedFile(uploadResult);
      onSuccess?.(uploadResult);
      
      return uploadResult;
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [uploadFunction, onProgress, onSuccess, onError]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    uploadedFile,
    reset
  };
}
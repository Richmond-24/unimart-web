
// lib/apiClient.ts

// ALWAYS add /api to the base URL - this overrides any env issue
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';
// Remove trailing slash if exists, then ALWAYS add /api
const API_BASE_URL = `${baseUrl.replace(/\/$/, '')}/api`;

// Debug: Log the API base URL
console.log('[apiClient] API_BASE_URL:', API_BASE_URL);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  suppressErrorLog?: boolean;
}

// Core request function
async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Build the full URL - /api is already in the base URL
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  // Debug: Log the full URL
  console.log('[apiClient] Full URL:', url);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('unimart:token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    });

    let payload: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch (e) {
        payload = {};
      }
    }

    if (!response.ok) {
      const errorMessage = payload?.message || payload?.error || response.statusText || `HTTP ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).payload = payload;
      (error as any).url = url;
      
      // Only log if suppressErrorLog is not true
      if (!options.suppressErrorLog) {
        console.error('[apiClient] Error Response:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          payload: payload,
          url: url,
        });
      }
      
      throw error;
    }

    return payload as T;
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      const networkError = new Error('Cannot connect to server. Please check your internet connection.');
      (networkError as any).isNetworkError = true;
      (networkError as any).status = 0;
      throw networkError;
    }
    
    if (error.status) {
      throw error;
    }
    
    const wrappedError = new Error(error.message || 'An unexpected error occurred');
    (wrappedError as any).originalError = error;
    throw wrappedError;
  }
}

// Default export for apiFetch users
export default request;

// Named export for apiClient with methods
export const apiClient = {
  get: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'POST', body }),
  
  put: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PUT', body }),
  
  delete: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request<T>(endpoint, { ...options, method: 'PATCH', body }),
};

export { request as apiFetch };
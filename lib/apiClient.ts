// lib/apiClient.ts

// ============================================
// API CLIENT - FINAL WORKING VERSION
// ============================================

// Get the base URL - NO /api here!
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unimart-backend-6pld.onrender.com';
// Remove trailing slash if exists - NO /api added!
const API_BASE_URL = baseUrl.replace(/\/$/, '');

console.log('🔧 [apiClient] API_BASE_URL:', API_BASE_URL);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  suppressErrorLog?: boolean;
  timeout?: number;
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Build the full URL - NO duplicate /api!
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  if (!options.suppressErrorLog) {
    console.log(`🚀 [apiClient] ${options.method || 'GET'} ${url}`);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('unimart:token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!options.suppressErrorLog) {
      console.log(`📥 [apiClient] Response: ${response.status} ${response.statusText}`);
    }
    
    // Get the response as text
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (e) {
      responseText = '';
    }
    
    // Parse JSON if possible
    let data: any = {};
    
    if (responseText && responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Not JSON - use raw text
        data = { raw: responseText };
      }
    }
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      if (data?.message) errorMessage = data.message;
      else if (data?.error) errorMessage = data.error;
      else if (response.statusText) errorMessage = response.statusText;
      
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      error.url = url;
      
      // Only log if not suppressed
      if (!options.suppressErrorLog) {
        console.error(`❌ [apiClient] Error: ${response.status} - ${errorMessage}`);
      }
      
      throw error;
    }
    
    return data as T;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout`) as any;
      timeoutError.status = 408;
      throw timeoutError;
    }
    
    if (error.message === 'Failed to fetch') {
      const networkError = new Error('Cannot connect to server.') as any;
      networkError.isNetworkError = true;
      networkError.status = 0;
      throw networkError;
    }
    
    if (error.status) throw error;
    
    const wrappedError = new Error(error.message || 'An unexpected error occurred') as any;
    wrappedError.originalError = error;
    throw wrappedError;
  }
}

export default request;

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
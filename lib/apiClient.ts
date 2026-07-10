export type ApiClientOptions = Omit<RequestInit, 'body'> & {
  absolute?: boolean;
  body?: any;
};

const EXPLICIT_API_BASE =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL))
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL)?.trim() || ''
    : '';

function normalizeBackendUrl(url: string): string {
  return url
    .trim()
    .replace(/\/+$|\s+$/g, '')
    .replace(/\/api$/i, '');
}

const API_BASE = EXPLICIT_API_BASE
  ? normalizeBackendUrl(EXPLICIT_API_BASE)
  : (typeof window !== 'undefined' ? '' : 'https://unimart-backends-2.onrender.com');

function buildUrl(path: string, absolute?: boolean): string {
  if (absolute) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const hasApiPrefix = normalizedPath.startsWith('/api/');
  const base = API_BASE;

  if (base) {
    return hasApiPrefix ? `${base}${normalizedPath}` : `${base}/api${normalizedPath}`;
  }

  return hasApiPrefix ? normalizedPath : `/api${normalizedPath}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function request<T = any>(method: string, path: string, opts: ApiClientOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.absolute);
  const headers: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
  };

  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  if (!isFormData && opts.body !== undefined && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('unimart:token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // ignore localStorage access errors
    }
  }

  const init: RequestInit = {
    method,
    headers,
    ...opts,
  };

  if (opts.body !== undefined) {
    if (isFormData) {
      init.body = opts.body;
    } else if (typeof opts.body === 'string') {
      init.body = opts.body;
    } else {
      init.body = JSON.stringify(opts.body);
    }
  }

  console.debug('[apiClient] request', { method, url, init });

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    console.error('[apiClient] fetch error:', errorMsg);
    
    // Provide helpful error message
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('ERR_NAME_NOT_RESOLVED')) {
      const error = new Error(
        `Cannot reach backend server at ${API_BASE}. The server may be down or unreachable.`
      );
      (error as any).status = 0;
      (error as any).originalError = err;
      throw error;
    }
    
    throw err;
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const backendMessage =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: string }).message || '')
        : '';

    const error = new Error(
      backendMessage || `API request failed: ${response.status} ${response.statusText} - ${url}`
    );
    (error as any).status = response.status;
    (error as any).payload = payload;
    console.error('[apiClient] error response', { status: response.status, payload });
    throw error;
  }

  return payload as T;
}

export async function apiFetch<T = any>(path: string, opts: ApiClientOptions = {}) {
  const method = opts.method ? String(opts.method).toUpperCase() : 'GET';
  return request<T>(method, path, opts);
}

export function get<T = any>(path: string, opts?: ApiClientOptions) {
  return request<T>('GET', path, opts || {});
}

export function post<T = any>(path: string, body?: any, opts?: ApiClientOptions) {
  return request<T>('POST', path, { ...opts, body });
}

export function put<T = any>(path: string, body?: any, opts?: ApiClientOptions) {
  return request<T>('PUT', path, { ...opts, body });
}

export function del<T = any>(path: string, opts?: ApiClientOptions) {
  return request<T>('DELETE', path, opts || {});
}

const apiClient = {
  get,
  post,
  put,
  delete: del,
};

export default apiFetch;
export { apiClient };

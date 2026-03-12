const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

const ACCESS_KEY = 'erp-epi-access';
const REFRESH_KEY = 'erp-epi-refresh';

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('erp-epi-user');
  },
};

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    return null;
  }

  const data = await response.json();
  if (data?.access) {
    localStorage.setItem(ACCESS_KEY, data.access);
    return data.access;
  }

  tokenStorage.clear();
  return null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    auth = true,
    retry = true,
    headers,
    body,
    ...rest
  } = options;

  const finalHeaders = new Headers(headers || {});

  if (!(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const access = tokenStorage.getAccess();
    if (access) {
      finalHeaders.set('Authorization', `Bearer ${access}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
    body,
  });

  if (response.status === 401 && auth && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return apiFetch<T>(endpoint, {
        ...options,
        retry: false,
      });
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof responseData === 'object' && responseData !== null
        ? responseData.detail || responseData.message || 'Erro na requisição.'
        : 'Erro na requisição.';
    throw new Error(detail);
  }

  return responseData as T;
}

export { API_BASE_URL };
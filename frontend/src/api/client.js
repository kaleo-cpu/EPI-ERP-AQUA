import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// --- Refresh token flow ---
// Evita falhas intermitentes durante navegação quando o access expira.
// Backend: /api/auth/token/ (obter) e /api/auth/refresh/ (refresh)
let isRefreshing = false;
let refreshQueue = [];

function queueResolve(token) {
  refreshQueue.forEach((p) => p.resolve(token));
  refreshQueue = [];
}

function queueReject(err) {
  refreshQueue.forEach((p) => p.reject(err));
  refreshQueue = [];
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) throw new Error('Sem refresh token');

  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const { data } = await axios.post(`${base}/auth/refresh/`, { refresh });
  if (!data?.access) throw new Error('Resposta de refresh inválida');
  localStorage.setItem('access', data.access);
  return data.access;
}

// injeta o token em toda request (suporta string simples ou JSON em 'auth')
api.interceptors.request.use((config) => {
  let token = null;

  // formato 1: string em "access"
  const rawAccess = localStorage.getItem('access');
  if (rawAccess && rawAccess !== 'null' && rawAccess !== 'undefined') {
    token = rawAccess.replace(/^"+|"+$/g, ''); // remove aspas acidentais
  }

  // formato 2: JSON em "auth" -> { token: "..." }
  if (!token) {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || 'null');
      if (auth?.token) token = auth.token;
    } catch {}
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    // Se não for 401, segue o fluxo normal
    if (status !== 401 || !original || original.__isRetry) {
      return Promise.reject(error);
    }

    // Evita loop de refresh para o próprio endpoint
    if (String(original.url || '').includes('/auth/refresh/')) {
      return Promise.reject(error);
    }

    // Se já está refrescando, enfileira e tenta depois
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            original.__isRetry = true;
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      queueResolve(newToken);
      original.__isRetry = true;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      queueReject(err);
      try {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('auth');
      } catch {}
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

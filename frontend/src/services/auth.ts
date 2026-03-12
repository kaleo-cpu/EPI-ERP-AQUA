import { apiFetch, tokenStorage } from './http';

export type AuthUser = {
  username: string;
  nome: string;
  email?: string;
  perfil?: string;
};

type TokenResponse = {
  access: string;
  refresh: string;
};

function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1];
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('erp-epi-user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!tokenStorage.getAccess();
}

export async function loginRequest(username: string, password: string): Promise<AuthUser> {
  const data = await apiFetch<TokenResponse>('/auth/token/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      username,
      password,
    }),
  });

  tokenStorage.setTokens(data.access, data.refresh);

  const payload = parseJwt(data.access);

  const user: AuthUser = {
    username,
    nome: username,
    email: '',
    perfil: payload?.perfil || (payload?.is_staff ? 'admin' : 'usuário'),
  };

  localStorage.setItem('erp-epi-user', JSON.stringify(user));
  localStorage.setItem('erp-epi-auth', 'true');

  return user;
}

export function logoutRequest() {
  tokenStorage.clear();
  localStorage.removeItem('erp-epi-auth');
}
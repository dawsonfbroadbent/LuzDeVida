import type { AuthSession } from '../types/AuthSession';
import { apiUrl } from './apiConfig';

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return fallbackMessage;
  }

  const data = await response.json();

  if (typeof data?.detail === 'string' && data.detail.length > 0) {
    return data.detail;
  }

  if (typeof data?.title === 'string' && data.title.length > 0) {
    return data.title;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)
      .flat()
      .find((value): value is string => typeof value === 'string');

    if (firstError) {
      return firstError;
    }
  }

  return fallbackMessage;
}

export async function getAuthSession(): Promise<AuthSession> {
  const response = await fetch(apiUrl('/api/auth/me'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch auth session');
  }

  return response.json() as Promise<AuthSession>;
}

export async function registerUser(
  email: string,
  password: string,
): Promise<void> {
  const response = await fetch(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Registration failed'));
  }
}

export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<void> {
  const searchParams = new URLSearchParams();
  searchParams.set('useCookies', 'true');

  if (!rememberMe) {
    searchParams.set('useSessionCookies', 'true');
  }

  const response = await fetch(
    apiUrl(`/api/auth/login?${searchParams.toString()}`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Login failed'));
  }
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(apiUrl('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Logout failed'));
  }
}

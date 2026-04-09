export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export const authenticatedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, credentials: 'include' });

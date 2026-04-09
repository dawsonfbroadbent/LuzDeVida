import type { AuthSession } from "../types/AuthSession";

const apiBaseUrl = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net';

async function readApiError(
  response: Response,
  fallbackMessage: string
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
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
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
  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Registration failed'));
  }
}
  export async function loginUser(email: string, password: string, rememberMe: boolean): Promise<void> {
    const searchParams = new URLSearchParams();
    if (rememberMe) {
      searchParams.set('remember', 'true');
    } else {
      searchParams.set('remember', 'false');
    }

    const response = await fetch(`${apiBaseUrl}/api/auth/login?${searchParams.toString()}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Login failed'));
    }
  }

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Logout failed'));
  }
}


// const BASE = 'https://luzdevidabackend-aegdcxe9grhucsfm.francecentral-01.azurewebsites.net/api/auth'

// export interface RegisterPayload {
//   firstName: string
//   lastName: string
//   email: string
//   password: string
// }

// export interface LoginPayload {
//   email: string
//   password: string
// }

// export interface AuthResponse {
//   token: string
//   email: string
//   displayName: string
//   role: string
//   userId: number
// }

// async function handleResponse<T>(res: Response): Promise<T> {
//   const data = await res.json()
//   if (!res.ok) {
//     throw new Error(data.message ?? 'Something went wrong. Please try again.')
//   }
//   return data as T
// }

// export async function register(payload: RegisterPayload): Promise<AuthResponse> {
//   const res = await fetch(`${BASE}/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       firstName: payload.firstName,
//       lastName:  payload.lastName,
//       email:     payload.email,
//       password:  payload.password,
//     }),
//   })
//   return handleResponse<AuthResponse>(res)
// }

// export async function login(payload: LoginPayload): Promise<AuthResponse> {
//   const res = await fetch(`${BASE}/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       email:    payload.email,
//       password: payload.password,
//     }),
//   })
//   return handleResponse<AuthResponse>(res)
// }

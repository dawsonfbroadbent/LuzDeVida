import type { AuthSession, TwoFactorStatus } from '../types/AuthSession';

/**
 * External authentication provider (e.g., Google, Microsoft).
 */
export interface ExternalAuthProvider {
  name: string;
  displayName: string;
}

// Get API base URL from environment variable or use default
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5289';

/**
 * Parse API error responses to user-friendly messages.
 */
async function readApiError(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return fallbackMessage;
  }

  try {
    const data = await response.json();

    // Try common error field names
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

    if (typeof data?.message === 'string' && data.message.length > 0) {
      return data.message;
    }
  } catch {
    // Response wasn't valid JSON
  }

  return fallbackMessage;
}

/**
 * Get the current user's authentication session.
 * Does not require authentication - allows checking if user is logged in.
 */
export async function getAuthSession(): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    credentials: 'include', // Send cookies with request
  });

  if (!response.ok) {
    throw new Error('Unable to load auth session.');
  }

  return response.json();
}

/**
 * Get current user's profile information (requires authentication).
 */
export async function getUserProfile() {
  const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to load profile.'));
  }

  return response.json();
}

/**
 * Register a new user account.
 */
export async function registerUser(
  email: string,
  password: string
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to register the account.')
    );
  }
}

/**
 * Login with email and password.
 */
export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean = false,
  twoFactorCode?: string,
  twoFactorRecoveryCode?: string
): Promise<void> {
  const searchParams = new URLSearchParams();

  if (rememberMe) {
    searchParams.set('useCookies', 'true'); // Persistent cookie for 7 days
  } else {
    searchParams.set('useSessionCookies', 'true'); // Session cookie only
  }

  const body: Record<string, string> = {
    email,
    password,
  };

  if (twoFactorCode) {
    body.twoFactorCode = twoFactorCode;
  }

  if (twoFactorRecoveryCode) {
    body.twoFactorRecoveryCode = twoFactorRecoveryCode;
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/login?${searchParams}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        'Unable to log in. Please check your email and password.'
      )
    );
  }
}

/**
 * Logout the current user.
 */
export async function logoutUser(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Unable to log out.'));
  }
}

/**
 * Change user's password (requires authentication).
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, 'Unable to change password.')
    );
  }
}

/**
 * Get two-factor authentication status.
 */
export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const response = await fetch(`${apiBaseUrl}/api/auth/manage/2fa`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to get 2FA status.');
  }

  return response.json();
}

/**
 * Enable two-factor authentication.
 */
export async function enableTwoFactor(
  twoFactorCode: string
): Promise<TwoFactorStatus> {
  const response = await fetch(`${apiBaseUrl}/api/auth/manage/2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      enable: true,
      twoFactorCode,
      resetRecoveryCodes: true,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to enable 2FA.');
  }

  return response.json();
}

/**
 * Disable two-factor authentication.
 */
export async function disableTwoFactor(): Promise<TwoFactorStatus> {
  const response = await fetch(`${apiBaseUrl}/api/auth/manage/2fa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      enable: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to disable 2FA.');
  }

  return response.json();
}

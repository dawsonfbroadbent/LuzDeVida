/**
 * Represents the current authentication session.
 * Contains user information and assigned roles.
 */
export interface AuthSession {
  isAuthenticated: boolean;
  userName: string | null;
  email: string | null;
  roles: string[];
}

/**
 * Two-factor authentication status.
 */
export interface TwoFactorStatus {
  has2faEnabled: boolean;
  isMachineRemembered: boolean;
  recoveryCodes?: string[];
}

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns AuthContextValue with auth state and methods
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * const { isAuthenticated, authSession, refreshAuthState } = useAuth();
 * if (!isAuthenticated) return <Navigate to="/login" />;
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

import { ReactNode } from 'react';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * Protected route component that requires authentication.
 * Optionally restricts access to specific roles.
 */
export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, authSession, isLoading } = useAuth();

  if (isLoading) {
    return <div className="protected-route-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-route-error">
        <p>You must be logged in to access this page.</p>
        <a href="/login">Go to login</a>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = authSession.roles.some(role =>
      requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <div className="protected-route-error">
          <p>You do not have permission to access this page.</p>
          <p>Required roles: {requiredRoles.join(', ')}</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}

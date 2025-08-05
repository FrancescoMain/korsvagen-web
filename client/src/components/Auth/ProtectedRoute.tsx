import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "editor";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, loading, token } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute check:", {
    loading,
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    location: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("⏳ ProtectedRoute: Showing loading spinner");
    return <LoadingSpinner centered size="lg" />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("❌ ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const hasRequiredRole = user.role === requiredRole || user.role === "admin";

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log("✅ ProtectedRoute: Access granted");
  return <>{children}</>;
};

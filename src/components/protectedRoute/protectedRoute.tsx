// components/ProtectedRoute.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { loading, checkAuthStatus } = useAuth();
  const router = useRouter();

  // Direct localStorage check that doesn't depend on state
  useEffect(() => {
    // Double-check authentication directly from localStorage
    if (typeof window !== 'undefined') {
      const isAuthenticatedFromStorage = checkAuthStatus();
      
      console.log('[ProtectedRoute] Direct storage check result:', isAuthenticatedFromStorage);
      
      if (!isAuthenticatedFromStorage) {
        console.log('[ProtectedRoute] No auth data in storage, redirecting to login');
        router.replace('/login');
      }
    }
  }, [router, checkAuthStatus]);

  // Show loading state when checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // The auth provider will handle redirection if not authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
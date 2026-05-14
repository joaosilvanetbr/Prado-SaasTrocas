'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WithAuthOptions {
  allowedRoles?: string[];
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af]" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
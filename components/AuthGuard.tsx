import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, navigate to login
      router.replace('/login' as any);
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated, show loading while redirecting
  return <LoadingScreen message="Redirecting to login..." />;
}; 
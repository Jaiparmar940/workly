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
    if (!loading) {
      if (user) {
        // User is authenticated, navigate to main app
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, navigate to login
        router.replace('/login' as any);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return <>{children}</>;
}; 
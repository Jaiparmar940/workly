import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
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

  return <LoadingScreen message="Redirecting..." />;
} 
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { user, loading, validateSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleInitialRoute = async () => {
      if (!loading) {
        if (user) {
          // Validate session before allowing access to protected routes
          const isValidSession = await validateSession();
          if (isValidSession) {
            router.replace('/(tabs)');
          } else {
            // Session invalid, redirect to login
            router.replace('/(auth)/login');
          }
        } else {
          router.replace('/(auth)/login');
        }
      }
    };

    handleInitialRoute();
  }, [user, loading, validateSession, router]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
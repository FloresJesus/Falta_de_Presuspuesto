import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Redirect href="/inicio" />;
  }

  return <Redirect href="/welcome" />;
}

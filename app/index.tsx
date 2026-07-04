import { Redirect } from 'expo-router';
import { YStack, Spinner } from 'tamagui';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  return <Redirect href={session ? '/(tabs)' : '/(auth)/welcome'} />;
}
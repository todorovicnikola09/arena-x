import { YStack, Text, H3, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/auth';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useState } from 'react';

export default function ProfileScreen() {
  const { profile, session } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!session) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} padding="$5" gap="$4" justifyContent="center">
      <YStack alignItems="center" gap="$1">
        <H3>{profile?.full_name ?? 'ArenaX Player'}</H3>
        <Text color="$color11">{profile?.email ?? session.user.email}</Text>
      </YStack>

      <PrimaryButton onPress={handleLogout} isLoading={isLoggingOut}>
        Log out
      </PrimaryButton>
    </YStack>
  );
}
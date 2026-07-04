import { YStack, Text, H1, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <YStack flex={1} justifyContent="center" padding="$5" gap="$5" backgroundColor="$background">
      <YStack gap="$2" alignItems="center">
        <H1 color="$arenaxPrimary" fontWeight="800">
          ArenaX
        </H1>
        <Text color="$color11" textAlign="center">
          Create tournaments. Recruit players. Compete.
        </Text>
      </YStack>

      <YStack gap="$3">
        <PrimaryButton onPress={() => router.push('/(auth)/register')}>
          Create account
        </PrimaryButton>
        <Button
          variant="outlined"
          borderRadius="$4"
          onPress={() => router.push('/(auth)/login')}
        >
          I already have an account
        </Button>
      </YStack>
    </YStack>
  );
}
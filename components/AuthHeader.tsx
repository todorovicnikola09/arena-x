import { YStack, XStack, Text, H1 } from 'tamagui';
import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AuthHeaderProps {
  active: 'login' | 'register';
}

export function AuthHeader({ active }: AuthHeaderProps) {
  const router = useRouter();

  return (
    <YStack alignItems="center" gap="$3" paddingTop="$8">
      <LinearGradient
        colors={['#9D5CFF', '#4F6BFF']}
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="flash" size={30} color="#fff" />
      </LinearGradient>

      <YStack alignItems="center" gap="$1">
        <H1 color="$arenaxPrimary" fontWeight="900" letterSpacing={2}>
          ARENAX
        </H1>
        <Text color="$textDim" fontSize="$2" letterSpacing={1}>
          COMPETE. ORGANIZE. DOMINATE.
        </Text>
      </YStack>

      <XStack backgroundColor="$bgElevated" borderRadius="$6" padding="$1" width="100%">
        <Pressable style={{ flex: 1 }} onPress={() => router.replace('/(auth)/login')}>
          {active === 'login' ? (
            <LinearGradient
              colors={['#9D5CFF', '#4F6BFF']}
              style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text color="white" fontWeight="700">SIGN IN</Text>
            </LinearGradient>
          ) : (
            <YStack paddingVertical="$3" alignItems="center">
              <Text color="$textDim" fontWeight="600">SIGN IN</Text>
            </YStack>
          )}
        </Pressable>

        <Pressable style={{ flex: 1 }} onPress={() => router.replace('/(auth)/register')}>
          {active === 'register' ? (
            <LinearGradient
              colors={['#9D5CFF', '#4F6BFF']}
              style={{ borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text color="white" fontWeight="700">REGISTER</Text>
            </LinearGradient>
          ) : (
            <YStack paddingVertical="$3" alignItems="center">
              <Text color="$textDim" fontWeight="600">REGISTER</Text>
            </YStack>
          )}
        </Pressable>
      </XStack>
    </YStack>
  );
}
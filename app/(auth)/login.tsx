import { useState } from 'react';
import { YStack, Text, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthHeader } from '../../components/AuthHeader';
import { GradientButton } from '../../components/GradientButton';
import { FormField } from '../../components/FormField';
import { signIn } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$5" gap="$5">
        <AuthHeader active="login" />

        <YStack backgroundColor="$bgCard" borderWidth={1} borderColor="$cardBorder" borderRadius="$6" padding="$5" gap="$4">
          <YStack gap="$1">
            <Text color="white" fontSize="$7" fontWeight="800">Welcome back</Text>
            <Text color="$textDim" fontSize="$3">Sign in to your ArenaX account</Text>
          </YStack>

          <FormField
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />

          <FormField
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#9CA3AF"
                onPress={() => setShowPassword((s) => !s)}
              />
            }
          />

          <Text color="$arenaxPrimary" fontSize="$2" alignSelf="flex-end" fontWeight="600">
            Forgot password?
          </Text>

          {error ? <Text color="$statusRejected" fontSize="$2">{error}</Text> : null}

          <GradientButton onPress={handleLogin} isLoading={isLoading} icon={<Ionicons name="flash" size={16} color="#fff" />}>
            SIGN IN
          </GradientButton>

          <Text color="$textDim" fontSize="$2" textAlign="center">
            Don't have an account?{' '}
            <Text color="$arenaxPrimary" fontWeight="700" onPress={() => router.push('/(auth)/register')}>
              Register now
            </Text>
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
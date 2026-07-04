import { useState } from 'react';
import { YStack, Text, H2 } from 'tamagui';
import { useRouter, Link } from 'expo-router';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { signIn } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <YStack flex={1} justifyContent="center" padding="$5" gap="$4" backgroundColor="$background">
      <H2>Log in</H2>

      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      {error ? <Text color="$statusRejected">{error}</Text> : null}

      <PrimaryButton onPress={handleLogin} isLoading={isLoading}>
        Log in
      </PrimaryButton>

      <Link href="/(auth)/register" asChild>
        <Text color="$arenaxPrimary" textAlign="center">
          Don&apos;t have an account? Sign up
        </Text>
      </Link>
    </YStack>
  );
}
import { useState } from 'react';
import { YStack, Text, H2 } from 'tamagui';
import { useRouter, Link } from 'expo-router';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { signUp } from '../../lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await signUp(email.trim(), password, fullName.trim());
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        setError('Account created — check your email to confirm, then log in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <YStack flex={1} justifyContent="center" padding="$5" gap="$4" backgroundColor="$background">
      <H2>Create account</H2>

      <FormField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Ana Anić" />
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
        placeholder="At least 6 characters"
      />

      {error ? <Text color="$statusRejected">{error}</Text> : null}

      <PrimaryButton onPress={handleRegister} isLoading={isLoading}>
        Sign up
      </PrimaryButton>

      <Link href="/(auth)/login" asChild>
        <Text color="$arenaxPrimary" textAlign="center">
          Already have an account? Log in
        </Text>
      </Link>
    </YStack>
  );
}
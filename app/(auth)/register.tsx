import { useState } from 'react';
import { YStack, XStack, Text, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthHeader } from '../../components/AuthHeader';
import { GradientButton } from '../../components/GradientButton';
import { FormField } from '../../components/FormField';
import { signUp } from '../../lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
  setError(null);
  if (!username || !firstName || !surname || !email || !password) {
    setError('Fill in all fields.');
    return;
  }
  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }
  setIsLoading(true);
  try {
    const fullName = `${firstName.trim()} ${surname.trim()}`;
    const data = await signUp(email.trim(), password, fullName, username.trim());
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
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$5" gap="$5">
        <AuthHeader active="register" />

        <YStack backgroundColor="$bgCard" borderWidth={1} borderColor="$cardBorder" borderRadius="$6" padding="$5" gap="$4">
          <YStack gap="$1">
            <Text color="white" fontSize="$7" fontWeight="800">Create account</Text>
            <Text color="$textDim" fontSize="$3">Join the competitive arena</Text>
          </YStack>

          <FormField
            label="USERNAME"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="e.g. ShadowKill"
            leftIcon={<Ionicons name="at" size={16} color="#9CA3AF" />}
          />

          <XStack gap="$3">
            <YStack flex={1}>
              <FormField
                label="FIRST NAME"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Alex"
                leftIcon={<Ionicons name="person-outline" size={16} color="#9CA3AF" />}
              />
            </YStack>
            <YStack flex={1}>
              <FormField
                label="SURNAME"
                value={surname}
                onChangeText={setSurname}
                placeholder="Mercer"
                leftIcon={<Ionicons name="person-outline" size={16} color="#9CA3AF" />}
              />
            </YStack>
          </XStack>

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
            secureTextEntry
            placeholder="At least 6 characters"
          />

          {error ? <Text color="$statusRejected" fontSize="$2">{error}</Text> : null}

          <GradientButton onPress={handleRegister} isLoading={isLoading} icon={<Ionicons name="flash" size={16} color="#fff" />}>
            CREATE ACCOUNT
          </GradientButton>

          <Text color="$textDim" fontSize="$2" textAlign="center">
            Already have an account?{' '}
            <Text color="$arenaxPrimary" fontWeight="700" onPress={() => router.push('/(auth)/login')}>
              Sign in
            </Text>
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
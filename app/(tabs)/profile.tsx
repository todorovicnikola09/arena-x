import { useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../lib/auth';
import { updateProfile, PLAYER_RANKS } from '../../lib/profiles';
import { AvatarBadge } from '../../components/AvatarBadge';
import { FormField } from '../../components/FormField';
import { GradientButton } from '../../components/GradientButton';

export default function ProfileScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [rank, setRank] = useState(profile?.rank ?? 'Bronze');

  function startEditing() {
    setFullName(profile?.full_name ?? '');
    setUsername(profile?.username ?? '');
    setRank(profile?.rank ?? 'Bronze');
    setError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    if (!profile?.id) return;
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        username: username.trim() || null,
        rank,
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

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
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  const initials = (profile?.username ?? profile?.full_name ?? '??')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$5">
        <XStack alignItems="center" gap="$3">
          <Pressable onPress={() => router.navigate('/(tabs)')}>
            <View backgroundColor="$bgElevated" borderRadius={20} padding="$2">
              <Ionicons name="chevron-back" size={20} color="white" />
            </View>
          </Pressable>
          <Text color="white" fontSize="$7" fontWeight="800">Profile</Text>
        </XStack>

        <YStack alignItems="center" gap="$3">
          <AvatarBadge initials={initials} size={88} />
          <YStack alignItems="center" gap="$1">
            <Text color="white" fontSize="$6" fontWeight="800">
              {profile?.username ?? profile?.full_name ?? 'ArenaX Player'}
            </Text>
            {profile?.username && (
              <Text color="$textDim" fontSize="$3">{profile.full_name}</Text>
            )}
            <Text color="$textDim" fontSize="$2">{profile?.email ?? session.user.email}</Text>
          </YStack>

          <XStack
            backgroundColor="rgba(139,92,246,0.12)"
            borderRadius="$5"
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            alignItems="center"
            gap="$1.5"
          >
            <Ionicons name="star" size={12} color="#F1C40F" />
            <Text color="$arenaxPrimary" fontSize="$2" fontWeight="700">
              {profile?.rank ?? 'Bronze'}
            </Text>
          </XStack>
        </YStack>

        {!isEditing ? (
          <Pressable onPress={startEditing}>
            <XStack
              backgroundColor="$bgElevated"
              borderRadius="$5"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
            >
              <Ionicons name="pencil-outline" size={14} color="white" />
              <Text color="white" fontSize="$3" fontWeight="600">Edit Profile</Text>
            </XStack>
          </Pressable>
        ) : (
          <YStack
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="$cardBorder"
            borderRadius="$5"
            padding="$4"
            gap="$4"
          >
            <FormField
              label="FULL NAME"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Alex Mercer"
              leftIcon={<Ionicons name="person-outline" size={16} color="#9CA3AF" />}
            />

            <FormField
              label="USERNAME"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="e.g. ShadowKill"
              leftIcon={<Ionicons name="at" size={16} color="#9CA3AF" />}
            />

            <YStack gap="$1.5">
              <Text fontSize="$1" color="$textDim" letterSpacing={1}>RANK</Text>
              <XStack flexWrap="wrap" gap="$2">
                {PLAYER_RANKS.map((r) => (
                  <Pressable key={r} onPress={() => setRank(r)}>
                    <View
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius="$5"
                      backgroundColor={rank === r ? '#8B5CF6' : '$bgElevated'}
                      borderWidth={1}
                      borderColor={rank === r ? '#8B5CF6' : '$cardBorder'}
                    >
                      <Text color={rank === r ? 'white' : '$textDim'} fontWeight="600" fontSize="$2">
                        {r}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            {error && <Text color="$statusRejected" fontSize="$2">{error}</Text>}

            <XStack gap="$3">
              <Pressable style={{ flex: 1 }} onPress={() => setIsEditing(false)} disabled={isSaving}>
                <XStack
                  backgroundColor="$bgElevated"
                  borderRadius="$5"
                  paddingVertical="$3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="$textDim" fontWeight="700">Cancel</Text>
                </XStack>
              </Pressable>
              <YStack flex={2}>
                <GradientButton onPress={handleSave} isLoading={isSaving}>
                  SAVE CHANGES
                </GradientButton>
              </YStack>
            </XStack>
          </YStack>
        )}

        <Pressable onPress={handleLogout} disabled={isLoggingOut}>
          <XStack
            backgroundColor="rgba(231,76,60,0.1)"
            borderRadius="$5"
            paddingVertical="$3"
            alignItems="center"
            justifyContent="center"
            gap="$1.5"
            opacity={isLoggingOut ? 0.6 : 1}
          >
            {isLoggingOut ? (
              <Spinner size="small" color="#E74C3C" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={16} color="#E74C3C" />
                <Text color="#E74C3C" fontWeight="700">Log out</Text>
              </>
            )}
          </XStack>
        </Pressable>
      </YStack>
    </ScrollView>
  );
}
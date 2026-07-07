import { useEffect, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormField } from '../../../components/FormField';
import { GradientButton } from '../../../components/GradientButton';
import { ProgressSteps } from '../../../components/ProgressSteps';
import { AvatarBadge } from '../../../components/AvatarBadge';
import { useCreateTournament } from '../../../context/CreateTournamentContext';
import { useAuth } from '../../../context/AuthContext';
import { searchProfilesByUsername } from '../../../lib/profiles';
import { publishTournament } from '../../../lib/tournaments';
import type { Profile } from '../../../types/database';

export default function CreateStep3Screen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { form, addCoOrganizer, removeCoOrganizer, reset } = useCreateTournament();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Debounced live search as the user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchProfilesByUsername(query, profile?.id);
        // hide anyone already added
        const filtered = results.filter(
          (r) => !form.coOrganizers.some((c) => c.id === r.id)
        );
        setSuggestions(filtered);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, profile?.id, form.coOrganizers]);

  function handleSelect(found: Profile) {
    addCoOrganizer({ id: found.id, username: found.username, full_name: found.full_name });
    setQuery('');
    setSuggestions([]);
  }

  async function handlePublish() {
    setPublishError(null);

    if (!form.name.trim()) {
      setPublishError('Tournament needs a name — go back to Step 1.');
      return;
    }
    if (!profile?.id) {
      setPublishError('You must be logged in to create a tournament.');
      return;
    }

    setIsPublishing(true);
    try {
      const tournament = await publishTournament(form, profile.id);
      reset();
      router.replace(`/(tabs)/tournaments/${tournament.id}`);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed. Try again.');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1} keyboardShouldPersistTaps="handled">
      <YStack padding="$4" gap="$4">
        <YStack gap="$1">
          <Text color="white" fontSize="$8" fontWeight="800">Create Tournament</Text>
          <Text color="$textDim" fontSize="$3">Step 3 of 3 — Co-organizers</Text>
        </YStack>

        <ProgressSteps step={3} />

        <YStack backgroundColor="$bgElevated" borderRadius="$5" padding="$3">
          <Text color="$textDim" fontSize="$2">
            Co-organizers can manage applications and edit tournament details. Search by username.
          </Text>
        </YStack>

        <YStack gap="$1.5" zIndex={10}>
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>ADD CO-ORGANIZERS</Text>
          <FormField
            label=""
            value={query}
            onChangeText={setQuery}
            placeholder="Start typing a username..."
            autoCapitalize="none"
            leftIcon={<Ionicons name="search-outline" size={16} color="#9CA3AF" />}
            rightIcon={isSearching ? <Spinner size="small" color="#8B5CF6" /> : undefined}
          />

          {searchError && (
            <Text color="$statusRejected" fontSize="$2">{searchError}</Text>
          )}

          {suggestions.length > 0 && (
            <YStack
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$cardBorder"
              borderRadius="$5"
              overflow="hidden"
            >
              {suggestions.map((s, index) => (
                <Pressable key={s.id} onPress={() => handleSelect(s)}>
                  <XStack
                    alignItems="center"
                    gap="$3"
                    padding="$3"
                    borderBottomWidth={index < suggestions.length - 1 ? 1 : 0}
                    borderBottomColor="$cardBorder"
                  >
                    <AvatarBadge
                      initials={(s.username ?? s.full_name ?? '??').slice(0, 2).toUpperCase()}
                      size={36}
                    />
                    <YStack flex={1}>
                      <Text color="white" fontWeight="700">{s.username ?? '(no username)'}</Text>
                      {s.full_name && (
                        <Text color="$textDim" fontSize="$2">{s.full_name}</Text>
                      )}
                    </YStack>
                    <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" />
                  </XStack>
                </Pressable>
              ))}
            </YStack>
          )}

          {query.trim().length > 0 && !isSearching && suggestions.length === 0 && !searchError && (
            <Text color="$textDim" fontSize="$2" paddingLeft="$1">
              No matching usernames found.
            </Text>
          )}
        </YStack>

        {form.coOrganizers.length === 0 ? (
          <YStack
            borderWidth={1}
            borderColor="$cardBorder"
            borderStyle="dashed"
            borderRadius="$5"
            padding="$6"
            alignItems="center"
            gap="$2"
          >
            <Ionicons name="person-add-outline" size={22} color="#6B7280" />
            <Text color="$textDim">No co-organizers added yet</Text>
          </YStack>
        ) : (
          <YStack gap="$2">
            {form.coOrganizers.map((co) => (
              <XStack
                key={co.id}
                backgroundColor="$bgCard"
                borderRadius="$5"
                padding="$3"
                justifyContent="space-between"
                alignItems="center"
                gap="$3"
              >
                <XStack alignItems="center" gap="$3" flex={1}>
                  <AvatarBadge
                    initials={(co.username ?? co.full_name ?? '??').slice(0, 2).toUpperCase()}
                    size={36}
                  />
                  <YStack flex={1}>
                    <Text color="white" fontWeight="700" numberOfLines={1}>
                      {co.username ?? co.full_name}
                    </Text>
                    {co.full_name && co.username && (
                      <Text color="$textDim" fontSize="$2" numberOfLines={1}>
                        {co.full_name}
                      </Text>
                    )}
                  </YStack>
                </XStack>
                <Pressable onPress={() => removeCoOrganizer(co.id)}>
                  <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                </Pressable>
              </XStack>
            ))}
          </YStack>
        )}

        <YStack
          backgroundColor="rgba(139,92,246,0.1)"
          borderWidth={1}
          borderColor="$cardBorder"
          borderRadius="$5"
          padding="$4"
          gap="$1"
        >
          <Text color="$arenaxPrimary" fontSize="$2" fontWeight="700" letterSpacing={1}>
            READY TO PUBLISH
          </Text>
          <Text color="white" fontWeight="800" fontSize="$5">
            {form.name || 'Unnamed Tournament'}
          </Text>
          <Text color="$textDim" fontSize="$2">
            {form.game} · {form.maxParticipants} slots ·{' '}
            {form.locationType === 'online' ? 'Online' : 'Offline'}
          </Text>
        </YStack>

        {publishError && (
          <Text color="$statusRejected" fontSize="$2" textAlign="center">
            {publishError}
          </Text>
        )}

        <XStack gap="$3">
          <Pressable style={{ flex: 1 }} onPress={() => router.back()} disabled={isPublishing}>
            <View alignItems="center" paddingVertical="$4" borderRadius="$5" backgroundColor="$bgElevated">
              <Text color="$textDim" fontWeight="700">← Back</Text>
            </View>
          </Pressable>
          <YStack flex={2}>
            <GradientButton
              onPress={handlePublish}
              isLoading={isPublishing}
              icon={<Ionicons name="flash" size={16} color="#fff" />}
            >
              PUBLISH TOURNAMENT
            </GradientButton>
          </YStack>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
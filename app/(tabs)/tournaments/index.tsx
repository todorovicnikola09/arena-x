import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, Spinner, View, Input } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllVisibleTournaments } from '../../../lib/tournaments';
import type { Tournament } from '../../../types/database';
import { TournamentCard } from '../../../components/TournamentCard';

function toCardShape(t: Tournament) {
  return {
    id: t.id,
    name: t.name,
    game: t.game,
    status: t.is_live ? ('live' as const) : (t.status as 'open' | 'closed' | 'finished'),
    prizePool: t.prize_pool ? '$' + t.prize_pool.toLocaleString() : '—',
    formatTags: [t.team_format, t.game_mode].filter(Boolean) as string[],
    rounds: '—',
    date: new Date(t.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    isOnline: t.is_online,
    location: t.location ?? undefined,
    coverImage:
      t.cover_image_url ??
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    maxParticipants: t.max_participants,
    filledCount: 0,
    rules: t.rules ? [t.rules] : [],
    players: [],
  };
}

export default function TournamentsListScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getAllVisibleTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      load();
    }, [load])
  );

  const filtered = tournaments.filter((t) => {
    if (search.trim().length === 0) return true;
    const query = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.game.toLowerCase().includes(query) ||
      (t.location ?? '').toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="white" fontSize="$8" fontWeight="800">
            Tournaments
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/tournaments/my-applications')}>
            <XStack
              backgroundColor="$bgElevated"
              borderRadius="$5"
              paddingHorizontal="$3"
              paddingVertical="$2"
              alignItems="center"
              gap="$1.5"
            >
              <Ionicons name="document-text-outline" size={14} color="#8B5CF6" />
              <Text color="$arenaxPrimary" fontSize="$2" fontWeight="700">
                My Applications
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        <XStack
          alignItems="center"
          backgroundColor="$bgElevated"
          borderRadius="$6"
          borderWidth={1}
          borderColor="$cardBorder"
          paddingHorizontal="$3"
        >
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <Input
            flex={1}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, game, or location..."
            placeholderTextColor="$textDim"
            borderWidth={0}
            backgroundColor="transparent"
            color="white"
            paddingHorizontal="$2"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </Pressable>
          )}
        </XStack>

        {isLoading ? (
          <YStack alignItems="center" paddingVertical="$8">
            <Spinner size="large" color="$arenaxPrimary" />
          </YStack>
        ) : error ? (
          <Text color="$statusRejected">{error}</Text>
        ) : tournaments.length === 0 ? (
          <Text color="$textDim">No tournaments yet. Be the first to create one!</Text>
        ) : filtered.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8" gap="$2">
            <Ionicons name="search-outline" size={32} color="#6B7280" />
            <Text color="$textDim">No tournaments match your search.</Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={toCardShape(t)} />
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
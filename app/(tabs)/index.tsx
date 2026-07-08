import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner, Input } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { CategoryChip } from '../../components/CategoryChip';
import { FeaturedCard } from '../../components/FeaturedCard';
import { TournamentCard } from '../../components/TournamentCard';
import { AvatarBadge } from '../../components/AvatarBadge';
import { CATEGORIES } from '../../constants/mockData';
import { getOpenTournaments } from '../../lib/tournaments';
import type { Tournament } from '../../types/database';

function toCardShape(t: Tournament) {
  return {
    id: t.id,
    name: t.name,
    game: t.game,
    status: t.is_live ? ('live' as const) : (t.status as 'open' | 'closed' | 'finished'),
    prizePool: t.prize_pool ? `$${t.prize_pool.toLocaleString()}` : '—',
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

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getOpenTournaments();
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

  const initials = (profile?.full_name ?? 'AR')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filtered = tournaments.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.game === activeCategory;
    const matchesSearch =
      search.trim().length === 0 ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.game.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <XStack alignItems="center" gap="$1.5">
              <Ionicons name="flash" size={16} color="#8B5CF6" />
              <Text color="$arenaxPrimary" fontWeight="900" fontSize="$5" letterSpacing={1}>
                ARENAX
              </Text>
            </XStack>
            <Text color="$textDim" fontSize="$2">
              Welcome back, <Text color="white" fontWeight="700">{profile?.full_name ?? 'Player'}</Text>
            </Text>
          </YStack>

          <XStack alignItems="center" gap="$3">
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <AvatarBadge initials={initials} size={40} />
            </Pressable>
          </XStack>
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
            placeholder="Search tournaments, games..."
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack>
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                isActive={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </XStack>
        </ScrollView>

        {isLoading ? (
          <YStack alignItems="center" paddingVertical="$8">
            <Spinner size="large" color="$arenaxPrimary" />
          </YStack>
        ) : error ? (
          <Text color="$statusRejected">{error}</Text>
        ) : tournaments.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8" gap="$2">
            <Ionicons name="trophy-outline" size={32} color="#6B7280" />
            <Text color="$textDim">No open tournaments yet.</Text>
          </YStack>
        ) : filtered.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8" gap="$2">
            <Ionicons name="search-outline" size={32} color="#6B7280" />
            <Text color="$textDim">No tournaments match your search.</Text>
          </YStack>
        ) : (
          <>
            {featured && (
              <YStack gap="$3">
                <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>
                  FEATURED
                </Text>
                <FeaturedCard tournament={toCardShape(featured)} />
              </YStack>
            )}

            {rest.length > 0 && (
              <YStack gap="$3">
                <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>
                  UPCOMING TOURNAMENTS
                </Text>
                {rest.map((t) => (
                  <TournamentCard key={t.id} tournament={toCardShape(t)} />
                ))}
              </YStack>
            )}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
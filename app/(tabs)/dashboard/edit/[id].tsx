import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { FormField } from '../../../../components/FormField';
import { GradientButton } from '../../../../components/GradientButton';
import { getTournamentById, updateTournament } from '../../../../lib/tournaments';
import type { Tournament } from '../../../../types/database';
import { CATEGORIES } from '../../../../constants/mockData';

export default function EditTournamentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const games = CATEGORIES.filter((c) => c !== 'All');

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [locationType, setLocationType] = useState<'online' | 'offline'>('online');
  const [location, setLocation] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [rules, setRules] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const t = await getTournamentById(id);
      if (!t) {
        setError('Tournament not found.');
        return;
      }
      setTournament(t);
      setName(t.name);
      setGame(t.game);
      setMaxParticipants(String(t.max_participants));
      setLocationType(t.is_online ? 'online' : 'offline');
      setLocation(t.location ?? '');
      setPrizePool(t.prize_pool != null ? String(t.prize_pool) : '');
      setRules(t.rules ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournament.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      load();
    }, [load])
  );

  async function handleSave() {
    if (!tournament) return;
    setError(null);

    const parsedMax = parseInt(maxParticipants, 10);
    if (!name.trim()) {
      setError('Tournament name is required.');
      return;
    }
    if (!parsedMax || parsedMax <= 0) {
      setError('Max participants must be a positive number.');
      return;
    }

    setIsSaving(true);
    try {
      await updateTournament(tournament.id, {
        name: name.trim(),
        game,
        max_participants: parsedMax,
        is_online: locationType === 'online',
        location: locationType === 'offline' ? location.trim() || null : null,
        prize_pool: prizePool.trim() ? Number(prizePool) : null,
        rules: rules.trim() || null,
      });
      router.navigate('/(tabs)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  if (!tournament) {
    return (
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center" gap="$3" padding="$5">
        <Text color="white">{error ?? 'Tournament not found.'}</Text>
        <Pressable onPress={() => router.navigate('/(tabs)/dashboard')}>
          <Text color="$arenaxPrimary" fontWeight="700">Go back</Text>
        </Pressable>
      </YStack>
    );
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <XStack alignItems="center" gap="$3">
          <Pressable onPress={() => router.navigate('/(tabs)/dashboard')}>
            <View backgroundColor="$bgElevated" borderRadius={20} padding="$2">
              <Ionicons name="chevron-back" size={20} color="white" />
            </View>
          </Pressable>
          <YStack>
            <Text color="white" fontSize="$7" fontWeight="800">Edit Tournament</Text>
            <Text color="$textDim" fontSize="$2">{tournament.name}</Text>
          </YStack>
        </XStack>

        <FormField
          label="TOURNAMENT NAME"
          value={name}
          onChangeText={setName}
          placeholder="e.g. PUBG Summer Showdown"
          leftIcon={<Ionicons name="trophy-outline" size={16} color="#9CA3AF" />}
        />

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>GAME</Text>
          <XStack flexWrap="wrap" gap="$2">
            {games.map((g) => (
              <Pressable key={g} onPress={() => setGame(g)}>
                <View
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                  borderRadius="$5"
                  backgroundColor={game === g ? '#8B5CF6' : '$bgElevated'}
                  borderWidth={1}
                  borderColor={game === g ? '#8B5CF6' : '$cardBorder'}
                >
                  <Text color={game === g ? 'white' : '$textDim'} fontWeight="600">{g}</Text>
                </View>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        <FormField
          label="MAX PARTICIPANTS"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          placeholder="16"
          keyboardType="number-pad"
          leftIcon={<Ionicons name="people-outline" size={16} color="#9CA3AF" />}
        />

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>LOCATION TYPE</Text>
          <XStack gap="$3">
            <Pressable style={{ flex: 1 }} onPress={() => { setLocationType('online'); setLocation(''); }}>
              <YStack
                alignItems="center"
                paddingVertical="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor={locationType === 'online' ? '#8B5CF6' : '$cardBorder'}
                backgroundColor={locationType === 'online' ? 'rgba(139,92,246,0.12)' : '$bgElevated'}
                gap="$1"
              >
                <Ionicons name="wifi" size={16} color={locationType === 'online' ? '#8B5CF6' : '#9CA3AF'} />
                <Text color={locationType === 'online' ? '$arenaxPrimary' : '$textDim'} fontWeight="700">
                  Online
                </Text>
              </YStack>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setLocationType('offline')}>
              <YStack
                alignItems="center"
                paddingVertical="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor={locationType === 'offline' ? '#8B5CF6' : '$cardBorder'}
                backgroundColor={locationType === 'offline' ? 'rgba(139,92,246,0.12)' : '$bgElevated'}
                gap="$1"
              >
                <Ionicons name="location-outline" size={16} color={locationType === 'offline' ? '#8B5CF6' : '#9CA3AF'} />
                <Text color={locationType === 'offline' ? '$arenaxPrimary' : '$textDim'} fontWeight="700">
                  LAN / Offline
                </Text>
              </YStack>
            </Pressable>
          </XStack>
        </YStack>

        {locationType === 'offline' && (
          <FormField
            label="VENUE / CITY"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Berlin, DE"
            leftIcon={<Ionicons name="location-outline" size={16} color="#9CA3AF" />}
          />
        )}

        <FormField
          label="PRIZE POOL (OPTIONAL)"
          value={prizePool}
          onChangeText={setPrizePool}
          placeholder="e.g. 1000"
          keyboardType="number-pad"
          leftIcon={<Ionicons name="cash-outline" size={16} color="#9CA3AF" />}
        />

        <FormField
          label="RULES (OPTIONAL)"
          value={rules}
          onChangeText={setRules}
          placeholder="e.g. Standard competitive ruleset, best of 3"
          multiline
          numberOfLines={4}
          leftIcon={<Ionicons name="document-text-outline" size={16} color="#9CA3AF" />}
        />

        {error && <Text color="$statusRejected" fontSize="$2">{error}</Text>}

        <GradientButton
          onPress={handleSave}
          isLoading={isSaving}
          icon={<Ionicons name="checkmark" size={16} color="#fff" />}
        >
          SAVE CHANGES
        </GradientButton>
      </YStack>
    </ScrollView>
  );
}
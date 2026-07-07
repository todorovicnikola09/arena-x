import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { applyToTournament, getMyApplication } from '../../../lib/applications';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge } from '../../../components/StatusBadge';
import { GradientButton } from '../../../components/GradientButton';
import type { Tournament, Application } from '../../../types/database';
import { getTournamentById, getAcceptedCount, checkIsOrganizer } from '../../../lib/tournaments';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [myApplication, setMyApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [t, count] = await Promise.all([
        getTournamentById(id),
        getAcceptedCount(id),
      ]);
      setTournament(t);
      setAcceptedCount(count);

      if (t && profile?.id) {
        const [myApp, organizerCheck] = await Promise.all([
          getMyApplication(t.id, profile.id),
          checkIsOrganizer(t.id, profile.id),
        ]);
        setMyApplication(myApp);
        setIsOrganizer(organizerCheck);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournament.');
    } finally {
      setIsLoading(false);
    }
  }, [id, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      load();
    }, [load])
  );

  async function handleJoin() {
    if (!tournament || !profile?.id) return;
    setError(null);
    setIsJoining(true);
    try {
      const app = await applyToTournament(tournament.id, profile.id);
      setMyApplication(app);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join tournament.');
    } finally {
      setIsJoining(false);
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
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center" gap="$3">
        <Text color="white">Tournament not found.</Text>
        {error && <Text color="$statusRejected" fontSize="$2">{error}</Text>}
      </YStack>
    );
  }

  const isOwner = profile?.id === tournament.owner_id;
  const isFull = acceptedCount >= tournament.max_participants;

  let joinButtonLabel = 'JOIN TOURNAMENT';
  let joinDisabled = false;

  if (isOwner || isOrganizer) {
    joinButtonLabel = 'YOU ORGANIZE THIS';
    joinDisabled = true;
  } else if (myApplication?.status === 'pending') {
    joinButtonLabel = 'APPLICATION PENDING';
    joinDisabled = true;
  } else if (myApplication?.status === 'accepted') {
    joinButtonLabel = 'YOU\'RE IN';
    joinDisabled = true;
  } else if (myApplication?.status === 'rejected') {
    joinButtonLabel = 'APPLICATION REJECTED';
    joinDisabled = true;
  } else if (isFull || tournament.status !== 'open') {
    joinButtonLabel = 'REGISTRATION CLOSED';
    joinDisabled = true;
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack>
        <View height={220}>
          <Image
            source={{
              uri:
                tournament.cover_image_url ??
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
            }}
            style={{ width: '100%', height: '100%' }}
          />
          <LinearGradient
            colors={['rgba(11,7,20,0)', '#0B0714']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
          />
          <Pressable
            onPress={() => router.navigate('/(tabs)/tournaments')}
            style={{ position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="white" />
          </Pressable>
        </View>

        <YStack padding="$4" gap="$4" marginTop="-$6">
          <XStack justifyContent="space-between">
            <StatusBadge
              label={tournament.is_live ? 'LIVE' : tournament.status.toUpperCase()}
              variant={tournament.is_live ? 'live' : (tournament.status as any)}
            />
            {tournament.prize_pool ? (
              <XStack backgroundColor="rgba(0,0,0,0.5)" paddingHorizontal="$3" paddingVertical="$1.5" borderRadius="$4">
                <Text color="#F1C40F" fontWeight="700">
                  ${tournament.prize_pool.toLocaleString()} Prize Pool
                </Text>
              </XStack>
            ) : null}
          </XStack>

          <Text color="white" fontSize="$8" fontWeight="800">{tournament.name}</Text>

          <XStack gap="$2">
            {[tournament.team_format, tournament.game_mode].filter(Boolean).map((tag) => (
              <StatusBadge key={tag} label={tag as string} variant="tag" />
            ))}
          </XStack>

          <XStack gap="$3">
            {[
              { label: 'DATE', value: new Date(tournament.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
              { label: 'FORMAT', value: tournament.is_online ? 'Online' : 'Offline' },
              { label: 'GAME', value: tournament.game },
            ].map((item) => (
              <YStack
                key={item.label}
                flex={1}
                backgroundColor="$bgCard"
                borderWidth={1}
                borderColor="$cardBorder"
                borderRadius="$5"
                padding="$3"
                alignItems="center"
                gap="$1"
              >
                <Text color="$textDim" fontSize="$1">{item.label}</Text>
                <Text color="white" fontWeight="700" fontSize="$3">{item.value}</Text>
              </YStack>
            ))}
          </XStack>

          {tournament.rules ? (
            <YStack gap="$2">
              <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>MATCH RULES</Text>
              <YStack backgroundColor="$bgCard" borderWidth={1} borderColor="$cardBorder" borderRadius="$5" padding="$4">
                <Text color="$textDim" fontSize="$3">{tournament.rules}</Text>
              </YStack>
            </YStack>
          ) : null}

          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="white" fontWeight="700">
                {acceptedCount} of {tournament.max_participants} slots filled
              </Text>
              <Text color="#F39C12" fontWeight="700" fontSize="$2">
                {Math.max(tournament.max_participants - acceptedCount, 0)} remaining
              </Text>
            </XStack>
            <View height={8} borderRadius={4} backgroundColor="$bgElevated" overflow="hidden">
              <View
                height={8}
                borderRadius={4}
                backgroundColor="#F39C12"
                width={`${Math.min((acceptedCount / tournament.max_participants) * 100, 100)}%`}
              />
            </View>
          </YStack>

          {error && (
            <Text color="$statusRejected" fontSize="$2" textAlign="center">{error}</Text>
          )}

          {!isOwner && !isOrganizer && (
            <GradientButton
              onPress={handleJoin}
              isLoading={isJoining}
              disabled={joinDisabled}
              icon={<Ionicons name="flash" size={16} color="#fff" />}
            >
              {joinButtonLabel}
            </GradientButton>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
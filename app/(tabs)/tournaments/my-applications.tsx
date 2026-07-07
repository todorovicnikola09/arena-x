import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { getMyApplications, cancelApplication, type MyApplicationRow } from '../../../lib/applications';
import { StatusBadge } from '../../../components/StatusBadge';
import type { Tournament, ApplicationStatus } from '../../../types/database';

function resolveTournament(row: MyApplicationRow): Tournament | null {
  return Array.isArray(row.tournaments) ? row.tournaments[0] ?? null : row.tournaments;
}

function statusVariant(status: ApplicationStatus): 'open' | 'closed' | 'live' {
  if (status === 'accepted') return 'open';
  if (status === 'rejected') return 'closed';
  return 'live';
}

function statusLabel(status: ApplicationStatus): string {
  if (status === 'accepted') return 'ACCEPTED';
  if (status === 'rejected') return 'REJECTED';
  return 'PENDING';
}

export default function MyApplicationsScreen() {
  const { profile } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState<MyApplicationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setError(null);
    try {
      const data = await getMyApplications(profile.id);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      load();
    }, [load])
  );

  async function handleCancel(applicationId: string) {
    setCancelingId(applicationId);
    setError(null);
    try {
      await cancelApplication(applicationId);
      setRows((prev) => prev.filter((r) => r.id !== applicationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel application.');
    } finally {
      setCancelingId(null);
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <XStack alignItems="center" gap="$3">
          <Pressable onPress={() => router.navigate('/(tabs)/tournaments')}>
            <View backgroundColor="$bgElevated" borderRadius={20} padding="$2">
              <Ionicons name="chevron-back" size={20} color="white" />
            </View>
          </Pressable>
          <Text color="white" fontSize="$7" fontWeight="800">My Applications</Text>
        </XStack>

        {error && <Text color="$statusRejected" fontSize="$2">{error}</Text>}

        {rows.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8" gap="$2">
            <Ionicons name="document-text-outline" size={32} color="#6B7280" />
            <Text color="$textDim">You haven't applied to any tournaments yet.</Text>
          </YStack>
        ) : (
          <YStack gap="$3">
            {rows.map((row) => {
              const tournament = resolveTournament(row);
              const isCanceling = cancelingId === row.id;

              if (!tournament) return null;

              return (
                <Pressable
                  key={row.id}
                  onPress={() => router.push(`/(tabs)/tournaments/${tournament.id}`)}
                >
                  <YStack
                    backgroundColor="$bgCard"
                    borderWidth={1}
                    borderColor="$cardBorder"
                    borderRadius="$5"
                    padding="$3"
                    gap="$2"
                    opacity={isCanceling ? 0.5 : 1}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text color="white" fontWeight="700" fontSize="$4" numberOfLines={1} flex={1}>
                        {tournament.name}
                      </Text>
                      <StatusBadge label={statusLabel(row.status)} variant={statusVariant(row.status)} />
                    </XStack>

                    <XStack alignItems="center" gap="$1">
                      <Ionicons name="game-controller-outline" size={12} color="#9CA3AF" />
                      <Text color="$textDim" fontSize="$2">{tournament.game}</Text>
                      <Ionicons name="calendar-outline" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
                      <Text color="$textDim" fontSize="$2">
                        {new Date(tournament.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </XStack>

                    {row.status === 'pending' && (
                      <Pressable
                        disabled={isCanceling}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleCancel(row.id);
                        }}
                      >
                        <XStack
                          alignItems="center"
                          justifyContent="center"
                          gap="$1.5"
                          backgroundColor="rgba(231,76,60,0.1)"
                          borderRadius="$4"
                          paddingVertical="$2"
                          marginTop="$1"
                        >
                          {isCanceling ? (
                            <Spinner size="small" color="#E74C3C" />
                          ) : (
                            <>
                              <Ionicons name="close-circle-outline" size={14} color="#E74C3C" />
                              <Text color="#E74C3C" fontSize="$2" fontWeight="600">
                                Cancel Application
                              </Text>
                            </>
                          )}
                        </XStack>
                      </Pressable>
                    )}
                  </YStack>
                </Pressable>
              );
            })}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
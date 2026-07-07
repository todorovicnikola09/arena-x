import { useCallback, useState } from 'react';
import { YStack, XStack, Text, ScrollView, View, Spinner } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatCard } from '../../../components/StatCard';
import { AvatarBadge } from '../../../components/AvatarBadge';
import { useAuth } from '../../../context/AuthContext';
import {
  getTournamentsManagedByUser,
  closeApplications,
  deleteTournament,
  type ManagedTournament,
} from '../../../lib/tournaments';
import {
  getApplicationsForTournament,
  updateApplicationStatus,
} from '../../../lib/applications';
import type { Application } from '../../../types/database';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'pending' | 'accepted'>('pending');

  const [managedTournaments, setManagedTournaments] = useState<ManagedTournament[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadTournaments = useCallback(async () => {
    if (!profile?.id) return;
    setError(null);
    try {
      const managed = await getTournamentsManagedByUser(profile.id);
      setManagedTournaments(managed);
      setSelectedId((prev) => {
        if (prev && managed.some((m) => m.id === prev)) return prev;
        return managed[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments.');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadTournaments();
    }, [loadTournaments])
  );

  const loadApplications = useCallback(async (tournamentId: string) => {
    setIsLoadingApps(true);
    setError(null);
    try {
      const apps = await getApplicationsForTournament(tournamentId);
      setApplications(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications.');
    } finally {
      setIsLoadingApps(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedId) {
        loadApplications(selectedId);
      }
    }, [selectedId, loadApplications])
  );

  async function handleDecision(applicationId: string, status: 'accepted' | 'rejected') {
    setActioningId(applicationId);
    setError(null);
    try {
      await updateApplicationStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActioningId(null);
    }
  }

  async function handleCloseApplications() {
    if (!selectedId) return;
    setIsClosing(true);
    setError(null);
    try {
      await closeApplications(selectedId);
      await loadTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not close applications.');
    } finally {
      setIsClosing(false);
    }
  }

  async function handleDeleteTournament() {
    if (!selectedId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTournament(selectedId);
      setShowDeleteConfirm(false);
      await loadTournaments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete tournament.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  if (managedTournaments.length === 0) {
    return (
      <YStack flex={1} backgroundColor="$bg" alignItems="center" justifyContent="center" padding="$5" gap="$2">
        <Ionicons name="trophy-outline" size={32} color="#6B7280" />
        <Text color="white" fontWeight="700" fontSize="$5">No tournaments to manage</Text>
        <Text color="$textDim" textAlign="center">
          Tournaments you own or co-organize will appear here.
        </Text>
      </YStack>
    );
  }

  const selected = managedTournaments.find((t) => t.id === selectedId) ?? managedTournaments[0];
  const pending = applications.filter((a) => a.status === 'pending');
  const accepted = applications.filter((a) => a.status === 'accepted');
  const fillRate = Math.round((accepted.length / selected.max_participants) * 100);
  const isFull = accepted.length >= selected.max_participants;
  const hasStarted = new Date(selected.date).getTime() <= Date.now();
  const canDelete = selected.my_role === 'owner' && !hasStarted;

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1}>
            <Text color="white" fontSize="$8" fontWeight="800">Organizer Hub</Text>
            <Text color="$arenaxPrimary" fontSize="$3" fontWeight="600">{selected.name}</Text>
          </YStack>
          <XStack
            backgroundColor="$bgElevated"
            borderRadius="$5"
            paddingHorizontal="$3"
            paddingVertical="$2"
            alignItems="center"
            gap="$1.5"
          >
            <Ionicons
              name={selected.my_role === 'owner' ? 'star' : 'people'}
              size={12}
              color="#8B5CF6"
            />
            <Text color="$arenaxPrimary" fontSize="$1" fontWeight="700">
              {selected.my_role === 'owner' ? 'OWNER' : 'CO-ORGANIZER'}
            </Text>
          </XStack>
        </XStack>

        {managedTournaments.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              {managedTournaments.map((t) => (
                <Pressable key={t.id} onPress={() => setSelectedId(t.id)}>
                  <View
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$5"
                    backgroundColor={selectedId === t.id ? '#8B5CF6' : '$bgElevated'}
                    borderWidth={1}
                    borderColor={selectedId === t.id ? '#8B5CF6' : '$cardBorder'}
                  >
                    <Text
                      color={selectedId === t.id ? 'white' : '$textDim'}
                      fontWeight="600"
                      fontSize="$2"
                      numberOfLines={1}
                    >
                      {t.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </XStack>
          </ScrollView>
        )}

        <XStack gap="$3">
          <StatCard value={applications.length} label="Total" color="#8B5CF6" />
          <StatCard value={accepted.length} label="Accepted" color="#2ECC71" />
          <StatCard value={pending.length} label="Pending" color="#F1C40F" />
        </XStack>

        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>FILL RATE</Text>
            <Text color="white" fontWeight="700">{fillRate}%</Text>
          </XStack>
          <View height={8} borderRadius={4} backgroundColor="$bgElevated" overflow="hidden">
            <View height={8} borderRadius={4} backgroundColor="#8B5CF6" width={`${Math.min(fillRate, 100)}%`} />
          </View>
        </YStack>

        <XStack gap="$3">
          <Pressable
            style={{ flex: 1 }}
            onPress={() => router.push(`/(tabs)/dashboard/edit/${selected.id}`)}
          >
            <XStack
              backgroundColor="$bgElevated"
              borderRadius="$5"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
            >
              <Ionicons name="pencil-outline" size={14} color="white" />
              <Text color="white" fontSize="$2" fontWeight="600">Edit Tournament</Text>
            </XStack>
          </Pressable>

          <Pressable
            style={{ flex: 1 }}
            disabled={selected.status !== 'open' || isClosing}
            onPress={handleCloseApplications}
          >
            <XStack
              backgroundColor={selected.status === 'open' ? 'rgba(231,76,60,0.15)' : '$bgElevated'}
              borderRadius="$5"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
              opacity={selected.status !== 'open' || isClosing ? 0.5 : 1}
            >
              {isClosing ? (
                <Spinner size="small" color="#E74C3C" />
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={14} color={selected.status === 'open' ? '#E74C3C' : '#6B7280'} />
                  <Text color={selected.status === 'open' ? '#E74C3C' : '$textDim'} fontSize="$2" fontWeight="600">
                    {selected.status === 'open' ? 'Close Applications' : 'Closed'}
                  </Text>
                </>
              )}
            </XStack>
          </Pressable>
        </XStack>

        {canDelete && (
          <Pressable onPress={() => setShowDeleteConfirm(true)}>
            <XStack
              backgroundColor="rgba(231,76,60,0.08)"
              borderWidth={1}
              borderColor="rgba(231,76,60,0.3)"
              borderRadius="$5"
              paddingVertical="$3"
              alignItems="center"
              justifyContent="center"
              gap="$1.5"
            >
              <Ionicons name="trash-outline" size={14} color="#E74C3C" />
              <Text color="#E74C3C" fontSize="$2" fontWeight="600">Delete Tournament</Text>
            </XStack>
          </Pressable>
        )}

        {showDeleteConfirm && (
          <YStack
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="rgba(231,76,60,0.3)"
            borderRadius="$5"
            padding="$4"
            gap="$3"
          >
            <XStack alignItems="flex-start" gap="$2">
              <Ionicons name="warning-outline" size={18} color="#E74C3C" />
              <YStack flex={1} gap="$1">
                <Text color="white" fontWeight="700">Delete this tournament?</Text>
                <Text color="$textDim" fontSize="$2">
                  This will permanently delete "{selected.name}" and all its applications. This can't be undone.
                </Text>
              </YStack>
            </XStack>
            <XStack gap="$3">
              <Pressable style={{ flex: 1 }} onPress={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                <XStack
                  backgroundColor="$bgElevated"
                  borderRadius="$5"
                  paddingVertical="$2.5"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="$textDim" fontWeight="700">Cancel</Text>
                </XStack>
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={handleDeleteTournament} disabled={isDeleting}>
                <XStack
                  backgroundColor="#E74C3C"
                  borderRadius="$5"
                  paddingVertical="$2.5"
                  alignItems="center"
                  justifyContent="center"
                  gap="$1.5"
                  opacity={isDeleting ? 0.6 : 1}
                >
                  {isDeleting ? (
                    <Spinner size="small" color="white" />
                  ) : (
                    <Text color="white" fontWeight="700">Delete</Text>
                  )}
                </XStack>
              </Pressable>
            </XStack>
          </YStack>
        )}

        {isFull && selected.status === 'open' && (
          <XStack backgroundColor="rgba(243,156,18,0.1)" borderRadius="$4" padding="$2.5" alignItems="center" gap="$2">
            <Ionicons name="information-circle-outline" size={16} color="#F39C12" />
            <Text color="#F39C12" fontSize="$2" flex={1}>
              This tournament reached max participants and will auto-close.
            </Text>
          </XStack>
        )}

        {error && <Text color="$statusRejected" fontSize="$2">{error}</Text>}

        <XStack backgroundColor="$bgElevated" borderRadius="$6" padding="$1">
          <Pressable style={{ flex: 1 }} onPress={() => setTab('pending')}>
            <View
              paddingVertical="$2.5"
              borderRadius="$5"
              alignItems="center"
              backgroundColor={tab === 'pending' ? '#8B5CF6' : 'transparent'}
            >
              <Text color={tab === 'pending' ? 'white' : '$textDim'} fontWeight="700" fontSize="$3">
                Pending Queue  {pending.length}
              </Text>
            </View>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => setTab('accepted')}>
            <View
              paddingVertical="$2.5"
              borderRadius="$5"
              alignItems="center"
              backgroundColor={tab === 'accepted' ? '#8B5CF6' : 'transparent'}
            >
              <Text color={tab === 'accepted' ? 'white' : '$textDim'} fontWeight="700" fontSize="$3">
                Accepted  {accepted.length}
              </Text>
            </View>
          </Pressable>
        </XStack>

        {isLoadingApps ? (
          <YStack alignItems="center" paddingVertical="$6">
            <Spinner size="large" color="$arenaxPrimary" />
          </YStack>
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$6" gap="$2">
              <Ionicons name="checkmark-done-outline" size={24} color="#6B7280" />
              <Text color="$textDim">No pending applications.</Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {pending.map((app) => {
                const p = app.profiles;
                const label = p?.username ?? p?.full_name ?? 'Unknown player';
                const initials = label.slice(0, 2).toUpperCase();
                const isActioning = actioningId === app.id;

                return (
                  <XStack
                    key={app.id}
                    backgroundColor="$bgCard"
                    borderWidth={1}
                    borderColor="$cardBorder"
                    borderRadius="$5"
                    padding="$3"
                    alignItems="center"
                    gap="$3"
                    opacity={isActioning ? 0.5 : 1}
                  >
                    <AvatarBadge initials={initials} size={44} />
                    <YStack flex={1}>
                      <Text color="white" fontWeight="700">{label}</Text>
                      {p?.rank && (
                        <XStack alignItems="center" gap="$1">
                          <Ionicons name="star" size={10} color="#F1C40F" />
                          <Text color="$textDim" fontSize="$2">{p.rank}</Text>
                        </XStack>
                      )}
                    </YStack>
                    <Pressable
                      disabled={isActioning}
                      onPress={() => handleDecision(app.id, 'rejected')}
                      style={{ backgroundColor: 'rgba(231,76,60,0.15)', padding: 10, borderRadius: 10 }}
                    >
                      <Ionicons name="close" size={16} color="#E74C3C" />
                    </Pressable>
                    <Pressable
                      disabled={isActioning}
                      onPress={() => handleDecision(app.id, 'accepted')}
                      style={{ backgroundColor: 'rgba(39,174,96,0.15)', padding: 10, borderRadius: 10 }}
                    >
                      <Ionicons name="checkmark" size={16} color="#27AE60" />
                    </Pressable>
                  </XStack>
                );
              })}
            </YStack>
          )
        ) : (
          <YStack gap="$2">
            {accepted.length === 0 ? (
              <Text color="$textDim">No accepted players yet.</Text>
            ) : (
              <XStack flexWrap="wrap" gap="$2">
                {accepted.map((app) => {
                  const p = app.profiles;
                  const label = p?.username ?? p?.full_name ?? 'Unknown player';
                  return (
                    <XStack
                      key={app.id}
                      backgroundColor="rgba(39,174,96,0.12)"
                      borderRadius="$5"
                      paddingHorizontal="$3"
                      paddingVertical="$1.5"
                      alignItems="center"
                      gap="$1.5"
                    >
                      <AvatarBadge initials={label.slice(0, 2).toUpperCase()} size={20} />
                      <Text color="#27AE60" fontSize="$2" fontWeight="600">{label}</Text>
                    </XStack>
                  );
                })}
              </XStack>
            )}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
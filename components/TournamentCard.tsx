import { XStack, YStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import type { TournamentMock } from '../constants/mockData';

export function TournamentCard({ tournament }: { tournament: TournamentMock }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/(tabs)/tournaments/${tournament.id}`)}>
      <XStack
        backgroundColor="$bgCard"
        borderRadius="$5"
        borderWidth={1}
        borderColor="$cardBorder"
        padding="$3"
        gap="$3"
        marginBottom="$3"
        alignItems="center"
      >
        <Image
          source={{ uri: tournament.coverImage }}
          style={{ width: 56, height: 56, borderRadius: 12 }}
        />
        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="white" fontWeight="700" fontSize="$4" numberOfLines={1} flex={1}>
              {tournament.name}
            </Text>
            <StatusBadge label={tournament.game} variant="tag" />
          </XStack>
          <XStack alignItems="center" gap="$1">
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text color="$textDim" fontSize="$2">{tournament.date}</Text>
            <Ionicons name={tournament.isOnline ? 'wifi' : 'location-outline'} size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
            <Text color="$textDim" fontSize="$2">
              {tournament.isOnline ? 'Online' : tournament.location}
            </Text>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$textDim" fontSize="$2">
              {tournament.filledCount}/{tournament.maxParticipants}
            </Text>
            <Text color="$arenaxPrimary" fontWeight="700" fontSize="$2">
              View ›
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
}
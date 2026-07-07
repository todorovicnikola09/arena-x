import { YStack, XStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBadge } from './StatusBadge';
import type { TournamentMock } from '../constants/mockData';

export function FeaturedCard({ tournament }: { tournament: TournamentMock }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/(tabs)/tournaments/${tournament.id}`)}>
      <YStack borderRadius="$6" overflow="hidden" height={180}>
        <Image
          source={{ uri: tournament.coverImage }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        />
        <LinearGradient
          colors={['rgba(11,7,20,0)', 'rgba(11,7,20,0.95)']}
          style={{ flex: 1, justifyContent: 'space-between', padding: 14 }}
        >
          <XStack justifyContent="space-between">
            <StatusBadge label="LIVE" variant="live" />
            <XStack backgroundColor="rgba(0,0,0,0.5)" paddingHorizontal="$2.5" paddingVertical="$1" borderRadius="$4">
              <Text color="#F1C40F" fontWeight="700" fontSize="$2">
                {tournament.prizePool}
              </Text>
            </XStack>
          </XStack>

          <YStack gap="$1">
            <StatusBadge label={tournament.game} variant="tag" />
            <Text color="white" fontWeight="800" fontSize="$6">
              {tournament.name}
            </Text>
            <XStack alignItems="center" gap="$3">
              <XStack alignItems="center" gap="$1">
                <Ionicons name="calendar-outline" size={12} color="#D1D5DB" />
                <Text color="#D1D5DB" fontSize="$2">{tournament.date}</Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="wifi" size={12} color="#D1D5DB" />
                <Text color="#D1D5DB" fontSize="$2">Online</Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <Ionicons name="people-outline" size={12} color="#2ECC71" />
                <Text color="#2ECC71" fontSize="$2" fontWeight="700">
                  {tournament.filledCount}/{tournament.maxParticipants}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </LinearGradient>
      </YStack>
    </Pressable>
  );
}
import { View, Text, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { AVATAR_COLORS } from '../constants/mockData';

interface AvatarBadgeProps {
  initials: string;
  name?: string;
  status?: 'accepted' | 'pending';
  size?: number;
}

function colorForInitials(initials: string) {
  const idx = initials.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function AvatarBadge({ initials, name, status, size = 48 }: AvatarBadgeProps) {
  return (
    <YStack alignItems="center" gap="$1" width={size + 8}>
      <View position="relative">
        <View
          width={size}
          height={size}
          borderRadius={size / 2}
          backgroundColor={colorForInitials(initials)}
          alignItems="center"
          justifyContent="center"
        >
          <Text color="white" fontWeight="800" fontSize={size / 3}>
            {initials}
          </Text>
        </View>
        {status && (
          <View
            position="absolute"
            bottom={-2}
            right={-2}
            width={16}
            height={16}
            borderRadius={8}
            backgroundColor={status === 'accepted' ? '#27AE60' : '#F1C40F'}
            alignItems="center"
            justifyContent="center"
            borderWidth={2}
            borderColor="$bg"
          >
            <Ionicons
              name={status === 'accepted' ? 'checkmark' : 'time'}
              size={9}
              color="#0B0714"
            />
          </View>
        )}
      </View>
      {name && (
        <Text color="$textDim" fontSize="$1" numberOfLines={1}>
          {name}
        </Text>
      )}
    </YStack>
  );
}
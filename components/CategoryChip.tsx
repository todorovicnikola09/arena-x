import { Pressable } from 'react-native';
import { Text } from 'tamagui';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryChip({ label, isActive, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: isActive ? '#8B5CF6' : '#161022',
        borderWidth: 1,
        borderColor: isActive ? '#8B5CF6' : 'rgba(139,92,246,0.18)',
      }}
    >
      <Text color={isActive ? 'white' : '$textDim'} fontWeight="600" fontSize="$3">
        {label}
      </Text>
    </Pressable>
  );
}
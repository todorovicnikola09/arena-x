import { YStack, Text } from 'tamagui';

interface StatCardProps {
  value: number | string;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color = '#8B5CF6' }: StatCardProps) {
  return (
    <YStack
      flex={1}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$cardBorder"
      borderRadius="$5"
      paddingVertical="$3"
      alignItems="center"
      gap="$1"
    >
      <Text color={color} fontWeight="800" fontSize="$8">
        {value}
      </Text>
      <Text color="$textDim" fontSize="$1" letterSpacing={1}>
        {label.toUpperCase()}
      </Text>
    </YStack>
  );
}
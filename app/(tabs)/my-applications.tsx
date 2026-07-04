import { YStack, Text, H3 } from 'tamagui';

export default function MyApplicationsScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$5" gap="$2">
      <H3>My Applications</H3>
      <Text color="$color11" textAlign="center">
        Coming in Phase 2: your tournament applications with status badges.
      </Text>
    </YStack>
  );
}
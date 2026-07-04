import { YStack, Text, H3 } from 'tamagui';

export default function MyTournamentsScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$5" gap="$2">
      <H3>Organizing</H3>
      <Text color="$color11" textAlign="center">
        Coming in Phase 3: tournaments you own or co-organize, with management tools.
      </Text>
    </YStack>
  );
}
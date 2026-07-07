import { XStack, View } from 'tamagui';

export function ProgressSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <XStack gap="$2" width="100%">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          flex={1}
          height={4}
          borderRadius={2}
          backgroundColor={i <= step ? '#8B5CF6' : 'rgba(139,92,246,0.15)'}
        />
      ))}
    </XStack>
  );
}
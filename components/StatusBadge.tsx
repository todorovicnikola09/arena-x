import { XStack, Text, View } from 'tamagui';

interface StatusBadgeProps {
  label: string;
  variant: 'live' | 'open' | 'closed' | 'finished' | 'tag';
}

const VARIANT_MAP: Record<string, { bg: string; fg: string }> = {
  live: { bg: 'rgba(255,71,87,0.15)', fg: '#FF4757' },
  open: { bg: 'rgba(46,204,113,0.15)', fg: '#2ECC71' },
  closed: { bg: 'rgba(243,156,18,0.15)', fg: '#F39C12' },
  finished: { bg: 'rgba(127,140,141,0.15)', fg: '#BDC3C7' },
  tag: { bg: 'rgba(139,92,246,0.15)', fg: '#B794F6' },
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const { bg, fg } = VARIANT_MAP[variant];
  return (
    <XStack
      backgroundColor={bg}
      paddingHorizontal="$2.5"
      paddingVertical="$1"
      borderRadius="$4"
      alignItems="center"
      gap="$1.5"
    >
      {variant === 'live' && (
        <View width={6} height={6} borderRadius={3} backgroundColor={fg} />
      )}
      <Text color={fg} fontSize="$2" fontWeight="700">
        {label}
      </Text>
    </XStack>
  );
}
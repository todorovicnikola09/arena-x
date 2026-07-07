import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ActivityIndicator, Text as RNText, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface GradientButtonProps {
  children: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  colors?: [string, string];
}

export function GradientButton({
  children,
  onPress,
  isLoading,
  disabled,
  icon,
  colors = ['#9D5CFF', '#4F6BFF'],
}: GradientButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable onPress={isDisabled ? undefined : onPress} style={{ opacity: isDisabled ? 0.6 : 1 }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon}
            <RNText style={styles.text}>{children}</RNText>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
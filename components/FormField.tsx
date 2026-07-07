import { Input, Text, YStack, XStack, type InputProps } from 'tamagui';
import type { ReactNode } from 'react';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function FormField({ label, error, leftIcon, rightIcon, ...inputProps }: FormFieldProps) {
  return (
    <YStack gap="$1.5">
      <Text fontSize="$1" color="$textDim" letterSpacing={1}>
        {label}
      </Text>
      <XStack
        alignItems="center"
        backgroundColor="$bgElevated"
        borderColor={error ? '$statusRejected' : '$cardBorder'}
        borderWidth={1}
        borderRadius="$5"
        paddingHorizontal="$3"
      >
        {leftIcon}
        <Input
          flex={1}
          borderWidth={0}
          backgroundColor="transparent"
          color="white"
          placeholderTextColor="$textDim"
          size="$4"
          {...inputProps}
        />
        {rightIcon}
      </XStack>
      {error ? (
        <Text color="$statusRejected" fontSize="$2">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
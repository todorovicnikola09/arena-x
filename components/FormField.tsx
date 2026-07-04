import { Input, Label, Text, YStack, type InputProps } from 'tamagui';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  return (
    <YStack gap="$1.5">
      <Label fontSize="$3" color="$color11">
        {label}
      </Label>
      <Input
        borderColor={error ? '$statusRejected' : '$borderColor'}
        borderWidth={1}
        borderRadius="$4"
        size="$4"
        {...inputProps}
      />
      {error ? (
        <Text color="$statusRejected" fontSize="$2">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
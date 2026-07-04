import { Button, Spinner, styled } from 'tamagui';

const StyledButton = styled(Button, {
  backgroundColor: '$arenaxPrimary',
  color: 'white',
  fontWeight: '600',
  borderRadius: '$4',
  pressStyle: {
    backgroundColor: '$arenaxPrimaryDark',
  },
});

interface PrimaryButtonProps {
  children: string;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ children, onPress, isLoading, disabled }: PrimaryButtonProps) {
  return (
    <StyledButton
      onPress={onPress}
      disabled={disabled || isLoading}
      opacity={disabled || isLoading ? 0.6 : 1}
      icon={isLoading ? <Spinner color="white" /> : undefined}
    >
      {isLoading ? '' : children}
    </StyledButton>
  );
}
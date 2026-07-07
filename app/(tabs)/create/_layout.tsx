import { Stack } from 'expo-router';

export default function CreateStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
    </Stack>
  );
}
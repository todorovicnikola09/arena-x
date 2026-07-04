import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { YStack, Spinner, useTheme } from 'tamagui';

export default function TabsLayout() {
  const { session, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.arenaxPrimary?.val ?? '#6C5CE7',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tournaments' }} />
      <Tabs.Screen name="my-applications" options={{ title: 'My Applications' }} />
      <Tabs.Screen name="my-tournaments" options={{ title: 'Organizing' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
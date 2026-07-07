import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { YStack, Spinner } from 'tamagui';
import { BottomTabBar } from '../../components/BottomTabBar';
import { CreateTournamentProvider } from '../../context/CreateTournamentContext';

export default function TabsLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$bg">
        <Spinner size="large" color="$arenaxPrimary" />
      </YStack>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <CreateTournamentProvider>
      <Tabs
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tournaments" />
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="create" />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </CreateTournamentProvider>
  );
}
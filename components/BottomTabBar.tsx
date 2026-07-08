import { XStack, YStack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const ICONS: Record<string, { active: any; inactive: any }> = {
  index: { active: 'home', inactive: 'home-outline' },
  tournaments: { active: 'trophy', inactive: 'trophy-outline' },
  dashboard: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  create: { active: 'add-circle', inactive: 'add-circle-outline' },
};

const LABELS: Record<string, string> = {
  index: 'Discover',
  tournaments: 'Tournaments',
  dashboard: 'Dashboard',
  create: 'Create',
};

const ROOT_PATHS: Record<string, string> = {
  index: '/(tabs)',
  tournaments: '/(tabs)/tournaments',
  dashboard: '/(tabs)/dashboard',
  create: '/(tabs)/create',
};


const VISIBLE_TABS = ['index', 'tournaments', 'dashboard', 'create'];

export function BottomTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route) => VISIBLE_TABS.includes(route.name));

  return (
    <XStack
      backgroundColor="$bgElevated"
      borderTopWidth={1}
      borderColor="$cardBorder"
      paddingBottom={insets.bottom || 12}
      paddingTop="$2.5"
      justifyContent="space-around"
    >
      {visibleRoutes.map((route) => {
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === routeIndex;
        const icon = ICONS[route.name] ?? ICONS.index;
        const label = LABELS[route.name] ?? route.name;
        const rootPath = ROOT_PATHS[route.name] ?? '/(tabs)';

        return (
          <Pressable
            key={route.key}
            onPress={() => router.navigate(rootPath as any)}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Ionicons
              name={isFocused ? icon.active : icon.inactive}
              size={22}
              color={isFocused ? '#8B5CF6' : '#6B7280'}
            />
            <Text color={isFocused ? '$arenaxPrimary' : '$textDim'} fontSize="$1" fontWeight={isFocused ? '700' : '500'}>
              {label}
            </Text>
            {isFocused && (
              <YStack width={16} height={2} borderRadius={1} backgroundColor="$arenaxPrimary" marginTop="$0.5" />
            )}
          </Pressable>
        );
      })}
    </XStack>
  );
}
import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { GradientButton } from '../../../components/GradientButton';
import { ProgressSteps } from '../../../components/ProgressSteps';
import { useCreateTournament } from '../../../context/CreateTournamentContext';

const QUICK_SELECT = [8, 16, 32, 64];

export default function CreateStep2Screen() {
  const router = useRouter();
  const { form, update } = useCreateTournament();

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <YStack gap="$1">
          <Text color="white" fontSize="$8" fontWeight="800">Create Tournament</Text>
          <Text color="$textDim" fontSize="$3">Step 2 of 3 — Format & Slots</Text>
        </YStack>

        <ProgressSteps step={2} />

        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>MAX PARTICIPANTS</Text>
          <Text color="$arenaxPrimary" fontWeight="800" fontSize="$6">{form.maxParticipants}</Text>
        </XStack>

        <Slider
          minimumValue={4}
          maximumValue={64}
          step={1}
          value={form.maxParticipants}
          onValueChange={(v) => update({ maxParticipants: Math.round(v) })}
          minimumTrackTintColor="#8B5CF6"
          maximumTrackTintColor="#2A2438"
          thumbTintColor="#8B5CF6"
        />
        <XStack justifyContent="space-between">
          {[4, 16, 32, 48, 64].map((n) => (
            <Text key={n} color="$textDim" fontSize="$1">{n}</Text>
          ))}
        </XStack>

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>QUICK SELECT</Text>
          <XStack gap="$2">
            {QUICK_SELECT.map((n) => (
              <Pressable key={n} style={{ flex: 1 }} onPress={() => update({ maxParticipants: n })}>
                <View
                  alignItems="center"
                  paddingVertical="$3"
                  borderRadius="$5"
                  backgroundColor={form.maxParticipants === n ? '#8B5CF6' : '$bgElevated'}
                  borderWidth={1}
                  borderColor={form.maxParticipants === n ? '#8B5CF6' : '$cardBorder'}
                >
                  <Text color={form.maxParticipants === n ? 'white' : '$textDim'} fontWeight="700">{n}</Text>
                </View>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text color="$textDim" fontSize="$2" fontWeight="700" letterSpacing={1}>FORMAT PREVIEW</Text>
          <YStack backgroundColor="$bgCard" borderWidth={1} borderColor="$cardBorder" borderRadius="$5" padding="$4" gap="$3">
            <XStack justifyContent="space-between">
              <YStack>
                <Text color="$textDim" fontSize="$1">GAME</Text>
                <Text color="white" fontWeight="700">{form.game}</Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text color="$textDim" fontSize="$1">SLOTS</Text>
                <Text color="white" fontWeight="700">{form.maxParticipants} players</Text>
              </YStack>
            </XStack>
            <XStack justifyContent="space-between">
              <YStack>
                <Text color="$textDim" fontSize="$1">TYPE</Text>
                <Text color="white" fontWeight="700">{form.locationType === 'online' ? 'Online' : 'Offline'}</Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text color="$textDim" fontSize="$1">DATE</Text>
                <Text color="white" fontWeight="700">{form.date || 'Not set'}</Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        <XStack gap="$3">
          <Pressable style={{ flex: 1 }} onPress={() => router.back()}>
            <View alignItems="center" paddingVertical="$4" borderRadius="$5" backgroundColor="$bgElevated">
              <Text color="$textDim" fontWeight="700">← Back</Text>
            </View>
          </Pressable>
          <YStack flex={2}>
            <GradientButton onPress={() => router.push('/(tabs)/create/step3')}>
              NEXT STEP  ›
            </GradientButton>
          </YStack>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
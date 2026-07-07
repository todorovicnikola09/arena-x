import { YStack, XStack, Text, ScrollView, View } from 'tamagui';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { FormField } from '../../../components/FormField';
import { GradientButton } from '../../../components/GradientButton';
import { ProgressSteps } from '../../../components/ProgressSteps';
import { useCreateTournament } from '../../../context/CreateTournamentContext';
import { CATEGORIES } from '../../../constants/mockData';
import { formatDateInput, formatTimeInput, isDateComplete, isDateInPast } from '../../../lib/dateutils';

export default function CreateStep1Screen() {
  const router = useRouter();
  const { form, update } = useCreateTournament();
  const games = CATEGORIES.filter((c) => c !== 'All');

  const dateComplete = isDateComplete(form.date);
  const dateInPast = dateComplete && isDateInPast(form.date);
  const canProceed = form.name.trim().length > 0 && dateComplete && !dateInPast;

  function handleDateChange(raw: string) {
    update({ date: formatDateInput(raw) });
  }

  function handleTimeChange(raw: string) {
    update({ time: formatTimeInput(raw) });
  }

  function handleNext() {
    if (!canProceed) return;
    router.push('/(tabs)/create/step2');
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      update({ coverImageUri: result.assets[0].uri });
    }
  }

  return (
    <ScrollView backgroundColor="$bg" flex={1}>
      <YStack padding="$4" gap="$4">
        <YStack gap="$1">
          <Text color="white" fontSize="$8" fontWeight="800">Create Tournament</Text>
          <Text color="$textDim" fontSize="$3">Step 1 of 3 — Tournament Info</Text>
        </YStack>

        <ProgressSteps step={1} />

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>COVER IMAGE (OPTIONAL)</Text>
          <Pressable onPress={handlePickImage}>
            {form.coverImageUri ? (
              <View borderRadius="$5" overflow="hidden" height={140}>
                <Image source={{ uri: form.coverImageUri }} style={{ width: '100%', height: '100%' }} />
                <View
                  position="absolute"
                  bottom={8}
                  right={8}
                  backgroundColor="rgba(0,0,0,0.6)"
                  borderRadius={16}
                  padding="$2"
                >
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </View>
            ) : (
              <YStack
                height={140}
                borderRadius="$5"
                borderWidth={1}
                borderColor="$cardBorder"
                borderStyle="dashed"
                backgroundColor="$bgElevated"
                alignItems="center"
                justifyContent="center"
                gap="$2"
              >
                <Ionicons name="image-outline" size={28} color="#6B7280" />
                <Text color="$textDim" fontSize="$2">Tap to add a cover image</Text>
              </YStack>
            )}
          </Pressable>
        </YStack>

        <FormField
          label="TOURNAMENT NAME"
          value={form.name}
          onChangeText={(v) => update({ name: v })}
          placeholder="e.g. PUBG Summer Showdown"
          leftIcon={<Ionicons name="trophy-outline" size={16} color="#9CA3AF" />}
        />

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>GAME</Text>
          <XStack flexWrap="wrap" gap="$2">
            {games.map((g) => (
              <Pressable key={g} onPress={() => update({ game: g })}>
                <View
                  paddingHorizontal="$3"
                  paddingVertical="$2.5"
                  borderRadius="$5"
                  backgroundColor={form.game === g ? '#8B5CF6' : '$bgElevated'}
                  borderWidth={1}
                  borderColor={form.game === g ? '#8B5CF6' : '$cardBorder'}
                >
                  <Text color={form.game === g ? 'white' : '$textDim'} fontWeight="600">{g}</Text>
                </View>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        <XStack gap="$3">
          <YStack flex={1}>
            <FormField
              label="DATE"
              value={form.date}
              onChangeText={handleDateChange}
              placeholder="DD.MM.YYYY"
              keyboardType="number-pad"
              maxLength={10}
              leftIcon={<Ionicons name="calendar-outline" size={16} color="#9CA3AF" />}
            />
          </YStack>
          <YStack flex={1}>
            <FormField
              label="TIME"
              value={form.time}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              keyboardType="number-pad"
              maxLength={5}
              leftIcon={<Ionicons name="time-outline" size={16} color="#9CA3AF" />}
            />
          </YStack>
        </XStack>

        {dateComplete && dateInPast && (
          <XStack alignItems="center" gap="$1.5">
            <Ionicons name="alert-circle-outline" size={14} color="#E74C3C" />
            <Text color="$statusRejected" fontSize="$2">
              Date can't be in the past.
            </Text>
          </XStack>
        )}

        <YStack gap="$1.5">
          <Text fontSize="$1" color="$textDim" letterSpacing={1}>LOCATION TYPE</Text>
          <XStack gap="$3">
            <Pressable style={{ flex: 1 }} onPress={() => update({ locationType: 'online', location: '' })}>
              <YStack
                alignItems="center"
                paddingVertical="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor={form.locationType === 'online' ? '#8B5CF6' : '$cardBorder'}
                backgroundColor={form.locationType === 'online' ? 'rgba(139,92,246,0.12)' : '$bgElevated'}
                gap="$1"
              >
                <Ionicons name="wifi" size={16} color={form.locationType === 'online' ? '#8B5CF6' : '#9CA3AF'} />
                <Text color={form.locationType === 'online' ? '$arenaxPrimary' : '$textDim'} fontWeight="700">
                  Online
                </Text>
              </YStack>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => update({ locationType: 'offline' })}>
              <YStack
                alignItems="center"
                paddingVertical="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor={form.locationType === 'offline' ? '#8B5CF6' : '$cardBorder'}
                backgroundColor={form.locationType === 'offline' ? 'rgba(139,92,246,0.12)' : '$bgElevated'}
                gap="$1"
              >
                <Ionicons name="location-outline" size={16} color={form.locationType === 'offline' ? '#8B5CF6' : '#9CA3AF'} />
                <Text color={form.locationType === 'offline' ? '$arenaxPrimary' : '$textDim'} fontWeight="700">
                  LAN / Offline
                </Text>
              </YStack>
            </Pressable>
          </XStack>
        </YStack>

        {form.locationType === 'offline' && (
          <FormField
            label="VENUE / CITY"
            value={form.location}
            onChangeText={(v) => update({ location: v })}
            placeholder="e.g. Berlin, DE"
            leftIcon={<Ionicons name="location-outline" size={16} color="#9CA3AF" />}
          />
        )}

        <FormField
          label="PRIZE POOL (OPTIONAL)"
          value={form.prizePool}
          onChangeText={(v) => update({ prizePool: v.replace(/[^0-9]/g, '') })}
          placeholder="e.g. 1000"
          keyboardType="number-pad"
          leftIcon={<Ionicons name="cash-outline" size={16} color="#9CA3AF" />}
        />

        <FormField
          label="RULES (OPTIONAL)"
          value={form.rules}
          onChangeText={(v) => update({ rules: v })}
          placeholder="e.g. Standard competitive ruleset, best of 3"
          multiline
          numberOfLines={4}
          leftIcon={<Ionicons name="document-text-outline" size={16} color="#9CA3AF" />}
        />

        <GradientButton onPress={handleNext} disabled={!canProceed}>
          NEXT STEP  ›
        </GradientButton>
      </YStack>
    </ScrollView>
  );
}
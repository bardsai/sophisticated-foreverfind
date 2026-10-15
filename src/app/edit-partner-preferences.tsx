import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipOption } from '@/components/onboarding/chip-option';
import { PrimaryButton } from '@/components/primary-button';
import { SelectField } from '@/components/select-field';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEAL_BREAKER_OPTIONS, DISTANCE_OPTIONS, QUALITY_OPTIONS } from '@/constants/onboarding-options';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { friendlySaveError } from '@/lib/friendly-error';
import { hasSharedLocation, updateMyLocation } from '@/lib/location';
import { supabase } from '@/lib/supabase';

function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function EditPartnerPreferencesScreen() {
  const { session } = useSession();
  const userId = session!.user.id;

  const [loading, setLoading] = useState(true);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [qualities, setQualities] = useState<string[]>([]);
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    supabase
      .from('partner_preferences')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMinAge(data.min_age ? String(data.min_age) : '');
          setMaxAge(data.max_age ? String(data.max_age) : '');
          setQualities(data.qualities);
          setDealBreakers(data.deal_breakers);
          setMaxDistanceKm(data.max_distance_km ? String(data.max_distance_km) : '');
        }
        setLoading(false);
      });
    hasSharedLocation(userId).then(setLocationShared);
  }, [userId]);

  async function handleShareLocation() {
    setLocationLoading(true);
    setLocationError(undefined);
    try {
      await updateMyLocation(userId);
      setLocationShared(true);
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Could not get your location.');
    } finally {
      setLocationLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(undefined);

    const minAgeValue = Number(minAge);
    const maxAgeValue = Number(maxAge);
    const distanceValue = Number(maxDistanceKm);

    const { error: saveError } = await supabase.from('partner_preferences').upsert({
      id: userId,
      min_age: Number.isFinite(minAgeValue) && minAge ? minAgeValue : null,
      max_age: Number.isFinite(maxAgeValue) && maxAge ? maxAgeValue : null,
      qualities,
      deal_breakers: dealBreakers,
      max_distance_km: Number.isFinite(distanceValue) && maxDistanceKm ? distanceValue : null,
    });

    setSaving(false);
    if (saveError) {
      setError(friendlySaveError(saveError.message));
      return;
    }
    router.back();
  }

  if (loading) {
    return (
      <ThemedView style={styles.centerFlex}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: 'Partner preferences' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Section title="Age range">
              <View style={styles.ageRow}>
                <TextField
                  label="Minimum age"
                  value={minAge}
                  onChangeText={(text) => setMinAge(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  containerStyle={styles.ageInput}
                />
                <TextField
                  label="Maximum age"
                  value={maxAge}
                  onChangeText={(text) => setMaxAge(text.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  containerStyle={styles.ageInput}
                />
              </View>
            </Section>

            <Section title="Qualities that matter to you">
              <View style={styles.chipGrid}>
                {QUALITY_OPTIONS.map((option) => (
                  <ChipOption
                    key={option.value}
                    label={option.label}
                    selected={qualities.includes(option.value)}
                    onPress={() => setQualities((cur) => toggleInArray(cur, option.value))}
                  />
                ))}
              </View>
            </Section>

            <Section title="Deal breakers">
              <View style={styles.chipGrid}>
                {DEAL_BREAKER_OPTIONS.map((option) => (
                  <ChipOption
                    key={option.value}
                    label={option.label}
                    selected={dealBreakers.includes(option.value)}
                    onPress={() => setDealBreakers((cur) => toggleInArray(cur, option.value))}
                  />
                ))}
              </View>
            </Section>

            <Section title="Distance">
              <SelectField
                label="How far are you willing to travel?"
                value={maxDistanceKm}
                options={DISTANCE_OPTIONS}
                onChange={setMaxDistanceKm}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {locationShared
                  ? "Your location is shared. Update it if you've moved."
                  : 'Share your location so distance can be used in Discover.'}
              </ThemedText>
              {locationError ? (
                <ThemedText type="small" themeColor="danger">
                  {locationError}
                </ThemedText>
              ) : null}
              <PrimaryButton
                title={locationShared ? 'Update my location' : 'Share my location'}
                loading={locationLoading}
                onPress={handleShareLocation}
              />
            </Section>

            {error ? (
              <ThemedText themeColor="danger" type="small" style={styles.paddedBlock}>
                {error}
              </ThemedText>
            ) : null}

            <PrimaryButton
              title="Save changes"
              loading={saving}
              onPress={handleSave}
              style={styles.paddedBlock}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.paddedBlock}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={[styles.sectionBody, styles.paddedBlock]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.three,
  },
  ageRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  ageInput: {
    flex: 1,
    minWidth: 0,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  paddedBlock: {
    marginHorizontal: Spacing.four,
  },
});

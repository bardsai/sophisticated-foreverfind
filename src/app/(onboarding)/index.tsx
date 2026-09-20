import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { ChipOption } from '@/components/onboarding/chip-option';
import { OptionRow } from '@/components/onboarding/option-row';
import { SegmentedProgress } from '@/components/onboarding/segmented-progress';
import { Stepper } from '@/components/onboarding/stepper';
import { HeightField, heightRangeError } from '@/components/height-field';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { entranceAnimation } from '@/constants/motion';
import {
  DEAL_BREAKER_OPTIONS,
  DISTANCE_OPTIONS,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  GENOTYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PHYSIQUE_OPTIONS,
  QUALITY_OPTIONS,
  RELIGION_OPTIONS,
  WANTS_CHILDREN_OPTIONS,
  INTEREST_OPTIONS,
  type Option,
} from '@/constants/onboarding-options';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { friendlySaveError } from '@/lib/friendly-error';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/upload-avatar';

type StepBase = { key: string; title: string; subtitle?: string };
type Step =
  | (StepBase & { kind: 'photo' })
  | (StepBase & { kind: 'select'; field: keyof Answers; options: Option[] })
  | (StepBase & { kind: 'chips'; field: keyof Answers; options: Option[] })
  | (StepBase & {
      kind: 'text';
      field: keyof Answers;
      placeholder: string;
      keyboardType?: 'default' | 'phone-pad';
      multiline?: boolean;
    })
  | (StepBase & { kind: 'height'; field: keyof Answers })
  | (StepBase & { kind: 'family' })
  | (StepBase & { kind: 'partner-age' });

type Answers = {
  gender: string | null;
  city: string;
  hometown: string;
  occupation: string;
  phone_number: string;
  height_cm: string;
  physique: string | null;
  interests: string[];
  education_level: string | null;
  religion: string | null;
  marital_status: string | null;
  children_count: number;
  wants_children: string | null;
  is_single_parent: boolean;
  genotype: string | null;
  bio: string;
  partner_min_age: string;
  partner_max_age: string;
  partner_qualities: string[];
  partner_deal_breakers: string[];
  partner_max_distance_km: string;
};

const STEPS: Step[] = [
  { key: 'photo', kind: 'photo', title: 'Add a profile photo' },
  {
    key: 'gender',
    kind: 'select',
    field: 'gender',
    title: 'How do you identify?',
    subtitle: 'This helps us introduce you thoughtfully.',
    options: GENDER_OPTIONS,
  },
  {
    key: 'city',
    kind: 'text',
    field: 'city',
    title: 'Where do you live now?',
    placeholder: 'City',
  },
  {
    key: 'hometown',
    kind: 'text',
    field: 'hometown',
    title: 'Where are you from?',
    subtitle: 'Your hometown, if different from where you live now.',
    placeholder: 'Hometown',
  },
  {
    key: 'occupation',
    kind: 'text',
    field: 'occupation',
    title: 'What do you do?',
    placeholder: 'Occupation',
  },
  {
    key: 'phone',
    kind: 'text',
    field: 'phone_number',
    title: "What's your phone number?",
    subtitle: 'Only shared once a match is confirmed.',
    placeholder: 'Phone number',
    keyboardType: 'phone-pad',
  },
  {
    key: 'height',
    kind: 'height',
    field: 'height_cm',
    title: 'How tall are you?',
    subtitle: "Not sure? It's fine to skip this one.",
  },
  {
    key: 'physique',
    kind: 'select',
    field: 'physique',
    title: 'How would you describe your build?',
    options: PHYSIQUE_OPTIONS,
  },
  {
    key: 'interests',
    kind: 'chips',
    field: 'interests',
    title: 'What do you enjoy?',
    subtitle: 'Pick a few things you spend your time on.',
    options: INTEREST_OPTIONS,
  },
  {
    key: 'education',
    kind: 'select',
    field: 'education_level',
    title: 'What is your education level?',
    options: EDUCATION_OPTIONS,
  },
  {
    key: 'religion',
    kind: 'select',
    field: 'religion',
    title: 'What is your faith?',
    options: RELIGION_OPTIONS,
  },
  {
    key: 'marital_status',
    kind: 'select',
    field: 'marital_status',
    title: "What's your marital status?",
    options: MARITAL_STATUS_OPTIONS,
  },
  { key: 'family', kind: 'family', title: 'Children' },
  {
    key: 'genotype',
    kind: 'select',
    field: 'genotype',
    title: "What's your genotype?",
    subtitle: 'A blood trait some families check for compatibility. Ask a doctor if unsure.',
    options: GENOTYPE_OPTIONS,
  },
  {
    key: 'bio',
    kind: 'text',
    field: 'bio',
    title: 'Write a short bio',
    subtitle: 'A sentence or two — you can change this later.',
    placeholder: 'Bio',
    multiline: true,
  },
  { key: 'partner-age', kind: 'partner-age', title: "What age range interests you?" },
  {
    key: 'partner-qualities',
    kind: 'chips',
    field: 'partner_qualities',
    title: 'What qualities matter most to you?',
    subtitle: 'Pick a few — this shapes who we introduce you to.',
    options: QUALITY_OPTIONS,
  },
  {
    key: 'partner-dealbreakers',
    kind: 'chips',
    field: 'partner_deal_breakers',
    title: 'Any deal breakers?',
    subtitle: 'Optional — helps us rule out poor fits early.',
    options: DEAL_BREAKER_OPTIONS,
  },
  {
    key: 'partner-distance',
    kind: 'select',
    field: 'partner_max_distance_km',
    title: 'How far are you willing to travel?',
    subtitle: "Not sure? Anywhere works — you can change this later.",
    options: DISTANCE_OPTIONS,
  },
];


function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const { profile, refresh } = useProfile();
  const userId = session!.user.id;

  const [step, setStep] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.primary_photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const [answers, setAnswers] = useState<Answers>({
    gender: profile?.gender ?? null,
    city: profile?.city ?? '',
    hometown: profile?.hometown ?? '',
    occupation: profile?.occupation ?? '',
    phone_number: profile?.phone_number ?? '',
    height_cm: profile?.height_cm ? String(profile.height_cm) : '',
    physique: profile?.physique ?? null,
    interests: profile?.interests ?? [],
    education_level: profile?.education_level ?? null,
    religion: profile?.religion ?? null,
    marital_status: profile?.marital_status ?? null,
    children_count: profile?.children_count ?? 0,
    wants_children: profile?.wants_children ?? null,
    is_single_parent: profile?.is_single_parent ?? false,
    genotype: profile?.genotype ?? null,
    bio: profile?.bio ?? '',
    partner_min_age: '',
    partner_max_age: '',
    partner_qualities: [],
    partner_deal_breakers: [],
    partner_max_distance_km: '',
  });

  function set<K extends keyof Answers>(field: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [field]: value }));
  }

  async function pickPhoto(source: 'library' | 'camera') {
    setPhotoError(undefined);
    const permission =
      source === 'library'
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Permission is required to add a photo.');
      return;
    }

    const result =
      source === 'library'
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadAvatar(userId, result.assets[0]);
      const { error: submitError } = await supabase.rpc('submit_photo_for_review', {
        p_photo_url: publicUrl,
      });
      if (submitError) throw submitError;
      // Safe to preview locally right away — it stays hidden from other
      // members until an admin approves it (see submit_photo_for_review).
      setPhotoUrl(publicUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function finishOnboarding() {
    setSaving(true);
    setSaveError(undefined);

    const heightCm = Number(answers.height_cm);
    const minAge = Number(answers.partner_min_age);
    const maxAge = Number(answers.partner_max_age);
    const maxDistance = Number(answers.partner_max_distance_km);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        gender: answers.gender,
        city: answers.city.trim() || null,
        hometown: answers.hometown.trim() || null,
        occupation: answers.occupation.trim() || null,
        phone_number: answers.phone_number.trim() || null,
        height_cm: Number.isFinite(heightCm) && answers.height_cm ? heightCm : null,
        physique: answers.physique,
        interests: answers.interests,
        education_level: answers.education_level,
        religion: answers.religion,
        marital_status: answers.marital_status,
        children_count: answers.children_count,
        wants_children: answers.wants_children,
        is_single_parent: answers.children_count > 0 ? answers.is_single_parent : false,
        genotype: answers.genotype,
        bio: answers.bio.trim() || null,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      setSaving(false);
      setSaveError(friendlySaveError(profileError.message));
      return;
    }

    const { error: prefsError } = await supabase.from('partner_preferences').upsert({
      id: userId,
      min_age: Number.isFinite(minAge) && answers.partner_min_age ? minAge : null,
      max_age: Number.isFinite(maxAge) && answers.partner_max_age ? maxAge : null,
      qualities: answers.partner_qualities,
      deal_breakers: answers.partner_deal_breakers,
      max_distance_km:
        Number.isFinite(maxDistance) && answers.partner_max_distance_km ? maxDistance : null,
    });

    setSaving(false);
    if (prefsError) {
      setSaveError(friendlySaveError(prefsError.message));
      return;
    }

    await refresh();
    // The root layout's Stack.Protected guard swaps to (tabs) once
    // profile.onboarding_completed_at is set.
  }

  function goNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finishOnboarding();
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  const current = STEPS[step];
  const isPhotoStep = current.kind === 'photo';
  const isHeightStep = current.kind === 'height';
  const canContinue =
    (!isPhotoStep || !!photoUrl) &&
    (!isHeightStep || !heightRangeError(answers[current.field as 'height_cm']));

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <View style={styles.header}>
            {step > 0 ? (
              <Pressable onPress={goBack} hitSlop={8} style={styles.backButton}>
                <ThemedText themeColor="textSecondary" type="smallBold">
                  Back
                </ThemedText>
              </Pressable>
            ) : (
              <View style={styles.backButton} />
            )}
            <View style={styles.progressWrapper}>
              <SegmentedProgress step={step} total={STEPS.length} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <Animated.View key={current.key} entering={entranceAnimation()} style={styles.stepBlock}>
              <ThemedText type="subtitle" style={styles.centerText}>
                {current.title}
              </ThemedText>
              {current.subtitle ? (
                <ThemedText themeColor="textSecondary" style={styles.centerText}>
                  {current.subtitle}
                </ThemedText>
              ) : null}

              {current.kind === 'photo' ? (
                <View style={styles.photoStep}>
                  <Pressable
                    onPress={() => pickPhoto('library')}
                    style={[
                      styles.photoCircle,
                      { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                    ]}>
                    {uploadingPhoto ? (
                      <ActivityIndicator color={theme.primary} />
                    ) : photoUrl ? (
                      <Image source={{ uri: photoUrl }} style={styles.photoImage} />
                    ) : (
                      <ThemedText themeColor="textSecondary">Add photo</ThemedText>
                    )}
                  </Pressable>
                  <Pressable onPress={() => pickPhoto('camera')} hitSlop={8}>
                    <ThemedText themeColor="primary" type="smallBold" style={styles.centerText}>
                      Take a photo instead
                    </ThemedText>
                  </Pressable>
                  <ThemedText themeColor="textSecondary" type="small" style={styles.centerText}>
                    Your photo is reviewed before it&apos;s shown to other members.
                  </ThemedText>
                  {photoError ? (
                    <ThemedText themeColor="danger" type="small" style={styles.centerText}>
                      {photoError}
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}

              {current.kind === 'select' ? (
                <View style={styles.optionList}>
                  {current.options.map((option) => (
                    <OptionRow
                      key={option.value}
                      label={option.label}
                      Icon={option.Icon}
                      selected={answers[current.field] === option.value}
                      onPress={() => set(current.field, option.value as never)}
                    />
                  ))}
                </View>
              ) : null}

              {current.kind === 'chips' ? (
                <View style={styles.chipGrid}>
                  {current.options.map((option) => {
                    const selectedList = answers[current.field] as string[];
                    return (
                      <ChipOption
                        key={option.value}
                        label={option.label}
                        Icon={option.Icon}
                        selected={selectedList.includes(option.value)}
                        onPress={() =>
                          set(current.field, toggleInArray(selectedList, option.value) as never)
                        }
                      />
                    );
                  })}
                </View>
              ) : null}

              {current.kind === 'text' ? (
                <TextField
                  label={current.placeholder}
                  value={answers[current.field] as string}
                  onChangeText={(text) => set(current.field, text as never)}
                  placeholder={current.placeholder}
                  keyboardType={current.keyboardType}
                  multiline={current.multiline}
                  numberOfLines={current.multiline ? 4 : undefined}
                  style={current.multiline ? styles.multilineInput : undefined}
                  maxLength={current.field === 'bio' ? 500 : undefined}
                  autoFocus
                />
              ) : null}

              {current.kind === 'height' ? (
                <HeightField
                  valueCm={answers[current.field] as string}
                  onChangeCm={(cm) => set(current.field, cm as never)}
                  error={heightRangeError(answers[current.field] as string)}
                />
              ) : null}

              {current.kind === 'family' ? (
                <View style={styles.familyStep}>
                  <Stepper
                    value={answers.children_count}
                    onChange={(value) => set('children_count', value)}
                  />
                  <ThemedText themeColor="textSecondary" style={styles.centerText}>
                    {answers.children_count === 0 ? 'No children' : 'Number of children'}
                  </ThemedText>

                  <ThemedText type="smallBold" themeColor="textSecondary" style={styles.centerText}>
                    Do you want (more) children?
                  </ThemedText>
                  <View style={styles.chipGrid}>
                    {WANTS_CHILDREN_OPTIONS.map((option) => (
                      <ChipOption
                        key={option.value}
                        label={option.label}
                        selected={answers.wants_children === option.value}
                        onPress={() => set('wants_children', option.value)}
                      />
                    ))}
                  </View>

                  {answers.children_count > 0 ? (
                    <ChipOption
                      label="I'm a single parent"
                      selected={answers.is_single_parent}
                      onPress={() => set('is_single_parent', !answers.is_single_parent)}
                    />
                  ) : null}
                </View>
              ) : null}

              {current.kind === 'partner-age' ? (
                <View style={styles.ageRangeRow}>
                  <TextField
                    label="Minimum age"
                    value={answers.partner_min_age}
                    onChangeText={(text) => set('partner_min_age', text.replace(/[^0-9]/g, ''))}
                    placeholder="18"
                    keyboardType="number-pad"
                    style={styles.ageInput}
                  />
                  <TextField
                    label="Maximum age"
                    value={answers.partner_max_age}
                    onChangeText={(text) => set('partner_max_age', text.replace(/[^0-9]/g, ''))}
                    placeholder="99"
                    keyboardType="number-pad"
                    style={styles.ageInput}
                  />
                </View>
              ) : null}
            </Animated.View>

            {saveError ? (
              <ThemedText themeColor="danger" type="small" style={styles.centerText}>
                {saveError}
              </ThemedText>
            ) : null}

            <PrimaryButton
              title={step === STEPS.length - 1 ? 'Finish' : 'Continue'}
              loading={saving}
              disabled={!canContinue}
              onPress={goNext}
              style={styles.continueButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    width: 44,
  },
  progressWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  stepBlock: {
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  optionList: {
    gap: Spacing.two,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoStep: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  photoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  familyStep: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  ageRangeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  ageInput: {
    flex: 1,
  },
  continueButton: {
    marginTop: Spacing.two,
  },
});

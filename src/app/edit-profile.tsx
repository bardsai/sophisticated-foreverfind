import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { ChipOption } from '@/components/onboarding/chip-option';
import { Stepper } from '@/components/onboarding/stepper';
import { HeightField, heightRangeError } from '@/components/height-field';
import { PrimaryButton } from '@/components/primary-button';
import { SelectField } from '@/components/select-field';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  GENOTYPE_OPTIONS,
  INTEREST_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PHYSIQUE_OPTIONS,
  RELIGION_OPTIONS,
  WANTS_CHILDREN_OPTIONS,
} from '@/constants/onboarding-options';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { friendlySaveError } from '@/lib/friendly-error';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/upload-avatar';

function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function EditProfileScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const { profile, refresh } = useProfile();
  const userId = session!.user.id;

  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.primary_photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoReviewStatus, setPhotoReviewStatus] = useState<{
    status: string;
    admin_note: string | null;
  } | null>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [gender, setGender] = useState<string | null>(profile?.gender ?? null);
  const [city, setCity] = useState(profile?.city ?? '');
  const [hometown, setHometown] = useState(profile?.hometown ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ?? '');
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [physique, setPhysique] = useState<string | null>(profile?.physique ?? null);
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [educationLevel, setEducationLevel] = useState<string | null>(
    profile?.education_level ?? null,
  );
  const [religion, setReligion] = useState<string | null>(profile?.religion ?? null);
  const [maritalStatus, setMaritalStatus] = useState<string | null>(
    profile?.marital_status ?? null,
  );
  const [childrenCount, setChildrenCount] = useState(profile?.children_count ?? 0);
  const [wantsChildren, setWantsChildren] = useState<string | null>(
    profile?.wants_children ?? null,
  );
  const [isSingleParent, setIsSingleParent] = useState(profile?.is_single_parent ?? false);
  const [genotype, setGenotype] = useState<string | null>(profile?.genotype ?? null);
  const [bio, setBio] = useState(profile?.bio ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    supabase
      .from('photo_reviews')
      .select('status, admin_note')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPhotoReviewStatus(data));
  }, [userId]);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission is required to change your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadAvatar(userId, result.assets[0]);
      const { data: review, error: submitError } = await supabase.rpc('submit_photo_for_review', {
        p_photo_url: publicUrl,
      });
      if (submitError) throw submitError;
      // The uploaded file is safe to preview locally right away — it's only
      // hidden from *other* members until admin_review_photo() approves it
      // and copies it into profiles.primary_photo_url.
      setPhotoUrl(publicUrl);
      setPhotoReviewStatus(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    const heightError = heightRangeError(heightCm);
    if (heightError) {
      setError(heightError);
      return;
    }

    setSaving(true);
    setError(undefined);

    const heightValue = Number(heightCm);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        gender,
        city: city.trim() || null,
        hometown: hometown.trim() || null,
        occupation: occupation.trim() || null,
        phone_number: phoneNumber.trim() || null,
        height_cm: Number.isFinite(heightValue) && heightCm ? heightValue : null,
        physique,
        interests,
        education_level: educationLevel,
        religion,
        marital_status: maritalStatus,
        children_count: childrenCount,
        wants_children: wantsChildren,
        is_single_parent: childrenCount > 0 ? isSingleParent : false,
        genotype,
        bio: bio.trim() || null,
      })
      .eq('id', userId);

    setSaving(false);
    if (updateError) {
      setError(friendlySaveError(updateError.message));
      return;
    }
    await refresh();
    router.back();
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: 'Edit profile' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Pressable
              onPress={pickPhoto}
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

            {photoReviewStatus?.status === 'pending' ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Your photo is awaiting review and isn&apos;t visible to others yet.
              </ThemedText>
            ) : photoReviewStatus?.status === 'rejected' ? (
              <ThemedText type="small" themeColor="danger" style={styles.centerText}>
                Your last photo was declined
                {photoReviewStatus.admin_note ? `: ${photoReviewStatus.admin_note}` : '.'} Try
                uploading a different one.
              </ThemedText>
            ) : null}

            <Section title="Basics">
              <TextField label="Name" value={displayName} onChangeText={setDisplayName} />
              <SelectField label="Gender" value={gender} options={GENDER_OPTIONS} onChange={setGender} />
            </Section>

            <Section title="Location & work">
              <TextField label="Current city" value={city} onChangeText={setCity} />
              <TextField label="Hometown" value={hometown} onChangeText={setHometown} />
              <TextField label="Occupation" value={occupation} onChangeText={setOccupation} />
              <TextField
                label="Phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </Section>

            <Section title="Appearance">
              <HeightField
                valueCm={heightCm}
                onChangeCm={setHeightCm}
                error={heightRangeError(heightCm)}
              />
              <SelectField
                label="Physique"
                value={physique}
                options={PHYSIQUE_OPTIONS}
                onChange={setPhysique}
              />
            </Section>

            <Section title="Interests">
              <View style={styles.chipGrid}>
                {INTEREST_OPTIONS.map((option) => (
                  <ChipOption
                    key={option.value}
                    label={option.label}
                    Icon={option.Icon}
                    selected={interests.includes(option.value)}
                    onPress={() => setInterests((cur) => toggleInArray(cur, option.value))}
                  />
                ))}
              </View>
            </Section>

            <Section title="Background">
              <SelectField
                label="Education level"
                value={educationLevel}
                options={EDUCATION_OPTIONS}
                onChange={setEducationLevel}
              />
              <SelectField
                label="Religion"
                value={religion}
                options={RELIGION_OPTIONS}
                onChange={setReligion}
              />
              <SelectField
                label="Genotype"
                value={genotype}
                options={GENOTYPE_OPTIONS}
                onChange={setGenotype}
              />
            </Section>

            <Section title="Family">
              <SelectField
                label="Marital status"
                value={maritalStatus}
                options={MARITAL_STATUS_OPTIONS}
                onChange={setMaritalStatus}
              />
              <View style={styles.stepperRow}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Children
                </ThemedText>
                <Stepper value={childrenCount} onChange={setChildrenCount} />
              </View>
              <SelectField
                label="Want (more) children?"
                value={wantsChildren}
                options={WANTS_CHILDREN_OPTIONS}
                onChange={setWantsChildren}
              />
              {childrenCount > 0 ? (
                <ChipOption
                  label="I'm a single parent"
                  selected={isSingleParent}
                  onPress={() => setIsSingleParent((v) => !v)}
                />
              ) : null}
            </Section>

            <Section title="About">
              <TextField
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={500}
                style={styles.multilineInput}
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
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
    marginHorizontal: Spacing.four,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.three,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stepperRow: {
    gap: Spacing.two,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  paddedBlock: {
    marginHorizontal: Spacing.four,
  },
});

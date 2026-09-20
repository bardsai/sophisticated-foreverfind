import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsRow } from '@/components/settings-row';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { INTEREST_OPTIONS } from '@/constants/onboarding-options';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { calculateAge, formatLocationLine } from '@/lib/profile-utils';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const { signOut } = useSession();
  const { isAdmin } = useIsAdmin();

  if (!profile) return null;

  const locationLine = formatLocationLine(profile);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}>
            {profile.primary_photo_url ? (
              <Image source={{ uri: profile.primary_photo_url }} style={styles.photoImage} />
            ) : (
              <ThemedText themeColor="textSecondary">No photo</ThemedText>
            )}
          </View>

          <View style={styles.headerBlock}>
            <ThemedText type="title" style={styles.name}>
              {profile.display_name}
              {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
            </ThemedText>
            {locationLine ? (
              <ThemedText themeColor="textSecondary">{locationLine}</ThemedText>
            ) : null}
          </View>

          {profile.bio ? (
            <ThemedText style={styles.paddedBlock}>{profile.bio}</ThemedText>
          ) : null}

          {profile.interests.length ? (
            <View style={styles.tagRow}>
              {profile.interests.map((interest) => (
                <Tag
                  key={interest}
                  label={interest}
                  Icon={INTEREST_OPTIONS.find((o) => o.value === interest)?.Icon}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.settingsList}>
            <SettingsRow label="Edit profile" onPress={() => router.push('/edit-profile')} />
            <SettingsRow
              label="Partner preferences"
              onPress={() => router.push('/edit-partner-preferences')}
            />
            <SettingsRow label="Blocked users" onPress={() => router.push('/blocked-users')} />
          </View>

          <View style={styles.settingsList}>
            <SettingsRow label="Terms of Service" onPress={() => router.push('/terms')} />
            <SettingsRow label="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
          </View>

          {isAdmin ? (
            <View style={styles.settingsList}>
              <SettingsRow label="Review requests (admin)" onPress={() => router.push('/admin')} />
            </View>
          ) : null}

          <View style={styles.settingsList}>
            <SettingsRow
              label="Delete account"
              themeColor="danger"
              onPress={() => router.push('/delete-account')}
            />
            <SettingsRow label="Log out" themeColor="danger" onPress={() => signOut()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
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
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  headerBlock: {
    paddingHorizontal: Spacing.four,
    gap: 2,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  paddedBlock: {
    marginHorizontal: Spacing.four,
  },
  settingsList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
});

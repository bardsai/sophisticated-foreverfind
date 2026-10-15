import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const { profile } = useProfile();
  const { signOut } = useSession();
  const { isAdmin } = useIsAdmin();

  if (!profile) return null;

  const locationLine = formatLocationLine(profile);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.hero,
              wide && styles.wideHero,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <View
              style={[
                styles.photo,
                wide && styles.widePhoto,
                { backgroundColor: theme.backgroundSelected },
              ]}>
              {profile.primary_photo_url ? (
                <Image
                  source={{ uri: profile.primary_photo_url }}
                  style={styles.photoImage}
                  accessibilityLabel={`${profile.display_name}'s profile photo`}
                />
              ) : (
                <ThemedText themeColor="textSecondary">No photo</ThemedText>
              )}
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.headerBlock}>
                <ThemedText type="title" style={styles.name}>
                  {profile.display_name}
                  {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
                </ThemedText>
                {locationLine ? (
                  <ThemedText themeColor="textSecondary">{locationLine}</ThemedText>
                ) : null}
              </View>

              {profile.bio ? <ThemedText>{profile.bio}</ThemedText> : null}

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

              <SettingsRow label="Edit your profile" onPress={() => router.push('/edit-profile')} />
            </View>
          </View>

          <SettingsSection title="Your preferences">
            <SettingsRow
              label="Partner preferences"
              onPress={() => router.push('/edit-partner-preferences')}
            />
          </SettingsSection>

          <SettingsSection title="Safety & information">
            <SettingsRow label="Blocked users" onPress={() => router.push('/blocked-users')} />
            <SettingsRow label="Terms of Service" onPress={() => router.push('/terms')} />
            <SettingsRow label="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
          </SettingsSection>

          {isAdmin ? (
            <SettingsSection title="Administration">
              <SettingsRow label="Review requests (admin)" onPress={() => router.push('/admin')} />
            </SettingsSection>
          ) : null}

          <SettingsSection title="Account">
            <SettingsRow
              label="Delete account"
              themeColor="danger"
              onPress={() => router.push('/delete-account')}
            />
            <SettingsRow label="Log out" themeColor="danger" onPress={() => signOut()} />
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingsSection}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
        {title.toUpperCase()}
      </ThemedText>
      <View style={styles.settingsList}>{children}</View>
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
    maxWidth: MaxContentWidth + Spacing.five,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  hero: {
    padding: Spacing.three,
    borderRadius: 24,
    borderWidth: 1,
    gap: Spacing.three,
  },
  wideHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  photo: {
    width: '100%',
    maxWidth: 376,
    aspectRatio: 0.86,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  widePhoto: {
    width: '42%',
    flexShrink: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.three,
  },
  headerBlock: {
    gap: Spacing.one,
  },
  name: {
    fontSize: 30,
    lineHeight: 36,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  settingsSection: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  sectionLabel: {
    letterSpacing: 0.8,
  },
  settingsList: {
    gap: Spacing.two,
  },
});

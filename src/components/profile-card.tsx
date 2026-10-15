import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculateAge, formatLocationLine } from '@/lib/profile-utils';
import type { Profile } from '@/hooks/use-profile';

export type ProfileCardProps = {
  profile: Profile;
  requested?: boolean;
  distanceKm?: number;
  onPress: () => void;
};

export function ProfileCard({ profile, requested, distanceKm, onPress }: ProfileCardProps) {
  const theme = useTheme();
  const locationLine = formatLocationLine(profile);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${profile.display_name}${profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}${locationLine ? `, ${locationLine}` : ''}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}>
        {profile.primary_photo_url ? (
          <Image source={{ uri: profile.primary_photo_url }} style={styles.photoImage} />
        ) : (
          <ThemedText themeColor="textSecondary" type="small">
            No photo
          </ThemedText>
        )}
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {profile.display_name}
          {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
        </ThemedText>
        {locationLine ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {locationLine}
          </ThemedText>
        ) : null}
        {distanceKm != null ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {distanceKm < 1 ? 'Less than 1 km away' : `${distanceKm} km away`}
          </ThemedText>
        ) : null}
        {requested ? (
          <ThemedText type="small" themeColor="primary" style={styles.requestedLabel}>
            Requested
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
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
  info: {
    padding: Spacing.two,
    gap: 2,
  },
  requestedLabel: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.82,
  },
});

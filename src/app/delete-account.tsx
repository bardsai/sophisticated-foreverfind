import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const { signOut } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();

  async function performDelete() {
    setDeleting(true);
    setError(undefined);
    const { error: fnError } = await supabase.functions.invoke('delete-account');
    setDeleting(false);
    if (fnError) {
      setError(fnError.message);
      return;
    }
    await signOut();
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your profile, matches, and requests. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ],
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: 'Delete account' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <View style={styles.content}>
          <ThemedText type="subtitle">This can&apos;t be undone</ThemedText>
          <ThemedText themeColor="textSecondary">
            Deleting your account permanently removes your profile, photos, match requests, and
            matches. Anyone you&apos;ve matched with will no longer see you in their requests.
          </ThemedText>

          {error ? (
            <ThemedText themeColor="danger" type="small">
              {error}
            </ThemedText>
          ) : null}

          <PrimaryButton
            title="Delete my account"
            loading={deleting}
            onPress={confirmDelete}
            style={{ backgroundColor: theme.danger }}
          />
        </View>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
});

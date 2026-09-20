import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import { passwordError } from '@/lib/validation';

export default function UpdatePasswordScreen() {
  const { clearPasswordRecovery, signOut } = useSession();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const fieldErrors = {
    password: passwordError(password),
    confirmPassword: confirmPassword !== password ? 'Passwords do not match' : undefined,
  };

  async function handleSubmit() {
    setTouched(true);
    setSubmitError(undefined);
    if (fieldErrors.password || fieldErrors.confirmPassword) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    // Lets the root layout's guards resume normally — onto (tabs) or
    // (onboarding), whichever this account already qualifies for.
    clearPasswordRecovery();
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <Animated.View entering={entranceAnimation()}>
              <BrandMark width={200} />
            </Animated.View>

            <Animated.View entering={entranceAnimation(80)} style={styles.titleBlock}>
              <ThemedText type="subtitle" style={styles.centerText}>
                Choose a new password
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                This replaces your old password on ForeverFind.
              </ThemedText>
            </Animated.View>

            <Animated.View entering={entranceAnimation(160)} style={styles.form}>
              <TextField
                label="New password"
                value={password}
                onChangeText={setPassword}
                error={touched ? fieldErrors.password : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                submitBehavior="submit"
              />
              <TextField
                ref={confirmRef}
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={touched ? fieldErrors.confirmPassword : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {submitError ? (
                <Animated.View entering={fadeInAnimation()}>
                  <ThemedText themeColor="danger" type="small">
                    {submitError}
                  </ThemedText>
                </Animated.View>
              ) : null}

              <PrimaryButton title="Update password" loading={loading} onPress={handleSubmit} />
            </Animated.View>

            <Pressable onPress={() => signOut()} hitSlop={8}>
              <ThemedText themeColor="textSecondary" type="small" style={styles.centerText}>
                Cancel and sign out
              </ThemedText>
            </Pressable>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.five,
  },
  titleBlock: {
    gap: Spacing.one,
  },
  centerText: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});

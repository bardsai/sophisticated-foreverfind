import { makeRedirectUri } from 'expo-auth-session';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { emailError } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const error = emailError(email);

  async function handleSubmit() {
    setTouched(true);
    setSubmitError(undefined);
    if (error) return;

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: makeRedirectUri(),
    });
    setLoading(false);

    if (resetError) {
      setSubmitError(resetError.message);
      return;
    }
    router.push({
      pathname: '/check-email',
      params: { email: email.trim(), purpose: 'recovery' },
    });
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
                Reset your password
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                Enter your email and we&apos;ll send you a link to choose a new one.
              </ThemedText>
            </Animated.View>

            <Animated.View entering={entranceAnimation(160)} style={styles.form}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={touched ? error : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
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

              <PrimaryButton title="Send reset link" loading={loading} onPress={handleSubmit} />
            </Animated.View>

            <ThemedView style={styles.footerRow}>
              <ThemedText themeColor="textSecondary">Remembered it?</ThemedText>
              <Link href="/login" replace>
                <ThemedText themeColor="primary" type="smallBold">
                  Log in
                </ThemedText>
              </Link>
            </ThemedView>
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});

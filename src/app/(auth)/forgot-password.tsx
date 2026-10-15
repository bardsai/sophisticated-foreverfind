import { makeRedirectUri } from 'expo-auth-session';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { fadeInAnimation, entranceAnimation } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
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
    <AuthScreen
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={
        <>
          <ThemedText themeColor="textSecondary">Remembered it?</ThemedText>
          <Link href="/login" replace>
            <ThemedText themeColor="primary" type="smallBold">
              Log in
            </ThemedText>
          </Link>
        </>
      }>
      <Animated.View entering={entranceAnimation(80)} style={styles.form}>
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
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});

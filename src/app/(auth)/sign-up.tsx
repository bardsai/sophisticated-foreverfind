import { makeRedirectUri } from 'expo-auth-session';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth-screen';
import { DateField } from '@/components/date-field';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import {
  birthdateError,
  displayNameError,
  emailError,
  passwordError,
  toDateOnlyString,
} from '@/lib/validation';

const TODAY = new Date();
const MAX_BIRTHDATE = new Date(TODAY.getFullYear() - 18, TODAY.getMonth(), TODAY.getDate());
const MIN_BIRTHDATE = new Date(TODAY.getFullYear() - 100, TODAY.getMonth(), TODAY.getDate());

export default function SignUpScreen() {
  const theme = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const fieldErrors = {
    displayName: displayNameError(displayName),
    birthdate: birthdateError(birthdate),
    email: emailError(email),
    password: passwordError(password),
    confirmPassword: confirmPassword !== password ? 'Passwords do not match' : undefined,
  };
  const hasErrors = Object.values(fieldErrors).some(Boolean);

  async function handleSignUp() {
    setTouched(true);
    setSubmitError(undefined);
    if (!agreedToTerms) {
      setSubmitError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    if (hasErrors || !birthdate) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim(), birthdate: toDateOnlyString(birthdate) },
        // The confirmation email is unmodifiable Supabase-default text
        // (custom SMTP is required to edit it), so it's a magic link rather
        // than an OTP code. Tapping it opens the app via this deep link,
        // where SessionProvider completes the sign-in — see use-session.tsx.
        emailRedirectTo: makeRedirectUri(),
      },
    });
    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before a session exists; the profile
      // row was already created server-side from the metadata above.
      router.push({ pathname: '/check-email', params: { email: email.trim() } });
    }
    // If a session came back immediately (confirmation disabled), the root
    // layout's Stack.Protected guard swaps to (onboarding) on its own.
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Every introduction is reviewed by our team before you connect."
      footer={
        <>
          <ThemedText themeColor="textSecondary">Already have an account?</ThemedText>
          <Link href="/login" replace>
            <ThemedText themeColor="primary" type="smallBold">
              Log in
            </ThemedText>
          </Link>
        </>
      }>
      <Animated.View entering={entranceAnimation(80)} style={styles.form}>
              <TextField
                label="Name"
                value={displayName}
                onChangeText={setDisplayName}
                error={touched ? fieldErrors.displayName : undefined}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                submitBehavior="submit"
              />
              <DateField
                label="Date of birth"
                value={birthdate}
                onChange={setBirthdate}
                error={touched ? fieldErrors.birthdate : undefined}
                maximumDate={MAX_BIRTHDATE}
                minimumDate={MIN_BIRTHDATE}
              />
              <TextField
                ref={emailRef}
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={touched ? fieldErrors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
              />
              <TextField
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                error={touched ? fieldErrors.password : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                submitBehavior="submit"
              />
              <TextField
                ref={confirmPasswordRef}
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={touched ? fieldErrors.confirmPassword : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />

              <Pressable
                onPress={() => setAgreedToTerms((v) => !v)}
                style={styles.termsRow}
                hitSlop={4}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: agreedToTerms ? theme.primary : theme.border,
                      backgroundColor: agreedToTerms ? theme.primary : 'transparent',
                    },
                  ]}
                />
                <ThemedText type="small" themeColor="textSecondary" style={styles.termsText}>
                  I agree to the{' '}
                  <ThemedText type="small" themeColor="primary" onPress={() => router.push('/terms')}>
                    Terms of Service
                  </ThemedText>{' '}
                  and{' '}
                  <ThemedText
                    type="small"
                    themeColor="primary"
                    onPress={() => router.push('/privacy-policy')}>
                    Privacy Policy
                  </ThemedText>
                </ThemedText>
              </Pressable>

              {submitError ? (
                <Animated.View entering={fadeInAnimation()}>
                  <ThemedText themeColor="danger" type="small">
                    {submitError}
                  </ThemedText>
                </Animated.View>
              ) : null}

              <PrimaryButton title="Create account" loading={loading} onPress={handleSignUp} />
      </Animated.View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    lineHeight: 20,
  },
});

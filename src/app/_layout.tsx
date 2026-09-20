import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import { ProfileProvider, useProfile } from '@/hooks/use-profile';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { SessionProvider, useSession } from '@/hooks/use-session';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'MonaSans-Regular': require('@/assets/fonts/mona-sans/MonaSans-Regular.ttf'),
    'MonaSans-Medium': require('@/assets/fonts/mona-sans/MonaSans-Medium.ttf'),
    'MonaSans-SemiBold': require('@/assets/fonts/mona-sans/MonaSans-SemiBold.ttf'),
    'MonaSans-Bold': require('@/assets/fonts/mona-sans/MonaSans-Bold.ttf'),
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme}>
      {/* expo-router mounts react-helmet-async's <Head> globally on web (it's
          why an empty, Helmet-managed <title data-rh="true"> shows up even
          though no screen renders <Head>), which clears the static <title>
          set in +html.tsx once it takes over. Giving Helmet a title here,
          always-mounted at the root, is what actually sticks. */}
      <Head>
        <title>ForeverFind</title>
      </Head>
      <StatusBar style="auto" />
      <SessionProvider>
        <ProfileProvider>
          <AnimatedSplashOverlay ready={fontsLoaded || !!fontError} />
          <RootNavigator />
        </ProfileProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading: sessionLoading, isPasswordRecovery } = useSession();
  const { profile, isLoading: profileLoading } = useProfile();
  usePushNotifications();

  const ready = !sessionLoading && (!session || !profileLoading);

  // Don't mount the Stack until auth state is actually known. Before that,
  // every Stack.Protected guard below is false at once, leaving only the two
  // unconditional screens (privacy-policy, terms) available — expo-router
  // then resolves any other deep-linked path (e.g. /login, or the magic-link
  // callback) to the first of those as a fallback, and never revisits it
  // once the real guard state comes in. The splash overlay covers this.
  if (!ready) return null;

  const isAuthenticated = !!session;
  // A password-reset link authenticates the user via a recovery session —
  // isPasswordRecovery takes priority over the normal onboarded/tabs split
  // so they land on update-password instead of straight into the app.
  const isOnboarded = isAuthenticated && !isPasswordRecovery && !!profile?.onboarding_completed_at;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated && isPasswordRecovery}>
        <Stack.Screen name="update-password" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !isPasswordRecovery && isOnboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="edit-partner-preferences" />
        <Stack.Screen name="blocked-users" />
        <Stack.Screen name="delete-account" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="chat/[matchId]" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !isPasswordRecovery && !isOnboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={ready && !session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Static, no user data — reachable regardless of auth state (pre-signup and from Profile settings). */}
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}

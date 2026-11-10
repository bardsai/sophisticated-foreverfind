import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxAuthWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({ title, subtitle, children, footer }: AuthScreenProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.brandBlock}>
                <BrandMark width={176} />
                <View style={[styles.trustBadge, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                  <SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={15} tintColor={theme.primary} />
                  <ThemedText type="smallBold" themeColor="primary">A more thoughtful way to meet</ThemedText>
                </View>
              </View>
              <ThemedView
                type="backgroundElement"
                style={[styles.card, { borderColor: theme.border }]}>
                <View style={styles.heading}>
                  <View style={[styles.headingIcon, { backgroundColor: theme.backgroundSelected }]}>
                    <SymbolView
                      name={title === 'Create your account'
                        ? { ios: 'person.crop.circle.badge.plus', android: 'person_add', web: 'person_add' }
                        : title === 'Welcome back'
                          ? { ios: 'heart.circle.fill', android: 'favorite', web: 'favorite' }
                          : { ios: 'lock.shield', android: 'lock', web: 'lock' }}
                      size={25}
                      tintColor={theme.primary}
                    />
                  </View>
                  <ThemedText type="smallBold" themeColor="primary" style={styles.eyebrow}>
                    THOUGHTFUL INTRODUCTIONS
                  </ThemedText>
                  <ThemedText type="subtitle" style={styles.title}>
                    {title}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                    {subtitle}
                  </ThemedText>
                </View>
                {children}
              </ThemedView>
              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxAuthWidth,
    alignItems: 'center',
    gap: Spacing.four,
  },
  brandBlock: { alignItems: 'center', gap: Spacing.two },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderWidth: 1, borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  heading: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  headingIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.one },
  eyebrow: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
});

import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LEGAL_LAST_UPDATED, type LegalSection } from '@/constants/legal-content';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export function LegalDocument({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText themeColor="textSecondary" type="small">
            Last updated {LEGAL_LAST_UPDATED}
          </ThemedText>
          {sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <ThemedText type="smallBold">{section.heading}</ThemedText>
              {section.paragraphs.map((paragraph) => (
                <ThemedText key={paragraph} themeColor="textSecondary">
                  {paragraph}
                </ThemedText>
              ))}
            </View>
          ))}
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColor } from '@/constants/theme';

export type SettingsRowProps = {
  label: string;
  onPress: () => void;
  themeColor?: ThemeColor;
};

export function SettingsRow({ label, onPress, themeColor = 'text' }: SettingsRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor={themeColor}>
        {label}
      </ThemedText>
      <View style={[styles.chevron, { borderColor: theme[themeColor] }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chevron: {
    width: 7,
    height: 7,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
});

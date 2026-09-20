import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CheckIcon, type IconProps } from '@/components/onboarding/icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type OptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  Icon?: ComponentType<IconProps>;
};

export function OptionRow({ label, selected, onPress, Icon }: OptionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[
        styles.row,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      {Icon ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: selected ? theme.primary : theme.backgroundSelected },
          ]}>
          <Icon color={selected ? theme.background : theme.primary} size={20} />
        </View>
      ) : null}
      <ThemedText
        type={selected ? 'smallBold' : 'default'}
        themeColor={selected ? 'primary' : 'text'}
        style={styles.label}>
        {label}
      </ThemedText>
      {selected ? (
        <View style={[styles.check, { backgroundColor: theme.primary }]}>
          <CheckIcon color={theme.background} size={12} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

import { useState, type CSSProperties } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonaSans, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

function toInputValue(date: Date | null | undefined) {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// @react-native-community/datetimepicker has no web build, so this platform
// file swaps in a real <input type="date">, which gives web users the
// browser's own native date picker UI for free.
export function DateField({
  label,
  value,
  onChange,
  error,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.danger : focused ? theme.primary : theme.border;

  const inputStyle: CSSProperties = {
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor,
    borderRadius: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.three,
    paddingTop: Spacing.two + 2,
    paddingBottom: Spacing.two + 2,
    fontSize: 16,
    fontFamily: MonaSans.medium,
    colorScheme: colorScheme === 'dark' ? 'dark' : 'light',
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    outline: 'none',
    minHeight: 48,
    boxSizing: 'border-box',
    width: '100%',
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <input
        type="date"
        value={toInputValue(value) ?? ''}
        max={toInputValue(maximumDate)}
        min={toInputValue(minimumDate)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          const [year, month, day] = event.target.value.split('-').map(Number);
          if (year && month && day) onChange(new Date(year, month - 1, day));
        }}
        style={inputStyle}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
});

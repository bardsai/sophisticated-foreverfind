import { Host, Picker } from '@expo/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  type DateFieldProps,
  type DateParts,
  getDateDays,
  getDateMonths,
  getDateParts,
  getDateYears,
  MONTHS,
  normalizeDateParts,
} from '@/components/date-field-utils';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type { DateFieldProps } from '@/components/date-field-utils';

export function DateField({
  label,
  value,
  onChange,
  error,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const theme = useTheme();
  const [parts, setParts] = useState(() => getDateParts(value));
  const years = getDateYears(minimumDate, maximumDate);
  const months = parts.year
    ? getDateMonths(Number(parts.year), minimumDate, maximumDate)
    : Array.from({ length: 12 }, (_, i) => i + 1);
  const days =
    parts.year && parts.month
      ? getDateDays(Number(parts.year), Number(parts.month), minimumDate, maximumDate)
      : [];

  function updateParts(nextParts: DateParts) {
    const updated = normalizeDateParts(nextParts, minimumDate, maximumDate);
    setParts(updated);
    if (updated.year && updated.month && updated.day) {
      onChange(new Date(Number(updated.year), Number(updated.month) - 1, Number(updated.day)));
    } else {
      onChange(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">{label}</ThemedText>
      <View style={styles.pickerRow}>
        <Host style={[styles.pickerHost, styles.nativePickerField, { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]} seedColor={theme.primary}>
          <Picker
            selectedValue={parts.day}
            onValueChange={(day) => updateParts({ ...parts, day: String(day) })}
            appearance="menu"
            enabled={days.length > 0}
            testID="birthdate-day">
            <Picker.Item label="Day" value="" />
            {days.map((day) => (
              <Picker.Item key={day} label={String(day)} value={String(day)} />
            ))}
          </Picker>
        </Host>
        <Host style={[styles.pickerHost, styles.nativePickerField, { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]} seedColor={theme.primary}>
          <Picker
            selectedValue={parts.month}
            onValueChange={(month) => updateParts({ ...parts, month: String(month), day: parts.day })}
            appearance="menu"
            enabled={months.length > 0}
            testID="birthdate-month">
            <Picker.Item label="Month" value="" />
            {months.map((month) => (
              <Picker.Item key={month} label={MONTHS[month - 1]} value={String(month)} />
            ))}
          </Picker>
        </Host>
        <Host style={[styles.pickerHost, styles.nativePickerField, { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]} seedColor={theme.primary}>
          <Picker
            selectedValue={parts.year}
            onValueChange={(year) => updateParts({ ...parts, year: String(year) })}
            appearance="menu"
            enabled={years.length > 0}
            testID="birthdate-year">
            <Picker.Item label="Year" value="" />
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </Host>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        Select the month and year first to enable day selection.
      </ThemedText>
      {error ? <ThemedText type="small" themeColor="danger">{error}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one, backgroundColor: 'transparent', width: '100%' },
  pickerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    minHeight: 48,
    width: '100%',
    alignItems: 'center',
  },
  pickerHost: { flex: 1, minWidth: 0 },
  nativePickerField: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});

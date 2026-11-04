import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonaSans, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function dateParts(date: Date | null) {
  return date
    ? {
        day: String(date.getDate()).padStart(2, '0'),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        year: String(date.getFullYear()),
      }
    : { day: '', month: '', year: '' };
}

function dateTimestamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select a date',
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const theme = useTheme();
  const [parts, setParts] = useState(() => dateParts(value));
  const [focusedPart, setFocusedPart] = useState<'day' | 'month' | 'year'>();
  const [inputError, setInputError] = useState<string>();
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  function openPicker() {
    const initialValue = value ?? maximumDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialValue,
        mode: 'date',
        maximumDate,
        minimumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(date);
        },
      });
    }
  }

  function updatePart(part: 'day' | 'month' | 'year', text: string) {
    const nextParts = { ...parts, [part]: text.replace(/[^0-9]/g, '') };
    setParts(nextParts);
    setInputError(undefined);
    onChange(null);

    if (nextParts.day.length !== 2 || nextParts.month.length !== 2 || nextParts.year.length !== 4) {
      return;
    }

    const day = Number(nextParts.day);
    const month = Number(nextParts.month);
    const year = Number(nextParts.year);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      setInputError('Enter a valid date.');
      return;
    }

    if (
      (maximumDate && dateTimestamp(date) > dateTimestamp(maximumDate)) ||
      (minimumDate && dateTimestamp(date) < dateTimestamp(minimumDate))
    ) {
      setInputError('Choose a date within the allowed range.');
      return;
    }

    onChange(date);
  }

  const inputErrorColor = inputError || error ? theme.danger : undefined;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {Platform.OS === 'ios' ? (
        <View style={styles.dateParts}>
          <TextInput
            accessibilityLabel="Day of birth"
            value={parts.day}
            onChangeText={(text) => updatePart('day', text)}
            onFocus={() => setFocusedPart('day')}
            onBlur={() => setFocusedPart(undefined)}
            returnKeyType="next"
            onSubmitEditing={() => monthRef.current?.focus()}
            placeholder="DD"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
            style={[
              styles.datePartInput,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: inputErrorColor ?? (focusedPart === 'day' ? theme.primary : theme.border),
              },
            ]}
          />
          <TextInput
            ref={monthRef}
            accessibilityLabel="Month of birth"
            value={parts.month}
            onChangeText={(text) => updatePart('month', text)}
            onFocus={() => setFocusedPart('month')}
            onBlur={() => setFocusedPart(undefined)}
            returnKeyType="next"
            onSubmitEditing={() => yearRef.current?.focus()}
            placeholder="MM"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
            style={[
              styles.datePartInput,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: inputErrorColor ?? (focusedPart === 'month' ? theme.primary : theme.border),
              },
            ]}
          />
          <TextInput
            ref={yearRef}
            accessibilityLabel="Year of birth"
            value={parts.year}
            onChangeText={(text) => updatePart('year', text)}
            onFocus={() => setFocusedPart('year')}
            onBlur={() => setFocusedPart(undefined)}
            returnKeyType="done"
            placeholder="YYYY"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
            style={[
              styles.datePartInput,
              styles.yearInput,
              {
                color: theme.text,
                backgroundColor: theme.backgroundElement,
                borderColor: inputErrorColor ?? (focusedPart === 'year' ? theme.primary : theme.border),
              },
            ]}
          />
        </View>
      ) : (
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              borderColor: error ? theme.danger : theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}>
          <ThemedText style={{ color: value ? theme.text : theme.textSecondary }}>
            {value ? formatDate(value) : placeholder}
          </ThemedText>
        </Pressable>
      )}
      {inputError || error ? (
        <ThemedText type="small" themeColor="danger">
          {inputError ?? error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
    width: '100%',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    minWidth: 0,
  },
  dateParts: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  datePartInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    fontFamily: MonaSans.medium,
    textAlign: 'center',
  },
  yearInput: {
    flex: 1.5,
  },
});

import { useRef, useState, type CSSProperties } from 'react';
import { StyleSheet } from 'react-native';

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

const datePartsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: Spacing.two,
};

const datePartInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderWidth: 1.5,
  borderStyle: 'solid',
  borderRadius: Spacing.two,
  paddingLeft: Spacing.two,
  paddingRight: Spacing.two,
  fontSize: 16,
  fontFamily: MonaSans.medium,
  outline: 'none',
  minHeight: 48,
  boxSizing: 'border-box',
  textAlign: 'center',
};

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
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

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

  function inputStyle(part: 'day' | 'month' | 'year'): CSSProperties {
    return {
      ...datePartInputStyle,
      ...(part === 'year' ? { flex: 1.5 } : undefined),
      borderColor: inputError || error
        ? theme.danger
        : focusedPart === part
          ? theme.primary
          : theme.border,
      backgroundColor: theme.backgroundElement,
      color: theme.text,
    };
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <div style={datePartsStyle}>
        <input
          aria-label="Day of birth"
          type="text"
          inputMode="numeric"
          autoComplete="bday-day"
          value={parts.day}
          onChange={(event) => updatePart('day', event.target.value)}
          onFocus={() => setFocusedPart('day')}
          onBlur={() => setFocusedPart(undefined)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              monthRef.current?.focus();
            }
          }}
          placeholder="DD"
          maxLength={2}
          style={inputStyle('day')}
        />
        <input
          ref={monthRef}
          aria-label="Month of birth"
          type="text"
          inputMode="numeric"
          autoComplete="bday-month"
          value={parts.month}
          onChange={(event) => updatePart('month', event.target.value)}
          onFocus={() => setFocusedPart('month')}
          onBlur={() => setFocusedPart(undefined)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              yearRef.current?.focus();
            }
          }}
          placeholder="MM"
          maxLength={2}
          style={inputStyle('month')}
        />
        <input
          ref={yearRef}
          aria-label="Year of birth"
          type="text"
          inputMode="numeric"
          autoComplete="bday-year"
          value={parts.year}
          onChange={(event) => updatePart('year', event.target.value)}
          onFocus={() => setFocusedPart('year')}
          onBlur={() => setFocusedPart(undefined)}
          placeholder="YYYY"
          maxLength={4}
          style={inputStyle('year')}
        />
      </div>
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
});

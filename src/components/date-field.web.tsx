import type { CSSProperties } from 'react';
import { useState } from 'react';

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
import { MonaSans, Spacing } from '@/constants/theme';
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

  const selectStyle = (selected: boolean): CSSProperties => ({
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    boxSizing: 'border-box',
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: error ? theme.danger : theme.border,
    borderRadius: Spacing.two,
    padding: `${Spacing.two + 2}px ${Spacing.three}px`,
    backgroundColor: theme.backgroundElement,
    color: selected ? theme.text : theme.textSecondary,
    fontSize: 16,
    fontFamily: MonaSans.medium,
    outline: 'none',
  });

  return (
    <ThemedView style={{ gap: Spacing.one, backgroundColor: 'transparent', width: '100%' }}>
      <ThemedText type="smallBold" themeColor="textSecondary">{label}</ThemedText>
      <div style={{ display: 'flex', gap: Spacing.two, width: '100%' }}>
        <select
          aria-label={`${label} day`}
          value={parts.day}
          onChange={(event) => updateParts({ ...parts, day: event.currentTarget.value })}
          style={selectStyle(!!parts.day)}
          data-testid="birthdate-day"
          disabled={days.length === 0}>
          <option value="">Day</option>
          {days.map((day) => (
            <option key={day} value={String(day)}>{day}</option>
          ))}
        </select>
        <select
          aria-label={`${label} month`}
          value={parts.month}
          onChange={(event) => updateParts({ ...parts, month: event.currentTarget.value })}
          style={selectStyle(!!parts.month)}
          data-testid="birthdate-month">
          <option value="">Month</option>
          {months.map((month) => (
            <option key={month} value={String(month)}>{MONTHS[month - 1]}</option>
          ))}
        </select>
        <select
          aria-label={`${label} year`}
          value={parts.year}
          onChange={(event) => updateParts({ ...parts, year: event.currentTarget.value })}
          style={selectStyle(!!parts.year)}
          data-testid="birthdate-year">
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <ThemedText type="small" themeColor="textSecondary">
        Select the month and year first to enable day selection.
      </ThemedText>
      {error ? <ThemedText type="small" themeColor="danger">{error}</ThemedText> : null}
    </ThemedView>
  );
}

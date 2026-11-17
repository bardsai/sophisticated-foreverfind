export type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

export type DateParts = {
  day: string;
  month: string;
  year: string;
};

const CURRENT_YEAR = new Date().getFullYear();

export const MONTHS = Array.from({ length: 12 }, (_, index) =>
  new Date(2000, index, 1).toLocaleString(undefined, { month: 'long' }),
);

export function getDateParts(date: Date | null): DateParts {
  if (!date) return { day: '', month: '', year: '' };
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
}

export function getDateYears(minimumDate?: Date, maximumDate?: Date) {
  const firstYear = minimumDate?.getFullYear() ?? CURRENT_YEAR - 100;
  const lastYear = maximumDate?.getFullYear() ?? CURRENT_YEAR;
  return Array.from({ length: Math.max(0, lastYear - firstYear + 1) }, (_, index) =>
    String(lastYear - index),
  );
}

export function getDateDays(year: number, month: number, minimumDate?: Date, maximumDate?: Date) {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => index + 1).filter((day) =>
    isWithinBounds(new Date(year, month - 1, day), minimumDate, maximumDate),
  );
}

export function getDateMonths(year: number, minimumDate?: Date, maximumDate?: Date) {
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((month) =>
    getDateDays(year, month, minimumDate, maximumDate).length > 0,
  );
}

export function normalizeDateParts(
  parts: DateParts,
  minimumDate?: Date,
  maximumDate?: Date,
): DateParts {
  if (!parts.year) return { ...parts, day: '' };
  if (
    parts.month &&
    !getDateMonths(Number(parts.year), minimumDate, maximumDate).includes(Number(parts.month))
  ) {
    return { ...parts, month: '', day: '' };
  }
  if (
    parts.month &&
    parts.day &&
    !getDateDays(Number(parts.year), Number(parts.month), minimumDate, maximumDate).includes(
      Number(parts.day),
    )
  ) {
    return { ...parts, day: '' };
  }
  return parts;
}

function isWithinBounds(date: Date, minimumDate?: Date, maximumDate?: Date) {
  const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const minimum = minimumDate
    ? new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate()).getTime()
    : Number.NEGATIVE_INFINITY;
  const maximum = maximumDate
    ? new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate()).getTime()
    : Number.POSITIVE_INFINITY;
  return timestamp >= minimum && timestamp <= maximum;
}

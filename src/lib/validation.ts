const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(value: string): string | undefined {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
  return undefined;
}

export function passwordError(value: string): string | undefined {
  if (value.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

export function displayNameError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length > 60) return 'Name must be 60 characters or fewer';
  return undefined;
}

export function birthdateError(value: Date | null): string | undefined {
  if (!value) return 'Date of birth is required';

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  if (value > eighteenYearsAgo) return 'You must be 18 or older to join';

  return undefined;
}

// Formats a Date as YYYY-MM-DD using local calendar fields, avoiding the
// day-shift that toISOString() can introduce by converting through UTC.
export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

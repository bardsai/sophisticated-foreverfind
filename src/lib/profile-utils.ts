import { toDateOnlyString } from '@/lib/validation';

export function calculateAge(birthdate: string): number {
  const dob = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

// Converts a partner-preference age range into birthdate bounds for a
// query: "at least minAge" means born on/before (today - minAge years);
// "at most maxAge" means born after (today - maxAge - 1 years) — the day
// exactly maxAge+1 years ago is the first excluded birthdate.
export function birthdateBoundsForAgeRange(minAge: number | null, maxAge: number | null) {
  const today = new Date();
  const maxBirthdate =
    minAge != null
      ? toDateOnlyString(new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()))
      : null;
  const minBirthdateExclusive =
    maxAge != null
      ? toDateOnlyString(
          new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate()),
        )
      : null;
  return { maxBirthdate, minBirthdateExclusive };
}

export function formatLocationLine(profile: {
  occupation: string | null;
  city: string | null;
}): string | null {
  const parts = [profile.occupation, profile.city].filter(Boolean);
  return parts.length ? parts.join(' • ') : null;
}

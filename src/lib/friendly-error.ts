// Postgres check-constraint violations ("new row ... violates check
// constraint ...") are never something a user should see verbatim — this is
// the backstop for whenever client-side validation doesn't catch a bad
// value before it reaches the request.
export function friendlySaveError(message: string): string {
  if (message.includes('violates')) {
    return "One of your answers doesn't look right — please double-check and try again.";
  }
  return message;
}

export function friendlyAuthEmailError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('email address not authorized')) {
    return 'Email delivery is not available for this address yet. Please try a different address or contact the app team.';
  }
  if (
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('email rate limit exceeded')
  ) {
    return 'Too many emails were requested recently. Wait a few minutes, then try again.';
  }
  if (lower.includes('smtp') || lower.includes('mailer')) {
    return 'We could not send the email. Please wait a few minutes and try again.';
  }
  return message;
}

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

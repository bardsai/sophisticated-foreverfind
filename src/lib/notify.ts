import { supabase } from '@/lib/supabase';

type EventType = 'new_message' | 'new_match' | 'request_approved';

// Fire-and-forget: the underlying action (message sent, match made, request
// approved) has already succeeded by the time this is called, so a push
// failure here shouldn't surface as an error to the user — it just means
// they won't get pinged and will see it next time they open the app.
export async function sendPushNotification(
  eventType: EventType,
  targetUserId: string,
  senderName?: string,
) {
  try {
    await supabase.functions.invoke('send-push', {
      body: { eventType, targetUserId, senderName },
    });
  } catch {
    // best-effort, see above
  }
}

// Sends a push notification to another user after a legitimate state change
// (new message, new match, request approved). The client only supplies an
// event type and the recipient — this function determines the actual title
// and body itself, and verifies the caller has a real relationship backing
// the event, so an authenticated user can't push-spam an arbitrary id.
import { withSupabase } from 'npm:@supabase/server';

type EventType = 'new_message' | 'new_match' | 'request_approved';

const MESSAGES: Record<EventType, (senderName?: string) => { title: string; body: string }> = {
  new_message: (senderName) => ({
    title: senderName ?? 'New message',
    body: 'You have a new message.',
  }),
  new_match: (senderName) => ({
    title: "It's a match!",
    body: `You matched with ${senderName ?? 'someone new'}.`,
  }),
  request_approved: () => ({
    title: 'New introduction',
    body: 'Someone would like to be introduced to you.',
  }),
};

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const callerId = ctx.userClaims!.id;
    const { eventType, targetUserId, senderName } = (await req.json()) as {
      eventType: EventType;
      targetUserId: string;
      senderName?: string;
    };

    if (!(eventType in MESSAGES) || !targetUserId) {
      return Response.json({ error: 'invalid request' }, { status: 400 });
    }

    let allowed = false;
    if (eventType === 'new_message' || eventType === 'new_match') {
      const { data } = await ctx.supabaseAdmin
        .from('matches')
        .select('id')
        .or(
          `and(user_a_id.eq.${callerId},user_b_id.eq.${targetUserId}),and(user_a_id.eq.${targetUserId},user_b_id.eq.${callerId})`,
        )
        .maybeSingle();
      allowed = !!data;
    } else if (eventType === 'request_approved') {
      const { data: role } = await ctx.supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', callerId)
        .single();
      const { data: reqRow } = await ctx.supabaseAdmin
        .from('match_requests')
        .select('id')
        .eq('target_id', targetUserId)
        .eq('status', 'admin_approved')
        .maybeSingle();
      allowed = role?.role === 'admin' && !!reqRow;
    }

    if (!allowed) {
      return Response.json({ error: 'not permitted' }, { status: 403 });
    }

    const { data: profile } = await ctx.supabaseAdmin
      .from('profiles')
      .select('push_token')
      .eq('id', targetUserId)
      .single();
    if (!profile?.push_token) {
      return Response.json({ skipped: 'no push token' });
    }

    const { title, body } = MESSAGES[eventType](senderName);
    const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: profile.push_token, title, body }),
    });

    return Response.json({ sent: pushResponse.ok });
  }),
};

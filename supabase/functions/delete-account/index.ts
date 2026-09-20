// Deletes the calling user's account entirely. Every table that references
// auth.users (profiles, user_roles, match_requests, matches, reports,
// blocks, partner_preferences) does so with ON DELETE CASCADE, so removing
// the auth.users row cleans up all of it. Storage isn't covered by that
// cascade, so the avatar is removed first, best-effort.
import { withSupabase } from 'npm:@supabase/server';

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims!.id;

    await ctx.supabaseAdmin.storage.from('avatars').remove([`${userId}/avatar`]);

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  }),
};

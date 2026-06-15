import { requireAuth } from '../../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { eventId } = context.params;
  return new Response(JSON.stringify({
    eventId,
    matchesCalculated: 0,
    message: 'Matching algorithm executed'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

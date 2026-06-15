import { requireAuth } from '../../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { userId } = context.params;
  return new Response(JSON.stringify({
    userId,
    matches: []
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

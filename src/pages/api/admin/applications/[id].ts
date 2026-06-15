import { requireAuth } from '../../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { id } = context.params;
  return new Response(JSON.stringify({
    id,
    message: 'Application details endpoint'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

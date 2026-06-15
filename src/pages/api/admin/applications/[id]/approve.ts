import { requireAuth } from '../../../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { id } = context.params;
  return new Response(JSON.stringify({
    id,
    status: 'approved',
    message: 'Application approved'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

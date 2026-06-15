import { requireAuth } from '../../../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  try {
    const { id } = context.params;
    const body = await context.request.json();
    const { reason } = body;

    return new Response(JSON.stringify({
      id,
      status: 'rejected',
      reason,
      message: 'Application rejected'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

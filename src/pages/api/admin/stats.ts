import { requireAuth } from '../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  return new Response(JSON.stringify({
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    nextEventDate: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

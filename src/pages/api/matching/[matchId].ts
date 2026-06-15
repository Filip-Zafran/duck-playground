import { requireAuth } from '../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { matchId } = context.params;
  return new Response(JSON.stringify({
    matchId,
    user1: {},
    user2: {},
    matchScore: 85,
    sharedInterests: []
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  try {
    const { matchId } = context.params;
    const body = await context.request.json();
    const { status } = body;

    return new Response(JSON.stringify({
      matchId,
      status,
      message: 'Match status updated'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating match status:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

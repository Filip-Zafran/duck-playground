import { requireAuth } from '../../../lib/apiAuth';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  return new Response(JSON.stringify({
    id,
    name: 'Event Name',
    date: '2026-06-03',
    location: 'Berlin',
    status: 'postponed'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  try {
    const { id } = context.params;
    const updates = await context.request.json();

    return new Response(JSON.stringify({
      id,
      ...updates,
      message: 'Event updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async (context) => {
  const auth = requireAuth(context);
  if (!auth.valid) return auth.response!;

  const { id } = context.params;
  return new Response(JSON.stringify({
    id,
    message: 'Event deleted successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

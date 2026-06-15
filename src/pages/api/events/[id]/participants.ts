import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  return new Response(JSON.stringify({
    eventId: id,
    participants: []
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

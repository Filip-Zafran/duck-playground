import type { APIRoute } from 'astro';

export const GET: APIRoute = (context) => {
  const cookieHeader = context.request.headers.get('cookie');
  const token = cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('duck_session='))
    ?.split('=')[1];

  return new Response(JSON.stringify({ authenticated: !!token }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

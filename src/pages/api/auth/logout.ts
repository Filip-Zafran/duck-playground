import type { APIRoute } from 'astro';

export const POST: APIRoute = () => {
  console.log('🚪 POST /api/auth/logout');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Set-Cookie': 'duck_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
      'Content-Type': 'application/json',
    },
  });
};

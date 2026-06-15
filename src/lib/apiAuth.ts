import jwt from 'jsonwebtoken';
import type { APIContext } from 'astro';

const getSecret = () => process.env.JWT_SECRET || 'duck-site-secret';

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  return cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('duck_session='))
    ?.split('=')[1] || null;
}

export function requireAuth(context: APIContext): { valid: boolean; response?: Response } {
  const token = getTokenFromRequest(context.request);

  if (!token) {
    return {
      valid: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  try {
    jwt.verify(token, getSecret());
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      response: new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
}

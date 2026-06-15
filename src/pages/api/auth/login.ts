import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const getSitePassword = () => process.env.ADMIN_PASSWORD || process.env.SITE_PASSWORD || 'duck';
const getSecret = () => process.env.JWT_SECRET || 'duck-site-secret';
const getCookieOpts = () => {
  const opts = `HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
  return process.env.NODE_ENV === 'production'
    ? `${opts}; Secure`
    : opts;
};

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { password } = body;
    const SITE_PASSWORD = getSitePassword();
    const SECRET = getSecret();

    console.log('📝 POST /api/auth/login');
    console.log('   Password received:', !!password);
    console.log('   Password value length:', password ? password.length : 'undefined');
    console.log('   Expected password length:', SITE_PASSWORD ? SITE_PASSWORD.length : 'undefined');
    console.log('   Actual password:', password);
    console.log('   Expected password:', SITE_PASSWORD);
    console.log('   Match result:', password === SITE_PASSWORD);
    console.log('   SECRET being used:', SECRET.substring(0, 10) + '...');

    if (password === SITE_PASSWORD) {
      const token = jwt.sign({ auth: true }, SECRET, { expiresIn: '7d' });
      console.log('✅ Login successful! Token created:', token.substring(0, 20) + '...');
      console.log('🍪 Cookie set with options:', getCookieOpts());

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Set-Cookie': `duck_session=${token}; ${getCookieOpts()}`,
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('❌ Login FAILED - Password mismatch!');
    console.log('   Expected: "' + SITE_PASSWORD + '"');
    console.log('   Got: "' + password + '"');
    console.log('   Bytes expected:', Buffer.from(SITE_PASSWORD).toString('hex'));
    console.log('   Bytes got:', Buffer.from(password || '').toString('hex'));

    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

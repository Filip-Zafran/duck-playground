import { defineMiddleware } from 'astro:middleware';
import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = ['/', '/login', '/login/', '/health', '/sw.js', '/poll-vote', '/poll-vote/'];
const PUBLIC_PREFIXES = ['/api/', '/_astro', '/images', '/style.css'];
const PUBLIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.pdf', '.woff', '.woff2'];

const getSecret = () => process.env.JWT_SECRET || 'duck-site-secret';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Normalize path for comparison (remove trailing slash)
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  // Allow public paths
  if (PUBLIC_PATHS.includes(path) || PUBLIC_PATHS.includes(normalizedPath)) return next();
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return next();
  if (PUBLIC_EXTENSIONS.some(e => path.endsWith(e))) return next();

  try {
    const cookieHeader = context.request.headers.get('cookie');
    const token = cookieHeader
      ?.split(';')
      .find(c => c.trim().startsWith('duck_session='))
      ?.split('=')[1];

    if (!token) {
      console.error('❌ No duck_session cookie found for path:', path);
      return context.redirect('/login');
    }

    jwt.verify(token, getSecret());
    return next();
  } catch (err) {
    console.error('❌ JWT verification failed for path:', path);
    console.error('   Error:', (err as Error).message);
    console.error('   JWT_SECRET env set:', !!process.env.JWT_SECRET);
    return context.redirect('/login');
  }
});

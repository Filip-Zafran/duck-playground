import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = ['/', '/login', '/login/', '/health', '/sw.js', '/poll-vote', '/poll-vote/'];
const PUBLIC_PREFIXES = ['/api/', '/_astro', '/images', '/style.css'];
const PUBLIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.pdf', '.woff', '.woff2'];

export const siteAuth = (req, res, next) => {
  const path = req.path;

  // Normalize path for comparison (remove trailing slash)
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  if (PUBLIC_PATHS.includes(path) || PUBLIC_PATHS.includes(normalizedPath)) return next();
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return next();
  if (PUBLIC_EXTENSIONS.some(e => path.endsWith(e))) return next();

  try {
    const token = req.cookies.duck_session;
    if (!token) {
      console.error('❌ No duck_session cookie found for path:', path);
      return res.redirect('/login');
    }
    jwt.verify(token, process.env.JWT_SECRET || 'duck-site-secret');
    next();
  } catch (err) {
    console.error('❌ JWT verification failed for path:', path);
    console.error('   Error:', err.message);
    console.error('   JWT_SECRET env set:', !!process.env.JWT_SECRET);
    res.redirect('/login');
  }
};

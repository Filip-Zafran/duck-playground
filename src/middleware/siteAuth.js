import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = ['/login', '/health', '/sw.js'];
const PUBLIC_PREFIXES = ['/api/auth', '/_astro', '/images', '/style.css'];
const PUBLIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.ico', '.pdf', '.woff', '.woff2'];

export const siteAuth = (req, res, next) => {
  const path = req.path;

  if (PUBLIC_PATHS.includes(path)) return next();
  if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) return next();
  if (PUBLIC_EXTENSIONS.some(e => path.endsWith(e))) return next();

  const cookies = Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map(c => {
        const [key, value] = c.trim().split('=');
        return [key, value];
      })
      .filter(([key]) => key)
  );

  try {
    jwt.verify(cookies.duck_session, process.env.JWT_SECRET || 'duck-site-secret');
    next();
  } catch {
    res.redirect('/login');
  }
};

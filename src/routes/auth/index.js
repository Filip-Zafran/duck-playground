import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const getSitePassword = () => process.env.SITE_PASSWORD || 'duck';
const getSecret = () => process.env.JWT_SECRET || 'duck-site-secret';
const getCookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production'
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  const SITE_PASSWORD = getSitePassword();
  const SECRET = getSecret();
  const COOKIE_OPTS = getCookieOpts();

  console.log('📝 POST /api/auth/login - password received:', !!password);
  console.log('   password matches:', password === SITE_PASSWORD);
  console.log('   SECRET being used:', SECRET);

  if (password === SITE_PASSWORD) {
    const token = jwt.sign({ auth: true }, SECRET, { expiresIn: '7d' });
    console.log('✅ Token created:', token.substring(0, 20) + '...');
    res.cookie('duck_session', token, COOKIE_OPTS);
    console.log('🍪 Cookie set with options:', COOKIE_OPTS);
    return res.redirect('/');
  }

  console.log('❌ Password mismatch! Expected "' + SITE_PASSWORD + '", got "' + password + '"');
  res.redirect('/login?error=1');
});

router.post('/logout', (req, res) => {
  console.log('🚪 POST /api/auth/logout');
  res.clearCookie('duck_session', getCookieOpts());
  res.redirect('/login');
});

export default router;

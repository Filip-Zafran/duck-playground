import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const getSitePassword = () => process.env.ADMIN_PASSWORD || process.env.SITE_PASSWORD || 'duck';
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
    res.cookie('duck_session', token, COOKIE_OPTS);
    console.log('🍪 Cookie set with options:', COOKIE_OPTS);
    return res.redirect('/home');
  }

  console.log('❌ Login FAILED - Password mismatch!');
  console.log('   Expected: "' + SITE_PASSWORD + '"');
  console.log('   Got: "' + password + '"');
  console.log('   Bytes expected:', Buffer.from(SITE_PASSWORD).toString('hex'));
  console.log('   Bytes got:', Buffer.from(password || '').toString('hex'));

  // Redirect with error
  res.redirect('/login?error=1');
});

router.get('/status', (req, res) => {
  const token = req.cookies.duck_session;
  res.json({ authenticated: !!token });
});

router.post('/logout', (req, res) => {
  console.log('🚪 POST /api/auth/logout');
  res.clearCookie('duck_session', getCookieOpts());
  res.json({ success: true });
});

export default router;

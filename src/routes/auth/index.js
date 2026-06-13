import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'duck';
const SECRET = process.env.JWT_SECRET || 'duck-site-secret';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production'
};

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === SITE_PASSWORD) {
    const token = jwt.sign({ auth: true }, SECRET, { expiresIn: '7d' });
    res.cookie('duck_session', token, COOKIE_OPTS);
    return res.redirect('/');
  }

  res.redirect('/login?error=1');
});

router.post('/logout', (req, res) => {
  res.clearCookie('duck_session');
  res.redirect('/login');
});

export default router;

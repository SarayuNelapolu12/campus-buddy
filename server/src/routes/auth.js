import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { makeToken, publicUser } from '../utils/token.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Please try again later.' } });

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const isAdmin = Boolean(process.env.ADMIN_EMAIL) && email === process.env.ADMIN_EMAIL.trim().toLowerCase();
    const user = await User.create({ name, email, passwordHash, role: isAdmin ? 'admin' : 'student' });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
    const shouldBeAdmin = Boolean(process.env.ADMIN_EMAIL) && email === process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (shouldBeAdmin && user.role !== 'admin') { user.role = 'admin'; await user.save(); }
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;

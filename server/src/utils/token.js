import jwt from 'jsonwebtoken';
export function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
export function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

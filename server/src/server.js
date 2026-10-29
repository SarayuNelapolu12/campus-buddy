import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import claimRoutes from './routes/claims.js';
import adminRoutes from './routes/admin.js';

const app = express();
const port = process.env.PORT || 5000;
app.disable('x-powered-by');
if (process.env.RENDER) app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Campus Buddy API' }));
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
if (process.env.NODE_ENV === 'production') {
  const clientDist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'MulterError') return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : err.message });
  if (err.message?.includes('Only JPG')) return res.status(400).json({ message: err.message });
  if (err.message?.includes('Image uploads are not configured')) return res.status(503).json({ message: err.message });
  if (err.name === 'ValidationError') return res.status(400).json({ message: 'Some item details are invalid.' });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID.' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message || 'Server error.' });
});

connectDB().then(() => app.listen(port, () => console.log(`Campus Buddy API running on port ${port}`))).catch(err => {
  console.error('Could not start server:', err.message);
  process.exit(1);
});

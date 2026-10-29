import { Router } from 'express';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.use(protect, adminOnly);
router.get('/items', async (_req, res, next) => {
  try { const items = await Item.find().populate('owner', 'name email').sort({ createdAt: -1 }).limit(200); res.json({ items }); }
  catch (err) { next(err); }
});
router.patch('/items/:id/moderate', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden', 'returned'].includes(status)) return res.status(400).json({ message: 'Invalid moderation status.' });
    const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('owner', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ item });
  } catch (err) { next(err); }
});
router.get('/stats', async (_req, res, next) => {
  try {
    const [users, totalItems, lostItems, foundItems, returnedItems, pendingClaims] = await Promise.all([
      User.countDocuments(), Item.countDocuments(), Item.countDocuments({ type: 'lost' }), Item.countDocuments({ type: 'found' }), Item.countDocuments({ status: 'returned' }), Claim.countDocuments({ status: 'pending' })
    ]);
    res.json({ stats: { users, totalItems, lostItems, foundItems, returnedItems, pendingClaims } });
  } catch (err) { next(err); }
});
export default router;

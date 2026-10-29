import { Router } from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import { protect } from '../middleware/auth.js';
const router = Router();

router.get('/mine', protect, async (req, res, next) => {
  try {
    const myClaims = await Claim.find({ claimant: req.user._id }).populate({ path: 'item', select: 'title type imageUrl status owner' }).sort({ createdAt: -1 });
    const itemIds = await Item.find({ owner: req.user._id }).distinct('_id');
    const receivedClaims = await Claim.find({ item: { $in: itemIds } }).populate('claimant', 'name email').populate('item', 'title type imageUrl status').sort({ createdAt: -1 });
    res.json({ myClaims, receivedClaims });
  } catch (err) { next(err); }
});

router.patch('/:claimId', protect, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.claimId).populate('item');
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });
    if (String(claim.item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the listing owner can review this claim.' });
    const status = req.body.status;
    if (!['approved', 'declined'].includes(status)) return res.status(400).json({ message: 'Status must be approved or declined.' });
    if (claim.status !== 'pending') return res.status(400).json({ message: 'This claim has already been reviewed.' });
    claim.status = status; await claim.save();
    if (status === 'approved') { claim.item.status = 'claim_pending'; await claim.item.save(); }
    res.json({ claim });
  } catch (err) { next(err); }
});
export default router;

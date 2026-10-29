import { Router } from 'express';
import multer from 'multer';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import { protect } from '../middleware/auth.js';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, or WebP images are allowed.'));
} });
const categories = ['ID Card', 'Electronics', 'Books & Notes', 'Bags', 'Bottles', 'Keys', 'Clothing', 'Accessories', 'Other'];
const dateIsValid = (d) => !Number.isNaN(new Date(d).getTime());

async function uploadImage(file) {
  if (!file) return { imageUrl: '', imagePublicId: '' };
  if (!cloudinaryConfigured) throw new Error('Image uploads are not configured. Add Cloudinary credentials to server/.env.');
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'campus-buddy', resource_type: 'image' }, (err, uploaded) => err ? reject(err) : resolve(uploaded));
    stream.end(file.buffer);
  });
  return { imageUrl: result.secure_url, imagePublicId: result.public_id };
}

router.get('/', async (req, res, next) => {
  try {
    const { q = '', type, category, status = 'active' } = req.query;
    const filter = { status: status === 'all' ? { $in: ['active', 'claim_pending', 'returned'] } : status };
    if (type && ['lost', 'found'].includes(type)) filter.type = type;
    if (category && categories.includes(category)) filter.category = category;
    if (String(q).trim()) {
      const escaped = String(q).trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }, { location: { $regex: escaped, $options: 'i' } }];
    }
    const items = await Item.find(filter).populate('owner', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name');
    if (!item || item.status === 'hidden') return res.status(404).json({ message: 'Item not found.' });
    res.json({ item });
  } catch (err) { next(err); }
});

router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category, type, location, date } = req.body;
    if (!title?.trim() || !description?.trim() || !location?.trim() || !categories.includes(category) || !['lost', 'found'].includes(type) || !dateIsValid(date)) return res.status(400).json({ message: 'Please complete all required fields with valid values.' });
    const image = await uploadImage(req.file);
    const item = await Item.create({ title: title.trim(), description: description.trim(), category, type, location: location.trim(), date: new Date(date), ...image, owner: req.user._id });
    await item.populate('owner', 'name');
    res.status(201).json({ item });
  } catch (err) { next(err); }
});

router.put('/:id', protect, upload.single('image'), async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only edit your own listing.' });
    const { title, description, category, type, location, date } = req.body;
    if (!title?.trim() || !description?.trim() || !location?.trim() || !categories.includes(category) || !['lost', 'found'].includes(type) || !dateIsValid(date)) return res.status(400).json({ message: 'Please complete all required fields with valid values.' });
    Object.assign(item, { title: title.trim(), description: description.trim(), category, type, location: location.trim(), date: new Date(date) });
    if (req.file) {
      const image = await uploadImage(req.file);
      item.imageUrl = image.imageUrl; item.imagePublicId = image.imagePublicId;
    }
    await item.save(); await item.populate('owner', 'name');
    res.json({ item });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only delete your own listing.' });
    await Claim.deleteMany({ item: item._id });
    if (item.imagePublicId && cloudinaryConfigured) await cloudinary.uploader.destroy(item.imagePublicId).catch(() => {});
    await item.deleteOne(); res.json({ message: 'Listing deleted.' });
  } catch (err) { next(err); }
});

router.patch('/:id/returned', protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    if (String(item.owner) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the listing owner or an admin can update this item.' });
    item.status = 'returned'; await item.save(); res.json({ item });
  } catch (err) { next(err); }
});

router.post('/:id/claims', protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.status === 'hidden' || item.status === 'returned') return res.status(404).json({ message: 'This item is not available for claims.' });
    if (String(item.owner) === String(req.user._id)) return res.status(400).json({ message: 'You cannot claim your own listing.' });
    const message = String(req.body.message || '').trim();
    if (message.length < 5 || message.length > 800) return res.status(400).json({ message: 'Claim message must be 5–800 characters.' });
    const claim = await Claim.create({ item: item._id, claimant: req.user._id, message });
    item.status = 'claim_pending'; await item.save();
    await claim.populate([{ path: 'item', select: 'title type imageUrl owner' }, { path: 'claimant', select: 'name email' }]);
    res.status(201).json({ claim });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You have already submitted a claim for this item.' });
    next(err);
  }
});

export default router;

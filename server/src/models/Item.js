import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1500 },
  category: { type: String, required: true, enum: ['ID Card', 'Electronics', 'Books & Notes', 'Bags', 'Bottles', 'Keys', 'Clothing', 'Accessories', 'Other'] },
  type: { type: String, required: true, enum: ['lost', 'found'], index: true },
  location: { type: String, required: true, trim: true, maxlength: 150 },
  date: { type: Date, required: true },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  status: { type: String, enum: ['active', 'claim_pending', 'returned', 'hidden'], default: 'active', index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
export default mongoose.model('Item', itemSchema);

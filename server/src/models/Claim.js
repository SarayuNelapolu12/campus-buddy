import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 800 },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' }
}, { timestamps: true });
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });
export default mongoose.model('Claim', claimSchema);

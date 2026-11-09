import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  resumeUrl: { type: String, default: '' },
  coverNote: { type: String, default: '' },
  status: { type: String, enum: ['New', 'Reviewing', 'Shortlisted', 'Rejected'], default: 'New' }
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);

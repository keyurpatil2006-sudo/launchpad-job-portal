import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  domain: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  applicationLink: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Full-time', 'Part-time'], default: 'Internship' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Opportunity', opportunitySchema);

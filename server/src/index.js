import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Opportunity from './models/Opportunity.js';
import Application from './models/Application.js';
import User from './models/User.js';
import initialOpportunities from './data/initialOpportunities.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../uploads');
const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /pdf|msword|officedocument/.test(file.mimetype)) });
app.use('/uploads', express.static(uploadDir));
const jwtSecret = process.env.JWT_SECRET || 'launchpad-development-secret';
const signToken = user => jwt.sign({ id: user._id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' });
const requireAuth = (req, res, next) => { try { const token = (req.headers.authorization || '').replace('Bearer ', ''); req.user = jwt.verify(token, jwtSecret); next(); } catch { res.status(401).json({ message: 'Authentication required' }); } };
const requireAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }) : null;

app.post('/api/auth/register', async (req, res) => {
  try { const name = String(req.body.name || '').trim(); const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || ''); if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a 6+ character password are required' }); const exists = await User.findOne({ email }); if (exists) return res.status(409).json({ message: 'An account already exists for this email' }); const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) }); res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } }); } catch (error) { res.status(400).json({ message: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try { const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || ''); const configuredAdminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(); const configuredAdminPassword = String(process.env.ADMIN_PASSWORD || ''); let user = await User.findOne({ email }); const isConfiguredAdmin = email === configuredAdminEmail && password === configuredAdminPassword && configuredAdminEmail && configuredAdminPassword; if (isConfiguredAdmin) { const passwordHash = await bcrypt.hash(password, 12); if (!user) user = await User.create({ name: 'LaunchPad Admin', email, passwordHash, role: 'admin' }); else if (user.role !== 'admin' || !(await bcrypt.compare(password, user.passwordHash))) { user.role = 'admin'; user.passwordHash = passwordHash; await user.save(); } } if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' }); res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } }); } catch (error) { res.status(400).json({ message: error.message }); }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'launchpad-api' }));

app.get('/api/opportunities', async (req, res) => {
  try {
    const { search = '', domain = 'All domains', type = 'All types' } = req.query;
    const filter = {};
    if (domain !== 'All domains') filter.domain = domain;
    if (type !== 'All types') filter.type = type;
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { company: new RegExp(search, 'i') }, { domain: new RegExp(search, 'i') }];
    res.json(await Opportunity.find(filter).sort({ featured: -1, createdAt: -1 }));
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/opportunities/:id', async (req, res) => {
  try { const item = await Opportunity.findById(req.params.id); if (!item) return res.status(404).json({ message: 'Opportunity not found' }); res.json(item); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

app.post('/api/opportunities', requireAuth, requireAdmin, async (req, res) => {
  try { res.status(201).json(await Opportunity.create(req.body)); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

app.put('/api/opportunities/:id', requireAuth, requireAdmin, async (req, res) => {
  try { res.json(await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/opportunities/:id', requireAuth, requireAdmin, async (req, res) => {
  try { await Opportunity.findByIdAndDelete(req.params.id); await Application.deleteMany({ opportunity: req.params.id }); res.json({ ok: true }); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try { const data = { ...req.body, resumeUrl: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : req.body.resumeUrl || '' }; const application = await Application.create(data); if (mailer && process.env.NOTIFICATION_EMAIL) await mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: process.env.NOTIFICATION_EMAIL, subject: `New application for ${application.opportunity}`, text: `${application.name} (${application.email}) submitted a new application.` }); res.status(201).json(application); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

app.get('/api/applications', requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await Application.find().populate('opportunity', 'title company').sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/applications/:id', async (req, res) => {
  try { res.json(await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('opportunity', 'title company')); }
  catch (error) { res.status(400).json({ message: error.message }); }
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/launchpad')
  .then(async () => {
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      await Opportunity.insertMany(initialOpportunities);
      console.log(`Seeded ${initialOpportunities.length} initial opportunities`);
    }
    app.listen(port, () => console.log(`Launchpad API running on http://localhost:${port}`));
  })
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });

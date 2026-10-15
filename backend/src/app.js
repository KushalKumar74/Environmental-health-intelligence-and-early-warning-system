const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

// Route files
const aqiRoutes = require('./routes/aqiRoutes');
const recordRoutes = require('./routes/recordRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const alertRoutes = require('./routes/alertRoutes');
const eventRoutes = require('./routes/eventRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

const app = express();

// ── Security ──────────────────────────────────────────────────────────
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
  skip: () => process.env.NODE_ENV === 'test',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' },
  skip: () => process.env.NODE_ENV === 'test',
});

// Allow requests from the Vite dev server (port 8080) and same-origin
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));

// ── Body parsing ───────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to /api/ routes
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Mount routers ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);

// ── Custom error handler ───────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

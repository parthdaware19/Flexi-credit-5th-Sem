const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const config = require('./config');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static files for demo test form
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    groqConfigured: !!config.GROQ_API_KEY,
    grokConfigured: !!config.GROK_API_KEY,
    tavilyConfigured: !!config.TAVILY_API_KEY
  });
});

// Serve compiled React client in production
const possibleDistPaths = [
  path.join(__dirname, '..', '..', 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(__dirname, '..', 'dist')
];

let activeDistPath = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    activeDistPath = p;
    break;
  }
}

if (activeDistPath) {
  console.log(`[Static] Serving React client from: ${activeDistPath}`);
  app.use(express.static(activeDistPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = path.join(activeDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
} else {
  console.warn('[Static] No compiled client/dist found. API mode only.');
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <body style="font-family: sans-serif; background: #0b0f19; color: #fff; padding: 40px; text-align: center;">
          <h2>FlexiCredit API Server is Running</h2>
          <p>Please compile the frontend or run via Vite dev server.</p>
          <a href="/api/health" style="color: #3b82f6;">Check Health</a> | 
          <a href="/demo-form.html" style="color: #3b82f6;">Test Demo Form</a>
        </body>
      </html>
    `);
  });
}

// Seed default demo user if no users exist
async function seedDefaultUser() {
  const existing = db.findUserByEmail('demo@flexicredit.com');
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    db.createUser({
      id: 'usr_demo_founder',
      email: 'demo@flexicredit.com',
      name: 'Alex Morgan',
      passwordHash,
      createdAt: new Date().toISOString()
    });
    console.log('[Database] Seeded demo user: demo@flexicredit.com / password123');
  }
}

seedDefaultUser();

// Start Server - explicitly listen on 0.0.0.0 for standalone / Docker / Render, export for Vercel
const PORT = process.env.PORT || config.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 FlexiCredit Automated Form Engine Server`);
    console.log(`📡 Listening on 0.0.0.0:${PORT}`);
    console.log(`📄 Built-in Demo Form: http://localhost:${PORT}/demo-form.html`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

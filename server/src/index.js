const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for demo test form
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve compiled React client in production
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    groqConfigured: !!config.GROQ_API_KEY,
    grokConfigured: !!config.GROK_API_KEY,
    tavilyConfigured: !!config.TAVILY_API_KEY
  });
});

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

// Start Server
app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 FlexiCredit Automated Form Engine Server`);
  console.log(`📡 Running on http://localhost:${config.PORT}`);
  console.log(`📄 Built-in Demo Form: http://localhost:${config.PORT}/demo-form.html`);
  console.log(`=======================================================`);
});

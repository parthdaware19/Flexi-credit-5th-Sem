const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultData = {
  users: [],
  profiles: {},
  formSessions: [],
  settings: {}
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file:', err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db file:', err);
  }
}

// User methods
function findUserByEmail(email) {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

function createUser(user) {
  const db = readDb();
  db.users.push(user);
  // Initialize default profile for user
  db.profiles[user.id] = {
    fullName: user.name || 'Alex Morgan',
    email: user.email,
    phone: '+1 (555) 234-8901',
    address: '450 Lexington Ave, Suite 1200',
    city: 'New York',
    state: 'NY',
    zipCode: '10017',
    country: 'United States',
    companyName: 'Apex Innovations LLC',
    companyWebsite: 'https://apexinnovations.example.com',
    industry: 'Financial Technology',
    jobTitle: 'Founder & Managing Director',
    taxIdEin: 'XX-XXXXXXX',
    annualRevenue: '$1,250,000',
    businessStructure: 'Limited Liability Company (LLC)',
    yearEstablished: '2021',
    bio: 'Founder with 12+ years in financial operations and enterprise software. Leading lean teams delivering high-velocity fintech solutions.',
    humanizerStyle: 'direct_natural', // options: 'direct_natural', 'conversational', 'concise_executive', 'formal'
    antiAiFilter: true, // strict avoidance of cliché buzzwords
    customNotes: 'Keep answers straightforward, professional, and authentic. No fluff or flowery marketing jargon.'
  };
  writeDb(db);
  return user;
}

// Profile methods
function getProfile(userId) {
  const db = readDb();
  return db.profiles[userId] || null;
}

function updateProfile(userId, newProfile) {
  const db = readDb();
  db.profiles[userId] = {
    ...(db.profiles[userId] || {}),
    ...newProfile,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.profiles[userId];
}

// Settings methods
function getSettings(userId) {
  const db = readDb();
  return db.settings[userId] || {
    grokApiKey: '',
    tavilyApiKey: '',
    defaultModel: 'grok-2-latest',
    autoSearchMissing: true,
    humanCadenceDelay: true
  };
}

function updateSettings(userId, newSettings) {
  const db = readDb();
  db.settings[userId] = {
    ...(db.settings[userId] || {}),
    ...newSettings
  };
  writeDb(db);
  return db.settings[userId];
}

// Form session history methods
function addFormSession(userId, session) {
  const db = readDb();
  const newSession = {
    id: 'fs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId,
    createdAt: new Date().toISOString(),
    ...session
  };
  db.formSessions.unshift(newSession);
  // Keep up to 100 sessions
  if (db.formSessions.length > 100) {
    db.formSessions = db.formSessions.slice(0, 100);
  }
  writeDb(db);
  return newSession;
}

function getFormSessions(userId) {
  const db = readDb();
  return db.formSessions.filter(s => s.userId === userId);
}

function getFormSessionById(id) {
  const db = readDb();
  return db.formSessions.find(s => s.id === id);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  addFormSession,
  getFormSessions,
  getFormSessionById
};

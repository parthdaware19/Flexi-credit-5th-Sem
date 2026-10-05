# FlexiCredit — Autonomous Humanized Form Engine

An enterprise-grade, automated form-filling system powered by **Groq LPU** (with fallback support for xAI Grok) and **Tavily Search API**. Designed specifically to evade robotic AI detection patterns through human typing cadence, natural stylistic variation, and anti-cliché auditing, protected by **JWT authentication**.

---

## ⚡ Key Highlights

- **Anti-AI Evasion & Natural Tone**:
  - Automatic filtering against robotic buzzwords (`delve`, `testament`, `crucial`, `pivotal`, `leverage`, `furthermore`, etc.).
  - Realistic human cadence with customizable persona styles: *Direct & Natural*, *Concise Executive*, *Conversational Founder*, and *Formal Legal*.
- **Tavily Real-Time Web Grounding**:
  - Automatically searches the web to verify real company registries, EIN formats, NAICS codes, headquarters addresses, and executive details.
- **Playwright Autonomous Browser Automation**:
  - Inspects live web page DOMs to extract form fields dynamically.
  - Realistic human keystroke delay (randomized 20–45ms pauses) to avoid instantaneous bot detection.
  - Real-time before-and-after visual screenshot verification.
- **Document & PDF Ingestion Engine**:
  - Upload pitch decks, executive briefs, Form 1120/tax returns, or resumes in PDF, TXT, CSV, or Markdown.
  - Groq LPU extracts all corporate entity parameters, executive officers, contact details, and financial metrics in seconds.
  - 1-Click merge into the Master Knowledge Vault with review capabilities and built-in quick test sample generators.
- **JWT-Protected Authentication**:
  - Stateless JSON Web Token authentication with bcrypt password hashing.
  - Persistent Master Profile Knowledge Vault and execution history.
- **Built-in Interactive Form Inspector**:
  - Paste arbitrary HTML forms or schemas, parse inputs, generate answers, and export to CSV or JSON with 1-click.
- **Pre-configured Local Demo Form**:
  - Includes a built-in commercial credit application (`http://localhost:5000/demo-form.html`) for instant testing.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 2. Environment Setup
The server `.env` file (`server/.env`) is already pre-configured with your keys:
```env
PORT=5000
JWT_SECRET=flexi_credit_super_secret_jwt_key_2026_xai_tavily
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-dev-...
```

### 3. Running the System

Start the backend server:
```bash
cd server
node src/index.js
```
*Backend runs on `http://localhost:5000`*

Start the client dashboard:
```bash
cd client
npm run dev
```
*Frontend opens at `http://localhost:5173`*

---

## 🔑 Demo Access
- **Email**: `demo@flexicredit.com`
- **Password**: `password123`
*(Or click the **Demo 1-Click Login** button on the sign-in screen)*

---

## 🛠️ System Architecture

```
flexi credit/
├── server/
│   ├── src/
│   │   ├── config/index.js           # Groq, Tavily, JWT, Port configs
│   │   ├── middleware/auth.js        # JWT verification middleware
│   │   ├── services/
│   │   │   ├── grokService.js        # Groq LPU + anti-AI heuristic pipeline
│   │   │   ├── tavilyService.js      # Tavily search and live entity research
│   │   │   ├── browserService.js     # Playwright automation & human keystrokes
│   │   │   └── formParserService.js  # Cheerio & DOM input extractor
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Register, Login, Me (JWT)
│   │   │   ├── formRoutes.js         # Inspect, Autofill, Browser-fill, Sessions
│   │   │   └── profileRoutes.js      # Master vault & user settings
│   │   ├── db.js                     # Persistent JSON database
│   │   └── index.js                  # Express API server
│   └── public/
│       └── demo-form.html            # Realistic commercial credit test form
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx              # JWT login & registration
    │   │   ├── BrowserFillView.jsx   # Live Playwright URL form automation
    │   │   ├── InteractiveInspectorView.jsx # HTML schema parser & anti-AI audit
    │   │   ├── KnowledgeVaultView.jsx# Master company & applicant profile
    │   │   ├── SettingsView.jsx      # API keys & model tuning
    │   │   └── HistoryView.jsx       # Run audit logs & screenshots
    │   ├── api.js                    # Authenticated fetch wrapper with JWT
    │   ├── App.jsx                   # Main layout and tab controller
    │   └── index.css                 # Bespoke high-density SaaS design system
    └── index.html
```

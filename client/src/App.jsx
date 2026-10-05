import React, { useState, useEffect } from 'react';
import { authApi, tokenStorage } from './api';
import Auth from './components/Auth';
import BrowserFillView from './components/BrowserFillView';
import InteractiveInspectorView from './components/InteractiveInspectorView';
import KnowledgeVaultView from './components/KnowledgeVaultView';
import SettingsView from './components/SettingsView';
import HistoryView from './components/HistoryView';
import {
  Zap,
  Globe,
  Code2,
  Database,
  Settings,
  History,
  LogOut,
  ShieldCheck,
  Cpu,
  User,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('browser');
  const [loading, setLoading] = useState(true);

  // Check JWT session on startup
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((data) => {
        setCurrentUser(data.user);
        setProfile(data.profile);
      })
      .catch((err) => {
        console.warn('JWT session invalid or expired:', err.message);
        tokenStorage.clear();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    authApi.getMe().then((data) => {
      setProfile(data.profile);
    });
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setCurrentUser(null);
    setProfile(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07090e', color: '#94a3b8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="brand-logo-icon" style={{ width: '48px', height: '48px' }}>
            <Zap size={28} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Validating JWT Session...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="top-nav">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Zap size={20} />
          </div>
          <div className="brand-name">
            <span>FlexiCredit</span>
            <span className="brand-tag">Autonomous Form Engine</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', color: '#34d399' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span>Groq LPU + Tavily Online</span>
          </div>
        </div>

        {/* Center Nav Switcher */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveTab('browser')}
          >
            <Globe size={15} />
            <span>Live Automation</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspector')}
          >
            <Code2 size={15} />
            <span>Schema Inspector</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
            onClick={() => setActiveTab('vault')}
          >
            <Database size={15} />
            <span>Knowledge Vault</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={15} />
            <span>Run History</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            <span>Config</span>
          </button>
        </nav>

        {/* User Status and JWT Signout */}
        <div className="user-profile-menu">
          <div className="user-badge">
            <div className="user-avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
                {currentUser.name || currentUser.email}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={10} color="#10b981" /> JWT Active
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            title="Log Out (Clears JWT)"
            style={{ padding: '8px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main View Body */}
      <main className="main-view-wrapper">
        {activeTab === 'browser' && (
          <BrowserFillView
            profile={profile || {}}
            userSettings={userSettings || {}}
          />
        )}

        {activeTab === 'inspector' && (
          <InteractiveInspectorView
            profile={profile || {}}
          />
        )}

        {activeTab === 'vault' && (
          <KnowledgeVaultView
            profile={profile || {}}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            userSettings={userSettings || {}}
            onSettingsUpdated={(updated) => setUserSettings(updated)}
          />
        )}
      </main>
    </div>
  );
}

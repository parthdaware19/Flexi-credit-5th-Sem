import React, { useState, useEffect } from 'react';
import { profileApi } from '../api';
import { Settings, Key, Shield, Zap, CheckCircle, ExternalLink, Sliders } from 'lucide-react';

export default function SettingsView({ userSettings, onSettingsUpdated }) {
  const [settings, setSettings] = useState(userSettings || {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
    }
  }, [userSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await profileApi.updateSettings(settings);
      onSettingsUpdated(res.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(`Settings save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="anti-ai-shield">
        <Settings className="shield-icon" size={24} />
        <div className="shield-content">
          <div className="shield-title">
            <span>Engine Configuration & API Keys</span>
          </div>
          <p className="shield-desc">
            Provide your xAI Grok API key and Tavily Search API key. Keys are securely stored and linked to your JWT session.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* API Keys Configuration Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Key size={18} />
              </div>
              <div>
                <h4>API Credentials</h4>
                <p style={{ fontSize: '12px' }}>Grok xAI reasoning & Tavily web research connectivity</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <div className="input-label">
                <span>xAI Grok API Key</span>
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Get Grok Key <ExternalLink size={11} />
                </a>
              </div>
              <input
                type="password"
                name="grokApiKey"
                className="form-input"
                placeholder="xai-..."
                value={settings.grokApiKey || ''}
                onChange={handleChange}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Note: If left empty, the engine uses the server's configured environment key or built-in contextual fallback.
              </span>
            </div>

            <div className="input-group">
              <div className="input-label">
                <span>Tavily Search API Key</span>
                <a
                  href="https://app.tavily.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Get Tavily Key <ExternalLink size={11} />
                </a>
              </div>
              <input
                type="password"
                name="tavilyApiKey"
                className="form-input"
                placeholder="tvly-..."
                value={settings.tavilyApiKey || ''}
                onChange={handleChange}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Powers real-time entity grounding, corporate registries, and missing form data lookups.
              </span>
            </div>
          </div>
        </div>

        {/* Model & Anti-Detection Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Sliders size={18} />
              </div>
              <div>
                <h4>Model & Anti-AI Cadence Calibration</h4>
                <p style={{ fontSize: '12px' }}>Fine-tune model intelligence and robotic detection evasion</p>
              </div>
            </div>
          </div>

          <div className="split-grid-2">
            <div className="input-group">
              <label className="input-label">Default Grok Model</label>
              <select
                name="defaultModel"
                className="form-input"
                value={settings.defaultModel || 'grok-2-latest'}
                onChange={handleChange}
              >
                <option value="grok-2-latest">grok-2-latest (Recommended for high fidelity)</option>
                <option value="grok-beta">grok-beta</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Tavily Search Depth</label>
              <select
                name="tavilySearchDepth"
                className="form-input"
                value={settings.tavilySearchDepth || 'basic'}
                onChange={handleChange}
              >
                <option value="basic">Basic (Fast factual verification)</option>
                <option value="advanced">Advanced (Deep document and public registry scan)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="autoSearchMissing"
                checked={settings.autoSearchMissing !== false}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Automatically trigger Tavily research for unknown or unprovided company details</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="humanCadenceDelay"
                checked={settings.humanCadenceDelay !== false}
                onChange={handleChange}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Enforce randomized human keystroke pacing (20-45ms) on Playwright browser execution</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px' }}>
              <CheckCircle size={16} />
              <span>Settings saved</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '12px 28px' }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}

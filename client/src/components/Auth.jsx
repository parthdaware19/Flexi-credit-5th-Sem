import React, { useState } from 'react';
import { authApi, tokenStorage } from '../api';
import { Lock, Mail, User, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function Auth({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await authApi.register(email, password, name);
      } else {
        data = await authApi.login(email, password);
      }

      if (data.token) {
        tokenStorage.set(data.token);
        onAuthenticated(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login('demo@flexicredit.com', 'password123');
      if (data.token) {
        tokenStorage.set(data.token);
        onAuthenticated(data.user);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(37,99,235,0.15)', borderRadius: '12px', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Zap size={28} />
          </div>
          <h2>FlexiCredit Engine</h2>
          <p>Autonomous Humanized Form Automation via Grok & Tavily</p>
        </div>

        {/* Anti-AI Security Badge */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <div style={{ fontSize: '12px', color: '#a7f3d0' }}>
            <strong style={{ color: '#34d399' }}>JWT Session Protected</strong> • Anti-AI heuristic engine ready
          </div>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={!isRegister ? 'active' : ''}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={isRegister ? 'active' : ''}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required={isRegister}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Register & Generate JWT' : 'Secure Login')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 12px', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Instant Evaluation
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '11px', display: 'flex', gap: '8px', justifyContent: 'center' }}
          disabled={loading}
        >
          <Sparkles size={16} color="#60a5fa" />
          <span>Demo 1-Click Login</span>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>(demo@flexicredit.com)</span>
        </button>
      </div>
    </div>
  );
}

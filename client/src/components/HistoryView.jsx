import React, { useState, useEffect } from 'react';
import { formApi } from '../api';
import { History, CheckCircle, ExternalLink, Calendar, Layers, RefreshCw } from 'lucide-react';

export default function HistoryView() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await formApi.getSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon">
              <History size={18} />
            </div>
            <div>
              <h4>Autofill Execution History</h4>
              <p style={{ fontSize: '12px' }}>Audit trail of all browser automation runs and visual confirmations</p>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={fetchSessions} disabled={loading} style={{ fontSize: '12px' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <History size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No browser automation sessions recorded yet.</p>
            <p style={{ fontSize: '12px' }}>Execute an automated form run from the "Live Browser Automation" tab to see records here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle size={20} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '14px', wordBreak: 'break-all' }}>
                      {sess.url}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(sess.createdAt).toLocaleString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={12} />
                        {sess.fieldCount || 0} fields filled
                      </span>
                      {sess.submitted && (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>• Auto-submitted</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {sess.filledScreenshot && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedSession(sess)}
                      style={{ fontSize: '12px' }}
                    >
                      View Screenshot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {selectedSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: '14px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '15px' }}>Session Verification Screenshot</h4>
                <p style={{ fontSize: '12px' }}>{selectedSession.url}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedSession(null)}>Close</button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <img
                src={selectedSession.filledScreenshot}
                alt="Filled Form Session"
                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

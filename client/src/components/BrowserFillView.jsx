import React, { useState } from 'react';
import { formApi } from '../api';
import {
  Globe,
  Search,
  Bot,
  Play,
  CheckCircle,
  AlertCircle,
  Eye,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function BrowserFillView({ profile, userSettings }) {
  const [url, setUrl] = useState('http://localhost:5000/demo-form.html');
  const [inspecting, setInspecting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  const [formMeta, setFormMeta] = useState(null);
  const [extractedFields, setExtractedFields] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [grokNotes, setGrokNotes] = useState('');
  const [tavilyContext, setTavilyContext] = useState('');
  
  const [initialScreenshot, setInitialScreenshot] = useState(null);
  const [filledScreenshot, setFilledScreenshot] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Automation settings
  const [useHumanDelay, setUseHumanDelay] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [useTavily, setUseTavily] = useState(true);
  const [styleMode, setStyleMode] = useState('direct_natural');
  const [statusMessage, setStatusMessage] = useState('');

  const appendLog = (msg) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Step 1: Inspect Target URL
  const handleInspect = async () => {
    if (!url) return;
    setInspecting(true);
    setStatusMessage('Navigating to target page and inspecting DOM...');
    appendLog(`Inspecting URL: ${url}`);

    try {
      const data = await formApi.inspectUrl(url);
      setFormMeta(data);
      setExtractedFields(data.fields || []);
      setInitialScreenshot(data.screenshot);
      appendLog(`Successfully extracted ${data.fields?.length || 0} fields from "${data.title || url}"`);
      setStatusMessage(`Found ${data.fields?.length || 0} fillable fields. Ready for Grok humanization.`);
    } catch (err) {
      appendLog(`Inspection error: ${err.message}`);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setInspecting(false);
    }
  };

  // Step 2: Grok + Tavily Autofill
  const handleGenerate = async () => {
    if (extractedFields.length === 0) return;
    setGenerating(true);
    setStatusMessage('Grok synthesis & Tavily web verification in progress...');
    appendLog(`Synthesizing fields with Grok Anti-AI Prompting (Tone: ${styleMode})...`);

    if (useTavily) {
      appendLog(`Tavily web grounding active: verifying company entity facts...`);
    }

    try {
      const result = await formApi.autofill(
        extractedFields,
        profile.customNotes || '',
        styleMode,
        useTavily
      );

      setFieldMappings(result.fields || {});
      setGrokNotes(result.notes || '');
      setTavilyContext(result.researchSummary || '');
      appendLog(`Grok generated ${Object.keys(result.fields || {}).length} humanized values.`);
      if (result.researchSummary) {
        appendLog(`Tavily context attached: ${result.researchSummary.substring(0, 80)}...`);
      }
      setStatusMessage('Fields humanized and ready for browser injection.');
    } catch (err) {
      appendLog(`Generation error: ${err.message}`);
      setStatusMessage(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Step 3: Run Playwright Browser Automation
  const handleExecuteBrowser = async () => {
    if (Object.keys(fieldMappings).length === 0) return;
    setExecuting(true);
    setStatusMessage('Autonomous Playwright browser launched. Typing with human delay cadence...');
    appendLog('Starting autonomous Playwright browser worker...');
    appendLog(`Config: Keystroke Delay = ${useHumanDelay ? 'Active (20-45ms variance)' : 'Instant'}; AutoSubmit = ${autoSubmit ? 'Yes' : 'No'}`);

    try {
      const res = await formApi.browserFill(
        url,
        fieldMappings,
        autoSubmit,
        useHumanDelay
      );

      if (res.logs && Array.isArray(res.logs)) {
        res.logs.forEach(l => appendLog(l));
      }

      if (res.filledScreenshot) {
        setFilledScreenshot(res.filledScreenshot);
      }

      appendLog(`Form filling completed. ${res.filledCount} fields populated.`);
      setStatusMessage(`Completed! ${res.filledCount} fields populated human-like.`);
    } catch (err) {
      appendLog(`Browser execution error: ${err.message}`);
      setStatusMessage(`Automation failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleFieldChange = (key, val) => {
    setFieldMappings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner: Anti-AI Protection Guarantee */}
      <div className="anti-ai-shield">
        <ShieldCheck className="shield-icon" size={24} />
        <div className="shield-content">
          <div className="shield-title">
            <span>Human-Pattern Cadence & Anti-Detection System</span>
            <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '999px', color: '#6ee7b7' }}>ACTIVE</span>
          </div>
          <p className="shield-desc">
            Output strictly audited against robotic AI vocabulary (delve, testament, leverage, crucial, etc.). Live typing cadence randomized with 15–45ms keystroke pauses.
          </p>
        </div>
      </div>

      {/* Target URL Selector Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon">
              <Globe size={20} />
            </div>
            <div>
              <h3>Target Form Automation</h3>
              <p style={{ fontSize: '13px' }}>Enter live website URL or test on built-in FlexiCredit application form</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setUrl('http://localhost:5000/demo-form.html')}
              style={{ fontSize: '12px' }}
            >
              Preset: Local Demo Form
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Open Page <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/apply-form"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleInspect}
            disabled={inspecting || !url}
          >
            {inspecting ? <RefreshCw className="animate-spin" size={15} /> : <Search size={15} />}
            <span>{inspecting ? 'Inspecting DOM...' : 'Step 1: Inspect Form'}</span>
          </button>
        </div>

        {/* Step Progression Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: formMeta ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)', border: formMeta ? '1px solid #3b82f6' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: formMeta ? '#60a5fa' : 'var(--text-dim)', fontWeight: 700 }}>Step 1: DOM Inspect</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
              {formMeta ? `${extractedFields.length} Fields Found` : 'Awaiting Inspection'}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: Object.keys(fieldMappings).length > 0 ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)', border: Object.keys(fieldMappings).length > 0 ? '1px solid #10b981' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: Object.keys(fieldMappings).length > 0 ? '#34d399' : 'var(--text-dim)', fontWeight: 700 }}>Step 2: Grok + Tavily</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
              {Object.keys(fieldMappings).length > 0 ? `${Object.keys(fieldMappings).length} Humanized Values` : 'Ready to Synthesize'}
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', background: filledScreenshot ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)', border: filledScreenshot ? '1px solid #f59e0b' : '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: filledScreenshot ? '#fbbf24' : 'var(--text-dim)', fontWeight: 700 }}>Step 3: Playwright Run</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
              {filledScreenshot ? 'Browser Fill Finished' : 'Ready to Execute'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      {extractedFields.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Human Tone Cadence:</span>
              <select
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
                value={styleMode}
                onChange={(e) => setStyleMode(e.target.value)}
              >
                <option value="direct_natural">Direct & Natural (Authentic)</option>
                <option value="concise_executive">Concise Executive (Punchy)</option>
                <option value="conversational">Conversational Founder (Warm)</option>
                <option value="formal">Formal & Legal</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '16px' }}>
              <input
                type="checkbox"
                checked={useTavily}
                onChange={(e) => setUseTavily(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Tavily Real-time Web Grounding</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '16px' }}>
              <input
                type="checkbox"
                checked={useHumanDelay}
                onChange={(e) => setUseHumanDelay(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Simulate Natural Keystroke Timing (25-45ms)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '16px' }}>
              <input
                type="checkbox"
                checked={autoSubmit}
                onChange={(e) => setAutoSubmit(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>Auto-Submit Form</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleGenerate}
              disabled={generating || extractedFields.length === 0}
            >
              <Bot size={15} color="#3b82f6" />
              <span>{generating ? 'Grok Synthesizing...' : 'Step 2: Generate Values'}</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={handleExecuteBrowser}
              disabled={executing || Object.keys(fieldMappings).length === 0}
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              <Play size={15} />
              <span>{executing ? 'Playwright Typing...' : 'Step 3: Run Browser Autofill'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Split Grid: Left Field Mapping vs Right Terminal & Screenshots */}
      <div className="split-grid-2">
        {/* Left Column: Form Fields & Grok Values */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Layers size={18} />
              </div>
              <div>
                <h4>Detected Form Fields & Injected Values</h4>
                <p style={{ fontSize: '12px' }}>Review or manually override any field prior to automated browser entry</p>
              </div>
            </div>
            <span className="field-pill">{extractedFields.length} Detected</span>
          </div>

          {tavilyContext && (
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', color: '#fde68a' }}>
              <strong>Tavily Fact Research:</strong> {tavilyContext}
            </div>
          )}

          {extractedFields.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No form fields inspected yet.</p>
              <p style={{ fontSize: '12px' }}>Click "Step 1: Inspect Form" above to parse target page inputs.</p>
            </div>
          ) : (
            <div className="field-table-container" style={{ maxHeight: '560px', overflowY: 'auto' }}>
              <table className="field-table">
                <thead>
                  <tr>
                    <th>Field Label / ID</th>
                    <th>Type</th>
                    <th>Humanized Value</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedFields.map((field) => {
                    const fieldKey = field.id || field.name;
                    const currentValue = fieldMappings[fieldKey] !== undefined ? fieldMappings[fieldKey] : '';
                    return (
                      <tr key={fieldKey}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{field.label}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{fieldKey}</div>
                        </td>
                        <td>
                          <span className={`field-pill ${field.required ? 'req' : ''}`}>
                            {field.type} {field.required ? '*' : ''}
                          </span>
                        </td>
                        <td>
                          {field.type === 'textarea' ? (
                            <textarea
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px', minHeight: '60px' }}
                              value={currentValue}
                              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                              placeholder="Auto-generated response..."
                            />
                          ) : (
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={currentValue}
                              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                              placeholder="Auto-generated value..."
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Execution Terminal & Visual Screenshots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Terminal Log */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot dot-red"></span>
                <span className="terminal-dot dot-yellow"></span>
                <span className="terminal-dot dot-green"></span>
              </div>
              <span>PLAYWRIGHT_WORKER // GROK_AGENT</span>
              <Terminal size={14} color="#64748b" />
            </div>
            <div className="terminal-body">
              {terminalLogs.length === 0 ? (
                <div style={{ color: '#475569' }}>
                  $ Engine initialized. Ready to inspect and autofill.<br />
                  $ Human typing delay cadence: ACTIVE<br />
                  $ Tavily grounding search: READY
                </div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div key={index} className="terminal-line">
                    <span style={{ color: '#38bdf8' }}>&gt;</span> {log}
                  </div>
                ))
              )}
              {executing && (
                <div>
                  <span style={{ color: '#38bdf8' }}>&gt;</span> Typing next field...
                  <span className="terminal-cursor"></span>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Comparison */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div className="card-title-group">
                <div className="card-icon">
                  <Eye size={18} />
                </div>
                <div>
                  <h4>Visual Browser Capture</h4>
                  <p style={{ fontSize: '12px' }}>Real-time Playwright screenshot before and after automated completion</p>
                </div>
              </div>
            </div>

            {filledScreenshot ? (
              <div className="screenshot-preview">
                <span className="screenshot-tag" style={{ background: 'rgba(16,185,129,0.9)' }}>
                  ✓ Post-Autofill Verification
                </span>
                <img src={filledScreenshot} alt="Form After Autofill" />
              </div>
            ) : initialScreenshot ? (
              <div className="screenshot-preview">
                <span className="screenshot-tag">
                  Initial Form DOM Inspection
                </span>
                <img src={initialScreenshot} alt="Initial Form View" />
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <Eye size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p>No browser visual capture yet.</p>
                <p style={{ fontSize: '11px' }}>Inspect a form to capture live page state.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

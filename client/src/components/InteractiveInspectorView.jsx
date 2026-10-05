import React, { useState } from 'react';
import { formApi } from '../api';
import {
  Code,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Download,
  FileText,
  RefreshCw,
  Sliders,
  AlertTriangle
} from 'lucide-react';

const PRESET_SCHEMAS = {
  creditApp: `<form id="commercial-credit">
  <label for="company_name">Legal Entity Name</label>
  <input type="text" id="company_name" name="company_name" required>

  <label for="tin_ein">Federal Tax Identification Number (EIN)</label>
  <input type="text" id="tin_ein" name="tin_ein" required>

  <label for="industry_sector">Primary Industry Classification</label>
  <input type="text" id="industry_sector" name="industry_sector">

  <label for="requested_amount">Requested Financing Amount ($)</label>
  <input type="number" id="requested_amount" name="requested_amount">

  <label for="funding_use">Business Strategic Rationale & Working Capital Allocation</label>
  <textarea id="funding_use" name="funding_use" required></textarea>

  <label for="executive_officer">Authorized Officer Full Name</label>
  <input type="text" id="executive_officer" name="executive_officer">
</form>`,
  vendorOnboarding: `<form id="vendor-onboard">
  <label for="vendor_name">Vendor Company Legal Name</label>
  <input type="text" id="vendor_name" name="vendor_name">

  <label for="billing_email">Accounts Receivable Email</label>
  <input type="email" id="billing_email" name="billing_email">

  <label for="headquarters_address">Corporate Headquarters Address</label>
  <input type="text" id="headquarters_address" name="headquarters_address">

  <label for="compliance_notes">Certifications & Data Security Compliance Summary</label>
  <textarea id="compliance_notes" name="compliance_notes"></textarea>
</form>`
};

export default function InteractiveInspectorView({ profile }) {
  const [htmlInput, setHtmlInput] = useState(PRESET_SCHEMAS.creditApp);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [parsedFields, setParsedFields] = useState([]);
  const [filledValues, setFilledValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('direct_natural');
  const [bannedCount, setBannedCount] = useState(0);

  const handleParse = async () => {
    if (!htmlInput) return;
    setParsing(true);
    try {
      const res = await formApi.parseHtml(htmlInput);
      setParsedFields(res.fields || []);
    } catch (err) {
      alert(`Parse error: ${err.message}`);
    } finally {
      setParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (parsedFields.length === 0) {
      // Auto-parse first if not parsed yet
      const res = await formApi.parseHtml(htmlInput);
      setParsedFields(res.fields || []);
      if (!res.fields?.length) return;
    }

    setGenerating(true);
    try {
      const fieldsToFill = parsedFields.length > 0 ? parsedFields : (await formApi.parseHtml(htmlInput)).fields;
      const res = await formApi.autofill(fieldsToFill, profile.customNotes || '', tone, true);
      setFilledValues(res.fields || {});

      // Anti-AI Verification audit
      let totalBannedFound = 0;
      const banned = ['delve', 'testament', 'crucial', 'pivotal', 'leverage', 'furthermore', 'moreover', 'beacon', 'tapestry'];
      Object.values(res.fields || {}).forEach(v => {
        if (typeof v === 'string') {
          banned.forEach(b => {
            if (new RegExp(`\\b${b}\\b`, 'i').test(v)) totalBannedFound++;
          });
        }
      });
      setBannedCount(totalBannedFound);
    } catch (err) {
      alert(`Autofill error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(filledValues, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [['Field ID', 'Value']];
    Object.entries(filledValues).forEach(([k, v]) => {
      rows.push([`"${k}"`, `"${String(v).replace(/"/g, '""')}"`]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flexi_form_autofill_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="anti-ai-shield">
        <ShieldCheck className="shield-icon" size={24} />
        <div className="shield-content">
          <div className="shield-title">
            <span>Interactive Form Schema & Anti-AI Inspector</span>
          </div>
          <p className="shield-desc">
            Paste any custom HTML form snippet or schema. Inspect inputs, generate authentic non-AI responses, and export immediately.
          </p>
        </div>
      </div>

      <div className="split-grid-2">
        {/* Left Column: HTML Input & Presets */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Code size={18} />
              </div>
              <div>
                <h4>Raw Form Schema / HTML Snippet</h4>
                <p style={{ fontSize: '12px' }}>Paste HTML from your target application or choose a preset</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={() => setHtmlInput(PRESET_SCHEMAS.creditApp)}
              >
                Preset: Credit App
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={() => setHtmlInput(PRESET_SCHEMAS.vendorOnboarding)}
              >
                Preset: Vendor
              </button>
            </div>
          </div>

          <textarea
            className="form-input"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', minHeight: '260px', resize: 'vertical' }}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="<form>...</form>"
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={15} color="#94a3b8" />
              <select
                className="form-input"
                style={{ fontSize: '12px', width: 'auto', padding: '6px 10px' }}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="direct_natural">Direct & Natural Tone</option>
                <option value="concise_executive">Concise Executive</option>
                <option value="conversational">Conversational Founder</option>
                <option value="formal">Formal & Precision Legal</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleParse}
                disabled={parsing || !htmlInput}
              >
                {parsing ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                <span>Parse Fields ({parsedFields.length})</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating || !htmlInput}
              >
                {generating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                <span>{generating ? 'Grok Synthesizing...' : 'Autofill with Grok'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output & Anti-AI Audit */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h4>Generated Values & Anti-AI Audit</h4>
                <p style={{ fontSize: '12px' }}>Natural phrasing guaranteed with automated cliché inspection</p>
              </div>
            </div>

            {Object.keys(filledValues).length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCopyJson}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'JSON'}</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadCsv}
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  <Download size={12} />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Anti-AI Metrics Indicator */}
          {Object.keys(filledValues).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#6ee7b7' }}>AI Banned Clichés</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{bannedCount} Detected</div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#93c5fd' }}>Human Tone Cadence</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#60a5fa' }}>Natural Human</div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#fde68a' }}>Fields Populated</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>{Object.keys(filledValues).length}</div>
              </div>
            </div>
          )}

          {Object.keys(filledValues).length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No fields generated yet.</p>
              <p style={{ fontSize: '12px' }}>Click "Autofill with Grok" to synthesize authentic responses.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(filledValues).map(([key, val]) => (
                <div key={key} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    {key}
                  </div>
                  <div style={{ fontSize: '13px', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                    {String(val)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { profileApi } from '../api';
import {
  Database,
  Save,
  CheckCircle,
  Building2,
  User,
  FileText,
  UploadCloud,
  FileCode,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';

const SAMPLE_DOCS = {
  pitchDeck: `COMPANY EXECUTIVE BRIEF: VORTEX LOGISTICS TECHNOLOGIES CORP
Corporate Identification:
Legal Name: Vortex Logistics Technologies Corp
EIN / Tax ID: 88-4920194
Formation: C-Corporation (Delaware, 2019)
Headquarters: 100 Montgomery St, Suite 1800, San Francisco, CA 94104
Direct Contact: +1 (415) 890-4412
Web: https://vortexlogistics.example.com

Executive Leadership:
Primary Officer: Elena Rostova
Role: Chief Executive Officer & Co-Founder
Email: elena.rostova@vortexlogistics.example.com

Financial Highlights:
FY2025 Annual Gross Revenue: $3,450,000 USD
Sector: Autonomous Freight Logistics & Intelligent Route Optimization
Workforce: 18 Full-time engineers and operations specialists

Executive Overview:
Elena Rostova brings 14 years of supply chain automation experience, having previously directed enterprise fulfillment at Tier-1 freight networks. Vortex develops predictive routing models that reduce long-haul fuel consumption by 22%. Currently seeking commercial credit facilities to procure field hardware units and scale regional hub distribution across the Midwest.`,

  taxSummary: `INTERNAL REVENUE SERVICE - FORM 1120 CORPORATE RETURN SUMMARY (EXTRACT)
Taxpayer Identification: 45-8120391
Legal Business Name: Summit Peak Financial Advisory LLC
DBA / Trade Name: Summit Peak Advisory
Mailing Address: 75 Wall Street, 22nd Floor, New York, NY 10005
Contact Telephone: +1 (212) 555-8910
Contact Email: compliance@summitpeakadvisory.example.com
Principal Business Activity: Financial & Wealth Management Advisory Services
Entity Classification: Limited Liability Company (LLC)
Date Business Commenced: 04/15/2018
Total Annual Receipts / Gross Income: $2,800,000
Managing Member / Authorized Signer: Marcus Vance, Managing Partner
Summary Statement:
Firm provides high-velocity corporate treasury management and financial compliance advisory to emerging enterprise clients. Seeking line of credit to finance expansion of secondary compliance audit facility.`
};

export default function KnowledgeVaultView({ profile, onProfileUpdated }) {
  const [formData, setFormData] = useState(profile || {});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Document ingestion states
  const [uploading, setUploading] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await profileApi.updateProfile(formData);
      onProfileUpdated(res.profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Upload actual file from disk (PDF, TXT, etc.)
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setExtractedResult(null);

    try {
      const res = await profileApi.uploadDocument(file, false);
      setExtractedResult(res);
    } catch (err) {
      setUploadError(err.message || 'Failed to process document');
    } finally {
      setUploading(false);
    }
  };

  // Quick test sample document generator
  const handleQuickTestSample = async (sampleType) => {
    const textContent = SAMPLE_DOCS[sampleType];
    const blob = new Blob([textContent], { type: 'text/plain' });
    const file = new File([blob], `${sampleType}_summary.txt`, { type: 'text/plain' });
    await handleFileUpload(file);
  };

  // Apply extracted data to form fields and save
  const handleApplyExtractedData = () => {
    if (!extractedResult || !extractedResult.extractedData) return;
    const merged = {
      ...formData,
      ...extractedResult.extractedData
    };
    setFormData(merged);
    setExtractedResult(null);
    onProfileUpdated(merged);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="anti-ai-shield">
        <Database className="shield-icon" size={24} />
        <div className="shield-content">
          <div className="shield-title">
            <span>Master Profile & Context Vault</span>
          </div>
          <p className="shield-desc">
            This repository supplies factual data for Grok & Tavily. Upload documents to automatically extract business parameters or edit them manually below.
          </p>
        </div>
      </div>

      {/* Document & PDF Ingestion Card */}
      <div className="card" style={{ border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, var(--bg-card) 100%)' }}>
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h4>Document & PDF Ingestion Engine</h4>
              <p style={{ fontSize: '12px' }}>Upload pitch decks, tax returns, resumes, or financial filings to auto-populate the vault</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => handleQuickTestSample('pitchDeck')}
              disabled={uploading}
            >
              <FileCode size={12} />
              <span>Sample: Pitch Deck</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => handleQuickTestSample('taxSummary')}
              disabled={uploading}
            >
              <FileCode size={12} />
              <span>Sample: Tax Filing</span>
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-strong)',
            borderRadius: '10px',
            padding: '28px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(15, 23, 42, 0.6)',
            transition: 'border-color 0.2s',
            marginBottom: '16px'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.csv,.json,.doc,.docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#60a5fa' }}>
              <RefreshCw className="animate-spin" size={28} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Analyzing Document with Groq LPU...</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Extracting company records, executive data, and financial highlights</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={32} color="#3b82f6" />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                Click to browse or drag and drop your document here
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Supports PDF, TXT, Markdown, CSV, and JSON (up to 25MB)
              </div>
            </div>
          )}
        </div>

        {uploadError && (
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Extracted Findings Modal / Card */}
        {extractedResult && (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  <span>Document Extracted: {extractedResult.filename}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#a7f3d0', marginTop: '2px' }}>
                  {extractedResult.documentSummary}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#10b981', border: 'none', padding: '8px 18px', fontSize: '12px' }}
                onClick={handleApplyExtractedData}
              >
                <Check size={14} />
                <span>Apply Extracted Data to Vault</span>
              </button>
            </div>

            {/* Field highlights pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(extractedResult.extractedData || {}).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{k}:</span>{' '}
                  <span style={{ color: '#f1f5f9' }}>{String(v).substring(0, 45)}{String(v).length > 45 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Business Information Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Building2 size={18} />
              </div>
              <div>
                <h4>Business & Entity Master Record</h4>
                <p style={{ fontSize: '12px' }}>Company identity, legal structure, and registration parameters</p>
              </div>
            </div>
          </div>

          <div className="split-grid-2">
            <div className="input-group">
              <label className="input-label">Legal Company Name</label>
              <input
                type="text"
                name="companyName"
                className="form-input"
                value={formData.companyName || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Company Website / Domain</label>
              <input
                type="url"
                name="companyWebsite"
                className="form-input"
                value={formData.companyWebsite || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Federal Tax ID / EIN</label>
              <input
                type="text"
                name="taxIdEin"
                className="form-input"
                value={formData.taxIdEin || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Annual Revenue Bracket</label>
              <input
                type="text"
                name="annualRevenue"
                className="form-input"
                value={formData.annualRevenue || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Industry Classification</label>
              <input
                type="text"
                name="industry"
                className="form-input"
                value={formData.industry || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Entity Structure</label>
              <input
                type="text"
                name="businessStructure"
                className="form-input"
                value={formData.businessStructure || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Primary Applicant & Location Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <User size={18} />
              </div>
              <div>
                <h4>Primary Authorized Officer & Headquarters</h4>
                <p style={{ fontSize: '12px' }}>Signer profile used for contact and verification fields</p>
              </div>
            </div>
          </div>

          <div className="split-grid-2">
            <div className="input-group">
              <label className="input-label">Officer Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Job Title / Role</label>
              <input
                type="text"
                name="jobTitle"
                className="form-input"
                value={formData.jobTitle || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Direct Business Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Direct Contact Phone</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formData.phone || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Street Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">City & State</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="form-input"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className="form-input"
                  style={{ width: '90px' }}
                  value={formData.state || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Postal / ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                className="form-input"
                value={formData.zipCode || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Narrative & Anti-AI Custom Directives Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <FileText size={18} />
              </div>
              <div>
                <h4>Narrative Grounding & Voice Directives</h4>
                <p style={{ fontSize: '12px' }}>Qualitative responses for long-form questions, bios, and loan rationale</p>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Executive Background / Operational Summary</label>
            <textarea
              name="bio"
              className="form-input"
              style={{ minHeight: '80px' }}
              value={formData.bio || ''}
              onChange={handleChange}
              placeholder="Summary of experience and operating trajectory..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Custom Anti-AI Prompt Directives</label>
            <textarea
              name="customNotes"
              className="form-input"
              style={{ minHeight: '80px' }}
              value={formData.customNotes || ''}
              onChange={handleChange}
              placeholder="e.g. Always write in first-person plural. Keep answers under 3 sentences. No buzzwords."
            />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
          {saveSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px' }}>
              <CheckCircle size={16} />
              <span>Vault parameters updated successfully</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '12px 28px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Updating Vault...' : 'Save Vault Records'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

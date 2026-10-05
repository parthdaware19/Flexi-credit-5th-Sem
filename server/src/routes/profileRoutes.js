const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const { getProfile, updateProfile, getSettings, updateSettings } = require('../db');
const { extractTextFromFile, extractProfileFromDocumentText } = require('../services/documentParserService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

router.use(authMiddleware);

// GET /api/profile
router.get('/profile', (req, res) => {
  try {
    const profile = getProfile(req.user.id);
    return res.json({ profile });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get profile.' });
  }
});

// PUT /api/profile
router.put('/profile', (req, res) => {
  try {
    const updated = updateProfile(req.user.id, req.body);
    return res.json({ profile: updated, message: 'Profile updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/profile/upload-doc
// Accepts multipart/form-data with field name 'document'
router.post('/upload-doc', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF, TXT, CSV, or Markdown document.' });
    }

    const { autoApply } = req.body;
    const currentProfile = getProfile(req.user.id) || {};

    console.log(`[Document Ingestion] Processing ${req.file.originalname} (${req.file.size} bytes)...`);

    // 1. Extract raw text from file
    const fileResult = await extractTextFromFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 2. Extract structured profile fields using Groq LPU
    const extraction = await extractProfileFromDocumentText(
      fileResult.text,
      currentProfile
    );

    let updatedProfile = currentProfile;
    if (autoApply === 'true' || autoApply === true) {
      // Merge with existing profile
      updatedProfile = updateProfile(req.user.id, extraction.extractedData);
    }

    return res.json({
      success: true,
      filename: req.file.originalname,
      fileType: fileResult.type,
      pageCount: fileResult.pageCount,
      extractedData: extraction.extractedData,
      documentSummary: extraction.documentSummary,
      fieldsFoundCount: extraction.fieldsFoundCount,
      profile: updatedProfile,
      message: autoApply
        ? 'Document parsed and Knowledge Vault successfully updated!'
        : 'Document parsed successfully. Review extracted fields before applying.'
    });
  } catch (err) {
    console.error('[Document Ingestion Error]:', err);
    return res.status(500).json({ error: err.message || 'Failed to process document.' });
  }
});

// GET /api/settings
router.get('/settings', (req, res) => {
  try {
    const settings = getSettings(req.user.id);
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get settings.' });
  }
});

// PUT /api/settings
router.put('/settings', (req, res) => {
  try {
    const updated = updateSettings(req.user.id, req.body);
    return res.json({ settings: updated, message: 'Settings saved successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

module.exports = router;

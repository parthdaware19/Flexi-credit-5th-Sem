const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getProfile, getSettings, addFormSession, getFormSessions } = require('../db');
const { inspectUrl, autoFillFormOnPage } = require('../services/browserService');
const { parseHtmlForm } = require('../services/formParserService');
const { searchWeb, researchEntityForForm } = require('../services/tavilyService');
const { generateFieldValues } = require('../services/grokService');

const router = express.Router();

// All routes here require JWT authentication
router.use(authMiddleware);

// POST /api/forms/inspect-url
router.post('/inspect-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
    }

    const result = await inspectUrl(url);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    return res.json(result);
  } catch (err) {
    console.error('Inspect URL error:', err);
    return res.status(500).json({ error: err.message || 'Failed to inspect form URL.' });
  }
});

// POST /api/forms/parse-html
router.post('/parse-html', (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required.' });
    }

    const fields = parseHtmlForm(html);
    return res.json({
      success: true,
      fields,
      fieldCount: fields.length
    });
  } catch (err) {
    console.error('Parse HTML error:', err);
    return res.status(500).json({ error: 'Failed to parse form HTML.' });
  }
});

// POST /api/forms/research
router.post('/research', async (req, res) => {
  try {
    const { query, entityName, missingFields } = req.body;
    const settings = getSettings(req.user.id);
    const userTavilyKey = settings.tavilyApiKey || null;

    if (entityName && missingFields && missingFields.length > 0) {
      const research = await researchEntityForForm(entityName, missingFields, userTavilyKey);
      return res.json({ success: true, ...research });
    }

    if (!query) {
      return res.status(400).json({ error: 'Query or entity details required for research.' });
    }

    const searchResult = await searchWeb(query, userTavilyKey);
    return res.json(searchResult);
  } catch (err) {
    console.error('Research error:', err);
    return res.status(500).json({ error: 'Failed to perform Tavily research.' });
  }
});

// POST /api/forms/autofill
router.post('/autofill', async (req, res) => {
  try {
    const { fields, customInstructions, humanizerStyle, useTavilyResearch } = req.body;
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ error: 'An array of fields is required.' });
    }

    const profile = getProfile(req.user.id) || {};
    const settings = getSettings(req.user.id) || {};

    // Override style if provided in request
    const effectiveProfile = {
      ...profile,
      humanizerStyle: humanizerStyle || profile.humanizerStyle || 'direct_natural',
      customNotes: customInstructions || profile.customNotes || ''
    };

    let researchContext = null;
    if (useTavilyResearch && profile.companyName) {
      try {
        const missingLabels = fields
          .map(f => f.label || f.name)
          .filter(l => l && !l.toLowerCase().includes('first') && !l.toLowerCase().includes('email'))
          .slice(0, 4);

        if (missingLabels.length > 0) {
          researchContext = await researchEntityForForm(profile.companyName, missingLabels, settings.tavilyApiKey);
        }
      } catch (tavilyErr) {
        console.warn('Tavily research step skipped:', tavilyErr.message);
      }
    }

    const grokResult = await generateFieldValues(
      fields,
      effectiveProfile,
      researchContext,
      settings.grokApiKey,
      settings
    );

    return res.json({
      success: true,
      fields: grokResult.fields,
      notes: grokResult.notes,
      modelUsed: grokResult.modelUsed,
      source: grokResult.source,
      researchSummary: researchContext ? researchContext.findings : null
    });
  } catch (err) {
    console.error('Autofill error:', err);
    return res.status(500).json({ error: err.message || 'Autofill generation failed.' });
  }
});

// POST /api/forms/browser-fill
router.post('/browser-fill', async (req, res) => {
  try {
    const { url, fieldMappings, autoSubmit, useHumanDelay } = req.body;
    if (!url || !fieldMappings) {
      return res.status(400).json({ error: 'URL and fieldMappings are required.' });
    }

    const fillResult = await autoFillFormOnPage(url, fieldMappings, {
      autoSubmit: !!autoSubmit,
      useHumanDelay: useHumanDelay !== false
    });

    if (fillResult.success) {
      addFormSession(req.user.id, {
        url,
        fieldCount: fillResult.filledCount,
        submitted: fillResult.submitted,
        initialScreenshot: fillResult.initialScreenshot,
        filledScreenshot: fillResult.filledScreenshot
      });
    }

    return res.json(fillResult);
  } catch (err) {
    console.error('Browser autofill error:', err);
    return res.status(500).json({ error: err.message || 'Browser automation failed.' });
  }
});

// GET /api/forms/sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = getFormSessions(req.user.id);
    return res.json({ sessions });
  } catch (err) {
    console.error('Get sessions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve session history.' });
  }
});

module.exports = router;

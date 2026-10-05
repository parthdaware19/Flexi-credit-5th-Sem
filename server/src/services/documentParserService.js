const pdfParse = require('pdf-parse');
const axios = require('axios');
const config = require('../config');

/**
 * Extracts raw textual content from uploaded file buffers
 */
async function extractTextFromFile(fileBuffer, originalName, mimeType) {
  const ext = originalName.split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(fileBuffer);
      return {
        text: data.text || '',
        pageCount: data.numpages || 1,
        type: 'pdf'
      };
    } catch (err) {
      console.error('[DocumentParser] PDF parse error:', err.message);
      throw new Error(`Failed to parse PDF: ${err.message}`);
    }
  }

  // Text, JSON, CSV, Markdown, etc.
  try {
    const text = fileBuffer.toString('utf-8');
    return {
      text,
      pageCount: 1,
      type: ext || 'text'
    };
  } catch (err) {
    throw new Error(`Failed to decode text document: ${err.message}`);
  }
}

/**
 * Uses Groq to extract structured profile and business fields from document text
 */
async function extractProfileFromDocumentText(documentText, existingProfile = {}) {
  // Truncate document text if excessively long to fit comfortably in context window
  const maxChars = 20000;
  const truncatedText = documentText.length > maxChars ? documentText.substring(0, maxChars) + '\n...[truncated]' : documentText;

  const systemPrompt = `You are a precision financial document extraction engine.
Analyze the provided document (which may be a resume, corporate tax filing, pitch deck, commercial credit application, or business summary) and extract structured applicant and business data.

Output STRICTLY valid JSON with the following structure:
{
  "companyName": "<Legal Company Name if found, or empty string>",
  "companyWebsite": "<Website URL if found, or empty string>",
  "taxIdEin": "<Federal Tax ID or EIN format XX-XXXXXXX if found, or empty string>",
  "annualRevenue": "<Annual revenue or sales volume with currency sign if found, or empty string>",
  "industry": "<Primary industry sector or classification if found, or empty string>",
  "businessStructure": "<LLC, C-Corp, S-Corp, Partnership, Sole Proprietorship if found, or empty string>",
  "yearEstablished": "<Founding year if found, or empty string>",
  "fullName": "<Primary applicant or executive officer full name if found, or empty string>",
  "jobTitle": "<Executive role or job title if found, or empty string>",
  "email": "<Contact or business email if found, or empty string>",
  "phone": "<Phone number with area code if found, or empty string>",
  "address": "<Street address if found, or empty string>",
  "city": "<City if found, or empty string>",
  "state": "<State or province code if found, or empty string>",
  "zipCode": "<Postal or ZIP code if found, or empty string>",
  "country": "<Country if found, or empty string>",
  "bio": "<2-3 sentence professional executive operational summary if found, or empty string>",
  "documentSummary": "<Brief 1-2 sentence overview of what this document is and key highlights found>"
}`;

  const userPrompt = `Document Content:
---
${truncatedText}
---
Extract all matching fields accurately based only on the facts in the document text above.`;

  try {
    const apiKey = config.GROQ_API_KEY || config.GROK_API_KEY;
    if (!apiKey) {
      throw new Error('No Groq or Grok API key configured for document extraction.');
    }

    const response = await axios.post(
      config.GROQ_API_URL,
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // low temperature for maximum factual precision
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    }

    // Filter out empty strings so we don't overwrite existing valid data with blanks
    const cleanExtracted = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === 'string' && val.trim() !== '' && val.trim().toLowerCase() !== 'empty string' && val.trim().toLowerCase() !== 'not found') {
        cleanExtracted[key] = val.trim();
      }
    }

    return {
      success: true,
      extractedData: cleanExtracted,
      documentSummary: parsed.documentSummary || 'Document successfully processed and analyzed.',
      fieldsFoundCount: Object.keys(cleanExtracted).filter(k => k !== 'documentSummary').length
    };
  } catch (error) {
    console.error('[Document Extraction Error]:', error.response?.data || error.message);
    throw new Error(`Failed to extract data via Groq: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = {
  extractTextFromFile,
  extractProfileFromDocumentText
};

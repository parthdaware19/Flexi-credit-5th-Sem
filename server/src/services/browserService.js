const { chromium } = require('playwright');

async function launchBrowser(options = {}) {
  // Try default bundled chromium first
  try {
    return await chromium.launch({
      headless: options.headless !== false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.warn('[Playwright] Default chromium launch failed, attempting system channel fallback:', err.message);
    try {
      // Try msedge channel (built into Windows)
      return await chromium.launch({
        channel: 'msedge',
        headless: options.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } catch (edgeErr) {
      // Try chrome channel
      return await chromium.launch({
        channel: 'chrome',
        headless: options.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }
}

/**
 * Inspects a live website URL and extracts form fields along with a visual screenshot
 */
async function inspectUrl(url) {
  let browser = null;
  try {
    browser = await launchBrowser({ headless: true });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait a brief moment for dynamic client-rendered frameworks to hydrate
    await page.waitForTimeout(1500);

    // Extract form fields dynamically from the DOM
    const fields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs
        .filter(el => {
          const type = (el.getAttribute('type') || '').toLowerCase();
          return !['hidden', 'submit', 'button', 'reset', 'image'].includes(type);
        })
        .map((el, index) => {
          const tagName = el.tagName.toLowerCase();
          const type = el.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : 'text');
          const id = el.id || '';
          const name = el.name || '';
          const placeholder = el.placeholder || '';
          const required = el.required || el.getAttribute('aria-required') === 'true';

          let label = '';
          if (id) {
            const labelEl = document.querySelector(`label[for="${id}"]`);
            if (labelEl) label = labelEl.innerText.trim();
          }
          if (!label) {
            const parentLabel = el.closest('label');
            if (parentLabel) label = parentLabel.innerText.replace(el.value || '', '').trim();
          }
          if (!label) {
            label = el.getAttribute('aria-label') || placeholder || name || id || `Input ${index + 1}`;
          }

          let options = [];
          if (tagName === 'select') {
            options = Array.from(el.querySelectorAll('option')).map(opt => ({
              value: opt.value,
              text: opt.innerText.trim()
            }));
          }

          return {
            id: id || `field_${index}`,
            name: name || id || `field_${index}`,
            type: tagName === 'textarea' ? 'textarea' : (tagName === 'select' ? 'select' : type),
            label: label.replace(/\s+/g, ' ').trim(),
            placeholder,
            required,
            options,
            selector: id ? `#${id}` : (name ? `[name="${name}"]` : `${tagName}:nth-of-type(${index + 1})`)
          };
        });
    });

    const pageTitle = await page.title();
    const screenshotBuffer = await page.screenshot({ fullPage: false, type: 'jpeg', quality: 75 });
    const screenshot = `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;

    await browser.close();

    return {
      success: true,
      title: pageTitle,
      url,
      fields,
      fieldCount: fields.length,
      screenshot
    };
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    console.error('[Playwright Inspect Error]:', error.message);
    return {
      success: false,
      error: `Could not inspect ${url}: ${error.message}`
    };
  }
}

/**
 * Automates browser navigation, types values with human cadence, and captures filled screenshot
 */
async function autoFillFormOnPage(url, fieldMappings, options = {}) {
  let browser = null;
  const executionLogs = [];
  const addLog = (msg) => executionLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

  try {
    addLog(`Launching humanized automation engine...`);
    browser = await launchBrowser(options);

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    addLog(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    const initialScreenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 70 });
    const initialScreenshot = `data:image/jpeg;base64,${initialScreenshotBuffer.toString('base64')}`;

    let filledCount = 0;
    addLog(`Beginning humanized input entry for ${Object.keys(fieldMappings).length} fields...`);

    for (const [key, value] of Object.entries(fieldMappings)) {
      if (value === undefined || value === null || value === '') continue;

      // Selectors to try
      const selectors = [
        `#${key}`,
        `[name="${key}"]`,
        `[id*="${key}"]`,
        `[name*="${key}"]`
      ];

      let targetHandle = null;
      let matchedSelector = null;

      for (const sel of selectors) {
        try {
          const el = await page.$(sel);
          if (el) {
            const isVisible = await el.isVisible().catch(() => false);
            if (isVisible) {
              targetHandle = el;
              matchedSelector = sel;
              break;
            }
          }
        } catch (e) {}
      }

      if (targetHandle) {
        try {
          await targetHandle.scrollIntoViewIfNeeded();
          const tagName = await targetHandle.evaluate(el => el.tagName.toLowerCase());
          const type = await targetHandle.evaluate(el => (el.getAttribute('type') || '').toLowerCase());

          if (tagName === 'select') {
            await targetHandle.selectOption({ label: String(value) }).catch(async () => {
              await targetHandle.selectOption({ value: String(value) }).catch(() => {});
            });
            addLog(`Selected option for "${key}": ${value}`);
          } else if (type === 'checkbox' || type === 'radio') {
            if (value === true || value === 'true' || value === 'on' || value === '1') {
              await targetHandle.check().catch(() => {});
              addLog(`Checked "${key}"`);
            }
          } else {
            await targetHandle.click();
            await targetHandle.fill(''); // clear existing
            
            // Human typing cadence with randomized delay between 15ms and 45ms per keystroke
            if (options.useHumanDelay !== false && typeof value === 'string' && value.length < 150) {
              await targetHandle.type(String(value), { delay: Math.floor(Math.random() * 25) + 15 });
            } else {
              await targetHandle.fill(String(value));
            }
            addLog(`Filled "${key}" with human cadence (${typeof value === 'string' ? value.substring(0, 30) : value}...)`);
          }
          filledCount++;
        } catch (err) {
          addLog(`Could not type into ${matchedSelector}: ${err.message}`);
        }
      } else {
        addLog(`Target field "${key}" not found in current DOM.`);
      }
    }

    addLog(`All fields processed. Waiting for UI state update...`);
    await page.waitForTimeout(1500);

    // Capture post-autofill screenshot
    const filledScreenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 75 });
    const filledScreenshot = `data:image/jpeg;base64,${filledScreenshotBuffer.toString('base64')}`;

    let submitted = false;
    if (options.autoSubmit) {
      addLog(`Submitting form...`);
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        submitted = true;
        addLog(`Form submission button triggered.`);
      }
    }

    await browser.close();

    return {
      success: true,
      filledCount,
      totalRequested: Object.keys(fieldMappings).length,
      initialScreenshot,
      filledScreenshot,
      submitted,
      logs: executionLogs
    };
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    addLog(`Error during browser autofill: ${error.message}`);
    return {
      success: false,
      error: error.message,
      logs: executionLogs
    };
  }
}

module.exports = {
  inspectUrl,
  autoFillFormOnPage
};

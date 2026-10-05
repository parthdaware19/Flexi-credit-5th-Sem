const cheerio = require('cheerio');

/**
 * Parses raw HTML string and extracts all detectable form inputs, selects, and textareas
 */
function parseHtmlForm(htmlString) {
  const $ = cheerio.load(htmlString);
  const fields = [];

  $('form, body').find('input, select, textarea').each((index, el) => {
    const $el = $(el);
    const tagName = el.tagName.toLowerCase();
    const type = ($el.attr('type') || (tagName === 'textarea' ? 'textarea' : 'text')).toLowerCase();
    
    // Skip hidden and submit/button inputs
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) {
      return;
    }

    const id = $el.attr('id') || '';
    const name = $el.attr('name') || '';
    const placeholder = $el.attr('placeholder') || '';
    const required = $el.is('[required]') || $el.attr('aria-required') === 'true';

    // Find label
    let label = '';
    if (id) {
      const labelEl = $(`label[for="${id}"]`);
      if (labelEl.length) {
        label = labelEl.text().trim();
      }
    }
    if (!label) {
      const parentLabel = $el.closest('label');
      if (parentLabel.length) {
        label = parentLabel.text().replace($el.val() || '', '').trim();
      }
    }
    if (!label) {
      label = $el.attr('aria-label') || placeholder || name || id || `Field ${index + 1}`;
    }

    // For selects, get options
    const options = [];
    if (tagName === 'select') {
      $el.find('option').each((_, opt) => {
        const val = $(opt).attr('value') || $(opt).text().trim();
        if (val) {
          options.push({
            value: val,
            text: $(opt).text().trim()
          });
        }
      });
    }

    fields.push({
      id: id || `field_${index}`,
      name: name || id || `field_${index}`,
      type: tagName === 'textarea' ? 'textarea' : (tagName === 'select' ? 'select' : type),
      label: label.replace(/\s+/g, ' ').replace(/\*$/, '').trim(),
      placeholder,
      required,
      options,
      selector: id ? `#${id}` : (name ? `[name="${name}"]` : `${tagName}:nth-of-type(${index + 1})`)
    });
  });

  return fields;
}

module.exports = {
  parseHtmlForm
};

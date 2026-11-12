// ==UserScript==
// @name         Nested iframe DOM Exporter
// @namespace    local.finance.dom-export
// @version      0.14.0
// @description  Export the current page and readable nested iframe DOM sources into one HTML file for AI analysis. Redacts recognizable credential form fields.
// @author       elsebit
// @homepageURL  https://github.com/elsebit/nested-iframe-dom-exporter
// @supportURL   https://github.com/elsebit/nested-iframe-dom-exporter/issues
// @updateURL    https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js
// @downloadURL  https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js
// @license      All rights reserved
// @match        http://*/*
// @match        https://*/*
// @run-at       document-idle
// @noframes
// @grant        GM_registerMenuCommand
// ==/UserScript==
// Build variant: original
/* Paste into the Console to export immediately; the userscript exports on demand from its menu.
 * Export the loaded DOM and readable nested frames as one HTML source file for AI analysis, not page replay.
 * Does not click page controls, turn pages, read cookies/storage, or request pages or external resources.
 */
(function installDOMExporter() {
  'use strict';
  function exportNestedDOM() {
  const MAX_DEPTH = 50;
  const MAX_FRAMES = 500;
  let rootWindow = window;
  // Start at the highest readable ancestor even when the Console targets a child frame.
  try {
    while (rootWindow.parent !== rootWindow) {
      if (!rootWindow.parent.document.documentElement) break;
      rootWindow = rootWindow.parent;
    }
  } catch (_) { /* Cross-origin ancestor is inaccessible; start within the readable scope. */ }
  const rootDocument = rootWindow.document;
  const report = {
    kind: 'finance-dom-snapshot', schemaVersion: 1,
    capturedAt: new Date().toISOString(), rootIsTop: rootWindow === rootWindow.top,
    limits: { maxDepth: MAX_DEPTH, maxFrames: MAX_FRAMES },
    notes: [
      'Includes only the currently loaded ordinary DOM; excludes unloaded pages, Shadow DOM, canvas pixels, and JavaScript runtime objects.',
      'Document HTML sources are concatenated in one file; parentId and frameIndex describe nesting. Capture is not atomic across documents.',
      'Password and recognizable credential form fields are redacted. Frame srcdoc attributes are omitted; loaded child documents are captured separately.',
      'Original scripts are preserved as text only. Do not execute this file or open it as an offline web page.'
    ],
    frames: [], truncated: false
  };
  const seen = new WeakSet();

  function safeURL(value, base) {
    try {
      const url = new URL(value, base);
      if (!['http:', 'https:', 'file:', 'about:'].includes(url.protocol)) return url.protocol;
      url.username = ''; url.password = ''; url.search = ''; url.hash = '';
      return url.href;
    } catch (_) { return ''; }
  }

  function captureHTML(doc) {
    // Clone into a document without a browsing context, preserving script text without executing it.
    const inert = rootDocument.implementation.createHTMLDocument('');
    const copy = inert.importNode(doc.documentElement, true);
    const selector = 'input,textarea,select,option';
    const originals = Array.from(doc.documentElement.querySelectorAll(selector));
    const copies = Array.from(copy.querySelectorAll(selector));
    if (originals.length !== copies.length) throw new Error('Form structure changed during capture.');
    let redactedFields = 0;
    originals.forEach(function (field, index) {
      const target = copies[index];
      const tag = field.tagName.toLowerCase();
      const type = String(field.type || '').toLowerCase();
      const identity = [field.getAttribute('name'), field.id, field.getAttribute('autocomplete')].join(' ');
      const sensitive = type === 'password' || /password|passwd|pwd|token|secret|authorization|credential|\u5bc6\u7801|\u53e3\u4ee4/i.test(identity);
      if (sensitive) {
        target.removeAttribute('value');
        if (tag === 'textarea' || tag === 'select' || tag === 'option') target.textContent = '';
        target.setAttribute('data-dom-export-redacted', 'true');
        redactedFields += 1;
      } else if (tag === 'input') {
        if (type === 'file') target.removeAttribute('value');
        else target.setAttribute('value', field.value);
        if (type === 'checkbox' || type === 'radio') {
          if (field.checked) target.setAttribute('checked', '');
          else target.removeAttribute('checked');
        }
      } else if (tag === 'textarea') target.textContent = field.value;
      else if (tag === 'option') {
        if (field.selected) target.setAttribute('selected', '');
        else target.removeAttribute('selected');
      }
    });
    copy.querySelectorAll('iframe,frame').forEach(function (element) {
      if (element.getAttribute('srcdoc') !== null) {
        element.removeAttribute('srcdoc');
        element.setAttribute('data-dom-export-srcdoc-omitted', 'true');
      }
    });
    const doctype = doc.doctype ? new rootWindow.XMLSerializer().serializeToString(doc.doctype) + '\n' : '';
    return { html: doctype + copy.outerHTML, redactedFields: redactedFields };
  }

  function visit(win, parentId, frameIndex, depth, element) {
    if (report.frames.length >= MAX_FRAMES) { report.truncated = true; return; }
    const entry = {
      id: 'frame-' + report.frames.length, parentId: parentId, frameIndex: frameIndex, depth: depth,
      element: element ? {
        tag: element.tagName.toLowerCase(), id: element.id || '', name: element.getAttribute('name') || '',
        src: safeURL(element.getAttribute('src') || '', element.ownerDocument.baseURI)
      } : null,
      status: 'unavailable', capturedAt: new Date().toISOString()
    };
    report.frames.push(entry);
    if (depth > MAX_DEPTH) { entry.status = 'depth-limit'; report.truncated = true; return; }
    let doc;
    try {
      if (!win) { entry.reason = 'Frame window has not been created.'; return; }
      doc = win.document; // Cross-origin or sandbox restrictions may throw SecurityError.
      if (!doc || !doc.documentElement) { entry.reason = 'Document has not loaded.'; return; }
      if (seen.has(doc)) { entry.status = 'duplicate'; return; }
      seen.add(doc);
      entry.url = safeURL(doc.URL, doc.baseURI);
      entry.title = doc.title;
      entry.readyState = doc.readyState;
    } catch (error) {
      entry.status = error.name === 'SecurityError' ? 'inaccessible' : 'read-error';
      entry.reason = error.name === 'SecurityError' ? 'The same-origin policy or frame sandbox prevents DOM access.' : 'Failed to read frame: ' + error.name;
      return;
    }
    try {
      Object.assign(entry, captureHTML(doc));
      entry.status = doc.readyState === 'complete' ? 'captured' : 'captured-loading';
    } catch (error) { entry.status = 'capture-error'; entry.reason = error.message; }
    // Continue visiting children even if HTML capture fails for their parent.
    try {
      const children = Array.from(doc.querySelectorAll('iframe,frame'));
      entry.childFrameCount = children.length;
      children.forEach(function (child, index) {
        let childWindow;
        try { childWindow = child.contentWindow; } catch (_) { /* Record as unavailable. */ }
        visit(childWindow, entry.id, index, depth + 1, child);
      });
    } catch (error) { entry.childrenError = error.name; }
  }

  visit(rootWindow, null, null, 0, null);
  report.summary = {
    frames: report.frames.length,
    captured: report.frames.filter(item => typeof item.html === 'string').length,
    incomplete: report.truncated || report.frames.some(item => item.status !== 'captured' || item.childrenError)
  };
  const basename = 'finance-dom-' + report.capturedAt.replace(/[:.]/g, '-');
  // Write frame metadata in comments; concatenate HTML directly without JSON or srcdoc nesting.
  function metadataComment(label, value) {
    const metadata = JSON.stringify(value, null, 2).replace(/[<>&]/g, function (character) {
      return '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0');
    }).replace(/--/g, '\\u002d\\u002d');
    return '<!-- DOM-EXPORT ' + label + '\n' + metadata + '\n-->\n';
  }
  const overview = Object.assign({}, report);
  delete overview.frames;
  const parts = ['\uFEFF<!-- DOM source collection for the root page and nested frames, for AI or text editors. Each section is a separate document, not a replayable page. -->\n',
    metadataComment('SUMMARY', overview)];
  report.frames.forEach(function (entry) {
    const metadata = Object.assign({}, entry);
    delete metadata.html;
    // UTF-16 code unit count distinguishes source content from frame delimiters.
    metadata.sourceLength = typeof entry.html === 'string' ? entry.html.length : 0;
    parts.push(metadataComment('FRAME', metadata));
    if (typeof entry.html === 'string') parts.push(entry.html);
    else parts.push('<!-- Frame could not be read: ' + entry.status + '; see the frame metadata above for details. -->');
    parts.push('\n<!-- DOM-EXPORT END ' + entry.id + ' -->\n');
  });
  const blob = new Blob(parts, {type: 'text/html;charset=utf-8'});
  const blobURL = rootWindow.URL.createObjectURL(blob);
  try {
    const link = rootDocument.createElement('a');
    link.href = blobURL;
    link.download = basename + '.html';
    link.click();
    console.info('DOM snapshot download requested: ' + link.download, report.summary);
    console.table(report.frames.map(item => ({ id: item.id, parent: item.parentId, status: item.status, url: item.url || item.element && item.element.src || '' })));
  } finally { rootWindow.setTimeout(function () { rootWindow.URL.revokeObjectURL(blobURL); }, 60000); }
  }

  if (typeof GM_registerMenuCommand === 'function') {
    // Register one menu in the top-level window and recursively capture readable child frames.
    if (window !== window.top) return;
    GM_registerMenuCommand('Export page and nested iframe DOM', function () {
      try { exportNestedDOM(); }
      catch (error) {
        console.error('DOM export failed', error);
        window.alert('DOM export failed: ' + error.message);
      }
    });
  } else exportNestedDOM();
})();

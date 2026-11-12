'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {test}=require('node:test');
const {read}=require('../scripts/build.cjs');
const root=path.resolve(__dirname,'..');

// Read frame metadata and unescaped document sources from the one HTML download.
async function readExport(fixture) {
  assert.equal(fixture.blobs.length, 1, 'one click must request one HTML file');
  assert.equal(fixture.blobs[0].type, 'text/html;charset=utf-8');
  assert.match(fixture.links[0].download, /^finance-dom-.*\.html$/);
  const bytes = Buffer.from(await fixture.blobs[0].arrayBuffer());
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'efbbbf');
  const html = bytes.toString('utf8');
  const overview = html.match(/<!-- DOM-EXPORT SUMMARY\n([\s\S]*?)\n-->\n/);
  assert.ok(overview, 'HTML must contain the capture summary');
  const report = JSON.parse(overview[1]);
  report.frames = [];
  let cursor = overview.index + overview[0].length;
  while (cursor < html.length) {
    const start = '<!-- DOM-EXPORT FRAME\n';
    assert.ok(html.startsWith(start, cursor));
    cursor += start.length;
    const end = html.indexOf('\n-->\n', cursor);
    assert.ok(end > cursor);
    const entry = JSON.parse(html.slice(cursor, end));
    cursor = end + '\n-->\n'.length;
    if (entry.sourceLength) {
      entry.html = html.slice(cursor, cursor + entry.sourceLength);
      cursor += entry.sourceLength;
    } else {
      assert.notEqual(entry.status, 'captured');
      const unavailable = html.indexOf('\n<!-- DOM-EXPORT END ', cursor);
      assert.ok(unavailable >= cursor);
      cursor = unavailable;
    }
    const marker = '\n<!-- DOM-EXPORT END ' + entry.id + ' -->\n';
    assert.ok(html.startsWith(marker, cursor));
    cursor += marker.length;
    report.frames.push(entry);
  }
  assert.equal(report.frames.length, report.summary.frames);
  return {report, html};
}

// The console tool runs as pasted source, without Node exports or page globals.
function domExportFixture() {
  const {FakeDocument, FakeElement} = require('./helpers/fake-dom.cjs');
  const documents = [];
  function makeDocument(title) {
    const doc = new FakeDocument();
    doc.title = title; doc.URL = 'https://synthetic.invalid/' + title + '?token=private#fragment'; doc.baseURI = doc.URL;
    doc.doctype = {};
    Object.defineProperty(doc, 'cookie', {get() { throw new Error('Cookie must never be read'); }});
    documents.push(doc);
    return doc;
  }
  const doc = makeDocument('portal');
  const blobs = [], links = [], timers = [], revoked = [];
  let failDownload = false;
  const createElement = doc.createElement.bind(doc);
  doc.createElement = function (tag) {
    const node = createElement(tag);
    if (tag === 'a') { links.push(node); node.click = () => { if (failDownload) throw new Error('download blocked'); }; }
    return node;
  };
  function clone(node, owner) {
    if (node.nodeType === 3) return owner.createTextNode(node.textContent);
    const copy = new FakeElement(node.tagName, owner);
    for (const [key, value] of Object.entries(node.attributes)) copy.setAttribute(key, value);
    copy._text = node._text;
    node.children.forEach(child => copy.appendChild(clone(child, owner)));
    return copy;
  }
  doc.implementation = {createHTMLDocument() {
    const inert = new FakeDocument(); inert.importNode = node => clone(node, inert); return inert;
  }};
  const win = {
    document: doc, URL: {createObjectURL(blob) { blobs.push(blob); return 'blob:synthetic'; }, revokeObjectURL(url) { revoked.push(url); }},
    XMLSerializer: class { serializeToString() { return '<!DOCTYPE html>'; } },
    setTimeout(callback) { timers.push(callback); }
  };
  win.parent = win; win.top = win;
  function frame(parent, title, tag = 'iframe') {
    const node = parent.createElement(tag); node.setAttribute('id', title); node.setAttribute('src', '/' + title);
    const child = makeDocument(title); node.contentWindow = {document: child}; parent.body.appendChild(node);
    return {node, doc: child};
  }
  function run(contextWindow = win, globals = {}, source = fs.readFileSync(path.resolve(__dirname, '../src/export-dom.js'), 'utf8')) {
    require('node:vm').runInNewContext(source, Object.assign({
      window: contextWindow, URL, Blob, TextEncoder, console: {info() {}, table() {}, error() {}}
    }, globals));
  }
  return {doc, win, frame, run, blobs, links, timers, revoked, blockDownload() { failDownload = true; }};
}

test('DOM console export traverses nested frames, preserves siblings after cross-origin failure and climbs from child', async () => {
  const f = domExportFixture();
  const business = f.frame(f.doc, 'business');
  f.frame(business.doc, 'nested', 'frame');
  const blocked = f.frame(f.doc, 'cross-origin');
  Object.defineProperty(blocked.node.contentWindow, 'document', {get() { throw Object.assign(new Error('blocked'), {name: 'SecurityError'}); }});
  f.frame(f.doc, 'sibling');
  const loading = f.frame(f.doc, 'loading'); loading.doc.readyState = 'loading';
  business.node.contentWindow.parent = f.win;
  f.run(business.node.contentWindow);
  const {report, html: exportedHTML} = await readExport(f);
  assert.equal(report.rootIsTop, true);
  assert.deepEqual(report.summary, {frames: 6, captured: 5, incomplete: true});
  assert.equal(report.frames[2].parentId, report.frames[1].id);
  assert.equal(report.frames[3].status, 'inaccessible');
  assert.equal(report.frames[4].title, 'sibling');
  assert.equal(report.frames[5].status, 'captured-loading');
  assert.equal(report.frames[0].url, 'https://synthetic.invalid/portal');
  assert.match(report.frames[0].html, /^<!DOCTYPE html>/);
  assert.equal(report.frames[3].html, undefined);
  assert.match(exportedHTML, /Frame could not be read: inaccessible/);
  assert.match(exportedHTML, /The same-origin policy or frame sandbox prevents DOM access/);
  f.timers[0](); assert.deepEqual(f.revoked, ['blob:synthetic']);
});

test('DOM console export captures live form values and redacts credentials without changing the page', async () => {
  const f = domExportFixture();
  f.doc.body.innerHTML = '<input name="customer" value="old"><input type="password" value="private-password"><input name="access_token" value="private-token"><textarea>old notes</textarea><input type="checkbox" checked=""><select><option selected="">A</option><option>B</option></select><iframe srcdoc="private-inline-content"></iframe>';
  const fields = f.doc.querySelectorAll('input,textarea,option');
  fields[0].value = 'current'; fields[3].value = 'current notes'; fields[4].checked = false;
  fields[5].selected = false; fields[6].selected = true;
  const before = f.doc.documentElement.outerHTML;
  f.run();
  const {report} = await readExport(f);
  const html = report.frames[0].html;
  assert.match(html, /value="current"/); assert.match(html, /current notes/);
  assert.doesNotMatch(html, /private-password|private-token|private-inline-content|checked=/);
  assert.match(html, /<option>A<\/option><option selected="">B<\/option>/);
  assert.equal(report.frames[0].redactedFields, 2);
  assert.equal(f.doc.documentElement.outerHTML, before);
  assert.equal(fields[0].value, 'current');
  assert.equal(report.frames[1].status, 'unavailable');
});

test('DOM console export bounds deep nesting and schedules blob cleanup even when download fails', async () => {
  const f = domExportFixture(); let doc = f.doc;
  for (let index = 0; index < 55; index++) doc = f.frame(doc, 'deep-' + index).doc;
  f.run();
  const {report} = await readExport(f);
  assert.equal(report.truncated, true); assert.equal(report.summary.incomplete, true);
  assert.equal(report.frames.at(-1).status, 'depth-limit');
  const blocked = domExportFixture(); blocked.blockDownload();
  assert.throws(() => blocked.run(), /download blocked/);
  blocked.timers[0](); assert.deepEqual(blocked.revoked, ['blob:synthetic']);
});

test('single HTML preserves raw Unicode source, escapes comment metadata and reports the frame count limit', async () => {
  const f = domExportFixture();
  f.doc.title = '\u6c5f\u897f\u5bfc\u51fa\ud83d\ude00 --><script>metadata must stay in its comment</script>\n\u6807\u9898';
  f.doc.head.innerHTML = '<meta charset="gbk"><style>body { color: red; }</style>';
  f.doc.body.innerHTML = '<p>\u5357\u660c\u5e02 &amp; \u4e5d\u6c5f\u5e02 \ud83d\ude00</p><script>window.example = "\u539f\u811a\u672c\u6587\u672c";</script>';
  for (let index = 0; index < 505; index++) f.frame(f.doc, 'child-' + index);
  f.run();
  const {report, html: exportedHTML} = await readExport(f);
  assert.deepEqual(report.summary, {frames: 500, captured: 500, incomplete: true});
  assert.equal(report.truncated, true);
  assert.match(exportedHTML, /<p>\u5357\u660c\u5e02 &amp; \u4e5d\u6c5f\u5e02 \ud83d\ude00<\/p>/);
  assert.match(exportedHTML, /<meta charset="gbk">/);
  assert.match(exportedHTML, /\u539f\u811a\u672c\u6587\u672c/);
  assert.equal(report.frames[0].title, f.doc.title);
  assert.equal(report.frames[0].html, '<!DOCTYPE html>\n' + f.doc.documentElement.outerHTML);
  const summary = exportedHTML.slice(0, exportedHTML.indexOf('<!DOCTYPE html>'));
  assert.doesNotMatch(summary, /--><script>/);
  assert.ok(!exportedHTML.includes('&lt;p&gt;\u5357\u660c\u5e02'));
});

test('DOM userscript original and protected source register one top-level menu and export only when clicked', async () => {
  const {assembleDOMExport} = require('../scripts/build.cjs');
  const {protectSource} = require('../scripts/build.cjs');
  const root = path.resolve(__dirname, '..');
  const original = assembleDOMExport(root);
  assert.match(original, /@noframes/);
  assert.match(original, /@grant\s+GM_registerMenuCommand/);
  assert.deepEqual(Array.from(original.matchAll(/^\/\/ @match\s+(\S+)$/gm), match => match[1]), ['http://*/*', 'https://*/*']);
  assert.match(original, /@name\s+Nested iframe DOM Exporter/);
  assert.doesNotMatch(original, /[\u3400-\u9fff]/);
  assert.match(original, /@license\s+All rights reserved/);
  assert.doesNotMatch(original, /newfms|chinatower|cwbase|rtf_frm_skbl/i);
  assert.doesNotMatch(original, /@require|@connect|unsafeWindow/);
  assert.ok(original.includes('// @version      ' + require('../package.json').version + '\n'));
  for (const source of [original, protectSource(original, root)]) {
    const f = domExportFixture(); const menus = [], alerts = [];
    const child = f.frame(f.doc, 'business'); f.frame(child.doc, 'nested');
    const globals = {GM_registerMenuCommand(label, callback) { menus.push({label, callback}); }};
    f.win.alert = message => alerts.push(message);
    f.run(f.win, globals, source);
    assert.equal(menus.length, 1); assert.match(menus[0].label, /Export/);
    assert.equal(f.blobs.length, 0, 'installation must not capture or download');
    child.node.contentWindow.top = f.win;
    f.run(child.node.contentWindow, globals, source);
    assert.equal(menus.length, 1, 'iframes must not register duplicate commands');
    menus[0].callback();
    const {report} = await readExport(f);
    assert.equal(report.summary.captured, 3);
    f.blockDownload(); menus[0].callback();
    assert.match(alerts[0], /DOM export failed: download blocked/);
    f.timers.forEach(callback => callback());
  }
});

test('standalone DOM userscript pair matches its manifest and registers menus without reading the page', () => {
  const {checkDOMExport, protectDOMExport} = require('../scripts/build.cjs');
  const manifest = checkDOMExport(root);
  assert.deepEqual(manifest.artifacts.map(item => item.variant), ['original', 'obfuscated']);
  const original = read(root, manifest.artifacts[0].path);
  assert.equal(require('../scripts/build.cjs').sha256(protectDOMExport(original, root)), manifest.artifacts[1].sha256);
  for (const artifact of manifest.artifacts) {
    const source = read(root, artifact.path);
    assert.deepEqual(Array.from(source.matchAll(/^\/\/ @match\s+(\S+)$/gm), match => match[1]), ['http://*/*', 'https://*/*']);
    assert.doesNotMatch(source, /newfms|chinatower|cwbase|rtf_frm_skbl/i);
    const win = {}; win.top = win;
    Object.defineProperty(win, 'document', {get() { throw new Error('must not capture on installation'); }});
    const menus = [];
    const run = window => require('node:vm').runInNewContext(source, {
      window, GM_registerMenuCommand(label, callback) { menus.push({label, callback}); }
    });
    run(win);
    assert.equal(menus.length, 1); assert.equal(typeof menus[0].callback, 'function');
    run({top: win});
    assert.equal(menus.length, 1);
  }
});

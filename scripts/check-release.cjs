'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {checkDOMExport} = require('./build.cjs');
const root = path.resolve(__dirname, '..');
checkDOMExport(root);
const expected = 'https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js';
const source = fs.readFileSync(path.join(root, 'export-dom.user.js'), 'utf8');
for (const key of ['updateURL', 'downloadURL']) {
  assert.equal(source.match(new RegExp('^// @' + key + '\\s+(\\S+)$', 'm'))?.[1], expected);
}
assert.match(source, /@namespace\s+local\.finance\.dom-export/);
function scan(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (['node_modules', '.git'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else {
      assert.doesNotMatch(entry.name, /[^\x00-\x7f]/, 'Project filenames must be ASCII');
      const text = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(text, /[\u3400-\u9fff]/, 'English-only project: ' + path.relative(root, file));
      assert.doesNotMatch(text, /(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/, 'Possible credential: ' + entry.name);
    }
  }
}
scan(root);
console.log('Release channel, English-only files, and credential-pattern checks passed.');

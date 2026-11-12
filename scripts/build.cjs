'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const SOURCE = 'src/export-dom.js';
const MANIFEST = 'release-manifest.json';
const ARTIFACTS = [
  {variant: 'original', path: 'export-dom.user.js'},
  {variant: 'obfuscated', path: 'export-dom.obfuscated.user.js'}
];
const HEADER = /^\/\/ ==UserScript==\r?\n[\s\S]*?^\/\/ ==\/UserScript==\r?\n/m;
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const json = (root, file) => JSON.parse(read(root, file));
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function assembleDOMExport(root = ROOT) {
  const version = json(root, 'package.json').version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid project version');
  const header = [
    '// ==UserScript==',
    '// @name         Nested iframe DOM Exporter',
    '// @namespace    local.finance.dom-export',
    '// @version      ' + version,
    '// @description  Export the current page and readable nested iframe DOM sources into one HTML file for AI analysis. Redacts recognizable credential form fields.',
    '// @author       elsebit',
    '// @homepageURL  https://github.com/elsebit/nested-iframe-dom-exporter',
    '// @supportURL   https://github.com/elsebit/nested-iframe-dom-exporter/issues',
    '// @updateURL    https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js',
    '// @downloadURL  https://raw.githubusercontent.com/elsebit/nested-iframe-dom-exporter/main/export-dom.user.js',
    '// @license      All rights reserved',
    '// @match        http://*/*',
    '// @match        https://*/*',
    '// @run-at       document-idle',
    '// @noframes',
    '// @grant        GM_registerMenuCommand',
    '// ==/UserScript==', ''
  ].join('\n');
  return header + '// Build variant: original\n' + read(root, SOURCE);
}

function protectInProcess(original, root) {
  const pkg = json(root, 'package.json'), lock = json(root, 'package-lock.json');
  const libraries = {};
  for (const name of ['terser', 'javascript-obfuscator']) {
    const directory = path.join(root, 'node_modules', name);
    const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json')));
    if (!/^\d+\.\d+\.\d+$/.test(pkg.devDependencies[name]) || installed.version !== pkg.devDependencies[name] ||
        lock.packages['node_modules/' + name].version !== installed.version) throw new Error('Build dependency mismatch; run npm ci: ' + name);
    libraries[name] = require(directory);
  }
  const header = original.match(HEADER);
  if (!header || header.index !== 0) throw new Error('Missing userscript metadata');
  const config = json(root, 'scripts/build-config.json');
  const minified = libraries.terser.minify_sync(original.slice(header[0].length), config.minify);
  if (!minified.code) throw new Error('Minification failed');
  const protectedCode = libraries['javascript-obfuscator'].obfuscate(minified.code, config.obfuscate).getObfuscatedCode();
  const reflowed = libraries.terser.minify_sync(protectedCode, {compress: false, mangle: false, format: {max_line_len: 200, comments: false}});
  if (!reflowed.code) throw new Error('Obfuscated output formatting failed');
  return header[0] + '// Build variant: obfuscated\n(function () {\n  \'use strict\';\n' + reflowed.code + '\n})();\n';
}

function protectSource(original, root = ROOT) {
  // Use a fresh process so obfuscator naming state does not affect reproducibility.
  return execFileSync(process.execPath, [__filename, '--protect', root], {
    input: original, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });
}
const protectDOMExport = protectSource;
function inputs(root) {
  return Object.fromEntries([SOURCE, 'scripts/build.cjs', 'scripts/build-config.json', 'package.json', 'package-lock.json']
    .map(file => [file, sha256(read(root, file))]));
}
function buildDOMExport(root = ROOT) {
  const original = assembleDOMExport(root);
  const values = [original, protectSource(original, root)];
  values.forEach((source, index) => new vm.Script(source, {filename: ARTIFACTS[index].path}));
  const manifest = {
    schemaVersion: 1, version: json(root, 'package.json').version,
    tools: json(root, 'package.json').devDependencies, inputs: inputs(root),
    artifacts: ARTIFACTS.map((item, index) => Object.assign({}, item, {bytes: Buffer.byteLength(values[index]), sha256: sha256(values[index])}))
  };
  manifest.artifacts.forEach((item, index) => fs.writeFileSync(path.join(root, item.path), values[index]));
  fs.writeFileSync(path.join(root, MANIFEST), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
function checkDOMExport(root = ROOT) {
  const manifest = json(root, MANIFEST), pkg = json(root, 'package.json'), lock = json(root, 'package-lock.json');
  if (lock.name !== pkg.name || lock.version !== pkg.version || lock.packages[''].name !== pkg.name || lock.packages[''].version !== pkg.version) throw new Error('Package and lockfile mismatch');
  if (manifest.schemaVersion !== 1 || manifest.version !== pkg.version || JSON.stringify(manifest.tools) !== JSON.stringify(pkg.devDependencies) ||
      JSON.stringify(manifest.inputs) !== JSON.stringify(inputs(root))) throw new Error('Build inputs changed; rebuild artifacts');
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 2) throw new Error('Both readable and obfuscated artifacts are required');
  const original = assembleDOMExport(root), header = original.match(HEADER)[0];
  ARTIFACTS.forEach((expected, index) => {
    const item = manifest.artifacts[index], bytes = fs.readFileSync(path.join(root, expected.path)), source = bytes.toString('utf8');
    if (item.path !== expected.path || item.variant !== expected.variant || item.bytes !== bytes.length || item.sha256 !== sha256(bytes) ||
        !source.startsWith(header + '// Build variant: ' + expected.variant + '\n') || (index === 0 && source !== original)) throw new Error('Artifact verification failed: ' + expected.path);
    new vm.Script(source, {filename: expected.path});
  });
  return manifest;
}

module.exports = {assembleDOMExport, protectSource, protectDOMExport, buildDOMExport, checkDOMExport, read, sha256, ARTIFACTS};
if (require.main === module) {
  if (process.argv[2] === '--protect') process.stdout.write(protectInProcess(fs.readFileSync(0, 'utf8'), process.argv[3]));
  else {
    if (process.argv[2] !== '--check') buildDOMExport();
    const manifest = checkDOMExport();
    process.stdout.write('DOM exporter verified: v' + manifest.version + ', original + obfuscated, SHA-256 matched\n');
  }
}

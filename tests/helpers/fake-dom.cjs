'use strict';

function decodeEntities(value) {
  return String(value).replace(/&nbsp;/g, '\u00a0').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseSimpleHtml(parent, source) {
  const stack = [parent];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tokens = String(source).match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+|</g) || [];
  tokens.forEach(function (token) {
    if (token.startsWith('<!--') || token.startsWith('<!')) return;
    if (/^<\//.test(token)) {
      if (stack.length > 1) stack.pop();
      return;
    }
    if (/^<[A-Za-z]/.test(token)) {
      const match = token.match(/^<([A-Za-z][\w:-]*)([\s\S]*?)\/?\s*>$/);
      if (!match) return;
      const element = parent.ownerDocument.createElement(match[1]);
      const attrSource = match[2];
      const attrPattern = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let attribute;
      while ((attribute = attrPattern.exec(attrSource))) element.setAttribute(attribute[1], decodeEntities(attribute[2] || attribute[3] || attribute[4] || ''));
      stack[stack.length - 1].appendChild(element);
      if (!voidTags.has(element.tagName.toLowerCase()) && !/\/\s*>$/.test(token)) stack.push(element);
      return;
    }
    stack[stack.length - 1].appendChild(parent.ownerDocument.createTextNode(decodeEntities(token)));
  });
}

function selectorMatches(node, selector) {
  selector = String(selector || '').trim();
  if (!selector || !node || node.nodeType !== 1) return false;
  const parts = selector.match(/^[\w-]+|#[\w-]+|\.[\w-]+|\[[^\]]+\]/g) || [];
  if (parts.join('') !== selector.replace(/\s+/g, '')) return false;
  return parts.every(function (part) {
    if (part[0] === '#') return node.id === part.slice(1);
    if (part[0] === '.') return String(node.className || '').split(/\s+/).indexOf(part.slice(1)) >= 0;
    if (part[0] === '[') {
      const match = part.match(/^\[([^\s=]+)(?:\s*=\s*["']?([^"'\]]*)["']?)?\]$/);
      if (!match) return false;
      const actual = node.getAttribute(match[1]);
      return match[2] === undefined ? actual !== null : actual === match[2];
    }
    return node.tagName.toLowerCase() === part.toLowerCase();
  });
}

class FakeTextNode {
  constructor(text, ownerDocument) { this.nodeType = 3; this.data = String(text); this.ownerDocument = ownerDocument; this.parentElement = null; }
  get textContent() { return this.data; }
  set textContent(value) { this.data = String(value == null ? '' : value); }
  get outerHTML() { return escapeText(this.data); }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.nodeType = 1;
    this.tagName = String(tagName || 'div').toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentElement = null;
    this.attributes = Object.create(null);
    this.listeners = Object.create(null);
    this.style = Object.create(null);
    this.className = '';
    this.id = '';
    this.value = '';
    this.disabled = false;
    this.hidden = false;
    this.files = [];
    this.type = '';
    this.accept = '';
    this._text = '';
  }
  appendChild(node) {
    if (node.parentElement) node.parentElement.removeChild(node);
    this.children.push(node);
    node.parentElement = this;
    return node;
  }
  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) this.children.splice(index, 1);
    node.parentElement = null;
    return node;
  }
  replaceChildren() { this.children.slice().forEach(node => this.removeChild(node)); this._text = ''; }
  get firstChild() { return this.children[0] || null; }
  get childNodes() { return this.children; }
  get textContent() { return this._text + this.children.map(node => node.textContent).join(''); }
  set textContent(value) { this.replaceChildren(); this._text = String(value == null ? '' : value); }
  get innerHTML() { return this.children.map(node => node.outerHTML || '').join('') + escapeText(this._text); }
  set innerHTML(value) { this.replaceChildren(); this._text = ''; parseSimpleHtml(this, value); }
  get outerHTML() {
    const attrs = Object.keys(this.attributes).map(name => ' ' + name + '="' + escapeText(this.attributes[name]) + '"').join('');
    const tag = this.tagName.toLowerCase();
    return '<' + tag + attrs + '>' + this.innerHTML + '</' + tag + '>';
  }
  setAttribute(name, value) {
    const key = String(name);
    const text = String(value);
    this.attributes[key] = text;
    if (key === 'id') this.id = text;
    if (key === 'class') this.className = text;
    if (key === 'value') this.value = text;
    if (key === 'type') this.type = text;
    if (key === 'accept') this.accept = text;
  }
  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, handler) { (this.listeners[type] || (this.listeners[type] = [])).push(handler); }
  removeEventListener(type, handler) { this.listeners[type] = (this.listeners[type] || []).filter(item => item !== handler); }
  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event && event.type;
    const payload = typeof event === 'object' ? event : { type: type };
    if (!payload.target) payload.target = this;
    payload.currentTarget = this;
    (this.listeners[type] || []).slice().forEach(handler => handler(payload));
    return true;
  }
  dispatch(type, values) { return this.dispatchEvent(Object.assign({ type: type, target: this }, values || {})); }
  click() { this.dispatch('click'); }
  focus() {}
  blur() {}
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const selectors = String(selector || '').split(',').map(item => item.trim()).filter(Boolean);
    const result = [];
    const visit = node => {
      node.children.forEach(child => {
        if (child.nodeType === 1 && selectors.some(item => selectorMatches(child, item)) && result.indexOf(child) < 0) result.push(child);
        if (child.querySelectorAll) visit(child);
      });
    };
    visit(this);
    return result;
  }
  find(predicate) {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const found = child.find ? child.find(predicate) : null;
      if (found) return found;
    }
    return null;
  }
  findAll(predicate, result) {
    result = result || [];
    this.children.forEach(child => {
      if (predicate(child)) result.push(child);
      if (child.findAll) child.findAll(predicate, result);
    });
    return result;
  }
  closest(selector) {
    let current = this;
    while (current) {
      if (selectorMatches(current, selector)) return current;
      current = current.parentElement;
    }
    return null;
  }
}

class FakeDocument {
  constructor() {
    this.nodeType = 9;
    this.head = new FakeElement('head', this);
    this.body = new FakeElement('body', this);
    this.documentElement = new FakeElement('html', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.readyState = 'complete';
    this.title = '';
  }
  createElement(tagName) { return new FakeElement(tagName, this); }
  createTextNode(text) { return new FakeTextNode(text, this); }
  getElementById(id) { return this.documentElement.find(node => node.nodeType === 1 && node.id === String(id)); }
  querySelector(selector) { return this.documentElement.querySelector(selector); }
  querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
}

module.exports = {FakeElement, FakeDocument};

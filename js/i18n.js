/* Tradução da página (pt-BR → en / es / fr).
   Dicionário: translations/novosite.js (window.ASTRON_TRANSLATIONS)  →  { "texto em português": { "en": "...", "es": "...", "fr": "..." } }
   O texto original em português fica no HTML; a troca de idioma substitui os textos (e alt,
   aria-label, title, placeholder, meta description) pelo dicionário e volta ao original em pt-BR.
   Textos sem entrada no dicionário (nomes de marcas, e-mails, números) ficam como estão.
   Para editar uma tradução ou adicionar um texto novo, é só mexer no JSON. */
(function () {
  "use strict";

  var ATTRS = ["alt", "aria-label", "title", "placeholder", "data-title"];
  var SKIP = /^(SCRIPT|STYLE|SVG|NOSCRIPT|TEXTAREA|CODE)$/i;

  var dict = window.ASTRON_TRANSLATIONS || null;
  var current = "pt-BR"; /* idioma desejado */
  var code = null; /* código no dicionário; null = pt-BR (original) */
  var observer = null;
  var origText = new WeakMap(); /* text node -> texto original (pt) */
  var lastText = new WeakMap(); /* text node -> último valor escrito por nós */
  var origAttr = new WeakMap(); /* elemento -> { attr: { o: original, last: escrito } } */
  var origTitle = null;

  function norm(s) {
    return s.replace(/\s+/g, " ").trim();
  }

  function lookup(text) {
    if (!code || !dict) return null;
    var entry = dict[norm(text)];
    return (entry && entry[code]) || null;
  }

  function translateNode(node) {
    var cur = node.nodeValue;
    if (!(lastText.has(node) && lastText.get(node) === cur)) origText.set(node, cur);
    var orig = origText.get(node);
    var t = lookup(orig);
    var out = orig;
    if (t) {
      out = orig.match(/^\s*/)[0] + t + orig.match(/\s*$/)[0];
      lastText.set(node, out);
    } else {
      lastText.delete(node);
    }
    if (out !== cur) node.nodeValue = out;
  }

  function translateAttrs(el) {
    var rec = origAttr.get(el);
    if (!rec) { rec = {}; origAttr.set(el, rec); }
    ATTRS.forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      var cur = el.getAttribute(name);
      var r = rec[name];
      if (!r || r.last !== cur) { r = rec[name] = { o: cur, last: null }; }
      var t = lookup(r.o);
      var out = t || r.o;
      r.last = t ? out : null;
      if (out !== cur) el.setAttribute(name, out);
    });
  }

  function translateMeta() {
    var meta = document.querySelector('meta[name="description"]');
    if (meta) translateAttrsFor(meta, "content");
    if (origTitle === null) origTitle = document.title;
    var t = lookup(origTitle);
    var out = t || origTitle;
    if (document.title !== out) document.title = out;
  }

  function translateAttrsFor(el, name) {
    var rec = origAttr.get(el);
    if (!rec) { rec = {}; origAttr.set(el, rec); }
    var cur = el.getAttribute(name);
    var r = rec[name];
    if (!r || r.last !== cur) { r = rec[name] = { o: cur, last: null }; }
    var t = lookup(r.o);
    var out = t || r.o;
    r.last = t ? out : null;
    if (out !== cur) el.setAttribute(name, out);
  }

  function walk(root) {
    if (root.nodeType === 3) {
      if (root.parentNode && !SKIP.test(root.parentNode.nodeName)) translateNode(root);
      return;
    }
    if (root.nodeType !== 1 || SKIP.test(root.nodeName)) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP.test(p.nodeName) || (p.closest && p.closest("svg,[data-no-i18n]"))) return NodeFilter.FILTER_REJECT;
        return /\S/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(translateNode);
    if (root.matches && root.matches("[alt],[aria-label],[title],[placeholder],[data-title]")) translateAttrs(root);
    root.querySelectorAll("[alt],[aria-label],[title],[placeholder],[data-title]").forEach(translateAttrs);
  }

  function run(fn) {
    if (observer) observer.disconnect();
    try { fn(); } finally { observe(); }
  }

  function observe() {
    if (!observer || !document.body) return;
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  function onMutations(records) {
    if (!dict) return;
    run(function () {
      records.forEach(function (rec) {
        if (rec.type === "childList") {
          rec.addedNodes.forEach(walk);
        } else if (rec.type === "characterData") {
          walk(rec.target);
        } else if (rec.type === "attributes") {
          translateAttrs(rec.target);
        }
      });
    });
  }

  function apply(lang) {
    current = lang;
    code = lang === "pt-BR" ? null : lang;
    if (!dict) return; /* aplica quando o dicionário chegar */
    run(function () {
      walk(document.body);
      translateMeta();
    });
  }

  if (window.MutationObserver) observer = new MutationObserver(onMutations);

  window.AstronI18n = { apply: apply };
})();

(function () {
  "use strict";

  var D = window.ASTRON;
  var IMG = D.IMG;
  var SITE = D.SITE;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function grad(g, deg) { return "linear-gradient(" + (deg || 202) + "deg," + g[0] + "," + g[1] + "," + g[0] + ")"; }
  function pageUrl(p) { return !p ? "#" : p.charAt(0) === "#" || /^https?:/.test(p) ? p : SITE + p; }
  function gatewayByName(name) {
    for (var i = 0; i < D.gateways.length; i++) if (D.gateways[i][0] === name) return D.gateways[i];
    return null;
  }
  function recurso(id) {
    for (var i = 0; i < D.recursos.length; i++) if (D.recursos[i].id === id) return D.recursos[i];
    return null;
  }

  /* Links decorativos (href="#") não pulam pro topo */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* =========================================================
     Montagem do conteúdo a partir de data.js
     ========================================================= */
  function megaLink(item) {
    var ico = '<span class="mega-ico" style="background:' + grad(item.grad) + '"><i class="' + item.icon + '"></i></span>';
    var txt = '<span class="mega-txt"><b>' + esc(item.title) + (item.soon ? '<span class="mega-soon">Em breve</span>' : "") + "</b><small>" + esc(item.desc) + "</small></span>";
    if (item.soon) return '<li><span class="mega-link mega-link--soon" aria-disabled="true">' + ico + txt + "</span></li>";
    return '<li><a class="mega-link" href="' + esc(item.href || pageUrl(item.page)) + '">' + ico + txt + "</a></li>";
  }
  function brandLink(name) {
    var g = gatewayByName(name);
    if (!g) return "";
    return '<li><a class="mega-link mega-link--text" href="#integracoes"><img class="mega-brand" src="' + IMG + "gateways-full/" + g[1] + '" alt="" style="background:linear-gradient(135deg,' + g[2] + "," + g[3] + ')"><span class="mega-txt"><b>' + esc(g[0]) + "</b></span></a></li>";
  }

  (function buildMega() {
    var rec = $("#mega-recursos");
    if (rec) rec.innerHTML = D.recursoGroups.map(function (grp) {
      return '<div class="mega-col"><p class="mega-heading">' + grp.title + '</p><ul class="mega-list">' +
        D.recursos.filter(function (r) { return r.group === grp.id; }).map(megaLink).join("") + "</ul></div>";
    }).join("");

    var int = $("#mega-integracoes");
    if (int) int.innerHTML = D.integracoesMenu.map(function (col) {
      var html = '<div class="mega-col"><p class="mega-heading">' + col.title + '</p><ul class="mega-list' + (col.twoCol ? " mega-list--2col" : "") + '">' + col.items.map(brandLink).join("") + "</ul>";
      if (col.then) html += '<p class="mega-heading mega-heading--gap">' + col.then.title + '</p><ul class="mega-list">' + col.then.items.map(brandLink).join("") + "</ul>";
      return html + "</div>";
    }).join("");

    var eco = $("#mega-ecossistema");
    if (eco) eco.innerHTML = D.ecossistemaMenu.map(function (col) {
      return '<div class="mega-col"><p class="mega-heading">' + col.title + '</p><ul class="mega-list">' + col.items.map(megaLink).join("") + "</ul></div>";
    }).join("");
  })();

  (function buildTsum() {
    var row = $("#tsum-row");
    if (!row) return;
    row.innerHTML = D.recursos.filter(function (r) { return r.tsum; }).map(function (r) {
      return '<li><a class="tsum__card" href="' + pageUrl(r.page) + '"><div class="tsum__media" style="--c:' + r.grad[1] + '">' +
        '<span class="tsum__ico"><i class="' + r.icon + '"></i></span>' +
        '<img class="tsum__photo" src="' + IMG + r.tsum + '" alt="" loading="lazy">' +
        '<span class="tsum__scrim"></span><div class="tsum__text"><h3 class="tsum__card-title">' + esc(r.title) + '</h3><p class="tsum__card-desc">' + esc(r.desc) + "</p></div></div></a></li>";
    }).join("");
  })();

  function pipeCardHTML(name, email, badge, isNew) {
    var initials = isNew ? email.slice(0, 2).toUpperCase() : name.split(" ").map(function (p) { return p.charAt(0); }).join("").slice(0, 2);
    return '<div class="pipe-card' + (isNew ? " pipe-card--new" : "") + '" role="button" tabindex="0" aria-label="Ver a venda de ' + esc(name) + '"><div class="pipe-card__top"><span class="pipe-avatar">' + esc(initials) + '</span><span class="pipe-info"><span class="pipe-name">' + esc(name) + '</span><span class="pipe-email">' + esc(email) + "</span></span></div>" +
      (badge ? '<span class="pipe-badge' + (isNew ? " pipe-badge--new" : "") + '"><i class="fa-solid ' + (isNew ? "fa-bolt" : badge.icon) + '"></i> ' + esc(isNew ? "Agora mesmo" : badge.text) + "</span>" : "") +
      '<span class="pipe-actions"><i class="fa-solid fa-phone"></i><i class="fa-regular fa-envelope"></i><i class="fa-regular fa-message"></i><i class="fa-solid fa-plus"></i></span></div>';
  }

  (function buildPipeline() {
    var board = $("#pipe-board");
    if (!board) return;
    board.innerHTML = D.pipeline.map(function (col) {
      var badge = col.badge ? { text: col.badge, icon: col.tone === "blue" ? "fa-check" : "fa-bolt" } : null;
      return '<div class="pipe-col' + (col.tone ? " pipe-col--" + col.tone : "") + '" style="--dot:' + (col.dot || (col.tone === "blue" ? "#3aa9ff" : "#ffb23a")) + '"><div class="pipe-col__head"><span class="pipe-dot"></span><span class="pipe-col__title">' + esc(col.title) + '</span><span class="pipe-col__count">' + col.count + ' usuários</span></div><div class="pipe-cards">' +
        col.people.map(function (p) { return pipeCardHTML(p[0], p[1] + "@example.com", badge); }).join("") +
        '</div><span class="pipe-add">+ Adicionar usuário</span></div>';
    }).join("");
  })();

  (function buildLogos() {
    var m = $("#logo-marquee");
    if (!m) return;
    var html = D.clientLogos.map(function (f) { return '<div class="logo-card"><img src="' + IMG + "logos/" + f + '" alt="" loading="lazy"></div>'; }).join("");
    m.innerHTML = html + html.replace(/<div class="logo-card">/g, '<div class="logo-card" aria-hidden="true">');
  })();

  function toolMediaHTML(t) {
    var inner;
    if (t.scene === "push") {
      inner = '<div class="tools__push"><div class="tools__push-toast"><span class="tools__push-ico"><i class="fa-solid fa-bell"></i></span><span class="tools__push-lines"><i></i><i></i><i></i></span></div></div>';
    } else if (t.logos) {
      inner = '<div class="tools__logos' + (t.logos.length > 3 ? " tools__logos--6" : "") + '">' + t.logos.map(function (l) { return '<span><img src="' + IMG + "gateways-full/" + l + '" alt=""></span>'; }).join("") + "</div>";
    } else {
      inner = '<img src="' + IMG + t.img + '" alt="" loading="lazy">' + (t.play ? '<span class="tools__play"><i class="fa-solid fa-play"></i></span>' : "");
    }
    return '<div class="tools__media" style="background:' + (t.logos ? t.color : "#0b0b0b") + '">' + inner + (t.pill ? '<span class="tools__pill">' + t.pill + "</span>" : "") + '<span class="tools__overlay"></span></div>';
  }

  (function buildTools() {
    var row = $("#tools-row");
    if (row) row.innerHTML = D.tools.map(function (t, i) {
      return '<article class="tools__card" tabindex="0" role="button" aria-haspopup="dialog" data-tool="' + i + '" data-reveal data-reveal-delay="' + Math.min(i, 3) * 90 + '">' + toolMediaHTML(t) +
        '<div class="tools__footer"><h4 class="tools__card-title">' + esc(t.title) + '</h4><span class="tools__category" style="background:' + t.color + '">' + esc(t.cat) + "</span></div></article>";
    }).join("");

    var bar = $("#tools-allbar");
    if (bar) bar.innerHTML = D.toolBar.map(function (id) {
      var r = recurso(id);
      var svg = D.toolBarIcons[id];
      var ico = svg ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + svg + "</svg>" : '<i class="' + r.icon + '"></i>';
      return r ? '<li><a href="' + pageUrl(r.page) + '" title="' + esc(r.title) + '" aria-label="' + esc(r.title) + '">' + ico + "</a></li>" : "";
    }).join("");
  })();

  (function buildGateways() {
    var grid = $("#gateways-grid");
    if (!grid) return;
    grid.innerHTML = D.gateways.map(function (g) {
      return '<div class="gw-card"><span class="gw-card__logo"><img src="' + IMG + "gateways-full/" + g[1] + '" alt="" loading="lazy" style="background:linear-gradient(135deg,' + g[2] + "," + g[3] + ')"></span><span class="gw-card__txt"><strong>' + esc(g[0]) + "</strong><small>" + esc(g[4] || "Gateway de Pagamento") + "</small></span></div>";
    }).join("");
  })();

  (function buildTestimonials() {
    var m = $("#testi-marquee");
    if (!m) return;
    var card = function (t, hidden) {
      return '<li' + (hidden ? ' aria-hidden="true"' : "") + '><a class="testi-card" href="https://www.youtube.com/watch?v=' + t.yt + '" data-yt="' + t.yt + '" data-title="Depoimento de ' + esc(t.name) + '"' + (hidden ? ' tabindex="-1"' : "") + '>' +
        '<img src="' + IMG + "depoimentos/" + t.img + '" alt="" loading="lazy"><span class="testi-card__scrim"></span><span class="testi-card__play"><i class="fa-solid fa-play"></i></span>' +
        '<span class="testi-card__text"><span class="testi-card__name">' + esc(t.name) + '</span><span class="testi-card__role">' + esc(t.role) + '</span><span class="testi-card__quote">“' + esc(t.quote) + "”</span></span></a></li>";
    };
    m.innerHTML = D.testimonials.map(function (t) { return card(t, false); }).join("") + D.testimonials.map(function (t) { return card(t, true); }).join("");
  })();

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* =========================================================
     Header: transparente sobre o hero, escuro com blur ao rolar
     ========================================================= */
  var navbar = $(".navbar");
  function onScroll() { navbar.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Fundo do hero: a luz segue o mouse e apaga quando ele para */
  (function () {
    var bg = $(".bg");
    if (!bg || reduceMotion) return;
    var raf = null, pending = null, idle = null;
    function apply() {
      raf = null;
      var r = bg.getBoundingClientRect();
      bg.style.setProperty("--mx", ((pending.x - r.left) / r.width) * 100 + "%");
      bg.style.setProperty("--my", ((pending.y - r.top) / r.height) * 100 + "%");
    }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = bg.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
      bg.classList.remove("is-idle");
      clearTimeout(idle);
      idle = setTimeout(function () { bg.classList.add("is-idle"); }, 1200);
    });
  })();

  /* Formulário do hero: entra direto na plataforma (/app.html) */
  (function () {
    var form = $("#hero-signup");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('input[name="email"]') || {}).value || "";
      if (email) {
        try { localStorage.setItem("astron-demo-email", email); } catch (err) {}
      }
      window.location.href = "/app.html";
    });
  })();

  /* Botões que apontam pro formulário do hero: rola e foca o e-mail */
  $$('a[href="#hero-signup"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var form = $("#hero-signup");
      if (!form) return;
      e.preventDefault();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { var i = form.querySelector("input"); if (i) i.focus({ preventScroll: true }); }, 600);
    });
  });

  /* =========================================================
     Menu mobile (drill-down montado a partir do mega-menu)
     ========================================================= */
  var burger = $("#burger");
  var menu = $("#mobile-menu");
  var mmViewport = menu && $(".mm-viewport", menu);
  var mmRoot = menu && $(".mm-root", menu);
  var mmLevelTrigger = null, menuReturnFocus = null;
  var mmFocusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function menuFocusable() {
    return [burger].concat($$(mmFocusable, menu)).filter(function (el) {
      return el && el.tabIndex >= 0 && !el.closest("[inert], [hidden]") && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
    });
  }

  function showLevel(name, focusTarget) {
    if (!mmViewport || !mmRoot) return;
    mmRoot.classList.toggle("is-behind", name !== "root");
    $$(".mm-level[data-level]", mmViewport).forEach(function (l) {
      var active = l.getAttribute("data-level") === name;
      l.classList.toggle("is-active", active);
      l.inert = !active;
      l.setAttribute("aria-hidden", active ? "false" : "true");
    });
    if (!menu.hidden) {
      var level = $('.mm-level[data-level="' + name + '"]', mmViewport);
      var target = focusTarget || (level && $(mmFocusable, level));
      if (target) target.focus({ preventScroll: true });
    }
  }

  if (mmViewport) {
    $$(".mega-panel").forEach(function (panel) {
      var lvl = document.createElement("div");
      lvl.className = "mm-level";
      lvl.setAttribute("data-level", panel.getAttribute("data-panel"));
      var back = document.createElement("button");
      back.type = "button";
      back.className = "mm-back";
      back.textContent = "Voltar";
      back.addEventListener("click", function () { showLevel("root", mmLevelTrigger); });
      var title = document.createElement("p");
      title.className = "mm-title";
      title.textContent = panel.getAttribute("data-title");
      lvl.appendChild(back);
      lvl.appendChild(title);
      $$(".mega-heading, .mega-link, .mega-cta", panel).forEach(function (el) { lvl.appendChild(el.cloneNode(true)); });
      mmViewport.appendChild(lvl);
    });
    $$("[data-open-level]", menu).forEach(function (btn) {
      btn.addEventListener("click", function () {
        mmLevelTrigger = btn;
        showLevel(btn.getAttribute("data-open-level"));
      });
    });
    showLevel("root");
  }

  var scrollLockY = 0;
  function openMenu() {
    scrollLockY = window.scrollY;
    menuReturnFocus = document.activeElement;
    burger.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    navbar.classList.add("menu-active");
    /* position:fixed no body segura o touch-scroll no iOS, devolvendo a posição depois */
    document.body.style.position = "fixed";
    document.body.style.top = -scrollLockY + "px";
    document.body.style.width = "100%";
    document.body.classList.add("menu-open");
    showLevel("root");
  }
  function closeMenu(restoreFocus) {
    var focusInside = menu.contains(document.activeElement) || document.activeElement === burger;
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    navbar.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollLockY);
    showLevel("root");
    if (restoreFocus !== false && focusInside) {
      var target = menuReturnFocus;
      if (!target || !target.isConnected || !target.getClientRects().length) target = burger.getClientRects().length ? burger : $(".logo", navbar);
      if (target) target.focus({ preventScroll: true });
    } else if (focusInside && document.activeElement !== burger) {
      document.activeElement.blur();
    }
    menuReturnFocus = null;
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.hidden ? openMenu() : closeMenu(); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (menu.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); }
      else if (e.key === "Tab") {
        var items = menuFocusable();
        if (!items.length) return;
        var index = items.indexOf(document.activeElement);
        var next = index < 0 ? (e.shiftKey ? items.length - 1 : 0) : (index + (e.shiftKey ? -1 : 1) + items.length) % items.length;
        e.preventDefault();
        items[next].focus({ preventScroll: true });
      }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1024 && !menu.hidden) closeMenu(); });
  }

  /* =========================================================
     Mega-menu desktop: hover com pequeno atraso, clique e teclado
     ========================================================= */
  (function () {
    var mega = $("#mega");
    var triggers = $$(".nav-trigger");
    var panels = $$(".mega-panel", mega);
    var desktop = window.matchMedia("(min-width: 1024px)");
    var active = null, openedAt = 0, openT = null, closeT = null;
    if (!mega || !triggers.length) return;

    function place(trigger) {
      var key = trigger.getAttribute("data-panel");
      panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === key); });
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", t === trigger ? "true" : "false"); });
      var mr = mega.getBoundingClientRect();
      var tr = trigger.getBoundingClientRect();
      mega.style.setProperty("--cx", (tr.left + tr.width / 2 - mr.left) + "px");
      if (!mega.classList.contains("is-open")) { mega.classList.add("is-open"); openedAt = Date.now(); }
      active = trigger;
    }
    function close() {
      clearTimeout(openT); clearTimeout(closeT);
      mega.classList.remove("is-open");
      triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
      active = null;
    }
    function scheduleClose() { clearTimeout(openT); clearTimeout(closeT); closeT = setTimeout(close, 160); }

    triggers.forEach(function (t) {
      t.addEventListener("mouseenter", function () {
        if (!desktop.matches) return;
        clearTimeout(closeT); clearTimeout(openT);
        openT = setTimeout(function () { place(t); }, mega.classList.contains("is-open") ? 0 : 70);
      });
      t.addEventListener("mouseleave", scheduleClose);
      t.addEventListener("click", function () {
        if (!desktop.matches) return;
        clearTimeout(openT); clearTimeout(closeT);
        /* se o hover já abriu, só fecha num clique deliberado */
        if (active === t && Date.now() - openedAt > 400) close(); else place(t);
      });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowDown" || !desktop.matches) return;
        e.preventDefault();
        place(t);
        var first = $(".mega-panel.is-active .mega-link", mega);
        if (first) first.focus();
      });
    });
    $$(".nav-link").forEach(function (l) { l.addEventListener("mouseenter", scheduleClose); });
    mega.addEventListener("mouseenter", function () { clearTimeout(closeT); clearTimeout(openT); });
    mega.addEventListener("mouseleave", scheduleClose);
    mega.addEventListener("click", function (e) { if (e.target.closest(".mega-link, .mega-cta")) close(); });
    document.addEventListener("click", function (e) { if (active && !navbar.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && active) { var t = active; close(); t.focus(); } });
    navbar.addEventListener("focusout", function (e) { if (e.relatedTarget && !navbar.contains(e.relatedTarget)) close(); });
    window.addEventListener("resize", function () { if (!desktop.matches) close(); else if (active) place(active); });
  })();

  /* =========================================================
     Mockup do hero: abas que avançam sozinhas + balões de onboarding
     ========================================================= */
  var heroTabs = $$(".hero-tab");
  var caption = $("#hero-tabs-caption");
  var frame = $("#dash-frame");
  var views = $$(".dash-view");
  var bubbles = $$(".ob-bubble");
  var TAB_MS = 8000;
  var captions = {
    captacao: "Ele preenche o cadastro e libera o acesso na hora",
    area: "Depois de entrar, ele já navega dentro da sua área de membros",
    crm: "Acompanhe cada aluno em um CRM nativo, sem planilha",
    ltv: "Ele entrou pagando R$30 e já comprou R$300 em cursos"
  };
  var obPrefer = { captacao: "left", area: "top", crm: "bottom", ltv: "top" };
  var obTarget = null;

  function targetFor(view) {
    if (view === "captacao") return $("#signup-card");
    if (view === "area") return $(".module-card");
    if (view === "crm") return $(".pipe-col");
    return $("#sale-icon");
  }

  function placeBubble(view) {
    if (!frame) return;
    if (obTarget) obTarget.classList.remove("ob-target");
    obTarget = null;
    bubbles.forEach(function (b) {
      var on = b.getAttribute("data-ob") === view;
      b.classList.toggle("is-on", on);
      b.inert = !on;
      b.setAttribute("aria-hidden", on ? "false" : "true");
      // Balões inativos voltam pra origem: posições antigas (de outra largura de tela) alargavam a página no mobile
      if (!on) { b.style.left = "0px"; b.style.top = "0px"; }
    });
    var bubble = bubbles.filter(function (b) { return b.getAttribute("data-ob") === view; })[0];
    var target = targetFor(view);
    if (!bubble || !target || !target.offsetParent) return;

    var fr = frame.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    var bw = bubble.offsetWidth, bh = bubble.offsetHeight, gap = 16, m = 8;
    var t = { l: tr.left - fr.left, t: tr.top - fr.top, w: tr.width, h: tr.height };
    var fits = {
      right: t.l + t.w + gap + bw <= fr.width - m,
      left: t.l - gap - bw >= m,
      bottom: t.t + t.h + gap + bh <= fr.height + 44,
      top: t.t - gap - bh >= m
    };
    var orders = { right: ["right", "left", "bottom", "top"], left: ["left", "right", "bottom", "top"], top: ["top", "bottom", "right", "left"], bottom: ["bottom", "top", "right", "left"] };
    var side = orders[obPrefer[view]].filter(function (s) { return fits[s]; })[0] || "bottom";
    var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
    var x, y;
    if (side === "left" || side === "right") {
      var ay = t.t + Math.min(t.h / 2, 70);
      x = side === "right" ? t.l + t.w + gap : t.l - gap - bw;
      y = clamp(ay - 28, m, fr.height - bh - m);
      bubble.style.setProperty("--ay", clamp(ay - y, 22, bh - 22) + "px");
    } else {
      var ax = t.l + t.w / 2;
      x = clamp(ax - bw / 2, m, fr.width - bw - m);
      y = side === "bottom" ? t.t + t.h + gap : t.t - gap - bh;
      bubble.style.setProperty("--ax", clamp(ax - x, 22, bw - 22) + "px");
    }
    bubble.setAttribute("data-side", side);
    bubble.style.left = Math.round(x) + "px";
    bubble.style.top = Math.round(y) + "px";
    if (view !== "captacao") { target.classList.add("ob-target"); obTarget = target; }
  }

  function setView(view) {
    var moveFocus = views.some(function (v) { return v.contains(document.activeElement); });
    views.forEach(function (v) {
      var on = v.getAttribute("data-view") === view;
      v.hidden = !on;
      v.classList.toggle("active", on);
      if (on && moveFocus) {
        var next = $('button, input, [role="button"]', v) || v;
        next.focus({ preventScroll: true });
      }
    });
  }

  var elapsed = 0, lastTs = null, paused = false, stopped = false, raf = null;
  function activeTab() { return heroTabs.filter(function (t) { return t.classList.contains("active"); })[0] || heroTabs[0]; }
  function fillOf(tab) { return $(".hero-tab__fill", tab); }

  function setTab(tab) {
    heroTabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      fillOf(t).style.width = "0%";
    });
    var view = tab.getAttribute("data-view");
    setView(view);
    if (caption) caption.textContent = captions[view] || "";
    requestAnimationFrame(function () { placeBubble(view); });
  }

  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    var focused = (frame && frame.contains(document.activeElement)) || (tabsEl && tabsEl.contains(document.activeElement));
    if (!paused && !stopped && !focused && !document.hidden) elapsed += ts - lastTs;
    lastTs = ts;
    var tab = activeTab();
    if (tab && !stopped) {
      fillOf(tab).style.width = Math.min(100, (elapsed / TAB_MS) * 100) + "%";
      if (elapsed >= TAB_MS) {
        elapsed = 0;
        setTab(heroTabs[(heroTabs.indexOf(tab) + 1) % heroTabs.length]);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function goTab(view) {
    var tab = heroTabs.filter(function (t) { return t.getAttribute("data-view") === view; })[0];
    if (tab) tab.click();
  }

  heroTabs.forEach(function (tab) {
    var view = tab.getAttribute("data-view");
    tab.id = "hero-tab-" + view;
    tab.setAttribute("aria-controls", "dash-view-" + view);
    var panel = views.filter(function (v) { return v.getAttribute("data-view") === view; })[0];
    if (panel) {
      panel.id = "dash-view-" + view;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
    }
    tab.addEventListener("click", function () {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      setTab(tab);
      fillOf(tab).style.width = "100%";
    });
    tab.addEventListener("keydown", function (e) {
      var index = heroTabs.indexOf(tab);
      if (e.key === "ArrowRight") index = (index + 1) % heroTabs.length;
      else if (e.key === "ArrowLeft") index = (index + heroTabs.length - 1) % heroTabs.length;
      else if (e.key === "Home") index = 0;
      else if (e.key === "End") index = heroTabs.length - 1;
      else return;
      e.preventDefault();
      heroTabs[index].click();
      heroTabs[index].focus({ preventScroll: true });
    });
  });
  var tabsEl = $("#hero-tabs");
  if (tabsEl) {
    tabsEl.addEventListener("pointerenter", function () { paused = true; });
    tabsEl.addEventListener("pointerleave", function () { paused = false; });
  }
  bubbles.forEach(function (b) {
    b.addEventListener("click", function () {
      var moveFocus = b.contains(document.activeElement);
      var next = heroTabs[(heroTabs.indexOf(activeTab()) + 1) % heroTabs.length];
      next.click();
      if (moveFocus) next.focus({ preventScroll: true });
    });
    b.addEventListener("pointerenter", function () { paused = true; });
    b.addEventListener("pointerleave", function () { paused = false; });
  });

  setTab(activeTab());
  if (!reduceMotion) raf = requestAnimationFrame(tick);
  window.addEventListener("resize", function () { placeBubble(activeTab().getAttribute("data-view")); });
  window.addEventListener("load", function () { placeBubble(activeTab().getAttribute("data-view")); });
  document.addEventListener("visibilitychange", function () { lastTs = null; });

  /* Interações da demonstração: cadastro → vitrine → CRM → venda */
  (function () {
    var form = $("#signup-card");
    var email = $("#demo-email");
    var name = $("#demo-name");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var mail = email && email.value.trim();
      if (mail) {
        var cards = $(".pipe-cards");
        var old = cards && $(".pipe-card--new", cards);
        if (old) old.remove();
        if (cards) cards.insertAdjacentHTML("afterbegin", pipeCardHTML((name && name.value.trim()) || "Você", mail, { text: "", icon: "" }, true));
      }
      goTab("area");
    });
    $$(".module-card").forEach(function (c) { c.addEventListener("click", function () { goTab("crm"); }); });
    var board = $("#pipe-board");
    if (board) {
      board.addEventListener("click", function (e) { if (e.target.closest(".pipe-card")) goTab("ltv"); });
      board.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target.closest(".pipe-card")) {
          e.preventDefault();
          goTab("ltv");
        }
      });
    }
  })();

  /* Setas da fileira de módulos */
  $$(".dash-arrows").forEach(function (arrows) {
    var row = document.getElementById(arrows.getAttribute("data-target"));
    var b = $$("button", arrows);
    if (!row || b.length < 2) return;
    var step = function () { var c = $(".module-card", row); return ((c ? c.getBoundingClientRect().width : 120) + 14) * 2; };
    b[0].addEventListener("click", function () { row.scrollBy({ left: -step(), behavior: "smooth" }); });
    b[1].addEventListener("click", function () { row.scrollBy({ left: step(), behavior: "smooth" }); });
  });

  /* =========================================================
     Carrosséis: setas (um card por clique) e degradê nas pontas
     ========================================================= */
  function bindCarousel(row, go) {
    var wrap = row.closest(".carousel");
    function edges() {
      if (!wrap) return;
      var max = row.scrollWidth - row.clientWidth;
      wrap.classList.toggle("at-start", row.scrollLeft <= 20);
      wrap.classList.toggle("at-end", row.scrollLeft >= max - 20);
    }
    row.addEventListener("scroll", edges, { passive: true });
    window.addEventListener("resize", edges);
    edges();

    var arrows = $('.arrows[data-target="' + row.id + '"]');
    if (!arrows) return;
    var btns = $$("button", arrows);
    function step() {
      var item = row.children[0];
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      return (item ? item.getBoundingClientRect().width : row.clientWidth * 0.8) + gap;
    }
    function move(dir) { if (go) go(dir, step()); else row.scrollBy({ left: dir * step(), behavior: "smooth" }); }
    btns[0].addEventListener("click", function () { move(-1); });
    btns[1].addEventListener("click", function () { move(1); });
  }

  ["tools-row", "gateways-grid", "plans-grid"].forEach(function (id) {
    var row = document.getElementById(id);
    if (row) bindCarousel(row);
  });

  /* Ecossistema: esteira contínua (duplica os cards e volta pro 0 na metade) */
  (function () {
    var row = $("#tsum-row");
    if (!row) return;
    var holdUntil = 0, half = 0;
    if (!reduceMotion) {
      Array.prototype.slice.call(row.children).forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        $$("a", c).forEach(function (a) { a.tabIndex = -1; });
        row.appendChild(c);
      });
      row.style.scrollBehavior = "auto";
      var SPEED = 32, pausedT = false, last = null;
      /* acumulador em float: reler scrollLeft (arredondado) faria os sub-pixels sumirem */
      var pos = row.scrollLeft;
      var measure = function () { half = row.scrollWidth / 2; };
      measure();
      window.addEventListener("resize", measure);
      var loop = function (ts) {
        if (last === null) last = ts;
        var dt = ts - last;
        last = ts;
        if (ts < holdUntil) pos = row.scrollLeft;
        else if (!pausedT) {
          pos += (SPEED * dt) / 1000;
          if (pos >= half) pos -= half;
          row.scrollLeft = pos;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      var wrap = row.closest(".carousel");
      ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { wrap.addEventListener(ev, function () { pausedT = true; }, { passive: true }); });
      ["pointerleave", "focusout", "touchend"].forEach(function (ev) { wrap.addEventListener(ev, function () { pos = row.scrollLeft; pausedT = false; }, { passive: true }); });
    }
    bindCarousel(row, function (dir, px) {
      holdUntil = performance.now() + 4000;
      if (dir < 0 && half && row.scrollLeft < px) row.scrollLeft += half;
      row.scrollBy({ left: dir * px, behavior: "smooth" });
    });
  })();

  /* =========================================================
     Scroll reveal (o conteúdo nasce visível; só esconde se o IO existir)
     ========================================================= */
  (function () {
    var els = $$("[data-reveal]");
    if (!els.length || !("IntersectionObserver" in window) || reduceMotion) return;
    els.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add("is-visible"); }, parseInt(el.getAttribute("data-reveal-delay") || "0", 10));
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* FAQ: acordeão exclusivo */
  var faqItems = $$("[data-faq]");
  faqItems.forEach(function (item) {
    var q = $(".faq__q", item);
    q.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      faqItems.forEach(function (o) { o.classList.remove("is-open"); $(".faq__q", o).setAttribute("aria-expanded", "false"); });
      if (willOpen) { item.classList.add("is-open"); q.setAttribute("aria-expanded", "true"); }
    });
  });

  /* =========================================================
     Planos: faixa de leads → plano
     ========================================================= */
  function planFor(leads) {
    for (var i = 0; i < D.plans.length; i++) if (leads <= D.plans[i].max) return D.plans[i];
    return D.plans[D.plans.length - 1];
  }
  function brl(v) { return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function intBR(v) { return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  /* Slider: 0–30% cobre a faixa grátis (1–10 leads); depois sobe em curva exponencial até 2.000 */
  (function () {
    var input = $("#pricing-slider");
    if (!input) return;
    var FREE = 10, MAXL = 2000, FREE_STOP = 0.3;
    var out = {
      tier: $("#pricing-tier-name"), price: $("#pricing-price-value"), suffix: $("#pricing-price-suffix"),
      line: $("#pricing-leads-line"), plan: $("#pricing-plan-line"), badge: $("#pricing-badge"), fill: $("#pricing-slider-fill")
    };
    function toLeads(p) {
      if (p <= FREE_STOP) return Math.max(1, Math.round(1 + (FREE - 1) * (p / FREE_STOP)));
      return Math.round(FREE * Math.pow(MAXL / FREE, (p - FREE_STOP) / (1 - FREE_STOP)));
    }
    function update() {
      var pos = (parseInt(input.value, 10) || 0) / 1000;
      var leads = toLeads(pos);
      var plan = planFor(leads);
      var word = leads === 1 ? "Lead" : "Leads";
      var label = plan.unlimited ? "+1.000" : leads.toLocaleString("pt-BR");
      if (plan.unlimited) { out.price.textContent = "Ilimitado"; out.suffix.hidden = true; }
      else if (plan.rate === null) { out.price.textContent = brl(plan.monthly); out.suffix.textContent = "/mês"; out.suffix.hidden = false; }
      else { out.price.textContent = brl(plan.rate); out.suffix.textContent = "/lead"; out.suffix.hidden = false; }
      out.tier.innerHTML = "Eu tenho <strong>" + label + "</strong> " + word + " entrando na minha base";
      out.line.innerHTML = plan.unlimited ? "Leads ativos ilimitados" : "Até <strong>" + label + "</strong> " + word + " nos últimos 30 dias";
      out.plan.textContent = leads <= FREE
        ? "Teste Grátis · 7 dias grátis, depois " + brl(plan.monthly) + " por mês"
        : "Plano " + plan.name + " · " + brl(plan.monthly) + " por mês";
      out.badge.classList.toggle("is-hidden", plan.name !== "Professional");
      out.fill.style.width = pos * 100 + "%";
    }
    input.addEventListener("input", update);
    update();
  })();

  /* Gráfico da fatura: linhas tracejadas + tooltip que interpola entre os meses */
  (function () {
    var plot = $("#paylead-plot"), svg = $("#paylead-svg");
    if (!plot || !svg) return;
    var LEADS = [8, 850, 120, 1400, 300, 1900];
    var W = 600, H = 240;
    /* escala log: 200 leads na base, 2.000 no topo */
    var yOf = function (n) { return Math.max(0.03, Math.min(0.98, 1 - (Math.log10(Math.max(n, 20)) - Math.log10(200)) / (Math.log10(2000) - Math.log10(200)))); };
    var LY = LEADS.map(yOf);
    var IY = LY.map(function (y) { return Math.min(0.99, y + 0.06); });
    var pts = function (ys) { return ys.map(function (f, i) { return (i * W / (ys.length - 1)).toFixed(1) + "," + (f * H).toFixed(1); }).join(" "); };
    $("#paylead-line-leads").setAttribute("points", pts(LY));
    $("#paylead-line-invest").setAttribute("points", pts(IY));

    var cursor = $("#paylead-cursor"), cline = $("#paylead-cursor-line"), dL = $("#paylead-dot-leads"), dI = $("#paylead-dot-invest");
    var tip = $("#paylead-tooltip"), tVal = $("#paylead-tt-value"), tLab = $("#paylead-tt-label"), tLeads = $("#paylead-tt-leads");
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    function move(clientX) {
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var rel = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      var f = rel * (LEADS.length - 1);
      var i0 = Math.min(Math.floor(f), LEADS.length - 2), t = f - i0;
      var x = rel * W;
      var yl = lerp(LY[i0], LY[i0 + 1], t) * H, yi = lerp(IY[i0], IY[i0 + 1], t) * H;
      var leads = lerp(LEADS[i0], LEADS[i0 + 1], t);
      var plan = planFor(leads);
      cline.setAttribute("x1", x); cline.setAttribute("x2", x);
      dL.setAttribute("cx", x); dL.setAttribute("cy", yl);
      dI.setAttribute("cx", x); dI.setAttribute("cy", yi);
      cursor.setAttribute("visibility", "visible");
      tVal.textContent = plan.rate === null ? brl(plan.monthly) : brl(plan.rate);
      tLab.textContent = plan.rate === null ? "por mês" : "custo por lead";
      tLeads.textContent = intBR(leads);
      var pr = plot.getBoundingClientRect();
      var left = r.left - pr.left + rel * r.width;
      tip.style.left = Math.max(60, Math.min(pr.width - 60, left)) + "px";
      tip.style.top = Math.max(20, (Math.min(yl, yi) / H) * r.height) + "px";
      tip.hidden = false;
    }
    function leave() { cursor.setAttribute("visibility", "hidden"); tip.hidden = true; }
    plot.addEventListener("mousemove", function (e) { move(e.clientX); });
    plot.addEventListener("mouseleave", leave);
    plot.addEventListener("touchmove", function (e) { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
    plot.addEventListener("touchend", leave);
  })();

  /* =========================================================
     Funil (hub): pulso percorre as 6 etapas; "Venda realizada" na 4ª
     ========================================================= */
  (function () {
    var scene = $("#hub-scene");
    if (!scene) return;
    var steps = $$(".hub-step", scene);
    var stage = $("#hub-stage"), core = $(".hub__core", scene), svgEl = $("#hub-beams"), list = $(".hub__steps", scene);
    var desktop = window.matchMedia("(min-width: 960px)");
    var NS = "http://www.w3.org/2000/svg", PULSE = 46;
    var beams = [], current = -1, timer = null, hold = null;

    function el(name, attrs) { var n = document.createElementNS(NS, name); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }

    function draw() {
      while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
      beams = [];
      if (!desktop.matches) return;
      var sr = scene.getBoundingClientRect();
      if (!sr.width) return;
      svgEl.setAttribute("viewBox", "0 0 " + sr.width + " " + sr.height);
      var st = stage.getBoundingClientRect();
      var cx = st.left - sr.left + st.width / 2, cy = st.top - sr.top + st.height / 2, R = st.width / 2 - 4;
      steps.forEach(function (step, i) {
        var r = step.getBoundingClientRect();
        var left = i < 3;
        var ax = (left ? r.right : r.left) - sr.left, ay = r.top - sr.top + r.height / 2;
        var ang = Math.atan2(ay - cy, ax - cx);
        var ex = cx + R * Math.cos(ang), ey = cy + R * Math.sin(ang);
        var dx = Math.abs(ex - ax) * 0.55;
        /* esquerda: card → bola (o lead entra); direita: bola → card (ele compra e fica) */
        var d = left
          ? "M" + ax + " " + ay + " C" + (ax + dx) + " " + ay + " " + (ex - dx) + " " + ey + " " + ex + " " + ey
          : "M" + ex + " " + ey + " C" + (ex + dx) + " " + ey + " " + (ax - dx) + " " + ay + " " + ax + " " + ay;
        var base = el("path", { d: d, "class": "hub-beam" });
        var pulse = el("path", { d: d, "class": "hub-pulse" });
        var n1 = el("circle", { cx: ax, cy: ay, r: 3.5, "class": "hub-node" });
        var n2 = el("circle", { cx: ex, cy: ey, r: 3.5, "class": "hub-node" });
        [base, pulse, n1, n2].forEach(function (n) { svgEl.appendChild(n); });
        var len = base.getTotalLength();
        pulse.style.strokeDasharray = PULSE + " " + len;
        pulse.style.strokeDashoffset = PULSE;
        beams.push({ base: base, pulse: pulse, nodes: [n1, n2], len: len });
      });
      if (current >= 0) light(current);
      if (reduceMotion) beams.forEach(function (b) { b.base.classList.add("is-lit"); });
    }
    function light(i) {
      beams.forEach(function (b, k) {
        b.base.classList.toggle("is-lit", k === i);
        b.nodes.forEach(function (n) { n.classList.toggle("is-lit", k === i); });
      });
    }
    function pulse(i) {
      var b = beams[i];
      if (!b || !b.pulse.animate) return;
      b.pulse.animate([
        { strokeDashoffset: PULSE, opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.85 },
        { strokeDashoffset: -b.len, opacity: 0 }
      ], { duration: 1100, easing: "ease-in-out" });
    }
    function rail(i) {
      if (desktop.matches || !list) return;
      var lr = list.getBoundingClientRect(), sr = steps[i].getBoundingClientRect();
      list.style.setProperty("--rail", Math.max(0, sr.top - lr.top + 12) + "px");
    }
    function activate(i) {
      current = i;
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      light(i);
      if (desktop.matches) pulse(i);
      rail(i);
      if (i === 0) core.classList.remove("is-sold");
      if (i === 3) {
        core.classList.add("is-sold");
        stage.classList.add("is-burst");
        setTimeout(function () { stage.classList.remove("is-burst"); }, 1600);
      }
    }
    function next() {
      var n = (current + 1) % steps.length;
      activate(n);
      timer = setTimeout(next, n === steps.length - 1 ? 2800 : 1900);
    }
    function start(delay) { if (reduceMotion || timer) return; timer = setTimeout(next, delay); }
    function stop() { clearTimeout(timer); timer = null; }

    steps.forEach(function (step, k) {
      function pin() { stop(); clearTimeout(hold); activate(k); }
      function resume(ms) { hold = setTimeout(function () { start(600); }, ms); }
      step.addEventListener("mouseenter", pin);
      step.addEventListener("focus", pin);
      step.addEventListener("mouseleave", function () { resume(200); });
      step.addEventListener("blur", function () { resume(200); });
      step.addEventListener("click", function () { pin(); resume(6000); });
    });

    if (reduceMotion) { core.classList.add("is-sold"); activate(1); }
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(scene);
    else window.addEventListener("resize", draw);
    window.addEventListener("load", draw);
    if ("IntersectionObserver" in window && !reduceMotion) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) start(current < 0 ? 400 : 900); else stop(); });
      }, { threshold: 0.25 }).observe(scene);
    }
  })();

  /* =========================================================
     Dialogs (ferramentas e vídeos): saída mais rápida que a entrada
     ========================================================= */
  function lockForDialog() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";
    document.body.classList.add("dialog-open");
  }
  function unlockForDialog() {
    document.body.classList.remove("dialog-open");
    document.body.style.paddingRight = "";
  }
  function closeAnimated(dlg, done) {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    if (reduceMotion) { dlg.close(); done(); return; }
    dlg.classList.add("is-closing");
    setTimeout(function () { dlg.classList.remove("is-closing"); dlg.close(); done(); }, 170);
  }

  (function () {
    var dlg = $("#tools-dialog");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var media = $("#tools-dialog-media"), chip = $("#tools-dialog-chip"), title = $("#tools-dialog-title"), content = $("#tools-dialog-content");
    var last = null;
    function open(card) {
      var t = D.tools[+card.getAttribute("data-tool")];
      media.innerHTML = toolMediaHTML(t).replace(/ loading="lazy"/g, "");
      chip.textContent = t.cat;
      chip.style.background = t.color;
      title.textContent = t.title;
      content.innerHTML = '<p class="tools-dialog__desc">' + esc(t.desc) + '</p><ul class="tools-dialog__list">' + t.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" +
        '<div class="tools-dialog__actions"><a class="btn btn--cta" href="' + D.CTA + '">Experimente grátis</a><a class="tools-dialog__link" href="' + pageUrl(t.page) + '">' + esc(t.pageLabel || "Saiba mais") + "</a></div>";
      last = card;
      lockForDialog();
      dlg.showModal();
      $("#tools-dialog-close").focus({ preventScroll: true });
    }
    function done() { unlockForDialog(); if (last) { last.focus({ preventScroll: true }); last = null; } }
    $$("[data-tool]").forEach(function (card) {
      card.addEventListener("click", function () { open(card); });
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); } });
    });
    $("#tools-dialog-close").addEventListener("click", function () { closeAnimated(dlg, done); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || (e.target.closest && e.target.closest('a[href^="#"]'))) closeAnimated(dlg, done);
    });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeAnimated(dlg, done); });
  })();

  (function () {
    var dlg = $("#video-modal");
    if (!dlg || typeof dlg.showModal !== "function") return;
    var frameEl = $("#video-modal-frame");
    var last = null;
    function done() { frameEl.textContent = ""; unlockForDialog(); if (last) { last.focus({ preventScroll: true }); last = null; } }
    document.addEventListener("click", function (e) {
      var card = e.target.closest && e.target.closest("[data-yt]");
      if (!card || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + card.getAttribute("data-yt") + "?autoplay=1&rel=0&playsinline=1";
      iframe.title = card.getAttribute("data-title") || "Vídeo";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.setAttribute("allowfullscreen", "");
      frameEl.textContent = "";
      frameEl.appendChild(iframe);
      dlg.setAttribute("aria-label", iframe.title);
      last = card;
      lockForDialog();
      dlg.showModal();
    });
    $("#video-modal-close").addEventListener("click", function () { closeAnimated(dlg, done); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeAnimated(dlg, done); });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeAnimated(dlg, done); });
  })();

  /* =========================================================
     Idioma: guarda a escolha e traduz os textos marcados com data-i18n
     ========================================================= */
  (function () {
    var root = $("#lang");
    if (!root) return;
    var btn = $(".lang__btn", root), menuEl = $("#lang-menu"), flag = $(".lang__flag", root);
    var dict = {
      en: {
        "nav.recursos": "Features", "nav.integracoes": "Integrations", "nav.ecossistema": "Ecosystem", "nav.planos": "Pricing", "nav.login": "Log in", "nav.ingressar": "Sign up",
        "hero.tagline": "Over 10,000 businesses have stopped losing leads to the internet.",
        "hero.title": "The complete members area<br> to capture, deliver<br> and retain students",
        "hero.email": "Enter your email", "hero.criar": "Create account", "hero.google": "Sign up with Google", "hero.eco": "A complete ecosystem"
      },
      es: {
        "nav.recursos": "Recursos", "nav.integracoes": "Integraciones", "nav.ecossistema": "Ecosistema", "nav.planos": "Planes", "nav.login": "Iniciar sesión", "nav.ingressar": "Registrarse",
        "hero.tagline": "Más de 10.000 negocios ya dejaron de perder leads en internet.",
        "hero.title": "El área de miembros completa<br> para captar, entregar<br> y retener alumnos",
        "hero.email": "Ingresa tu email", "hero.criar": "Crear cuenta", "hero.google": "Crear cuenta con Google", "hero.eco": "Un ecosistema completo"
      },
      fr: {
        "nav.recursos": "Fonctionnalités", "nav.integracoes": "Intégrations", "nav.ecossistema": "Écosystème", "nav.planos": "Tarifs", "nav.login": "Connexion", "nav.ingressar": "S'inscrire",
        "hero.tagline": "Plus de 10 000 entreprises ont arrêté de perdre des leads sur internet.",
        "hero.title": "L'espace membres complet<br> pour capter, livrer<br> et fidéliser vos élèves",
        "hero.email": "Votre e-mail", "hero.criar": "Créer un compte", "hero.google": "S'inscrire avec Google", "hero.eco": "Un écosystème complet"
      }
    };
    var original = {};
    $$("[data-i18n]").forEach(function (n) { original[n.getAttribute("data-i18n")] = n.textContent; });
    $$("[data-i18n-html]").forEach(function (n) { original[n.getAttribute("data-i18n-html")] = n.innerHTML; });
    $$("[data-i18n-ph]").forEach(function (n) { original[n.getAttribute("data-i18n-ph")] = n.placeholder; });

    function apply(code, flagCode) {
      if (window.AstronI18n && typeof window.AstronI18n.apply === "function") {
        window.AstronI18n.apply(code);
      }
      var d = dict[code] || original;
      var get = function (k) { return d[k] != null ? d[k] : original[k]; };
      document.documentElement.lang = code;
      $$("[data-i18n]").forEach(function (n) { n.textContent = get(n.getAttribute("data-i18n")); });
      $$("[data-i18n-html]").forEach(function (n) { n.innerHTML = get(n.getAttribute("data-i18n-html")); });
      $$("[data-i18n-ph]").forEach(function (n) { n.placeholder = get(n.getAttribute("data-i18n-ph")); });
      flag.src = IMG + "bandeiras/" + flagCode + ".webp";
      $$(".lang__opt", menuEl).forEach(function (o) { o.setAttribute("aria-selected", o.getAttribute("data-lang") === code ? "true" : "false"); });
      try { localStorage.setItem("astron-lang", code); } catch (e) { /* modo privado */ }
    }
    function setOpen(open) { menuEl.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open ? "true" : "false"); }

    $$(".lang__opt", menuEl).forEach(function (o) {
      o.addEventListener("click", function () { apply(o.getAttribute("data-lang"), o.getAttribute("data-flag")); setOpen(false); });
    });
    btn.addEventListener("click", function () { setOpen(!menuEl.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { if (!root.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    try {
      var saved = localStorage.getItem("astron-lang");
      var opt = saved && $('[data-lang="' + saved + '"]', menuEl);
      if (opt && saved !== "pt-BR") apply(saved, opt.getAttribute("data-flag"));
    } catch (e) { /* sem localStorage */ }
  })();
})();

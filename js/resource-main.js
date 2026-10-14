(function () {
  "use strict";

  /* Decorative placeholder links (nav items, chips, etc.) use href="#"
     as a mockup stand-in — stop them from jumping the page to the top. */
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
  });

  /* Cabeçalho fixo: fica transparente sobre o hero, e ganha um fundo
     escuro com blur assim que a página rola, pra continuar legível
     sobre qualquer seção por baixo. */
  (function () {
    var navbar = document.querySelector(".navbar");
    if (!navbar) return;
    function onScroll() {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* Ao atualizar (F5 / recarregar) a página sempre volta ao topo (hero), em vez de
     reabrir onde o visitante estava. Navegação normal, voltar/avançar e links com âncora seguem iguais. */
  (function () {
    var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var isReload = nav ? nav.type === "reload" : !!(performance.navigation && performance.navigation.type === 1);
    if (!isReload) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
    window.addEventListener("load", function () { window.scrollTo(0, 0); });
  })();

  /* Fundo do hero: o vídeo fica escondido atrás de um véu preto, e uma luz
     que segue o mouse (--mx/--my) abre um furo nele, revelando o vídeo.
     Parado o mouse por um tempo, a luz apaga sozinha (.bg.is-idle). */
  (function () {
    var bg = document.querySelector(".bg");
    if (!bg) return;
    var raf = null, pending = null, idleTimer = null;
    function apply() {
      raf = null;
      if (!pending) return;
      var r = bg.getBoundingClientRect();
      var x = ((pending.x - r.left) / r.width) * 100;
      var y = ((pending.y - r.top) / r.height) * 100;
      bg.style.setProperty("--mx", x + "%");
      bg.style.setProperty("--my", y + "%");
    }
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = bg.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
      bg.classList.remove("is-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { bg.classList.add("is-idle"); }, 1200);
    });
  })();

  /* O formulário de e-mail do hero leva pro cadastro real, já com o
     e-mail preenchido (em vez de só simular o envio). */
  (function () {
    var form = document.getElementById("hero-signup");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.querySelector('input[name="email"]') || {}).value || "";
      var url = "https://central.astronmembers.com.br/cadastrar?on=members";
      if (email) url += "&email=" + encodeURIComponent(email);
      window.location.href = url;
    });
  })();

  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");

  /* Drill-down mobile: cada item com sub-menu vira um nível próprio (com Voltar),
     montado a partir dos painéis do mega-menu — o conteúdo mora num lugar só. */
  var mmViewport = menu && menu.querySelector(".mm-viewport");
  var mmRoot = menu && menu.querySelector(".mm-root");
  var mmLevelTrigger = null, menuReturnFocus = null;
  var mmFocusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  if (mmRoot) mmRoot.setAttribute("data-level", "root");

  function menuFocusable() {
    return [burger].concat(Array.prototype.slice.call(menu.querySelectorAll(mmFocusable))).filter(function (el) {
      return el && el.tabIndex >= 0 && !el.closest("[inert], [hidden]") && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
    });
  }

  function showLevel(name, focusTarget) {
    if (!mmViewport || !mmRoot) return;
    mmRoot.classList.toggle("is-behind", name !== "root");
    mmViewport.querySelectorAll(".mm-level[data-level]").forEach(function (lvl) {
      var active = lvl.getAttribute("data-level") === name;
      lvl.classList.toggle("is-active", active);
      lvl.inert = !active;
      lvl.setAttribute("aria-hidden", active ? "false" : "true");
    });
    if (!menu.hidden) {
      var level = mmViewport.querySelector('.mm-level[data-level="' + name + '"]');
      var target = focusTarget || (level && level.querySelector(mmFocusable));
      if (target) target.focus({ preventScroll: true });
    }
  }

  if (mmViewport) {
    document.querySelectorAll(".mega-panel").forEach(function (panel) {
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
      panel.querySelectorAll(".mega-heading, .mega-link, .mega-cta").forEach(function (el) {
        lvl.appendChild(el.cloneNode(true));
      });
      mmViewport.appendChild(lvl);
    });

    menu.querySelectorAll("[data-open-level]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mmLevelTrigger = btn;
        showLevel(btn.getAttribute("data-open-level"));
      });
    });
    showLevel("root");
  }

  var menuLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll("a")) : [];

  function isMenuOpen() {
    return !!menu && !menu.hidden;
  }

  /* Trava o scroll da página por trás do menu. "overflow:hidden" no body
     sozinho não segura o touch-scroll no iOS/Safari — por isso tiramos o
     body do fluxo com position:fixed, guardando a posição do scroll pra
     devolver depois, exatamente onde a pessoa estava. */
  var scrollLockY = 0;

  function lockScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollLockY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.classList.add("menu-open");
  }

  function unlockScroll() {
    document.body.classList.remove("menu-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollLockY);
  }

  function openMenu() {
    if (!burger || !menu) return;
    menuReturnFocus = document.activeElement;
    burger.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    var menuNavbar = document.querySelector(".navbar");
    if (menuNavbar) menuNavbar.classList.add("menu-active");
    lockScroll();
    showLevel("root");
  }

  function closeMenu(restoreFocus) {
    if (!burger || !menu) return;
    var focusInside = menu.contains(document.activeElement) || document.activeElement === burger;
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    var menuNavbar = document.querySelector(".navbar");
    if (menuNavbar) menuNavbar.classList.remove("menu-active");
    unlockScroll();
    showLevel("root");
    if (restoreFocus !== false && focusInside) {
      var target = menuReturnFocus;
      if (!target || !target.isConnected || !target.getClientRects().length) target = burger.getClientRects().length ? burger : (menuNavbar && menuNavbar.querySelector(".logo"));
      if (target) target.focus({ preventScroll: true });
    } else if (focusInside && document.activeElement !== burger) {
      document.activeElement.blur();
    }
    menuReturnFocus = null;
  }

  if (burger) {
    burger.addEventListener("click", function () {
      isMenuOpen() ? closeMenu() : openMenu();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!isMenuOpen()) return;
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

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () { closeMenu(false); });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && isMenuOpen()) closeMenu();
  });

  /* ---------------------------------------------------
     Mega-menu desktop — abre no hover (com pequeno atraso), no clique e
     no foco por teclado; um único painel muda de tamanho/posição.
  --------------------------------------------------- */
  var header = document.querySelector(".navbar");
  var mega = document.getElementById("mega");
  var triggers = Array.prototype.slice.call(document.querySelectorAll(".nav-trigger"));
  var megaPanels = mega ? Array.prototype.slice.call(mega.querySelectorAll(".mega-panel")) : [];
  var desktopMq = window.matchMedia("(min-width: 1024px)");
  var activeTrigger = null;
  var openedAt = 0;
  var openTimer = null;
  var closeTimer = null;

  function placeMega(trigger) {
    var panel = mega.querySelector('[data-panel="' + trigger.getAttribute("data-panel") + '"]');
    var wasOpen = mega.classList.contains("is-open");

    megaPanels.forEach(function (p) {
      var on = p === panel;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-hidden", on ? "false" : "true");
    });
    triggers.forEach(function (t) {
      t.setAttribute("aria-expanded", t === trigger ? "true" : "false");
    });

    /* O painel ocupa a largura útil do header: da logo até os botões. */
    var hr = header.getBoundingClientRect();
    var cs = window.getComputedStyle(header);
    var padL = parseFloat(cs.paddingLeft) || 0;
    var padR = parseFloat(cs.paddingRight) || 0;
    var w = Math.round(hr.width - padL - padR);
    var x = padL;
    var tr = trigger.getBoundingClientRect();
    var center = tr.left - hr.left + tr.width / 2;
    megaPanels.forEach(function (p) { p.style.width = w + "px"; });
    var h = panel.offsetHeight;

    if (!wasOpen) mega.classList.add("no-anim");
    mega.style.setProperty("--w", w + "px");
    mega.style.setProperty("--h", h + "px");
    mega.style.setProperty("--x", x + "px");
    mega.style.setProperty("--cx", center - x + "px");
    if (!wasOpen) {
      void mega.offsetWidth; /* aplica a posição inicial sem transição */
      mega.classList.remove("no-anim");
      mega.classList.add("is-open");
      openedAt = Date.now();
    }
    activeTrigger = trigger;
  }

  function closeMega() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (!mega) return;
    mega.classList.remove("is-open");
    triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
    megaPanels.forEach(function (p) { p.classList.remove("is-active"); });
    activeTrigger = null;
  }

  function scheduleClose() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeMega, 160);
  }

  if (mega && header && triggers.length) {
    triggers.forEach(function (trigger) {
      trigger.addEventListener("mouseenter", function () {
        if (!desktopMq.matches) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(function () { placeMega(trigger); }, mega.classList.contains("is-open") ? 0 : 70);
      });
      trigger.addEventListener("mouseleave", scheduleClose);
      trigger.addEventListener("click", function () {
        if (!desktopMq.matches) return;
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        /* o hover já abriu: só fecha num clique deliberado (depois de 400ms) */
        if (activeTrigger === trigger && Date.now() - openedAt > 400) closeMega();
        else placeMega(trigger);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" && desktopMq.matches) {
          e.preventDefault();
          placeMega(trigger);
          var first = mega.querySelector(".mega-panel.is-active .mega-link");
          if (first) first.focus();
        }
      });
    });

    /* links simples ("Preços") também fecham o painel ao receber o mouse */
    var plainLinks = document.querySelectorAll(".nav-list .nav-link");
    plainLinks.forEach(function (l) { l.addEventListener("mouseenter", scheduleClose); });

    mega.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
    });
    mega.addEventListener("mouseleave", scheduleClose);
    mega.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".mega-link")) closeMega();
    });

    header.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !header.contains(e.relatedTarget)) closeMega();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && activeTrigger) {
        var t = activeTrigger;
        closeMega();
        t.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (activeTrigger && !header.contains(e.target)) closeMega();
    });
    window.addEventListener("resize", function () {
      if (!desktopMq.matches) closeMega();
      else if (activeTrigger) placeMega(activeTrigger);
    });
  }

  /* ---------------------------------------------------
     Hero mode tabs (Captação / Retenção / Engajamento / Vendas)
     — trocam o conteúdo do mockup, avançam sozinhas a cada 4s
       (com barra de progresso), pausam no hover e param no clique
  --------------------------------------------------- */
  var heroTabs = Array.prototype.slice.call(document.querySelectorAll(".hero-tab"));
  var heroTabsEl = document.getElementById("hero-tabs");
  var heroTabsCaption = document.getElementById("hero-tabs-caption");
  var dashViews = document.querySelectorAll(".dash-view");
  var HERO_TAB_INTERVAL = 8000;
  var heroTabCaptions = {
    retencao: "Ele preenche o cadastro e libera o acesso na hora",
    captacao: "Depois de entrar, ele já navega dentro da sua área de membros",
    engajamento: "Acompanhe cada aluno em um CRM nativo, sem planilha",
    vendas: "Ele entrou pagando R$30 e já comprou R$300 em cursos"
  };
  var heroElapsed = 0;
  var heroLastTs = null;
  var heroPaused = false;
  var heroStopped = false;
  var heroRaf = null;

  function setActiveView(view) {
    dashViews.forEach(function (panel) {
      var isMatch = panel.getAttribute("data-view") === view;
      panel.hidden = !isMatch;
      panel.classList.toggle("active", isMatch);
    });
  }


  /* ---------------------------------------------------
     Onboard do mockup — balões flutuantes com seta que guiam
     a trilha (uma etapa por aba) e apontam o elemento da tela
  --------------------------------------------------- */
  var obFrame = document.querySelector(".dash-panel-frame");
  var obBubbles = Array.prototype.slice.call(document.querySelectorAll(".ob-bubble"));
  var obTargetEl = null;
  var obPrefer = { captacao: "top", retencao: "left", engajamento: "bottom", vendas: "top" };

  function obFindTarget(view) {
    var q = function (s) { return document.querySelector(s); };
    if (view === "captacao") return q(".module-card-wrap");
    if (view === "retencao") return q('.dash-view[data-view="retencao"] .academy-modal');
    if (view === "engajamento") return q(".pipe-column");
    return q(".vendas-success-icon");
  }

  function obPlace(view) {
    if (!obFrame) return;
    if (obTargetEl) obTargetEl.classList.remove("ob-target");
    obTargetEl = null;
    obBubbles.forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-ob") === view); });
    var bubble = obBubbles.filter(function (b) { return b.getAttribute("data-ob") === view; })[0];
    var target = obFindTarget(view);
    if (!bubble || !target) return;
    var fr = obFrame.getBoundingClientRect();
    var tr = target.getBoundingClientRect();
    var bw = bubble.offsetWidth, bh = bubble.offsetHeight, gap = 16, m = 8;
    var t = { l: tr.left - fr.left, t: tr.top - fr.top, w: tr.width, h: tr.height };
    var fits = {
      right: t.l + t.w + gap + bw <= fr.width - m,
      left: t.l - gap - bw >= m,
      bottom: t.t + t.h + gap + bh <= fr.height + 44,
      top: t.t - gap - bh >= m
    };
    var order = { right: ["right", "left", "bottom", "top"], left: ["left", "right", "bottom", "top"], top: ["top", "bottom", "right", "left"], bottom: ["bottom", "top", "right", "left"] }[obPrefer[view]] || ["right", "left", "bottom", "top"];
    var side = order.filter(function (s) { return fits[s]; })[0] || "bottom";
    var x, y, clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
    if (side === "left" || side === "right") {
      var anchorY = t.t + Math.min(t.h / 2, 70);
      x = side === "right" ? t.l + t.w + gap : t.l - gap - bw;
      y = clamp(anchorY - 28, m, fr.height - bh - m);
      bubble.style.setProperty("--ay", clamp(anchorY - y, 22, bh - 22) + "px");
    } else {
      var anchorX = t.l + t.w / 2;
      x = clamp(anchorX - bw / 2, m, fr.width - bw - m);
      y = side === "bottom" ? t.t + t.h + gap : t.t - gap - bh;
      y = clamp(y, m, fr.height - bh - m);
      bubble.style.setProperty("--ax", clamp(anchorX - x, 22, bw - 22) + "px");
    }
    bubble.setAttribute("data-side", side);
    bubble.style.left = Math.round(x) + "px";
    bubble.style.top = Math.round(y) + "px";
    if (!(view === "retencao" && target.classList.contains("academy-modal"))) {
      target.classList.add("ob-target");
      obTargetEl = target;
    }
  }

  function obActiveView() {
    var tab = heroTabs.filter(function (t) { return t.classList.contains("active"); })[0];
    return tab ? tab.getAttribute("data-view") : "captacao";
  }

  obBubbles.forEach(function (b) {
    b.addEventListener("click", function () {
      var idx = heroTabs.indexOf(heroTabs.filter(function (t) { return t.classList.contains("active"); })[0]);
      heroTabs[(idx + 1) % heroTabs.length].click();
    });
    b.addEventListener("pointerenter", function () { heroPaused = true; });
    b.addEventListener("pointerleave", function () { heroPaused = false; });
  });
  window.addEventListener("resize", function () { obPlace(obActiveView()); });
  window.addEventListener("load", function () { obPlace(obActiveView()); });

  function heroTabFill(tab) {
    return tab.querySelector(".hero-tab-bar-fill");
  }

  function setHeroCaption(view) {
    if (heroTabsCaption) heroTabsCaption.textContent = heroTabCaptions[view] || "";
  }

  function setActiveHeroTab(tab) {
    heroTabs.forEach(function (t) {
      var isActive = t === tab;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      var fill = heroTabFill(t);
      if (fill) fill.style.width = "0%";
    });
    setActiveView(tab.getAttribute("data-view"));
    obPlace(tab.getAttribute("data-view"));
    setHeroCaption(tab.getAttribute("data-view"));
  }

  function heroTick(ts) {
    if (heroLastTs === null) heroLastTs = ts;
    if (!heroPaused && !heroStopped) heroElapsed += ts - heroLastTs;
    heroLastTs = ts;

    var activeTab = heroTabs.filter(function (t) {
      return t.classList.contains("active");
    })[0];
    if (activeTab && !heroStopped) {
      var fill = heroTabFill(activeTab);
      var pct = Math.min(100, (heroElapsed / HERO_TAB_INTERVAL) * 100);
      if (fill) fill.style.width = pct + "%";
      if (heroElapsed >= HERO_TAB_INTERVAL) {
        var idx = heroTabs.indexOf(activeTab);
        heroElapsed = 0;
        setActiveHeroTab(heroTabs[(idx + 1) % heroTabs.length]);
      }
    }
    heroRaf = requestAnimationFrame(heroTick);
  }

  heroTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      heroStopped = true;
      if (heroRaf) cancelAnimationFrame(heroRaf);
      heroRaf = null;
      setActiveHeroTab(tab);
      var fill = heroTabFill(tab);
      if (fill) fill.style.width = "100%";
    });
  });

  if (heroTabsEl) {
    heroTabsEl.addEventListener("pointerenter", function () { heroPaused = true; });
    heroTabsEl.addEventListener("pointerleave", function () { heroPaused = false; });
  }

  setHeroCaption("retencao");
  var heroReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!heroReducedMotion) {
    heroRaf = requestAnimationFrame(heroTick);
  }

  /* ---------------------------------------------------
     Academy login/signup modal — aparece sozinho por timer para
     demonstrar o "cadastre-se para continuar"; o e-mail digitado
     vira um card novo no funil (aba Funil automático)
  --------------------------------------------------- */
  var academyModal = document.getElementById("academy-modal");
  var academyModalClose = document.getElementById("academy-modal-close");
  var academyEmailInput = document.getElementById("academy-email-input");
  var academyEmailSubmit = document.getElementById("academy-email-submit");
  var academyShowTimer = null;
  var ACADEMY_FIRST_DELAY = 3000;
  var ACADEMY_REPEAT_DELAY = 9000;

  function showAcademyModal() {
    if (!academyModal) return;
    academyModal.hidden = false;
    if (typeof obPlace === "function" && obActiveView() === "retencao") obPlace("retencao");
  }

  function hideAcademyModal() {
    if (!academyModal) return;
    academyModal.hidden = true;
    if (academyEmailInput) academyEmailInput.value = "";
  }

  function scheduleAcademyModal(delay) {
    clearTimeout(academyShowTimer);
    academyShowTimer = setTimeout(function () {
      showAcademyModal();
    }, delay);
  }

  function startAcademyModalCycle() {
    hideAcademyModal();
    scheduleAcademyModal(ACADEMY_FIRST_DELAY);
  }

  function stopAcademyModalCycle() {
    clearTimeout(academyShowTimer);
    hideAcademyModal();
  }

  if (academyModalClose) {
    academyModalClose.addEventListener("click", function () {
      hideAcademyModal();
      scheduleAcademyModal(ACADEMY_REPEAT_DELAY);
    });
  }
  if (academyModal) {
    academyModal.addEventListener("click", function (e) {
      if (e.target === academyModal) {
        hideAcademyModal();
        scheduleAcademyModal(ACADEMY_REPEAT_DELAY);
      }
    });
  }

  /* Estado inicial do mockup: a 1ª aba (Captação de Usuários) é a academy
     com o conteúdo travado — precisa rodar só depois do modal acima estar
     pronto, senão o cycle começa cedo demais e não acha o elemento. */
  setActiveView("retencao");
  obPlace("retencao");

  var engajamentoTab = Array.prototype.find.call(heroTabs, function (t) {
    return t.getAttribute("data-view") === "engajamento";
  });

  function buildLeadCard(email) {
    var card = document.createElement("div");
    card.className = "pipe-card pipe-card--new";

    var avatar = document.createElement("span");
    avatar.className = "pipe-avatar";
    avatar.textContent = email.slice(0, 2).toUpperCase();

    var info = document.createElement("span");
    info.className = "pipe-info";
    var name = document.createElement("span");
    name.className = "pipe-name";
    name.textContent = "Você";
    var emailEl = document.createElement("span");
    emailEl.className = "pipe-email";
    emailEl.textContent = email;
    info.appendChild(name);
    info.appendChild(emailEl);

    var badge = document.createElement("span");
    badge.className = "pipe-badge pipe-badge--new";
    badge.textContent = "Agora mesmo";

    card.appendChild(avatar);
    card.appendChild(info);
    card.appendChild(badge);
    return card;
  }

  function submitAcademyEmail() {
    if (!academyEmailInput) return;
    var email = academyEmailInput.value.trim();
    if (!email) {
      academyEmailInput.focus();
      return;
    }

    var firstColumnCards = document.querySelector(".pipe-cards");
    if (firstColumnCards) {
      var existing = firstColumnCards.querySelector(".pipe-card--new");
      if (existing) existing.remove();
      firstColumnCards.insertBefore(buildLeadCard(email), firstColumnCards.firstChild);
    }

    hideAcademyModal();
    clearTimeout(academyShowTimer);
    if (engajamentoTab) engajamentoTab.click();
  }

  if (academyEmailSubmit) {
    academyEmailSubmit.addEventListener("click", submitAcademyEmail);
  }
  if (academyEmailInput) {
    academyEmailInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAcademyEmail();
      }
    });
  }

  /* Any lesson / the video itself is gated — clicking jumps straight to the modal */
  var academyClickables = document.querySelectorAll(
    ".academy-lesson, .academy-video, .academy-chip"
  );
  academyClickables.forEach(function (el) {
    el.addEventListener("click", function () {
      clearTimeout(academyShowTimer);
      showAcademyModal();
    });
  });

  /* ---------------------------------------------------
     Row scroll arrows (Continuar progresso / Seus módulos)
  --------------------------------------------------- */
  document.querySelectorAll(".dash-arrows").forEach(function (arrows) {
    var targetId = arrows.getAttribute("data-target");
    var row = targetId ? document.getElementById(targetId) : null;
    if (!row) return;

    var buttons = arrows.querySelectorAll("button");
    var prevBtn = buttons[0];
    var nextBtn = buttons[1];

    function scrollStep() {
      var card = row.querySelector("img");
      var cardWidth = card ? card.getBoundingClientRect().width : row.clientWidth * 0.8;
      var gap = 12;
      return (cardWidth + gap) * 2;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        row.scrollBy({ left: -scrollStep(), behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        row.scrollBy({ left: scrollStep(), behavior: "smooth" });
      });
    }
  });

  /* ---------------------------------------------------
     Capas dos módulos (aba 2, Área de Membros) — clicar leva pra
     aba 3 (CRM Nativo), onde o lead que já deixou o cadastro
     aparece nos pipelines
  --------------------------------------------------- */
  var crmTab = Array.prototype.find.call(heroTabs, function (t) {
    return t.getAttribute("data-view") === "engajamento";
  });
  if (crmTab) {
    document.querySelectorAll(".module-card-wrap").forEach(function (card) {
      card.addEventListener("click", function () {
        crmTab.click();
      });
    });
  }

  /* Lead do funil (Funil automático) — clicar leva à aba Vendas */
  var vendasTab = Array.prototype.find.call(heroTabs, function (t) {
    return t.getAttribute("data-view") === "vendas";
  });
  var pipeBoard = document.querySelector(".pipe-board");
  if (vendasTab && pipeBoard) {
    pipeBoard.addEventListener("click", function (e) {
      if (e.target.closest(".pipe-card")) vendasTab.click();
    });
  }

  /* ---------------------------------------------------
     Scroll reveal — fade/scale-in on entering the viewport.
     Elements ship visible by default (no class in the HTML);
     only after confirming JS + IntersectionObserver actually
     run do we add ".reveal" (the hidden starting state), so a
     JS failure never leaves content stuck invisible.
  --------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      if (el.hasAttribute("data-reveal-scale")) el.classList.add("reveal--scale");
    });

    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          revealIO.unobserve(el);
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach(function (el) {
      revealIO.observe(el);
    });
  }

  /* ---------------------------------------------------
     FAQ accordion (CTA + FAQ section) — exclusive: opening
     one item closes any other that was open, same behavior
     as the FAQ on astronmembers.com.br itself.
  --------------------------------------------------- */
  var faqItems = document.querySelectorAll("[data-faq]");
  faqItems.forEach(function (item) {
    var trigger = item.querySelector(".faq-item__q");
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        other.classList.remove("is-open");
        var otherTrigger = other.querySelector(".faq-item__q");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------------------------------------------
     Gateways grid — horizontal-scroll arrows page the
     grid by one column's width (+ gap) per click.
  --------------------------------------------------- */
  document.querySelectorAll(".gateways__arrows").forEach(function (arrows) {
    var targetId = arrows.getAttribute("data-target");
    var row = targetId ? document.getElementById(targetId) : null;
    if (!row) return;

    var buttons = arrows.querySelectorAll("button");
    var prevBtn = buttons[0];
    var nextBtn = buttons[1];

    function scrollStep() {
      var card = row.querySelector(".gateways__card");
      var cardWidth = card ? card.getBoundingClientRect().width : row.clientWidth * 0.8;
      var gap = 10;
      return cardWidth + gap;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        row.scrollBy({ left: -scrollStep(), behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        row.scrollBy({ left: scrollStep(), behavior: "smooth" });
      });
    }
  });

  /* Planos reais da Astron (mensalidade fixa por plano, conforme a tabela
     "Planos: Clubs" do admin). O cliente paga o plano em que se enquadra no
     mês, subindo ou descendo conforme os leads ativos variam. Grátis: 7 dias
     de teste e depois R$ 5/mês. rate null = mostra a mensalidade em vez do
     valor por lead (Grátis e Enterprise, que tem membros ilimitados). */
  var ASTRON_PLANS = [
    { name: "Grátis", max: 10, monthly: 5, rate: null },
    { name: "Starter", max: 200, monthly: 147, rate: 0.74 },
    { name: "Professional", max: 500, monthly: 297, rate: 0.59 },
    { name: "Scale", max: 1000, monthly: 587, rate: 0.59 },
    { name: "Enterprise", max: Infinity, monthly: 1197, rate: null, unlimited: true }
  ];
  function astronPlanFor(leads) {
    for (var i = 0; i < ASTRON_PLANS.length; i++) {
      if (leads <= ASTRON_PLANS[i].max) return ASTRON_PLANS[i];
    }
    return ASTRON_PLANS[ASTRON_PLANS.length - 1];
  }

  /* ---------------------------------------------------
     Paylead chart — draws the two dashed lines and,
     on hover/touch, interpolates the lead count between
     the two nearest months under the cursor (o custo por
     lead usa o valor fixo do plano daquela contagem, sem
     interpolar entre planos diferentes).
  --------------------------------------------------- */
  var payleadPlot = document.getElementById("paylead-plot");
  var payleadSvg = document.getElementById("paylead-svg");
  if (payleadPlot && payleadSvg) {
    /* Contagens escolhidas pra passar pelos 3 planos pagos + a faixa
       grátis ao longo do gráfico (Jan quase grátis, Fev Scale, Mar
       Starter, Abr Enterprise, Mai Professional, Jun Enterprise) — ao arrastar o
       mouse/dedo entre os meses, o tooltip atravessa Grátis → Starter →
       Professional/Scale, mostrando que o cliente só paga pelo plano
       (e faixa de preço) em que se enquadra naquele momento. */
    var PL_MONTHS = ["Jan/01", "Fev/01", "Mar/01", "Abr/01", "Mai/01", "Jun/01"];
    var PL_LEADS_Y = [0.98, 0.43, 0.93, 0.20, 0.89, 0.03];
    var PL_INVEST_Y = [0.99, 0.51, 0.99, 0.28, 0.95, 0.11];
    var PL_LEADS_COUNT = [8, 850, 120, 1400, 300, 1900];
    var PL_W = 600;
    var PL_H = 240;

    function plPoints(yFracs) {
      return yFracs
        .map(function (f, i) {
          return (i * (PL_W / (yFracs.length - 1))).toFixed(1) + "," + (f * PL_H).toFixed(1);
        })
        .join(" ");
    }

    var lineLeads = document.getElementById("paylead-line-leads");
    var lineInvest = document.getElementById("paylead-line-invest");
    if (lineLeads) lineLeads.setAttribute("points", plPoints(PL_LEADS_Y));
    if (lineInvest) lineInvest.setAttribute("points", plPoints(PL_INVEST_Y));

    var cursorGroup = document.getElementById("paylead-cursor-group");
    var cursorLine = document.getElementById("paylead-cursor-line");
    var dotLeads = document.getElementById("paylead-dot-leads");
    var dotInvest = document.getElementById("paylead-dot-invest");
    var tooltip = document.getElementById("paylead-tooltip");
    var tooltipValue = document.getElementById("paylead-tooltip-value");
    var tooltipCostLabel = document.querySelector("#paylead-tooltip .paylead__tooltip-label");
    var tooltipLeads = document.getElementById("paylead-tooltip-leads");

    function plLerp(a, b, t) {
      return a + (b - a) * t;
    }
    function plCurrency(v) {
      return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function plInt(v) {
      return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function payleadMove(clientX) {
      var rect = payleadSvg.getBoundingClientRect();
      if (!rect.width) return;
      var relX = (clientX - rect.left) / rect.width;
      relX = Math.max(0, Math.min(1, relX));

      var segF = relX * (PL_MONTHS.length - 1);
      var i0 = Math.floor(segF);
      if (i0 >= PL_MONTHS.length - 1) i0 = PL_MONTHS.length - 2;
      var i1 = i0 + 1;
      var t = segF - i0;

      var xSvg = relX * PL_W;
      var yLeads = plLerp(PL_LEADS_Y[i0], PL_LEADS_Y[i1], t) * PL_H;
      var yInvest = plLerp(PL_INVEST_Y[i0], PL_INVEST_Y[i1], t) * PL_H;
      var leadsCount = plLerp(PL_LEADS_COUNT[i0], PL_LEADS_COUNT[i1], t);
      var plan = astronPlanFor(leadsCount);

      cursorLine.setAttribute("x1", xSvg);
      cursorLine.setAttribute("x2", xSvg);
      dotLeads.setAttribute("cx", xSvg);
      dotLeads.setAttribute("cy", yLeads);
      dotInvest.setAttribute("cx", xSvg);
      dotInvest.setAttribute("cy", yInvest);
      cursorGroup.hidden = false;

      tooltipValue.textContent = plan.rate === null ? plCurrency(plan.monthly) : plCurrency(plan.rate);
      if (tooltipCostLabel) tooltipCostLabel.textContent = plan.rate !== null ? "custo por lead" : "por mês";
      tooltipLeads.textContent = plInt(leadsCount);
      var plotRect = payleadPlot.getBoundingClientRect();
      var svgLeftInPlot = rect.left - plotRect.left;
      var leftPx = svgLeftInPlot + relX * rect.width;
      var topPx = (Math.min(yLeads, yInvest) / PL_H) * rect.height;
      leftPx = Math.max(30, Math.min(plotRect.width - 30, leftPx));
      tooltip.style.left = leftPx + "px";
      tooltip.style.top = Math.max(topPx, 20) + "px";
      tooltip.hidden = false;
    }

    function payleadLeave() {
      cursorGroup.hidden = true;
      tooltip.hidden = true;
    }

    payleadPlot.addEventListener("mousemove", function (e) {
      payleadMove(e.clientX);
    });
    payleadPlot.addEventListener("mouseleave", payleadLeave);
    payleadPlot.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches && e.touches[0]) {
          payleadMove(e.touches[0].clientX);
          e.preventDefault();
        }
      },
      { passive: false }
    );
    payleadPlot.addEventListener("touchend", payleadLeave);
  }

  /* ---------------------------------------------------
     Pricing slider — arrastar (0-1000) sobe os leads ativos numa curva
     exponencial; até 10 é grátis e, acima, mostra o custo por lead ativo
     e o plano (Starter / Professional / Scale). Vem do componente
     "Pricing Slider" da Astron Pages.
  --------------------------------------------------- */
  var priceSlider = document.getElementById("pricing-slider");
  if (priceSlider) {
    var PS_RAW_MAX = 1000;
    var PS_LEADS_MAX = 2000;
    var PS_FREE_LIMIT = 10;
    var PS_FREE_STOP = 0.3;

    var pricePlanLine = document.getElementById("pricing-plan-line");
    var priceLeadsOut = document.getElementById("pricing-leads-value");
    var priceLeadsWordOut = document.getElementById("pricing-leads-word");
    var priceValueOut = document.getElementById("pricing-price-value");
    var priceSuffixOut = document.getElementById("pricing-price-suffix");
    var priceNameOut = document.getElementById("pricing-tier-name");
    var priceBadge = document.getElementById("pricing-badge");
    var priceFill = document.getElementById("pricing-slider-fill");
    var priceLeadsLine = priceLeadsOut.parentNode;
    var priceLeadsLineHTML = priceLeadsLine.innerHTML;

    function positionToLeads(pos) {
      if (pos <= PS_FREE_STOP) {
        var t1 = pos / PS_FREE_STOP;
        return Math.max(1, Math.round(1 + (PS_FREE_LIMIT - 1) * t1));
      }
      var t2 = (pos - PS_FREE_STOP) / (1 - PS_FREE_STOP);
      return Math.round(PS_FREE_LIMIT * Math.pow(PS_LEADS_MAX / PS_FREE_LIMIT, t2));
    }

    function formatBRLCents(value) {
      return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }


    function updatePriceSlider() {
      var raw = parseInt(priceSlider.value, 10) || 0;
      var pos = raw / PS_RAW_MAX;
      var leads = positionToLeads(pos);
      var isFree = leads <= PS_FREE_LIMIT;

      var plan = astronPlanFor(leads);
      if (plan.unlimited) {
        /* Enterprise é o topo: acima de 1.000 leads vira ilimitado */
        priceValueOut.textContent = "Ilimitado";
        priceSuffixOut.hidden = true;
      } else if (plan.rate === null) {
        priceValueOut.textContent = formatBRLCents(plan.monthly);
        priceSuffixOut.textContent = "/mês";
        priceSuffixOut.hidden = false;
      } else {
        priceValueOut.textContent = formatBRLCents(plan.rate);
        priceSuffixOut.textContent = "/lead";
        priceSuffixOut.hidden = false;
      }

      var leadWord = leads === 1 ? "Lead" : "Leads";
      var leadsLabel = plan.unlimited ? "+1.000" : leads.toLocaleString("pt-BR");
      if (plan.unlimited) {
        priceLeadsLine.textContent = "Leads ativos ilimitados";
      } else {
        if (!priceLeadsLine.contains(priceLeadsOut)) {
          priceLeadsLine.innerHTML = priceLeadsLineHTML;
          priceLeadsOut = document.getElementById("pricing-leads-value");
          priceLeadsWordOut = document.getElementById("pricing-leads-word");
        }
        priceLeadsOut.textContent = leadsLabel;
        if (priceLeadsWordOut) priceLeadsWordOut.textContent = leadWord;
      }
      priceNameOut.innerHTML = "Eu tenho <strong>" + leadsLabel + "</strong> " + leadWord + " entrando na minha base";
      priceBadge.classList.toggle("is-hidden", plan.name !== "Professional");
      if (pricePlanLine) {
        pricePlanLine.textContent = isFree
          ? "Teste Grátis · 7 dias grátis, depois " + formatBRLCents(plan.monthly) + " por mês"
          : "Plano " + plan.name + " · " + formatBRLCents(plan.monthly) + " por mês";
      }
      priceFill.style.width = pos * 100 + "%";
    }

    priceSlider.addEventListener("input", updatePriceSlider);
    updatePriceSlider();
  }

  /* Planos — carrossel (celular/tablet): liga/desliga o degradê de cada lado
     conforme o scroll, pra ele sumir quando não há mais cards pra esse lado
     em vez de ficar sugerindo "tem mais" no fim da lista. */
  document.querySelectorAll(".plans__carousel").forEach(function (carousel) {
    var grid = carousel.querySelector(".plans__grid--four");
    if (!grid) return;

    function updateEdges() {
      var max = grid.scrollWidth - grid.clientWidth;
      var tolerance = 28; /* cobre o "descanso" do scroll-snap perto das bordas */
      carousel.classList.toggle("at-start", grid.scrollLeft <= tolerance);
      carousel.classList.toggle("at-end", grid.scrollLeft >= max - tolerance);
    }

    grid.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    updateEdges();
    bindHscrollArrows(grid);
  });

  /* Setas de navegação dos carrosséis de ferramentas: rolam um card por clique. */
  function bindHscrollArrows(row, go) {
    var arrows = document.querySelector('.hscroll-arrows[data-target="' + row.id + '"]');
    if (!arrows) return;
    var btns = arrows.querySelectorAll("button");
    function step() {
      var item = row.children[0];
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      return (item ? item.getBoundingClientRect().width : row.clientWidth * 0.8) + gap;
    }
    function move(dir) {
      if (go) go(dir, step());
      else row.scrollBy({ left: dir * step(), behavior: "smooth" });
    }
    btns[0].addEventListener("click", function () { move(-1); });
    btns[1].addEventListener("click", function () { move(1); });
  }

  /* Ferramentas — mesmo tratamento de degradê nas pontas do carrossel */
  document.querySelectorAll(".tools__carousel").forEach(function (carousel) {
    var row = carousel.querySelector(".tools__row");
    if (!row) return;

    function updateToolsEdges() {
      var max = row.scrollWidth - row.clientWidth;
      var tolerance = 20;
      carousel.classList.toggle("at-start", row.scrollLeft <= tolerance);
      carousel.classList.toggle("at-end", row.scrollLeft >= max - tolerance);
    }

    row.addEventListener("scroll", updateToolsEdges, { passive: true });
    window.addEventListener("resize", updateToolsEdges);
    updateToolsEdges();
    bindHscrollArrows(row);
  });

  /* Ecossistema (tsum, logo abaixo do hero) — mesmo carrossel com degradê */
  document.querySelectorAll(".tsum__carousel").forEach(function (carousel) {
    var row = carousel.querySelector(".tsum__row");
    if (!row) return;

    function updateTsumEdges() {
      var max = row.scrollWidth - row.clientWidth;
      var tolerance = 20;
      carousel.classList.toggle("at-start", row.scrollLeft <= tolerance);
      carousel.classList.toggle("at-end", row.scrollLeft >= max - tolerance);
    }

    row.addEventListener("scroll", updateTsumEdges, { passive: true });
    window.addEventListener("resize", updateTsumEdges);
    updateTsumEdges();

    /* Roda sozinho em velocidade contínua (esteira), não aos pulos —
       duplica os cards uma vez pra fechar o loop sem soluço: quando passa
       da metade (fim do conjunto original), volta pro 0 instantaneamente,
       e como a segunda metade é idêntica à primeira, ninguém percebe o
       "corte". Pausa enquanto o visitante interage. */
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var tsumHoldUntil = 0;
    if (!reduceMotion) {
      var originalItems = Array.prototype.slice.call(row.children);
      originalItems.forEach(function (li) {
        var clone = li.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a").forEach(function (a) { a.tabIndex = -1; });
        row.appendChild(clone);
      });

      var TSUM_SPEED = 32; /* px por segundo */
      var tsumPaused = false;
      var tsumLastTs = null;
      var tsumHalfWidth = 0;
      /* acumulador em ponto flutuante à parte — reler row.scrollLeft (que o
         navegador arredonda pra inteiro) como base a cada frame faz os
         incrementos de sub-pixel somem no arredondamento e o carrossel trava */
      var tsumPos = row.scrollLeft;

      function measureHalf() {
        tsumHalfWidth = row.scrollWidth / 2;
      }
      measureHalf();
      window.addEventListener("resize", measureHalf);

      function tsumTick(ts) {
        if (tsumLastTs === null) tsumLastTs = ts;
        var dt = ts - tsumLastTs;
        tsumLastTs = ts;
        if (ts < tsumHoldUntil) {
          tsumPos = row.scrollLeft;
        } else if (!tsumPaused) {
          tsumPos += (TSUM_SPEED * dt) / 1000;
          if (tsumPos >= tsumHalfWidth) tsumPos -= tsumHalfWidth;
          row.scrollLeft = tsumPos;
        }
        requestAnimationFrame(tsumTick);
      }
      requestAnimationFrame(tsumTick);

      ["pointerenter", "focusin", "touchstart"].forEach(function (evt) {
        carousel.addEventListener(evt, function () { tsumPaused = true; }, { passive: true });
      });
      ["pointerleave", "focusout", "touchend"].forEach(function (evt) {
        /* resincroniza com a posição real antes de retomar — se o visitante
           arrastou manualmente enquanto pausado, continua dali em vez de
           voltar de repente pra onde a animação tinha parado */
        carousel.addEventListener(evt, function () { tsumPos = row.scrollLeft; tsumPaused = false; }, { passive: true });
      });
    }

    bindHscrollArrows(row, function (dir, stepPx) {
      /* a esteira segura por alguns segundos pra rolagem suave terminar;
         voltando do início, salta pra metade clonada antes de recuar */
      tsumHoldUntil = performance.now() + 4000;
      if (dir < 0 && tsumHalfWidth && row.scrollLeft < stepPx) row.scrollLeft += tsumHalfWidth;
      row.scrollBy({ left: dir * stepPx, behavior: "smooth" });
    });
  });


  /* ---------------------------------------------------
     Idioma — guarda a escolha, atualiza <html lang>, traduz a página
     (js/i18n.js + translations/novosite.js) e dispara "astron:languagechange".
  --------------------------------------------------- */
  var langRoot = document.getElementById("lang");
  var langBtn = langRoot && langRoot.querySelector(".lang__btn");
  var langMenu = document.getElementById("lang-menu");
  var langFlag = langRoot && langRoot.querySelector(".lang__flag");

  function applyLang(code, flag) {
    document.documentElement.setAttribute("lang", code);
    if (window.AstronI18n) window.AstronI18n.apply(code);
    if (langFlag) {
      /* mantém o prefixo relativo (páginas em /recursos/ usam ../images/) */
      var base = (langFlag.getAttribute("src") || "images/bandeiras/br.webp").replace(/bandeiras\/[a-z]+\.webp$/, "");
      langFlag.src = base + "bandeiras/" + flag + ".webp";
    }
    document.querySelectorAll("[data-lang]").forEach(function (el) {
      var on = el.getAttribute("data-lang") === code;
      if (el.hasAttribute("aria-selected")) el.setAttribute("aria-selected", on ? "true" : "false");
      if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("astron-lang", code); } catch (err) { /* modo privado */ }
    window.dispatchEvent(new CustomEvent("astron:languagechange", { detail: { lang: code } }));
  }

  function setLangMenu(open) {
    if (!langBtn || !langMenu) return;
    langMenu.classList.toggle("is-open", open);
    langBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  document.querySelectorAll(".lang__opt").forEach(function (opt) {
    opt.addEventListener("click", function () {
      applyLang(opt.getAttribute("data-lang"), opt.getAttribute("data-flag"));
      setLangMenu(false);
    });
  });

  if (langBtn) {
    langBtn.addEventListener("click", function () {
      setLangMenu(!langMenu.classList.contains("is-open"));
    });
    document.addEventListener("click", function (e) {
      if (!langRoot.contains(e.target)) setLangMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setLangMenu(false);
    });
    try {
      var savedLang = localStorage.getItem("astron-lang");
      var savedOpt = savedLang && langMenu.querySelector('[data-lang="' + savedLang + '"]');
      if (savedOpt) applyLang(savedLang, savedOpt.getAttribute("data-flag"));
    } catch (err) { /* sem localStorage */ }
  }

  /* ---------------------------------------------------
     Ferramentas — clicar num card abre o detalhe num <dialog> modal na
     própria página (visual, título, descrição, pontos e ação). Fecha com
     Esc, X, clique fora ou link interno; a saída é mais rápida que a entrada.
  --------------------------------------------------- */
  var toolsDlg = document.getElementById("tools-dialog");
  if (toolsDlg) {
    var toolsMedia = document.getElementById("tools-dialog-media");
    var toolsChip = document.getElementById("tools-dialog-chip");
    var toolsTitle = document.getElementById("tools-dialog-title");
    var toolsContent = document.getElementById("tools-dialog-content");
    var toolsClose = document.getElementById("tools-dialog-close");
    var toolsLast = null;

    function openTool(card) {
      var detail = card.querySelector(".tools__detail");
      var media = card.querySelector(".tools__media");
      var title = card.querySelector(".tools__card-title, .tools__featured-title");
      var chip = card.querySelector(".tools__category");
      if (!detail || !media || !title) return;

      toolsMedia.textContent = "";
      toolsMedia.appendChild(media.cloneNode(true));
      toolsTitle.textContent = title.textContent.trim();
      toolsChip.hidden = !chip;
      if (chip) {
        toolsChip.textContent = chip.textContent.trim();
        toolsChip.style.background = chip.style.background;
      }
      toolsContent.textContent = "";
      Array.prototype.forEach.call(detail.childNodes, function (node) {
        toolsContent.appendChild(node.cloneNode(true));
      });

      toolsLast = card;
      card.setAttribute("aria-expanded", "true");
      /* travar a rolagem faz a barra sumir e a página alargar; compensa a largura
         dela para o conteúdo não se mexer nem a rolagem pular */
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      if (sbw > 0) document.body.style.paddingRight = sbw + "px";
      document.body.classList.add("tools-dialog-open");
      if (typeof toolsDlg.showModal === "function") toolsDlg.showModal();
      else toolsDlg.setAttribute("open", "");
      toolsClose.focus({ preventScroll: true });
    }

    function onToolsClosed() {
      document.body.classList.remove("tools-dialog-open");
      document.body.style.paddingRight = "";
      if (toolsLast) {
        toolsLast.setAttribute("aria-expanded", "false");
        toolsLast.focus({ preventScroll: true });
        toolsLast = null;
      }
    }

    function finishToolsClose() {
      toolsDlg.classList.remove("is-closing");
      if (typeof toolsDlg.close === "function") toolsDlg.close();
      else toolsDlg.removeAttribute("open");
      onToolsClosed();
    }

    function closeTool() {
      if (!toolsDlg.open && !toolsDlg.hasAttribute("open")) return;
      if (toolsDlg.classList.contains("is-closing")) return;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        finishToolsClose();
        return;
      }
      toolsDlg.classList.add("is-closing");
      setTimeout(finishToolsClose, 170);
    }

    document.querySelectorAll("[data-tool]").forEach(function (card) {
      card.addEventListener("click", function () { openTool(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openTool(card);
        }
      });
    });

    toolsClose.addEventListener("click", closeTool);
    toolsDlg.addEventListener("click", function (e) {
      if (e.target === toolsDlg) {
        closeTool();
        return;
      }
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if (link) closeTool();
    });
    toolsDlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeTool();
    });
    toolsDlg.addEventListener("close", onToolsClosed);
  }

  /* ---------------------------------------------------
     Hub (funil) — o pulso percorre as 6 etapas na ordem, sobe a "Venda realizada"
     na etapa 4 e recomeça. No desktop desenha feixes de SVG entre cada card e a bola;
     no celular acende a trilha vertical. Pausa no hover/foco/toque e quando a seção
     sai da tela; com "reduzir movimento" fica tudo estático.
  --------------------------------------------------- */
  var hubScene = document.getElementById("hub-scene");
  if (hubScene) {
    var hubSection = hubScene.closest(".hub");
    var hubSteps = Array.prototype.slice.call(hubScene.querySelectorAll(".hub-step"));
    var hubStage = document.getElementById("hub-stage");
    var hubCore = hubScene.querySelector(".hub__core");
    var hubSvg = document.getElementById("hub-beams");
    var hubList = hubScene.querySelector(".hub__steps");
    var hubDesktop = window.matchMedia("(min-width: 960px)");
    var hubReduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var hubBeams = [];
    var hubActive = -1;
    var hubTimer = null;
    var hubHold = null;
    var HUB_PULSE = 46;
    var SVGNS = "http://www.w3.org/2000/svg";

    function hubEl(name, attrs) {
      var el = document.createElementNS(SVGNS, name);
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      return el;
    }

    function hubDraw() {
      while (hubSvg.firstChild) hubSvg.removeChild(hubSvg.firstChild);
      hubBeams = [];
      if (!hubDesktop.matches) return;
      var sr = hubScene.getBoundingClientRect();
      if (!sr.width) return;
      hubSvg.setAttribute("viewBox", "0 0 " + sr.width + " " + sr.height);
      var st = hubStage.getBoundingClientRect();
      var cx = st.left - sr.left + st.width / 2;
      var cy = st.top - sr.top + st.height / 2;
      var R = st.width / 2 - 4;

      hubSteps.forEach(function (step, i) {
        var r = step.getBoundingClientRect();
        var left = i < 3;
        var ax = (left ? r.right : r.left) - sr.left;
        var ay = r.top - sr.top + r.height / 2;
        var ang = Math.atan2(ay - cy, ax - cx);
        var ex = cx + R * Math.cos(ang);
        var ey = cy + R * Math.sin(ang);
        var dx = Math.abs(ex - ax) * 0.55;
        /* esquerda: card -> bola (o lead entra); direita: bola -> card (ele compra e fica) */
        var d = left
          ? "M" + ax + " " + ay + " C" + (ax + dx) + " " + ay + " " + (ex - dx) + " " + ey + " " + ex + " " + ey
          : "M" + ex + " " + ey + " C" + (ex + dx) + " " + ey + " " + (ax - dx) + " " + ay + " " + ax + " " + ay;
        var base = hubEl("path", { d: d, "class": "hub-beam" });
        var pulse = hubEl("path", { d: d, "class": "hub-pulse" });
        var nodeCard = hubEl("circle", { cx: ax, cy: ay, r: 3.5, "class": "hub-node" });
        var nodeHub = hubEl("circle", { cx: ex, cy: ey, r: 3.5, "class": "hub-node" });
        [base, pulse, nodeCard, nodeHub].forEach(function (n) { hubSvg.appendChild(n); });
        var len = base.getTotalLength();
        pulse.style.strokeDasharray = HUB_PULSE + " " + len;
        pulse.style.strokeDashoffset = HUB_PULSE;
        hubBeams.push({ base: base, pulse: pulse, nodes: [nodeCard, nodeHub], len: len });
      });
      if (hubActive >= 0) hubLight(hubActive);
      if (hubSection.classList.contains("is-static")) hubBeams.forEach(function (b) { b.base.classList.add("is-lit"); });
    }

    function hubLight(i) {
      hubBeams.forEach(function (b, k) {
        var on = k === i;
        b.base.classList.toggle("is-lit", on);
        b.nodes.forEach(function (n) { n.classList.toggle("is-lit", on); });
      });
    }

    function hubPulse(i) {
      var b = hubBeams[i];
      if (!b || !b.pulse.animate) return;
      b.pulse.animate(
        [
          { strokeDashoffset: HUB_PULSE, opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { opacity: 1, offset: 0.85 },
          { strokeDashoffset: -b.len, opacity: 0 }
        ],
        { duration: 1100, easing: "ease-in-out" }
      );
    }

    function hubRail(i) {
      if (!hubList || hubDesktop.matches) return;
      var lr = hubList.getBoundingClientRect();
      var sr = hubSteps[i].getBoundingClientRect();
      hubList.style.setProperty("--rail", Math.max(0, sr.top - lr.top + 12) + "px");
    }

    function hubActivate(i) {
      hubActive = i;
      hubSteps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      hubLight(i);
      if (hubDesktop.matches) hubPulse(i);
      hubRail(i);
      if (i === 0) hubCore.classList.remove("is-sold");
      if (i === 3) {
        hubCore.classList.add("is-sold");
        hubStage.classList.add("is-burst");
        setTimeout(function () { hubStage.classList.remove("is-burst"); }, 1600);
      }
    }

    function hubNext() {
      var n = (hubActive + 1) % hubSteps.length;
      hubActivate(n);
      hubTimer = setTimeout(hubNext, n === hubSteps.length - 1 ? 2800 : 1900);
    }
    function hubStart(delay) {
      if (hubReduced || hubTimer) return;
      hubSection.classList.add("is-live");
      hubTimer = setTimeout(hubNext, delay);
    }
    function hubStop() {
      clearTimeout(hubTimer);
      hubTimer = null;
    }

    hubSteps.forEach(function (step, k) {
      function hold() { hubStop(); clearTimeout(hubHold); hubActivate(k); }
      step.addEventListener("mouseenter", hold);
      step.addEventListener("focus", hold);
      step.addEventListener("mouseleave", function () { hubHold = setTimeout(function () { hubStart(600); }, 200); });
      step.addEventListener("blur", function () { hubHold = setTimeout(function () { hubStart(600); }, 200); });
      /* toque no celular: fixa a etapa por alguns segundos */
      step.addEventListener("click", function () {
        hold();
        hubHold = setTimeout(function () { hubStart(600); }, 6000);
      });
    });

    if (hubReduced) {
      hubSection.classList.add("is-static");
      hubCore.classList.add("is-sold");
    }

    hubDraw();
    if (window.ResizeObserver) {
      var hubRO = new ResizeObserver(function () { hubDraw(); });
      hubRO.observe(hubScene);
    } else {
      window.addEventListener("resize", hubDraw);
    }
    window.addEventListener("load", hubDraw);

    if ("IntersectionObserver" in window && !hubReduced) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) hubStart(hubActive < 0 ? 400 : 900);
          else hubStop();
        });
      }, { threshold: 0.25 }).observe(hubScene);
    }
  }
  // Vídeos de fundo abaixo do hero: só carregam e tocam quando visíveis
  (function () {
    var vids = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]")).filter(function (v) {
      return !v.classList.contains("bg-video");
    });
    if (!vids.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    vids.forEach(function (v) {
      v.removeAttribute("autoplay");
      v.preload = "none";
      v.muted = true;
    });
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          delete v.dataset.off;
          if (v.preload === "none") { v.preload = "auto"; v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.dataset.off = "1";
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px" });
    vids.forEach(function (v) { io.observe(v); });
  })();

  // Vídeos decorativos nunca mostram controles nem ficam pausados por toque:
  // celular/tablet (iOS e Android) podem exibir o ícone de pausar/play nativo.
  // Se algo pausar um deles fora da nossa própria pausa (fora da tela), volta a tocar.
  (function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call(document.querySelectorAll("video.bg-video, video.showcase__video, video.cta-faq__video"), function (v) {
      v.controls = false;
      v.removeAttribute("controls");
      v.disablePictureInPicture = true;
      v.disableRemotePlayback = true;
      v.setAttribute("tabindex", "-1");
      v.addEventListener("pause", function () {
        if (reduce || v.dataset.off || v.ended || document.hidden) return;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      });
    });
  })();
  // Botões que levam ao cadastro do hero: rola até o formulário e foca o e-mail
  document.querySelectorAll('a[href="#hero-signup"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var form = document.getElementById("hero-signup");
      if (!form) return;
      e.preventDefault();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      var input = form.querySelector("input");
      if (input) setTimeout(function () { input.focus({ preventScroll: true }); }, 600);
    });
  });
  // Botão "Falar com um especialista": abre o chat do Crisp
  document.querySelectorAll(".proofgrid__talk").forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.$crisp) window.$crisp.push(["do", "chat:open"]);
    });
  });

  /* Vídeos do YouTube nos heros dos recursos: só a miniatura carrega com a
     página; o clique abre o vídeo num popup (dialog nativo) por cima do
     fundo escurecido, em vez de tocar dentro do próprio card. Fecha com X,
     clique fora ou Esc, e o vídeo para assim que o popup fecha. Sem JS, o
     link abre o vídeo no YouTube. */
  var recVideoModal = document.getElementById("rec-video-modal");
  var recVideoFigs = document.querySelectorAll(".rec-video[data-yt], .testi-card[data-yt]");
  if (recVideoModal && recVideoFigs.length) {
    var recVideoFrame = document.getElementById("rec-video-modal-frame");
    var recVideoClose = document.getElementById("rec-video-modal-close");
    var recVideoLast = null;

    function openRecVideo(fig) {
      var title = fig.getAttribute("data-title") || "Vídeo";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + fig.getAttribute("data-yt") + "?autoplay=1&rel=0&playsinline=1";
      iframe.title = title;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      recVideoFrame.textContent = "";
      recVideoFrame.appendChild(iframe);
      recVideoModal.setAttribute("aria-label", title);

      recVideoLast = fig.querySelector(".rec-video__frame") || fig;
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      if (sbw > 0) document.body.style.paddingRight = sbw + "px";
      document.body.classList.add("rec-video-modal-open");
      if (typeof recVideoModal.showModal === "function") recVideoModal.showModal();
      else recVideoModal.setAttribute("open", "");
      recVideoClose.focus({ preventScroll: true });
    }

    function onRecVideoClosed() {
      recVideoFrame.textContent = ""; /* remove o iframe pra parar o vídeo/áudio */
      document.body.classList.remove("rec-video-modal-open");
      document.body.style.paddingRight = "";
      if (recVideoLast) {
        recVideoLast.focus({ preventScroll: true });
        recVideoLast = null;
      }
    }

    function finishRecVideoClose() {
      recVideoModal.classList.remove("is-closing");
      if (typeof recVideoModal.close === "function") recVideoModal.close();
      else recVideoModal.removeAttribute("open");
      onRecVideoClosed();
    }

    function closeRecVideo() {
      if (!recVideoModal.open && !recVideoModal.hasAttribute("open")) return;
      if (recVideoModal.classList.contains("is-closing")) return;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        finishRecVideoClose();
        return;
      }
      recVideoModal.classList.add("is-closing");
      setTimeout(finishRecVideoClose, 170);
    }

    recVideoFigs.forEach(function (fig) {
      var frame = fig.querySelector(".rec-video__frame") || fig;
      frame.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openRecVideo(fig);
      });
    });

    recVideoClose.addEventListener("click", closeRecVideo);
    recVideoModal.addEventListener("click", function (e) {
      if (e.target === recVideoModal) closeRecVideo();
    });
    recVideoModal.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeRecVideo();
    });
    recVideoModal.addEventListener("close", onRecVideoClosed);
  }
})();

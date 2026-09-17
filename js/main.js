(function () {
  "use strict";

  var PREFIX = "zlc_portfolio_v3_";
  var memoryStore = {};
  var storage = (function () {
    try {
      localStorage.setItem(PREFIX + "test", "1");
      localStorage.removeItem(PREFIX + "test");
      return localStorage;
    } catch (error) {
      return {
        getItem: function (key) { return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null; },
        setItem: function (key, value) { memoryStore[key] = String(value); },
        removeItem: function (key) { delete memoryStore[key]; },
        key: function (index) { return Object.keys(memoryStore)[index] || null; },
        get length() { return Object.keys(memoryStore).length; }
      };
    }
  })();

  function getValue(key) {
    try { return storage.getItem(PREFIX + key); } catch (error) { return null; }
  }
  function setValue(key, value) {
    try { storage.setItem(PREFIX + key, String(value)); } catch (error) { showToast("浏览器存储空间不足，请先导出配置备份"); }
  }
  function removeValue(key) {
    try { storage.removeItem(PREFIX + key); } catch (error) {}
  }
  function readJSON(key, fallback) {
    try { var value = getValue(key); return value ? JSON.parse(value) : fallback; } catch (error) { return fallback; }
  }
  function writeJSON(key, value) { setValue(key, JSON.stringify(value)); }
  function q(selector, root) { return (root || document).querySelector(selector); }
  function qa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  var toast = q("#toast");
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  /* ---------- Basic navigation and motion ---------- */
  var nav = q(".nav");
  function updateNav() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 16); }
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  var burger = q(".burger");
  var mobileMenu = q(".mobile-menu");
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = !burger.classList.contains("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      mobileMenu.classList.toggle("open", open);
      mobileMenu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
    });
    qa("a", mobileMenu).forEach(function (link) { link.addEventListener("click", closeMenu); });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function initReveal() {
    var items = qa(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -36px" });
    items.forEach(function (item) { observer.observe(item); });
  }
  initReveal();

  var hero = q(".hero");
  var orbit = q(".hero-orbit");
  if (hero && orbit && !reduceMotion) {
    hero.addEventListener("pointermove", function (event) {
      var x = (event.clientX / window.innerWidth - .5) * 16;
      var y = (event.clientY / window.innerHeight - .5) * 16;
      orbit.style.transform = "translate(" + x + "px," + y + "px)";
    });
  }

  /* ---------- Case-page context ---------- */
  var caseData = {
    "docking.html": ["亚马逊 3C 全链路", "围绕接口、性能和多设备场景建立清晰的信息层级。", "白底主图 · 功能附图 · KV · A+"],
    "transmission.html": ["无线图传系列视觉", "用专业拍摄与家庭娱乐两类场景区分人群和使用价值。", "系列主图 · Banner · 场景图"],
    "enclosure.html": ["硬盘盒商品视觉", "兼顾金属质感、性能参数与便携场景，降低理解成本。", "主附图 · A+ · 多平台适配"],
    "projector.html": ["智能投影仪视觉", "围绕画质、音质与家庭场景，将参数转译为直观体验。", "主图 · 功能附图 · 完整项目"],
    "sanq02.html": ["投影仪完整案例", "统一产品质感、核心卖点和场景氛围，形成连续浏览节奏。", "主图 · 卖点图 · A+ 详情"],
    "car.html": ["车载智能盒子", "通过系统兼容、连接方式与车内场景讲清产品价值。", "主附图 · A+ · 场景说明"],
    "store.html": ["品牌店铺与物料", "建立从旗舰店到线下展会的一致品牌识别和系列秩序。", "店铺首页 · 品牌故事 · 展会"],
    "ai.html": ["AI 辅助场景创作", "结合三维产品底图与 AI 场景探索，提高创意验证和交付效率。", "C4D · AI 合成 · 场景精修"]
  };
  var pageName = location.pathname.split("/").pop() || "index.html";
  if (caseData[pageName] && q(".page-head .container") && !q(".case-insight")) {
    var facts = caseData[pageName];
    var insight = document.createElement("div");
    insight.className = "case-insight reveal";
    insight.innerHTML = "<div><span>PROJECT TYPE</span><p>" + facts[0] + "</p></div><div><span>DESIGN APPROACH</span><p>" + facts[1] + "</p></div><div><span>DELIVERABLES</span><p>" + facts[2] + "</p></div>";
    q(".page-head .container").appendChild(insight);
    insight.classList.add("in");
  }

  /* ---------- Portfolio filters ---------- */
  qa(".filter[data-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      qa(".filter[data-filter]").forEach(function (item) { item.classList.toggle("active", item === button); });
      qa(".portfolio-gallery .gallery-item").forEach(function (item) {
        item.classList.toggle("is-hidden", filter !== "all" && item.getAttribute("data-category") !== filter);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = q("#lightbox");
  var lightboxImage = q("#lb-img");
  var lightboxCaption = q("#lb-cap");
  var lightboxCount = q("#lb-count");
  var lightboxItems = [];
  var lightboxIndex = 0;
  var editing = false;
  /* ---------- Product series carousel and page transition ---------- */
  function markSeriesPageEntry() {
    try {
      if (sessionStorage.getItem("zlc_series_transition") !== "1") return;
      sessionStorage.removeItem("zlc_series_transition");
      document.body.classList.add("series-page-enter");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { document.body.classList.add("series-page-enter--show"); });
      });
      setTimeout(function () { document.body.classList.remove("series-page-enter", "series-page-enter--show"); }, 850);
    } catch (error) {}
  }
  markSeriesPageEntry();

  function launchSeriesTransition(card) {
    var href = card.getAttribute("href");
    if (!href) return;
    if (reduceMotion) { location.href = href; return; }
    var media = q(".series-card-media", card) || card;
    var source = q("img", media);
    var title = q(".series-card-copy h3", card);
    var rect = media.getBoundingClientRect();
    var overlay = document.createElement("div");
    overlay.className = "series-transition";
    var visual = document.createElement("div");
    visual.className = "series-transition-visual";
    visual.style.left = rect.left + "px";
    visual.style.top = rect.top + "px";
    visual.style.width = rect.width + "px";
    visual.style.height = rect.height + "px";
    visual.style.borderRadius = "4px";
    if (source) {
      var image = source.cloneNode(false);
      image.removeAttribute("loading");
      visual.appendChild(image);
    }
    var label = document.createElement("div");
    label.className = "series-transition-label";
    var eyebrow = document.createElement("span");
    eyebrow.textContent = "OPENING SERIES";
    var name = document.createElement("b");
    name.textContent = title ? title.textContent : "作品系列";
    label.appendChild(eyebrow);
    label.appendChild(name);
    overlay.appendChild(visual);
    overlay.appendChild(label);
    document.body.appendChild(overlay);
    document.body.classList.add("transitioning");
    try { sessionStorage.setItem("zlc_series_transition", "1"); } catch (error) {}
    requestAnimationFrame(function () { overlay.classList.add("run"); });
    setTimeout(function () { location.href = href; }, 740);
  }

  function initSeriesCarousel() {
    var stage = q("#series-stage");
    if (!stage) return;
    var cards = qa(".series-card", stage);
    var prev = q("#series-prev");
    var next = q("#series-next");
    var dotsWrap = q("#series-dots");
    var current = q("#series-current");
    var active = 0;
    var pointerId = null;
    var startX = 0;
    var dragged = false;
    var pressedCard = null;
    var lastWheel = 0;
    var dots = [];

    cards.forEach(function (card, index) {
      if (dotsWrap) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "series-dot";
        dot.setAttribute("aria-label", "查看第 " + (index + 1) + " 个系列");
        dot.addEventListener("click", function () { setActive(index); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
      var inner = q(".series-card-inner", card);
      card.addEventListener("pointermove", function (event) {
        if (index !== active || !inner || document.body.classList.contains("editing")) return;
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - .5;
        var py = (event.clientY - rect.top) / rect.height - .5;
        inner.style.setProperty("--tilt-y", (px * 6).toFixed(2) + "deg");
        inner.style.setProperty("--tilt-x", (-py * 5).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        if (!inner) return;
        inner.style.removeProperty("--tilt-y");
        inner.style.removeProperty("--tilt-x");
      });
      card.addEventListener("click", function (event) {
        if (document.body.classList.contains("editing") || dragged) { event.preventDefault(); return; }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.detail > 0) { event.preventDefault(); return; }
        if (index !== active) { event.preventDefault(); setActive(index); return; }
        event.preventDefault();
        launchSeriesTransition(card);
      });
    });

    function setActive(index) {
      active = (index + cards.length) % cards.length;
      cards.forEach(function (card, cardIndex) {
        card.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next");
        var distance = (cardIndex - active + cards.length) % cards.length;
        var state = distance === 0 ? "is-active" : distance === 1 ? "is-next" : distance === 2 ? "is-far-next" : distance === cards.length - 1 ? "is-prev" : "is-far-prev";
        card.classList.add(state);
        card.setAttribute("tabindex", distance === 0 ? "0" : "-1");
        card.setAttribute("aria-hidden", distance === 0 ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
        dot.setAttribute("aria-current", dotIndex === active ? "true" : "false");
      });
      if (current) current.textContent = String(active + 1).padStart(2, "0");
    }
    function move(direction) { setActive(active + direction); }

    prev && prev.addEventListener("click", function () { move(-1); });
    next && next.addEventListener("click", function () { move(1); });
    stage.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "Enter") { event.preventDefault(); launchSeriesTransition(cards[active]); }
    });
    stage.addEventListener("wheel", function (event) {
      if (document.body.classList.contains("editing")) return;
      var delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8 || Date.now() - lastWheel < 620) return;
      event.preventDefault();
      lastWheel = Date.now();
      move(delta > 0 ? 1 : -1);
    }, { passive: false });
    stage.addEventListener("pointerdown", function (event) {
      if (document.body.classList.contains("editing") || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      dragged = false;
      pressedCard = event.target.closest(".series-card");
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(pointerId); } catch (error) {}
    });
    stage.addEventListener("pointermove", function (event) {
      if (pointerId !== event.pointerId) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 18) dragged = true;
      stage.style.setProperty("--drag-x", Math.max(-90, Math.min(90, delta)) + "px");
    });
    function finishDrag(event) {
      if (pointerId === null || (event && event.pointerId !== pointerId)) return;
      var delta = event ? event.clientX - startX : 0;
      var wasDragged = Math.abs(delta) > 18;
      var selectedCard = pressedCard;
      dragged = wasDragged;
      pressedCard = null;
      stage.classList.remove("is-dragging");
      stage.style.setProperty("--drag-x", "0px");
      if (Math.abs(delta) > 54) move(delta < 0 ? 1 : -1);
      else if (!wasDragged && selectedCard && !document.body.classList.contains("editing")) {
        var selectedIndex = Number(selectedCard.getAttribute("data-series-index"));
        if (selectedIndex !== active) setActive(selectedIndex);
        else launchSeriesTransition(selectedCard);
      }
      pointerId = null;
      if (wasDragged) setTimeout(function () { dragged = false; }, 60);
    }
    stage.addEventListener("pointerup", finishDrag);
    stage.addEventListener("pointercancel", finishDrag);
    setActive(0);
  }
  initSeriesCarousel();
  /* ---------- Scroll-linked product-series entrance ---------- */
  function initSeriesScrollMotion() {
    var module = q("#series");
    if (!module) return;
    module.classList.add("series-motion-enabled");
    var cards = qa(".series-card", module);
    var frame = 0;
    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function update() {
      frame = 0;
      var editMode = document.body.classList.contains("editing");
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var rect = module.getBoundingClientRect();
      var enterProgress = clamp((viewportHeight * .98 - rect.top) / (viewportHeight * .76), 0, 1);
      var exitProgress = clamp((rect.bottom - viewportHeight * .08) / (viewportHeight * .66), 0, 1);
      var exiting = !editMode && !reduceMotion && exitProgress < enterProgress;
      var raw = editMode || reduceMotion ? 1 : Math.min(enterProgress, exitProgress);
      var verticalDirection = exiting ? -1 : 1;
      module.classList.toggle("series-motion-exiting", exiting);
      var eased = raw * raw * (3 - 2 * raw);
      var remaining = 1 - eased;
      module.style.setProperty("--series-head-opacity", clamp(raw * 1.8, 0, 1).toFixed(3));
      module.style.setProperty("--series-head-y", (remaining * (exiting ? 42 : 54) * verticalDirection).toFixed(2) + "px");
      module.style.setProperty("--series-stage-opacity", clamp((raw - .08) / .72, 0, 1).toFixed(3));
      module.style.setProperty("--series-stage-y", (remaining * (exiting ? 82 : 130) * verticalDirection).toFixed(2) + "px");
      module.style.setProperty("--series-stage-scale", (.86 + eased * .14).toFixed(4));
      module.style.setProperty("--series-stage-tilt", (remaining * 8).toFixed(3) + "deg");
      module.style.setProperty("--series-stage-clip", (remaining * 18).toFixed(2) + "%");
      module.style.setProperty("--series-controls-opacity", clamp((raw - .45) / .55, 0, 1).toFixed(3));
      module.style.setProperty("--series-controls-y", (remaining * (exiting ? 20 : 28) * verticalDirection).toFixed(2) + "px");
      module.style.setProperty("--series-title-clip", (remaining * 100).toFixed(2) + "%");
      module.style.setProperty("--series-title-y", (remaining * (exiting ? 34 : 46) * verticalDirection).toFixed(2) + "px");
      var headingProgress = clamp(raw * 1.55, 0, 1);
      var sideProgress = clamp((raw - .16) / .56, 0, 1);
      module.style.setProperty("--series-kicker-opacity", headingProgress.toFixed(3));
      module.style.setProperty("--series-kicker-x", ((1 - headingProgress) * (exiting ? 34 : -34)).toFixed(2) + "px");
      module.style.setProperty("--series-side-opacity", sideProgress.toFixed(3));
      module.style.setProperty("--series-side-x", ((1 - sideProgress) * (exiting ? -42 : 42)).toFixed(2) + "px");
      module.style.setProperty("--series-count-scale", (.78 + sideProgress * .22).toFixed(4));
      module.style.setProperty("--series-bg-opacity", clamp((raw - .08) / .66, 0, 1).toFixed(3));
      module.style.setProperty("--series-bg-y", (remaining * (exiting ? 58 : 90) * verticalDirection).toFixed(2) + "px");
      module.style.setProperty("--series-bg-scale", (.82 + eased * .18).toFixed(4));

      var mobileFactor = window.innerWidth < 640 ? .56 : window.innerWidth < 900 ? .78 : 1;
      cards.forEach(function (card) {
        var side = card.classList.contains("is-prev") || card.classList.contains("is-far-prev") ? -1 :
          card.classList.contains("is-next") || card.classList.contains("is-far-next") ? 1 : 0;
        var distance = card.classList.contains("is-far-prev") || card.classList.contains("is-far-next") ? 2 :
          card.classList.contains("is-prev") || card.classList.contains("is-next") ? 1 : 0;
        var delay = distance * .055;
        var cardRaw = clamp((raw - .10 - delay) / Math.max(.34, .62 - delay), 0, 1);
        var cardEase = 1 - Math.pow(1 - cardRaw, 3);
        var cardRemaining = 1 - cardEase;
        var collapseX = -side * cardRemaining * (70 + distance * 68) * mobileFactor;
        var rise = cardRemaining * (exiting ? 138 : 205) * verticalDirection * mobileFactor + cardRemaining * distance * 42 * verticalDirection * mobileFactor;
        var startScale = distance === 0 ? .78 : .70;
        card.style.setProperty("--series-card-enter-x", collapseX.toFixed(2) + "px");
        card.style.setProperty("--series-card-enter-y", rise.toFixed(2) + "px");
        card.style.setProperty("--series-card-enter-scale", (startScale + cardEase * (1 - startScale)).toFixed(4));
        card.style.setProperty("--series-card-enter-rotate", (side * cardRemaining * (8 + distance * 4)).toFixed(3) + "deg");
        card.style.setProperty("--series-card-blur", (cardRemaining * (7 + distance * 2.5)).toFixed(2) + "px");
        card.style.setProperty("--series-card-saturation", (.56 + cardEase * .44).toFixed(3));
        card.style.setProperty("--series-card-opacity", (.04 + cardEase * .96).toFixed(3));
      });
      module.classList.toggle("series-motion-ready", raw > .68);
      module.classList.toggle("series-motion-arrived", eased > .985);
    }
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    update();
  }
  initSeriesScrollMotion();
  /* ---------- Scroll-linked AI gallery entrance ---------- */
  function initAiScrollMotion() {
    var section = q("#ai-works");
    var items = section ? qa(".ai-gallery-item", section) : [];
    if (!section || !items.length) return;
    section.classList.add("ai-motion-enabled");
    items.forEach(function (item) { item.classList.add("ai-motion-ready"); });

    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function setItemProgress(item, index, progress) {
      var eased = progress * progress * (3 - 2 * progress);
      var remaining = 1 - eased;
      var direction = index % 2 ? -1 : 1;
      var mobileFactor = window.innerWidth < 640 ? .46 : 1;
      item.style.setProperty("--ai-opacity", (.08 + eased * .92).toFixed(3));
      item.style.setProperty("--ai-shift", (direction * remaining * 118 * mobileFactor).toFixed(2) + "px");
      item.style.setProperty("--ai-rise", (remaining * 112 * mobileFactor).toFixed(2) + "px");
      item.style.setProperty("--ai-card-scale", (.86 + eased * .14).toFixed(4));
      item.style.setProperty("--ai-tilt", (direction * remaining * -2.3).toFixed(3) + "deg");
      item.style.setProperty("--ai-plane-tilt", (remaining * 4.2).toFixed(3) + "deg");
      item.style.setProperty("--ai-clip-x", (remaining * 19).toFixed(2) + "%");
      item.style.setProperty("--ai-clip-y", (remaining * 12).toFixed(2) + "%");
      item.style.setProperty("--ai-img-scale", (1.17 - eased * .17).toFixed(4));
      item.style.setProperty("--ai-progress", eased.toFixed(4));
      item.classList.toggle("ai-arrived", eased > .985);
    }

    var frame = 0;
    function update() {
      frame = 0;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var editMode = document.body.classList.contains("editing");
      items.forEach(function (item, index) {
        var rect = item.getBoundingClientRect();
        var start = viewportHeight * .96;
        var distance = viewportHeight * (window.innerWidth < 640 ? .66 : .74);
        var progress = editMode ? 1 : clamp((start - rect.top) / distance, 0, 1);
        setItemProgress(item, index, progress);
      });
    }
    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    new MutationObserver(scheduleUpdate).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    if (!reduceMotion) {
      section.addEventListener("pointermove", function (event) {
        if (document.body.classList.contains("editing")) return;
        var bounds = section.getBoundingClientRect();
        var x = clamp((event.clientX - bounds.left) / Math.max(1, bounds.width) - .5, -.5, .5);
        var y = clamp((event.clientY - bounds.top) / Math.max(1, bounds.height) - .5, -.5, .5);
        items.forEach(function (item, index) {
          var depth = index % 2 ? -.72 : 1;
          item.style.setProperty("--ai-mouse-x", (x * 18 * depth).toFixed(2) + "px");
          item.style.setProperty("--ai-mouse-y", (y * 12 * depth).toFixed(2) + "px");
        });
      });
      section.addEventListener("pointerleave", function () {
        items.forEach(function (item) {
          item.style.setProperty("--ai-mouse-x", "0px");
          item.style.setProperty("--ai-mouse-y", "0px");
        });
      });
    }

    if (reduceMotion) items.forEach(function (item, index) { setItemProgress(item, index, 1); });
    else update();
  }
  initAiScrollMotion();

  function captionFor(image) {
    return image.getAttribute("data-caption") || image.alt || (image.closest("figure") && q("figcaption", image.closest("figure")) ? q("figcaption", image.closest("figure")).innerText : "");
  }
  function refreshLightboxItems() {
    lightboxItems = qa(".js-lightbox, .pitem img").filter(function (image, index, all) { return all.indexOf(image) === index; });
    lightboxItems.forEach(function (image) {
      if (image.dataset.lightboxBound) return;
      image.dataset.lightboxBound = "1";
      image.addEventListener("click", function (event) {
        if (editing) return;
        event.preventDefault();
        openLightbox(lightboxItems.indexOf(image));
      });
    });
  }
  function renderLightbox() {
    var image = lightboxItems[lightboxIndex];
    if (!image || !lightboxImage) return;
    lightboxImage.src = image.getAttribute("data-src") || image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "作品大图";
    if (lightboxCaption) lightboxCaption.textContent = captionFor(image);
    if (lightboxCount) lightboxCount.textContent = String(lightboxIndex + 1).padStart(2, "0") + " / " + String(lightboxItems.length).padStart(2, "0");
  }
  function openLightbox(index) {
    if (!lightbox || !lightboxItems.length || index < 0) return;
    lightboxIndex = index;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lb-open");
    q("#lb-close") && q("#lb-close").focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lb-open");
  }
  function moveLightbox(direction) {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }
  refreshLightboxItems();
  q("#lb-close") && q("#lb-close").addEventListener("click", closeLightbox);
  q("#lb-prev") && q("#lb-prev").addEventListener("click", function () { moveLightbox(-1); });
  q("#lb-next") && q("#lb-next").addEventListener("click", function () { moveLightbox(1); });
  lightbox && lightbox.addEventListener("click", function (event) { if (event.target === lightbox) closeLightbox(); });
  var touchStartX = 0;
  lightbox && lightbox.addEventListener("pointerdown", function (event) { touchStartX = event.clientX; });
  lightbox && lightbox.addEventListener("pointerup", function (event) { var delta = event.clientX - touchStartX; if (Math.abs(delta) > 55) moveLightbox(delta > 0 ? -1 : 1); });
  document.addEventListener("keydown", function (event) {
    if (lightbox && lightbox.classList.contains("open")) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    }
  });

  /* ---------- Contact copy ---------- */
  function copyText(text) {
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); showToast("手机号已复制"); } catch (error) { showToast("请手动复制：" + text); }
      area.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { showToast("手机号已复制"); }, fallback);
    else fallback();
  }
  qa("[data-copy-phone]").forEach(function (button) { button.addEventListener("click", function () { copyText(button.getAttribute("data-copy-phone")); }); });

  /* ---------- IndexedDB image storage ---------- */
  var dbPromise = null;
  function openImageDB() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      var request;
      try { request = indexedDB.open("zlc_portfolio_editor", 1); } catch (error) { resolve(null); return; }
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains("images")) db.createObjectStore("images", { keyPath: "id" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { resolve(null); };
    });
    return dbPromise;
  }
  function dbAction(mode, action) {
    return openImageDB().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        var tx = db.transaction("images", mode);
        var storeObject = tx.objectStore("images");
        var request = action(storeObject);
        request.onsuccess = function () { resolve(request.result || true); };
        request.onerror = function () { resolve(null); };
      });
    });
  }
  function getStoredImage(id) {
    return dbAction("readonly", function (storeObject) { return storeObject.get(id); }).then(function (record) {
      if (record && record.data) return record;
      var fallback = getValue("fallback_image_" + id);
      return fallback ? { id: id, data: fallback } : null;
    });
  }
  function saveStoredImage(id, data) {
    return dbAction("readwrite", function (storeObject) { return storeObject.put({ id: id, data: data, updated: Date.now() }); }).then(function (result) {
      if (!result) setValue("fallback_image_" + id, data);
      return result;
    });
  }
  function deleteStoredImage(id) {
    removeValue("fallback_image_" + id);
    return dbAction("readwrite", function (storeObject) { return storeObject.delete(id); });
  }
  function getAllStoredImages() { return dbAction("readonly", function (storeObject) { return storeObject.getAll(); }).then(function (result) { return Array.isArray(result) ? result : []; }); }
  function clearStoredImages() { return dbAction("readwrite", function (storeObject) { return storeObject.clear(); }); }

  function applySavedImages() {
    qa("img[data-img]").forEach(function (image) {
      var id = image.getAttribute("data-img");
      getStoredImage(id).then(function (record) {
        if (!record || !record.data) return;
        image.src = record.data;
        if (image.hasAttribute("data-src")) image.setAttribute("data-src", record.data);
      });
    });
  }

  /* ---------- Editor data helpers ---------- */
  var undoStack = [];
  function pushUndo(label, callback) {
    undoStack.push({ label: label, callback: callback });
    if (undoStack.length > 30) undoStack.shift();
    updateUndoButton();
  }
  function updateUndoButton() {
    var button = q("#ep-undo");
    if (!button) return;
    button.disabled = undoStack.length === 0;
    button.textContent = undoStack.length ? "撤销：" + undoStack[undoStack.length - 1].label : "暂无可撤销操作";
  }
  function undoLast() {
    var action = undoStack.pop();
    if (!action) return;
    Promise.resolve(action.callback()).then(function () { updateUndoButton(); showToast("已撤销：" + action.label); });
  }

  function imageHolder(image) { return image.closest(".main-card, .gallery-item, .case-card, .pitem, .photo-frame, .qr-card, .ai-pic, .kv-frame, .kv-phone, .kv-hero, .case-banner, .product-banner, .product-square, .listing-media, .aplus-media, .sanq-banner, .sanq-mobile-rail figure, .sanq-aplus-document figure, .sanq-hero") || image.parentElement; }
  function visualHolder(image) { return image.closest(".main-card-media, .gallery-media, .case-media, .pitem, .photo-frame, .qr-card, .ai-pic, .kv-media, .kv-hero-bg, .case-banner-media, .product-banner, .product-square-media, .listing-media, .aplus-media, .sanq-banner-media, .docking-mobile-media, .sanq-aplus-document figure, .sanq-hero") || image.parentElement; }
  function styleKey(image) { return "image_style_" + image.getAttribute("data-img"); }
  function loadImageStyle(image) {
    var style = readJSON(styleKey(image), null);
    if (!style) return;
    var holder = imageHolder(image);
    var visual = visualHolder(image);
    if (style.height) { visual.style.height = style.height + "px"; visual.style.aspectRatio = "auto"; holder.classList.add("custom-height"); }
    if (style.width) { holder.style.width = style.width + "%"; if (holder.classList.contains("main-card")) holder.style.flexBasis = style.width + "%"; }
    if (style.span && holder.parentElement && (holder.parentElement.classList.contains("sortable-grid") || holder.parentElement.classList.contains("pgrid"))) holder.style.gridColumn = "span " + style.span;
    if (typeof style.x === "number" || typeof style.y === "number") image.style.objectPosition = (style.x == null ? 50 : style.x) + "% " + (style.y == null ? 50 : style.y) + "%";
  }
  qa("img[data-img]").forEach(loadImageStyle);
  /* ---------- Kinetic Amazon main-image wall ---------- */
  function initMainImageMarquee() {
    var marquee = q("#main-marquee");
    if (!marquee) return;
    var rows = qa(".main-row", marquee);
    var states = [];
    var measureQueued = false;

    rows.forEach(function (row, rowIndex) {
      var track = q(".main-track", row);
      var originals = track ? qa(".main-card:not(.is-clone)", track) : [];
      if (!track || !originals.length) return;
      originals.forEach(function (card) {
        var sourceImage = q("img[data-img]", card);
        var key = sourceImage ? sourceImage.getAttribute("data-img") : "";
        var clone = card.cloneNode(true);
        clone.classList.remove("editor-selected");
        clone.classList.add("is-clone");
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-clone-card-source", key);
        clone.removeAttribute("data-item-id");
        clone.removeAttribute("data-edit-card");
        qa("[id]", clone).forEach(function (element) { element.removeAttribute("id"); });
        qa("[data-edit]", clone).forEach(function (element) { element.setAttribute("data-clone-edit-source", element.getAttribute("data-edit")); element.removeAttribute("data-edit"); element.removeAttribute("contenteditable"); });
        var cloneMedia = q(".main-card-media", clone);
        if (cloneMedia) cloneMedia.setAttribute("data-clone-media-source", key);
        qa("img[data-img]", clone).forEach(function (image) {
          image.setAttribute("data-clone-source", image.getAttribute("data-img"));
          image.removeAttribute("data-img");
          image.classList.remove("js-lightbox");
        });
        track.appendChild(clone);
      });
      states.push({
        row: row,
        track: track,
        originals: originals,
        position: rowIndex * 73,
        base: parseFloat(row.getAttribute("data-speed")) || .3,
        direction: parseFloat(row.getAttribute("data-direction")) || 1,
        impulse: 0,
        loopWidth: 1
      });
    });
    if (!states.length) return;

    function measure() {
      measureQueued = false;
      states.forEach(function (state) {
        var gap = parseFloat(getComputedStyle(state.track).columnGap) || 0;
        var width = state.originals.reduce(function (sum, card) { return sum + card.getBoundingClientRect().width; }, 0);
        state.loopWidth = Math.max(1, width + gap * state.originals.length);
        state.position = ((state.position % state.loopWidth) + state.loopWidth) % state.loopWidth;
      });
    }
    function requestMeasure() {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener("resize", requestMeasure, { passive: true });

    var gallerySync = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var source = mutation.target;
        if (source.matches && source.matches("img[data-img]")) {
          var imageKey = source.getAttribute("data-img");
          qa('img[data-clone-source="' + imageKey + '"]', marquee).forEach(function (cloneImage) {
            cloneImage.src = source.src;
            if (source.hasAttribute("data-src")) cloneImage.setAttribute("data-src", source.getAttribute("data-src"));
          });
          return;
        }
        if (source.matches && source.matches(".editable[data-edit]")) {
          var textKey = source.getAttribute("data-edit");
          qa('[data-clone-edit-source="' + textKey + '"]', marquee).forEach(function (cloneText) { cloneText.style.cssText = source.style.cssText; });
          return;
        }
        if (source.matches && source.matches(".main-card")) {
          var cardImage = q("img[data-img]", source);
          var cardKey = cardImage && cardImage.getAttribute("data-img");
          qa('[data-clone-card-source="' + cardKey + '"]', marquee).forEach(function (cloneCard) {
            cloneCard.style.cssText = source.style.cssText;
            cloneCard.classList.toggle("custom-height", source.classList.contains("custom-height"));
          });
          requestMeasure();
          return;
        }
        if (source.matches && source.matches(".main-card-media")) {
          var mediaImage = q("img[data-img]", source);
          var mediaKey = mediaImage && mediaImage.getAttribute("data-img");
          qa('[data-clone-media-source="' + mediaKey + '"]', marquee).forEach(function (cloneMedia) { cloneMedia.style.cssText = source.style.cssText; });
          requestMeasure();
        }
      });
    });
    states.forEach(function (state) {
      state.originals.forEach(function (card) {
        gallerySync.observe(card, { attributes: true, attributeFilter: ["style", "class"] });
        var media = q(".main-card-media", card);
        var image = q("img[data-img]", card);
        if (media) gallerySync.observe(media, { attributes: true, attributeFilter: ["style"] });
        if (image) gallerySync.observe(image, { attributes: true, attributeFilter: ["src", "data-src"] });
        qa(".editable[data-edit]", card).forEach(function (editable) { gallerySync.observe(editable, { attributes: true, attributeFilter: ["style"] }); });
      });
    });

    var inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { inView = entries[0] ? entries[0].isIntersecting : true; }, { rootMargin: "220px 0px" }).observe(marquee);
    }
    var lastFrame = performance.now();
    function animate(now) {
      var frameScale = Math.min(2.4, Math.max(.25, (now - lastFrame) / 16.667));
      lastFrame = now;
      states.forEach(function (state) {
        if (inView && !editing && !reduceMotion) {
          state.position += (state.base * state.direction + state.impulse) * frameScale;
          state.impulse *= Math.pow(.92, frameScale);
        }
        state.position = ((state.position % state.loopWidth) + state.loopWidth) % state.loopWidth;
        state.track.style.transform = "translate3d(" + (-state.position).toFixed(2) + "px,0,0)";
      });
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    marquee.addEventListener("input", function (event) {
      var editable = event.target.closest && event.target.closest(".editable[data-edit]");
      if (!editable) return;
      var textKey = editable.getAttribute("data-edit");
      qa('[data-clone-edit-source="' + textKey + '"]', marquee).forEach(function (cloneText) { cloneText.textContent = editable.textContent; });
    });

    marquee.addEventListener("wheel", function (event) {
      if (editing || reduceMotion) return;
      var delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      states.forEach(function (state, index) {
        var response = index % 2 ? -1 : 1;
        state.impulse = Math.max(-7, Math.min(7, state.impulse + delta * .018 * response));
      });
      marquee.classList.add("has-wheel-energy");
      clearTimeout(marquee._wheelTimer);
      marquee._wheelTimer = setTimeout(function () { marquee.classList.remove("has-wheel-energy"); }, 440);
    }, { passive: true });

    var pointerId = null;
    var lastX = 0;
    var lastTime = 0;
    var moved = false;
    var suppressClick = false;
    marquee.addEventListener("pointerdown", function (event) {
      if (editing || event.button > 0) return;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastTime = performance.now();
      moved = false;
      marquee.setPointerCapture && marquee.setPointerCapture(pointerId);
      marquee.classList.add("is-dragging");
    });
    marquee.addEventListener("pointermove", function (event) {
      if (event.pointerId !== pointerId) return;
      var now = performance.now();
      var delta = event.clientX - lastX;
      if (Math.abs(delta) > 2) moved = true;
      states.forEach(function (state) {
        state.position -= delta;
        state.impulse = Math.max(-9, Math.min(9, (-delta / Math.max(8, now - lastTime)) * 16));
      });
      lastX = event.clientX;
      lastTime = now;
    });
    function finishDrag(event) {
      if (event.pointerId !== pointerId) return;
      suppressClick = moved;
      pointerId = null;
      marquee.classList.remove("is-dragging");
      setTimeout(function () { suppressClick = false; }, 90);
    }
    marquee.addEventListener("pointerup", finishDrag);
    marquee.addEventListener("pointercancel", finishDrag);
    marquee.addEventListener("click", function (event) {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
  function restoreHiddenItems() {
    var hidden = readJSON("hidden_items", []);
    hidden.forEach(function (id) { var item = q('[data-item-id="' + CSS.escape(id) + '"]'); if (item) item.remove(); });
  }
  restoreHiddenItems();

  function createCustomItem(config) {
    var gallery = q(".portfolio-gallery");
    if (!gallery) return null;
    var figure = document.createElement("figure");
    figure.className = "gallery-item reveal in";
    figure.setAttribute("data-category", config.category || "listing");
    figure.setAttribute("data-item-id", config.id);
    figure.setAttribute("data-custom", "1");
    figure.setAttribute("data-edit-card", "");
    var media = document.createElement("div");
    media.className = "gallery-media has-img";
    var image = document.createElement("img");
    image.className = "site-img js-lightbox";
    image.src = config.src || "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'%3E%3Crect width='100%25' height='100%25' fill='%23d9d5cc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2377746c' font-size='40'%3E上传新作品%3C/text%3E%3C/svg%3E";
    image.setAttribute("data-src", image.src);
    image.alt = config.title || "自定义作品";
    image.setAttribute("data-img", "custom-image-" + config.id);
    media.appendChild(image);
    var caption = document.createElement("figcaption");
    var meta = document.createElement("span");
    meta.className = "editable";
    meta.setAttribute("data-edit", "custom-meta-" + config.id);
    meta.textContent = config.meta || "CUSTOM WORK · 自定义分类";
    var title = document.createElement("b");
    title.className = "editable";
    title.setAttribute("data-edit", "custom-title-" + config.id);
    title.textContent = config.title || "新作品标题";
    caption.appendChild(meta); caption.appendChild(title);
    figure.appendChild(media); figure.appendChild(caption);
    gallery.appendChild(figure);
    return figure;
  }
  function restoreCustomItems() {
    readJSON("custom_items", []).forEach(createCustomItem);
  }
  function saveCustomItems() {
    var items = qa(".portfolio-gallery [data-custom='1']").map(function (item) {
      var image = q("img[data-img]", item);
      return { id: item.getAttribute("data-item-id"), src: image ? image.getAttribute("src") : "", title: q("figcaption b", item) ? q("figcaption b", item).innerText : "新作品标题", meta: q("figcaption span", item) ? q("figcaption span", item).innerText : "CUSTOM WORK", category: item.getAttribute("data-category") || "listing" };
    });
    writeJSON("custom_items", items);
  }
  restoreCustomItems();

  /* ---------- Sort order ---------- */
  function itemId(item) {
    var image = q("img[data-img]", item);
    return item.getAttribute("data-item-id") || (image && image.getAttribute("data-img")) || "item-" + Math.random().toString(36).slice(2);
  }
  function prepareSortableGrids() {
    qa(".sortable-grid, .pgrid").forEach(function (grid, gridIndex) {
      if (!grid.getAttribute("data-sort-key")) grid.setAttribute("data-sort-key", pageName + "-grid-" + gridIndex);
      qa(":scope > *", grid).forEach(function (item) { if (!item.getAttribute("data-item-id")) item.setAttribute("data-item-id", itemId(item)); });
      var savedOrder = readJSON("order_" + grid.getAttribute("data-sort-key"), []);
      savedOrder.forEach(function (id) { var child = q(':scope > [data-item-id="' + CSS.escape(id) + '"]', grid); if (child) grid.appendChild(child); });
      if (grid.dataset.sortBound) return;
      grid.dataset.sortBound = "1";
      var dragged = null;
      grid.addEventListener("dragstart", function (event) {
        if (!editing) { event.preventDefault(); return; }
        dragged = event.target.closest("[data-item-id]");
        if (dragged && dragged.parentElement !== grid) dragged = null;
        if (!dragged) return;
        dragged.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
      });
      grid.addEventListener("dragover", function (event) {
        if (!editing || !dragged) return;
        event.preventDefault();
        var target = event.target.closest("[data-item-id]");
        if (target && target.parentElement !== grid) target = null;
        if (!target || target === dragged) return;
        var rect = target.getBoundingClientRect();
        var before = event.clientY < rect.top + rect.height / 2 || event.clientX < rect.left + rect.width / 2;
        grid.insertBefore(dragged, before ? target : target.nextSibling);
      });
      grid.addEventListener("dragend", function () {
        if (!dragged) return;
        dragged.classList.remove("dragging");
        dragged = null;
        var key = "order_" + grid.getAttribute("data-sort-key");
        var previous = readJSON(key, []);
        var order = qa(":scope > [data-item-id]", grid).map(itemId);
        writeJSON(key, order);
        pushUndo("调整作品顺序", function () { writeJSON(key, previous); location.reload(); });
      });
    });
  }
  prepareSortableGrids();

  /* ---------- Rich local editor ---------- */
  var editButton = q("#edit-toggle");
  var editPanel = q("#edit-panel");
  var editToolbar = q("#edit-toolbar");
  var selectedImage = null;
  var selectedText = null;
  var uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.hidden = true;
  document.body.appendChild(uploadInput);

  function editorMarkup() {
    if (!editPanel || !editToolbar) return;
    editPanel.innerHTML = '<div class="ep-head">可视化编辑器<button class="ep-close" id="ep-close" type="button" aria-label="关闭面板">×</button></div>' +
      '<section class="ep-section"><div class="ep-section-title"><span>全局布局</span><span>LAYOUT</span></div>' +
      '<div class="ep-row"><label for="gap-gallery">图片间距</label><input id="gap-gallery" type="range" min="4" max="64" value="20"><output id="gap-gallery-val">20</output></div>' +
      '<div class="ep-row"><label for="gap-ti">文字图片间距</label><input id="gap-ti" type="range" min="16" max="100" value="44"><output id="gap-ti-val">44</output></div>' +
      '<div class="ep-row"><label for="radius-global">图片圆角</label><input id="radius-global" type="range" min="0" max="32" value="6"><output id="radius-global-val">6</output></div></section>' +
      '<section class="ep-section" id="ep-selected"><div class="ep-section-title"><span>所选图片 / 卡片</span><span id="ep-selected-name">未选择</span></div>' +
      '<div class="ep-row"><label for="image-height">占位符高度</label><input id="image-height" type="range" min="80" max="2000" value="360"><output id="image-height-val">360</output></div>' +
      '<div class="ep-row"><label for="image-width">占位符宽度 %</label><input id="image-width" type="range" min="25" max="100" value="100"><output id="image-width-val">100</output></div>' +
      '<div class="ep-row"><label for="image-span">网格列宽</label><input id="image-span" type="range" min="1" max="12" value="4"><output id="image-span-val">4</output></div>' +
      '<div class="ep-row"><label for="image-x">水平裁切位置</label><input id="image-x" type="range" min="0" max="100" value="50"><output id="image-x-val">50</output></div>' +
      '<div class="ep-row"><label for="image-y">垂直裁切位置</label><input id="image-y" type="range" min="0" max="100" value="50"><output id="image-y-val">50</output></div>' +
      '<div class="ep-actions"><button type="button" id="ep-upload">替换所选图片</button><button type="button" id="ep-duplicate">复制为新作品</button><button type="button" id="ep-delete" class="danger">删除所选卡片</button><button type="button" id="ep-clear-size">恢复图片尺寸</button></div></section>' +
      '<section class="ep-section" id="ep-selected-text"><div class="ep-section-title"><span>所选文字</span><span id="ep-selected-text-name">未选择</span></div>' +
      '<div class="ep-row"><label for="text-font-size">文字大小</label><input id="text-font-size" type="range" min="9" max="160" value="16"><output id="text-font-size-val">16</output></div>' +
      '<div class="ep-row"><label for="text-letter-spacing">文字间距</label><input id="text-letter-spacing" type="range" min="-4" max="20" step="0.1" value="0"><output id="text-letter-spacing-val">0</output></div>' +
      '<div class="ep-row"><label for="text-line-height">文字行距</label><input id="text-line-height" type="range" min="0.8" max="3" step="0.05" value="1.65"><output id="text-line-height-val">1.65</output></div>' +
      '<div class="ep-actions"><button type="button" id="ep-reset-text">恢复文字样式</button></div></section>' +
      '<section class="ep-section"><div class="ep-section-title"><span>作品管理</span><span>CONTENT</span></div><div class="ep-actions"><button type="button" id="ep-add">＋ 添加作品</button><button type="button" id="ep-undo" disabled>暂无可撤销操作</button></div><p class="ep-tip">点击文字后可拖动滑杆调整字号、字距和行距；点击图片可调整宽高、裁切位置或上传替换。</p></section>' +
      '<section class="ep-section"><div class="ep-section-title"><span>备份与迁移</span><span>DATA</span></div><div class="ep-actions"><button type="button" id="ep-export">导出配置</button><label class="ep-file" for="config-import">导入配置</label><button type="button" id="ep-reset" class="danger">恢复网站默认</button><button type="button" id="ep-help">使用说明</button></div></section>';
    editToolbar.innerHTML = '<button type="button" data-adj="fs-">字号 −</button><button type="button" data-adj="fs+">字号 ＋</button><button type="button" data-adj="ls-">字距 −</button><button type="button" data-adj="ls+">字距 ＋</button><button type="button" data-adj="lh-">行高 −</button><button type="button" data-adj="lh+">行高 ＋</button><button type="button" data-adj="reset">恢复文字样式</button>';
  }
  editorMarkup();

  var configImport = q("#config-import");
  if (!configImport) {
    configImport = document.createElement("input");
    configImport.id = "config-import";
    configImport.type = "file";
    configImport.accept = "application/json";
    configImport.hidden = true;
    document.body.appendChild(configImport);
  }

  function applyGlobalSetting(name, cssVariable, fallback) {
    var control = q("#" + name);
    var output = q("#" + name + "-val");
    var value = getValue(name);
    if (value == null) value = fallback;
    document.documentElement.style.setProperty(cssVariable, value + "px");
    if (control) control.value = value;
    if (output) output.textContent = value;
    if (!control) return;
    var startValue = value;
    control.addEventListener("pointerdown", function () { startValue = getValue(name) == null ? fallback : getValue(name); });
    control.addEventListener("input", function () {
      document.documentElement.style.setProperty(cssVariable, control.value + "px");
      if (output) output.textContent = control.value;
      setValue(name, control.value);
    });
    control.addEventListener("change", function () {
      var oldValue = startValue;
      pushUndo("调整全局布局", function () { setValue(name, oldValue); document.documentElement.style.setProperty(cssVariable, oldValue + "px"); control.value = oldValue; if (output) output.textContent = oldValue; });
    });
  }
  applyGlobalSetting("gap-gallery", "--gallery-gap", 20);
  applyGlobalSetting("gap-ti", "--ti-gap", 44);
  applyGlobalSetting("radius-global", "--radius", 6);

  function showTextToolbar(element) {
    if (!editToolbar) return;
    selectedText = element;
    updateSelectedTextPanel();
    var rect = element.getBoundingClientRect();
    editToolbar.classList.add("open");
    var width = editToolbar.offsetWidth || 300;
    editToolbar.style.left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12) + "px";
    var top = rect.bottom + 9;
    if (top + 55 > window.innerHeight) top = Math.max(12, rect.top - 52);
    editToolbar.style.top = top + "px";
  }
  var textControlMap = { "text-font-size": "fs", "text-letter-spacing": "ls", "text-line-height": "lh" };
  function currentTextStyle(element) {
    var computed = getComputedStyle(element);
    var size = parseFloat(computed.fontSize) || 16;
    return {
      fs: size,
      ls: computed.letterSpacing === "normal" ? 0 : (parseFloat(computed.letterSpacing) || 0),
      lh: parseFloat(computed.lineHeight) / size || 1.65
    };
  }
  function applyTextStyleObject(element, style) {
    element.style.fontSize = style.fs ? style.fs + "px" : "";
    element.style.letterSpacing = style.ls != null ? style.ls + "px" : "";
    element.style.lineHeight = style.lh || "";
  }
  function updateSelectedTextPanel() {
    var name = q("#ep-selected-text-name");
    if (!selectedText) { if (name) name.textContent = "未选择"; return; }
    var values = currentTextStyle(selectedText);
    Object.keys(textControlMap).forEach(function (controlId) {
      var part = textControlMap[controlId];
      var control = q("#" + controlId);
      var output = q("#" + controlId + "-val");
      var value = Math.round(values[part] * 100) / 100;
      if (control) control.value = value;
      if (output) output.textContent = value;
    });
    if (name) name.textContent = selectedText.getAttribute("data-edit") || "文字";
  }
  function hideTextToolbar() {
    if (editToolbar) editToolbar.classList.remove("open");
    selectedText = null;
    updateSelectedTextPanel();
  }

  function bindEditable(element) {
    if (element.dataset.editorBound) return;
    element.dataset.editorBound = "1";
    var id = element.getAttribute("data-edit");
    var saved = getValue("text_" + id);
    if (saved != null) element.innerText = saved;
    var style = readJSON("text_style_" + id, null);
    if (style) {
      if (style.fs) element.style.fontSize = style.fs + "px";
      if (style.ls != null) element.style.letterSpacing = style.ls + "px";
      if (style.lh) element.style.lineHeight = style.lh;
    }
    element.addEventListener("focus", function () { element.dataset.beforeText = element.innerText; });
    element.addEventListener("input", function () { setValue("text_" + id, element.innerText); });
    element.addEventListener("blur", function () {
      var before = element.dataset.beforeText;
      var after = element.innerText;
      if (before != null && before !== after) pushUndo("修改文字", function () { element.innerText = before; setValue("text_" + id, before); });
    });
    element.addEventListener("click", function (event) {
      if (!editing) return;
      if (element.closest("a")) event.preventDefault();
      event.stopPropagation();
      showTextToolbar(element);
    });
  }
  qa(".editable[data-edit]").forEach(bindEditable);
  initMainImageMarquee();

  Object.keys(textControlMap).forEach(function (controlId) {
    var part = textControlMap[controlId];
    var control = q("#" + controlId);
    var output = q("#" + controlId + "-val");
    var startStyle = null;
    var targetText = null;
    if (!control) return;
    control.addEventListener("pointerdown", function () {
      if (!selectedText) return;
      targetText = selectedText;
      startStyle = readJSON("text_style_" + targetText.getAttribute("data-edit"), currentTextStyle(targetText));
    });
    control.addEventListener("input", function () {
      if (!selectedText) return;
      var element = selectedText;
      var id = element.getAttribute("data-edit");
      var style = readJSON("text_style_" + id, currentTextStyle(element));
      style[part] = Number(control.value);
      writeJSON("text_style_" + id, style);
      applyTextStyleObject(element, style);
      if (output) output.textContent = control.value;
      showTextToolbar(element);
    });
    control.addEventListener("change", function () {
      if (!targetText || !startStyle) return;
      var element = targetText;
      var id = element.getAttribute("data-edit");
      var previous = startStyle;
      pushUndo("调整文字样式", function () {
        writeJSON("text_style_" + id, previous);
        applyTextStyleObject(element, previous);
        if (selectedText === element) updateSelectedTextPanel();
      });
      targetText = null;
      startStyle = null;
    });
  });
  q("#ep-reset-text") && q("#ep-reset-text").addEventListener("click", function () {
    if (!selectedText) { showToast("请先点击选择一段文字"); return; }
    var element = selectedText;
    var id = element.getAttribute("data-edit");
    var previous = readJSON("text_style_" + id, currentTextStyle(element));
    removeValue("text_style_" + id);
    applyTextStyleObject(element, {});
    pushUndo("恢复文字样式", function () { writeJSON("text_style_" + id, previous); applyTextStyleObject(element, previous); });
    updateSelectedTextPanel();
  });

  editToolbar && editToolbar.addEventListener("mousedown", function (event) { event.preventDefault(); });
  editToolbar && editToolbar.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-adj]");
    if (!button || !selectedText) return;
    var element = selectedText;
    var id = element.getAttribute("data-edit");
    var before = readJSON("text_style_" + id, {});
    var current = {
      fs: parseFloat(getComputedStyle(element).fontSize) || 16,
      ls: getComputedStyle(element).letterSpacing === "normal" ? 0 : (parseFloat(getComputedStyle(element).letterSpacing) || 0),
      lh: parseFloat(getComputedStyle(element).lineHeight) / (parseFloat(getComputedStyle(element).fontSize) || 16)
    };
    var action = button.getAttribute("data-adj");
    if (action === "reset") current = {};
    if (action === "fs+") current.fs = Math.min(160, current.fs + 1);
    if (action === "fs-") current.fs = Math.max(9, current.fs - 1);
    if (action === "ls+") current.ls = Math.min(20, current.ls + .5);
    if (action === "ls-") current.ls = Math.max(-4, current.ls - .5);
    if (action === "lh+") current.lh = Math.min(3, (current.lh || 1.65) + .05);
    if (action === "lh-") current.lh = Math.max(.8, (current.lh || 1.65) - .05);
    element.style.fontSize = current.fs ? current.fs + "px" : "";
    element.style.letterSpacing = current.ls != null ? current.ls + "px" : "";
    element.style.lineHeight = current.lh || "";
    if (Object.keys(current).length) writeJSON("text_style_" + id, current); else removeValue("text_style_" + id);
    pushUndo("调整文字样式", function () {
      element.style.fontSize = before.fs ? before.fs + "px" : "";
      element.style.letterSpacing = before.ls != null ? before.ls + "px" : "";
      element.style.lineHeight = before.lh || "";
      if (Object.keys(before).length) writeJSON("text_style_" + id, before); else removeValue("text_style_" + id);
    });
    showTextToolbar(element);
  });

  function updateSelectedPanel() {
    var name = q("#ep-selected-name");
    if (!selectedImage) { if (name) name.textContent = "未选择"; return; }
    var id = selectedImage.getAttribute("data-img");
    var holder = imageHolder(selectedImage);
    var visual = visualHolder(selectedImage);
    var style = readJSON(styleKey(selectedImage), {});
    var defaultSpan = 4;
    if (holder.classList.contains("gallery-item--landscape") || holder.classList.contains("case-card--full")) defaultSpan = 12;
    else if (holder.classList.contains("gallery-item--pair") || holder.classList.contains("case-card--square")) defaultSpan = 6;
    else if (holder.classList.contains("gallery-item--wide") || holder.classList.contains("gallery-item--lg")) defaultSpan = 8;
    else if (holder.classList.contains("kv-feature")) defaultSpan = 12;
    else if (holder.classList.contains("kv-phone")) defaultSpan = 4;
    else if (holder.classList.contains("kv-frame")) defaultSpan = holder.parentElement && holder.parentElement.classList.contains("kv-triptych") ? 12 : (holder.parentElement && holder.parentElement.classList.contains("kv-campaign-grid") ? 8 : 6);
    var span = style.span || defaultSpan;
    var parentWidth = holder.parentElement ? holder.parentElement.getBoundingClientRect().width : holder.getBoundingClientRect().width;
    var widthPercent = parentWidth ? Math.round(holder.getBoundingClientRect().width / parentWidth * 100) : 100;
    var values = { "image-height": style.height || Math.round(visual.getBoundingClientRect().height), "image-width": style.width || widthPercent, "image-span": span, "image-x": style.x == null ? 50 : style.x, "image-y": style.y == null ? 50 : style.y };
    Object.keys(values).forEach(function (key) { var control = q("#" + key); var output = q("#" + key + "-val"); if (control) control.value = values[key]; if (output) output.textContent = values[key]; });
    if (name) name.textContent = id;
  }
  function selectImage(image) {
    qa(".editor-selected").forEach(function (item) { item.classList.remove("editor-selected"); });
    selectedImage = image;
    var holder = imageHolder(image);
    holder.classList.add("editor-selected");
    updateSelectedPanel();
  }

  function bindImage(image) {
    if (!image.hasAttribute("data-img") || image.dataset.imageEditorBound) return;
    image.dataset.imageEditorBound = "1";
    image.addEventListener("click", function (event) {
      if (!editing) return;
      event.preventDefault(); event.stopPropagation(); selectImage(image);
    });
  }
  qa("img[data-img]").forEach(bindImage);

  function setImageStylePart(part, value) {
    if (!selectedImage) return;
    var style = readJSON(styleKey(selectedImage), {});
    style[part] = Number(value);
    writeJSON(styleKey(selectedImage), style);
    loadImageStyle(selectedImage);
  }
  ["height", "width", "span", "x", "y"].forEach(function (part) {
    var control = q("#image-" + part);
    var output = q("#image-" + part + "-val");
    if (!control) return;
    var startStyle = null;
    control.addEventListener("pointerdown", function () { if (selectedImage) startStyle = readJSON(styleKey(selectedImage), {}); });
    control.addEventListener("input", function () { if (!selectedImage) return; setImageStylePart(part, control.value); if (output) output.textContent = control.value; });
    control.addEventListener("change", function () {
      if (!selectedImage || !startStyle) return;
      var image = selectedImage;
      var oldStyle = startStyle;
      pushUndo("调整图片占位符", function () { writeJSON(styleKey(image), oldStyle); loadImageStyle(image); selectImage(image); });
    });
  });

  function resetSelectedSize() {
    if (!selectedImage) return;
    var image = selectedImage;
    var previous = readJSON(styleKey(image), {});
    removeValue(styleKey(image));
    var holder = imageHolder(image);
    var visual = visualHolder(image);
    holder.style.gridColumn = "";
    holder.style.width = "";
    holder.style.flexBasis = "";
    holder.classList.remove("custom-height");
    visual.style.height = "";
    visual.style.aspectRatio = "";
    image.style.objectPosition = "";
    pushUndo("恢复图片尺寸", function () { writeJSON(styleKey(image), previous); loadImageStyle(image); });
    updateSelectedPanel();
  }

  function imageDataFromFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var source = new Image();
        source.onerror = reject;
        source.onload = function () {
          var maxSide = 2400;
          var scale = Math.min(1, maxSide / Math.max(source.width, source.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(source.width * scale));
          canvas.height = Math.max(1, Math.round(source.height * scale));
          var context = canvas.getContext("2d");
          context.drawImage(source, 0, 0, canvas.width, canvas.height);
          var keepPng = file.type === "image/png" && file.size < 1800000;
          resolve(canvas.toDataURL(keepPng ? "image/png" : "image/webp", keepPng ? undefined : .9));
        };
        source.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function requestImageUpload(image) {
    if (!image) { showToast("请先点击选择一张图片"); return; }
    selectedImage = image;
    uploadInput.click();
  }
  uploadInput.addEventListener("change", function () {
    var file = uploadInput.files && uploadInput.files[0];
    uploadInput.value = "";
    if (!file || !selectedImage) return;
    var image = selectedImage;
    var id = image.getAttribute("data-img");
    var previous = image.src;
    imageDataFromFile(file).then(function (data) {
      image.src = data;
      if (image.hasAttribute("data-src")) image.setAttribute("data-src", data);
      return saveStoredImage(id, data);
    }).then(function () {
      saveCustomItems();
      pushUndo("替换图片", function () { image.src = previous; if (image.hasAttribute("data-src")) image.setAttribute("data-src", previous); return saveStoredImage(id, previous); });
      showToast("图片已替换并保存到当前浏览器");
    }).catch(function () { showToast("图片读取失败，请换一张图片重试"); });
  });

  function buildImageButtons() {
    qa("img[data-img]").forEach(function (image) {
      bindImage(image);
      var holder = visualHolder(image);
      if (q(".img-up", holder)) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "img-up";
      button.textContent = "上传替换";
      button.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); selectImage(image); requestImageUpload(image); });
      holder.appendChild(button);
    });
  }
  function removeImageButtons() { qa(".img-up").forEach(function (button) { button.remove(); }); }

  function setEditing(next) {
    editing = next;
    document.body.classList.toggle("editing", editing);
    if (editButton) { editButton.classList.toggle("active", editing); editButton.textContent = editing ? "✓ 完成编辑" : "✦ 编辑作品集"; }
    if (editPanel) editPanel.classList.toggle("open", editing);
    qa(".editable[data-edit]").forEach(function (element) { element.contentEditable = editing ? "true" : "false"; });
    qa(".sortable-grid > [data-item-id], .pgrid > [data-item-id]").forEach(function (item) { item.draggable = editing; });
    if (editing) { buildImageButtons(); showToast("已进入编辑模式，修改会自动保存在本机"); }
    else { removeImageButtons(); hideTextToolbar(); qa(".editor-selected").forEach(function (item) { item.classList.remove("editor-selected"); }); selectedImage = null; }
  }

  var params = new URLSearchParams(location.search);
  var editAccess = params.get("edit") === "1";
  if (editAccess) document.body.classList.add("edit-access");
  editButton && editButton.addEventListener("click", function () { setEditing(!editing); });
  q("#ep-close") && q("#ep-close").addEventListener("click", function () { if (editPanel) editPanel.classList.remove("open"); });
  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "e") {
      event.preventDefault();
      document.body.classList.add("edit-access");
      setEditing(!editing);
    }
  });
  document.addEventListener("click", function (event) { if (editing && !event.target.closest(".editable") && !event.target.closest(".edit-toolbar")) hideTextToolbar(); });

  function addCustomWork(source) {
    var id = "custom-" + Date.now().toString(36);
    var config = { id: id, src: source && source.src ? source.src : "", title: source && source.title ? source.title + "（副本）" : "新作品标题", meta: source && source.meta ? source.meta : "CUSTOM WORK · 自定义分类", category: source && source.category ? source.category : "listing" };
    var item = createCustomItem(config);
    if (!item) { showToast("请在首页作品档案中添加作品"); return null; }
    saveCustomItems();
    bindEditable(q("figcaption span", item)); bindEditable(q("figcaption b", item));
    var image = q("img[data-img]", item); bindImage(image); refreshLightboxItems(); prepareSortableGrids();
    if (editing) { item.draggable = true; buildImageButtons(); }
    pushUndo("添加作品", function () { item.remove(); saveCustomItems(); });
    item.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    setTimeout(function () { selectImage(image); if (!source) requestImageUpload(image); }, 350);
    return item;
  }
  q("#ep-add") && q("#ep-add").addEventListener("click", function () { addCustomWork(null); });
  q("#ep-duplicate") && q("#ep-duplicate").addEventListener("click", function () {
    if (!selectedImage) { showToast("请先选择一张作品图片"); return; }
    var holder = imageHolder(selectedImage);
    var item = selectedImage.closest(".gallery-item");
    addCustomWork({ src: selectedImage.src, title: item && q("figcaption b", item) ? q("figcaption b", item).innerText : selectedImage.alt, meta: item && q("figcaption span", item) ? q("figcaption span", item).innerText : "CUSTOM WORK", category: item ? item.getAttribute("data-category") : "listing" });
  });
  q("#ep-delete") && q("#ep-delete").addEventListener("click", function () {
    if (!selectedImage) { showToast("请先选择要删除的卡片"); return; }
    var holder = imageHolder(selectedImage);
    if (!holder || selectedImage.hasAttribute("data-fixed-image") || holder.classList.contains("photo-frame") || holder.classList.contains("qr-card")) { showToast("固定区域请使用替换功能"); return; }
    var parent = holder.parentNode;
    var next = holder.nextSibling;
    var id = itemId(holder);
    holder.remove();
    if (holder.getAttribute("data-custom") === "1") saveCustomItems();
    else { var hidden = readJSON("hidden_items", []); if (hidden.indexOf(id) < 0) hidden.push(id); writeJSON("hidden_items", hidden); }
    pushUndo("删除作品", function () { parent.insertBefore(holder, next); var hidden = readJSON("hidden_items", []).filter(function (item) { return item !== id; }); writeJSON("hidden_items", hidden); saveCustomItems(); });
    selectedImage = null; updateSelectedPanel(); showToast("作品已删除，可点击撤销恢复");
  });
  q("#ep-upload") && q("#ep-upload").addEventListener("click", function () { requestImageUpload(selectedImage); });
  q("#ep-clear-size") && q("#ep-clear-size").addEventListener("click", resetSelectedSize);
  q("#ep-undo") && q("#ep-undo").addEventListener("click", undoLast);

  function exportConfiguration() {
    var values = {};
    for (var index = 0; index < storage.length; index += 1) {
      var key = storage.key(index);
      if (key && key.indexOf(PREFIX) === 0) values[key] = storage.getItem(key);
    }
    getAllStoredImages().then(function (images) {
      var payload = { format: "ZLC Portfolio Editor", version: 3, exportedAt: new Date().toISOString(), localStorage: values, images: images };
      var blob = new Blob([JSON.stringify(payload)], { type: "application/json;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "邹林清作品集配置-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
      showToast("配置已导出，可用于备份或迁移");
    });
  }
  q("#ep-export") && q("#ep-export").addEventListener("click", exportConfiguration);
  configImport.addEventListener("change", function () {
    var file = configImport.files && configImport.files[0];
    configImport.value = "";
    if (!file) return;
    file.text().then(function (text) {
      var payload = JSON.parse(text);
      if (!payload || payload.format !== "ZLC Portfolio Editor") throw new Error("invalid");
      var existingKeys = [];
      for (var index = 0; index < storage.length; index += 1) {
        var existingKey = storage.key(index);
        if (existingKey && existingKey.indexOf(PREFIX) === 0) existingKeys.push(existingKey);
      }
      existingKeys.forEach(function (key) { storage.removeItem(key); });
      Object.keys(payload.localStorage || {}).forEach(function (key) { if (key.indexOf(PREFIX) === 0) storage.setItem(key, payload.localStorage[key]); });
      return clearStoredImages().then(function () { return Promise.all((payload.images || []).map(function (record) { return saveStoredImage(record.id, record.data); })); });
    }).then(function () { showToast("配置导入成功，正在刷新"); setTimeout(function () { location.reload(); }, 500); }).catch(function () { showToast("配置文件无效或读取失败"); });
  });
  q("#ep-reset") && q("#ep-reset").addEventListener("click", function () {
    if (!window.confirm("确定恢复网站默认内容吗？建议先导出配置备份。")) return;
    var keys = [];
    for (var index = 0; index < storage.length; index += 1) { var key = storage.key(index); if (key && key.indexOf(PREFIX) === 0) keys.push(key); }
    keys.forEach(function (key) { storage.removeItem(key); });
    clearStoredImages().then(function () { location.reload(); });
  });
  q("#ep-help") && q("#ep-help").addEventListener("click", function () { showToast("快捷键 Ctrl/⌘ + Shift + E 可随时进入或退出编辑模式"); });

  applySavedImages();
  updateUndoButton();
})();

(function () {
  "use strict";

  var page = document.querySelector(".kv-page");
  if (!page) return;
  page.classList.add("edit-access");

  function createEditorShell() {
    if (!document.querySelector("#edit-toggle")) {
      var button = document.createElement("button");
      button.className = "edit-btn";
      button.id = "edit-toggle";
      button.type = "button";
      button.setAttribute("aria-label", "打开自定义编辑器");
      button.textContent = "✦ 编辑此页面";
      document.body.appendChild(button);
    }
    if (!document.querySelector("#edit-panel")) {
      var panel = document.createElement("aside");
      panel.className = "edit-panel";
      panel.id = "edit-panel";
      panel.setAttribute("aria-label", "页面可视化编辑器");
      document.body.appendChild(panel);
    }
    if (!document.querySelector("#edit-toolbar")) {
      var toolbar = document.createElement("div");
      toolbar.className = "edit-toolbar";
      toolbar.id = "edit-toolbar";
      toolbar.setAttribute("aria-label", "文字样式快捷工具栏");
      document.body.appendChild(toolbar);
    }
    if (!document.querySelector("#config-import")) {
      var input = document.createElement("input");
      input.id = "config-import";
      input.type = "file";
      input.accept = "application/json";
      input.hidden = true;
      document.body.appendChild(input);
    }
  }

  function prepareHeroImage() {
    var background = document.querySelector(".kv-hero-bg");
    if (!background || background.querySelector("img")) return;
    var image = document.createElement("img");
    image.src = "../assets/img/kv-2026/premium-dock.jpg";
    image.alt = "2026 旗舰店 KV 首屏背景";
    image.setAttribute("data-img", "kv-2026-hero-background");
    background.appendChild(image);
  }

  function prepareImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll(".kv-frame img, .kv-phone img"));
    images.forEach(function (image, index) {
      var figure = image.closest(".kv-frame, .kv-phone");
      if (!figure) return;
      var media = image.parentElement;
      if (!media.classList.contains("kv-media")) {
        media = document.createElement("div");
        media.className = "kv-media has-img";
        image.parentNode.insertBefore(media, image);
        media.appendChild(image);
      } else {
        media.classList.add("has-img");
      }
      if (!image.hasAttribute("data-img")) {
        image.setAttribute("data-img", "kv-2026-image-" + String(index + 1).padStart(2, "0"));
      }
      var stableImageId = image.getAttribute("data-img").replace("kv-2026-image-", "");
      figure.setAttribute("data-edit-card", "");
      figure.setAttribute("data-item-id", "kv-2026-card-" + stableImageId);
    });
  }

  function prepareSortableGroups() {
    var groups = [
      [".kv-triptych", "kv-2026-store-entrance"],
      [".kv-duo", "kv-2026-brand-meaning"],
      [".kv-category-grid", "kv-2026-category-system"],
      [".kv-campaign-grid", "kv-2026-campaign"],
      [".kv-extension-grid", "kv-2026-product-extension"]
    ];
    groups.forEach(function (entry) {
      var grid = document.querySelector(entry[0]);
      if (!grid) return;
      grid.classList.add("sortable-grid");
      grid.setAttribute("data-sort-key", entry[1]);
      Array.prototype.slice.call(grid.children).forEach(function (item, index) {
        if (!item.hasAttribute("data-item-id")) item.setAttribute("data-item-id", entry[1] + "-item-" + String(index + 1).padStart(2, "0"));
      });
    });

    var feature = document.querySelector(".kv-feature");
    if (feature && !feature.parentElement.classList.contains("kv-feature-grid")) {
      var wrapper = document.createElement("div");
      wrapper.className = "kv-feature-grid sortable-grid";
      wrapper.setAttribute("data-sort-key", "kv-2026-featured-product");
      feature.parentNode.insertBefore(wrapper, feature);
      wrapper.appendChild(feature);
    }
  }

  function prepareEditableText() {
    var selector = [
      "main h1 > span",
      "main h1 > b",
      "main h2",
      "main h3",
      "main p",
      "main dd",
      "main figcaption b",
      "main figcaption span",
      "main .kv-note-card strong",
      "main .kv-next b"
    ].join(",");
    var legacyTextKey = "zlc_portfolio_v3_text_kv-2026-text-044";
    var stableTextKey = "zlc_portfolio_v3_text_kv-2026-category-note-title";
    var legacyStyleKey = "zlc_portfolio_v3_text_style_kv-2026-text-044";
    var stableStyleKey = "zlc_portfolio_v3_text_style_kv-2026-category-note-title";
    if (localStorage.getItem(legacyTextKey) && !localStorage.getItem(stableTextKey)) {
      localStorage.setItem(stableTextKey, localStorage.getItem(legacyTextKey));
    }
    if (localStorage.getItem(legacyStyleKey) && !localStorage.getItem(stableStyleKey)) {
      localStorage.setItem(stableStyleKey, localStorage.getItem(legacyStyleKey));
    }
    localStorage.removeItem(legacyTextKey);
    localStorage.removeItem(legacyStyleKey);

    var elements = Array.prototype.slice.call(document.querySelectorAll(selector));
    var usedIds = {};
    elements.forEach(function (element) {
      if (element.hasAttribute("data-edit")) usedIds[element.getAttribute("data-edit")] = true;
    });
    var sequence = 1;
    elements.forEach(function (element) {
      if (element.closest(".kv-scroll")) return;
      element.classList.add("editable");
      if (!element.hasAttribute("data-edit")) {
        var candidate;
        do {
          candidate = "kv-2026-text-" + String(sequence).padStart(3, "0");
          sequence += 1;
        } while (usedIds[candidate]);
        element.setAttribute("data-edit", candidate);
        usedIds[candidate] = true;
      }
    });
  }

  function normalizeTitle() {
    var title = document.querySelector(".kv-hero h1");
    if (!title || title.querySelector("b")) return;
    var lead = title.querySelector("span");
    var leadText = lead ? lead.textContent : "2026 旗舰店";
    title.innerHTML = "";
    var pre = document.createElement("span");
    pre.textContent = leadText;
    var main = document.createElement("b");
    main.textContent = "KV 视觉系统";
    title.appendChild(pre);
    title.appendChild(main);
  }

  function numberValue(value, fallback) {
    var number = parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function initTextSliders() {
    var panel = document.querySelector("#edit-panel");
    if (!panel || panel.querySelector("#kv-text-controls")) return;

    var section = document.createElement("section");
    section.className = "ep-section";
    section.id = "kv-text-controls";
    section.innerHTML =
      '<div class="ep-section-title"><span>所选文字</span><span id="kv-selected-text">未选择</span></div>' +
      '<div class="ep-row"><label for="kv-text-size">文字大小</label><input id="kv-text-size" type="range" min="9" max="180" step="1" value="16"><output id="kv-text-size-val">16</output></div>' +
      '<div class="ep-row"><label for="kv-letter-space">文字间距</label><input id="kv-letter-space" type="range" min="-4" max="20" step="0.5" value="0"><output id="kv-letter-space-val">0</output></div>' +
      '<div class="ep-row"><label for="kv-line-height">文字行高</label><input id="kv-line-height" type="range" min="0.8" max="3" step="0.05" value="1.5"><output id="kv-line-height-val">1.5</output></div>' +
      '<div class="ep-actions"><button type="button" id="kv-text-reset">恢复所选文字样式</button></div>' +
      '<p class="ep-tip">先在页面中点击一段文字，再拖动滑杆。文字内容、字号、字距和行高会自动保存在当前浏览器。</p>';

    var selectedSection = panel.querySelector("#ep-selected");
    panel.insertBefore(section, selectedSection || panel.children[1] || null);

    var current = null;
    var PREFIX = "zlc_portfolio_v3_";
    var controls = {
      fs: document.querySelector("#kv-text-size"),
      ls: document.querySelector("#kv-letter-space"),
      lh: document.querySelector("#kv-line-height")
    };
    var outputs = {
      fs: document.querySelector("#kv-text-size-val"),
      ls: document.querySelector("#kv-letter-space-val"),
      lh: document.querySelector("#kv-line-height-val")
    };

    function storageKey(element) {
      return PREFIX + "text_style_" + element.getAttribute("data-edit");
    }
    function readStyle(element) {
      var computed = getComputedStyle(element);
      var size = numberValue(computed.fontSize, 16);
      var line = numberValue(computed.lineHeight, size * 1.5);
      return {
        fs: size,
        ls: computed.letterSpacing === "normal" ? 0 : numberValue(computed.letterSpacing, 0),
        lh: line / size
      };
    }
    function updatePanel(element) {
      current = element;
      var style = readStyle(element);
      controls.fs.value = Math.round(style.fs);
      controls.ls.value = style.ls.toFixed(1);
      controls.lh.value = style.lh.toFixed(2);
      outputs.fs.textContent = controls.fs.value;
      outputs.ls.textContent = controls.ls.value;
      outputs.lh.textContent = controls.lh.value;
      document.querySelector("#kv-selected-text").textContent = element.getAttribute("data-edit");
    }
    function apply(part, value) {
      if (!current) return;
      var style = readStyle(current);
      style[part] = Number(value);
      current.style.fontSize = style.fs + "px";
      current.style.letterSpacing = style.ls + "px";
      current.style.lineHeight = String(style.lh);
      try { localStorage.setItem(storageKey(current), JSON.stringify(style)); } catch (error) {}
    }

    document.querySelectorAll(".editable[data-edit]").forEach(function (element) {
      element.addEventListener("click", function () {
        if (!document.body.classList.contains("editing")) return;
        updatePanel(element);
      });
      element.addEventListener("focus", function () {
        if (document.body.classList.contains("editing")) updatePanel(element);
      });
    });

    Object.keys(controls).forEach(function (part) {
      controls[part].addEventListener("input", function () {
        if (!current) return;
        apply(part, controls[part].value);
        outputs[part].textContent = controls[part].value;
      });
    });

    document.querySelector("#kv-text-reset").addEventListener("click", function () {
      if (!current) return;
      current.style.fontSize = "";
      current.style.letterSpacing = "";
      current.style.lineHeight = "";
      try { localStorage.removeItem(storageKey(current)); } catch (error) {}
      updatePanel(current);
    });
  }

  createEditorShell();
  prepareHeroImage();
  normalizeTitle();
  prepareImages();
  prepareSortableGroups();
  prepareEditableText();
  document.addEventListener("DOMContentLoaded", initTextSliders, { once: true });
})();

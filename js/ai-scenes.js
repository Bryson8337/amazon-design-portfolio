(function () {
  "use strict";

  var body = document.body;
  if (!body.classList.contains("ai-scene-page")) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progressBar = document.querySelector(".scene-progress span");
  var heroImage = document.querySelector(".scene-hero-media img");
  var reelShell = document.querySelector("[data-horizontal-scene]");
  var reel = reelShell && reelShell.querySelector(".scene-reel");
  var reelCount = document.querySelector("[data-reel-progress]");
  var indexLinks = Array.prototype.slice.call(document.querySelectorAll(".scene-index a[data-target]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-scene-section]"));
  var ticking = false;

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function updateScrollScene() {
    ticking = false;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var pageRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progressBar) progressBar.style.transform = "scaleX(" + clamp(scrollTop / pageRange, 0, 1) + ")";

    if (heroImage && !reduceMotion && scrollTop < window.innerHeight * 1.25) {
      var heroProgress = clamp(scrollTop / window.innerHeight, 0, 1);
      heroImage.style.transform = "scale(" + (1.08 + heroProgress * 0.08) + ") translateY(" + (heroProgress * 4) + "%)";
    }

    if (reelShell && reel && window.innerWidth > 700 && !reduceMotion) {
      var bounds = reelShell.getBoundingClientRect();
      var travel = Math.max(1, reelShell.offsetHeight - window.innerHeight);
      var reelProgress = clamp(-bounds.top / travel, 0, 1);
      var maxMove = Math.max(0, reel.scrollWidth - window.innerWidth + window.innerWidth * 0.04);
      reel.style.transform = "translate3d(" + (-maxMove * reelProgress) + "px,0,0)";
      if (reelCount) {
        var item = Math.min(9, Math.floor(reelProgress * 8.99) + 1);
        reelCount.textContent = String(item).padStart(2, "0") + " — 09";
      }
    }

    var center = window.innerHeight * 0.42;
    var active = "";
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= center && rect.bottom > center) active = section.getAttribute("data-scene-section") || section.id;
    });
    indexLinks.forEach(function (link) { link.classList.toggle("active", link.dataset.target === active); });
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollScene);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -7% 0px" });
    document.querySelectorAll(".scene-reveal").forEach(function (element) { observer.observe(element); });
  } else {
    document.querySelectorAll(".scene-reveal").forEach(function (element) { element.classList.add("is-visible"); });
  }

  document.querySelectorAll("[data-spotlight]").forEach(function (area) {
    area.addEventListener("pointermove", function (event) {
      var rect = area.getBoundingClientRect();
      area.closest(".chapter-worlds").style.setProperty("--mx", ((event.clientX - rect.left) / rect.width * 100) + "%");
      area.closest(".chapter-worlds").style.setProperty("--my", ((event.clientY - rect.top) / rect.height * 100) + "%");
    });
  });

  document.querySelectorAll(".scene-card,.creator-card,.world-card").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      if (reduceMotion || window.innerWidth < 900 || body.classList.contains("editing")) return;
      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = "perspective(900px) rotateX(" + (-y * 2.4) + "deg) rotateY(" + (x * 2.4) + "deg) translateY(-3px)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", requestUpdate);
  updateScrollScene();
})();

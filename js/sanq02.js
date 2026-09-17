(function () {
  "use strict";

  var showcase = document.querySelector("[data-sync-showcase]");
  var sticky = document.querySelector("[data-listing-sticky]");
  var viewport = document.querySelector("[data-listing-window]");
  var track = document.querySelector("[data-listing-track]");
  var progressBar = document.querySelector("[data-reel-progress]");
  var progressIndex = document.querySelector("[data-reel-index]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopLayout = window.matchMedia("(min-width: 1024px) and (min-height: 620px)");

  if (!showcase || !sticky || !viewport || !track) return;

  var reelImages = Array.prototype.slice.call(track.querySelectorAll("img"));
  var metrics = {
    start: 0,
    end: 1
  };
  var targetPosition = 0;
  var currentPosition = 0;
  var frame = 0;
  var resizeFrame = 0;
  var isNear = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function syncEnabled() {
    return desktopLayout.matches && !reduceMotion.matches;
  }

  function wrappedDistance(index, position, count) {
    var distance = index - position;
    var half = count / 2;
    if (distance > half) distance -= count;
    if (distance < -half) distance += count;
    return distance;
  }

  function renderTrack() {
    var count = reelImages.length;
    if (!count) return;

    var cardGap = clamp(viewport.clientWidth * .08, 18, 28);
    var step = viewport.clientWidth + cardGap;

    reelImages.forEach(function (image, index) {
      var distance = wrappedDistance(index, currentPosition, count);
      var depth = Math.abs(distance);
      var translateY = distance * step;
      var translateZ = -depth * 94;
      var rotateX = clamp(distance * -14, -42, 42);
      var scale = 1 - Math.min(depth * .09, .3);
      var opacity = depth > 1.85 ? 0 : Math.max(.1, 1 - depth * .32);

      image.style.transform = "translate3d(0,calc(-50% + " + translateY.toFixed(2) + "px)," + translateZ.toFixed(2) + "px) rotateX(" + rotateX.toFixed(2) + "deg) scale(" + scale.toFixed(4) + ")";
      image.style.opacity = opacity.toFixed(3);
      image.style.zIndex = String(100 - Math.round(depth * 12));
      image.style.visibility = depth > 2.1 ? "hidden" : "visible";
      image.classList.toggle("is-active-card", depth < .42);
    });

    track.style.setProperty("--carousel-position", currentPosition.toFixed(4));
  }

  function scrollProgress() {
    if (!syncEnabled()) return 0;
    return clamp((window.scrollY - metrics.start) / Math.max(1, metrics.end - metrics.start), 0, 1);
  }

  function updateReadout(progress) {
    if (progressBar) progressBar.style.transform = "scaleY(" + progress.toFixed(4) + ")";
    if (progressIndex) {
      var item = Math.min(reelImages.length, Math.max(1, Math.round(progress * Math.max(0, reelImages.length - 1)) + 1));
      progressIndex.textContent = String(item).padStart(2, "0");
    }
  }

  function animateTrack() {
    frame = 0;
    var difference = targetPosition - currentPosition;

    if (Math.abs(difference) < .001) {
      currentPosition = targetPosition;
      renderTrack();
      return;
    }

    currentPosition += difference * .125;
    renderTrack();
    frame = window.requestAnimationFrame(animateTrack);
  }

  function requestTrackUpdate(immediate) {
    if (!syncEnabled()) {
      targetPosition = 0;
      currentPosition = 0;
      renderTrack();
      updateReadout(0);
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      return;
    }

    var progress = scrollProgress();
    targetPosition = Math.round(progress * Math.max(0, reelImages.length - 1));
    updateReadout(progress);

    if (immediate) {
      currentPosition = targetPosition;
      renderTrack();
      return;
    }

    if (!frame) frame = window.requestAnimationFrame(animateTrack);
  }

  function measure() {
    var showcaseRect = showcase.getBoundingClientRect();
    var showcaseTop = window.scrollY + showcaseRect.top;
    var stickyTop = parseFloat(window.getComputedStyle(sticky).top) || 0;
    var stickyHeight = sticky.offsetHeight;

    metrics.start = showcaseTop - stickyTop;
    metrics.end = Math.max(
      metrics.start + 1,
      showcaseTop + showcase.offsetHeight - stickyHeight - stickyTop
    );

    requestTrackUpdate(true);
  }

  function scheduleMeasure() {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(function () {
      resizeFrame = 0;
      measure();
    });
  }

  window.addEventListener("scroll", function () {
    if (isNear) requestTrackUpdate(false);
  }, { passive: true });

  window.addEventListener("resize", scheduleMeasure, { passive: true });
  window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
  window.addEventListener("pageshow", scheduleMeasure);

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", scheduleMeasure);
    desktopLayout.addEventListener("change", scheduleMeasure);
  } else {
    reduceMotion.addListener(scheduleMeasure);
    desktopLayout.addListener(scheduleMeasure);
  }

  if ("ResizeObserver" in window) {
    var resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(showcase);
    resizeObserver.observe(sticky);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
  }

  reelImages.forEach(function (image) {
    if (!image.complete) image.addEventListener("load", scheduleMeasure, { once: true });
  });

  if ("IntersectionObserver" in window) {
    var proximityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isNear = entry.isIntersecting;
        showcase.classList.toggle("is-near", isNear);

        if (isNear) {
          reelImages.forEach(function (image) {
            image.loading = "eager";
          });
          scheduleMeasure();
          requestTrackUpdate(true);
        }
      });
    }, { rootMargin: "1100px 0px" });

    proximityObserver.observe(showcase);
  } else {
    isNear = true;
    showcase.classList.add("is-near");
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }

  /* Mobile / reduced-motion gallery */
  var mobileRail = document.querySelector("[data-mobile-rail]");
  var mobileCards = mobileRail ? Array.prototype.slice.call(mobileRail.querySelectorAll("figure")) : [];
  var mobileIndex = document.querySelector("[data-mobile-index]");
  var previousButton = document.querySelector("[data-mobile-prev]");
  var nextButton = document.querySelector("[data-mobile-next]");
  var activeMobile = 0;
  var mobileFrame = 0;

  function setMobileIndex(index) {
    activeMobile = clamp(index, 0, Math.max(0, mobileCards.length - 1));
    if (mobileIndex) mobileIndex.textContent = String(activeMobile + 1).padStart(2, "0");
    if (previousButton) previousButton.disabled = activeMobile === 0;
    if (nextButton) nextButton.disabled = activeMobile === mobileCards.length - 1;
  }

  function nearestMobileCard() {
    if (!mobileRail || !mobileCards.length) return;
    var railLeft = mobileRail.scrollLeft;
    var closest = 0;
    var distance = Infinity;

    mobileCards.forEach(function (card, index) {
      var currentDistance = Math.abs(card.offsetLeft - railLeft);
      if (currentDistance < distance) {
        distance = currentDistance;
        closest = index;
      }
    });

    setMobileIndex(closest);
  }

  function goToMobile(index) {
    if (!mobileRail || !mobileCards.length) return;
    var nextIndex = clamp(index, 0, mobileCards.length - 1);
    var card = mobileCards[nextIndex];

    mobileRail.scrollTo({
      left: card.offsetLeft,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
    setMobileIndex(nextIndex);
  }

  if (mobileRail) {
    mobileRail.addEventListener("scroll", function () {
      if (mobileFrame) return;
      mobileFrame = window.requestAnimationFrame(function () {
        mobileFrame = 0;
        nearestMobileCard();
      });
    }, { passive: true });

    mobileRail.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToMobile(activeMobile - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToMobile(activeMobile + 1);
      }
    });
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      goToMobile(activeMobile - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      goToMobile(activeMobile + 1);
    });
  }

  setMobileIndex(0);
  measure();
})();

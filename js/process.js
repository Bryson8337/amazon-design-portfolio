(function () {
  "use strict";

  var cases = [
    { resolution: "1800 × 1177", steps: [["case-01-step-01.jpg","概念场景","CONCEPT"],["case-01-step-02.jpg","空间重构","REBUILD"],["case-01-step-03.jpg","产品完稿","FINAL"]] },
    { resolution: "1800 × 1013", steps: [["case-02-step-01.jpg","产品渲染","RENDER"],["case-02-step-02.jpg","散热完稿","COOLING"]] },
    { resolution: "1800 × 900", steps: [["case-03-step-01.jpg","产品阵列","LAYOUT"],["case-03-step-02.jpg","比例统一","REFINE"],["case-03-step-03.jpg","背景构建","SCENE"]] },
    { resolution: "1800 × 900", steps: [["case-04-step-01.jpg","初始构图","LAYOUT"],["case-04-step-02.jpg","阵列调整","REFINE"],["case-04-step-03.jpg","氛围完稿","FINAL"]] },
    { resolution: "1800 × 1005", steps: [["case-05-step-01.jpg","产品陈列","DISPLAY"],["case-05-step-02.jpg","家居场景","INTERIOR"],["case-05-step-03.jpg","产品融合","FINAL"]] },
    { resolution: "1800 × 900", steps: [["case-06-step-01.jpg","基础陈列","BASE"],["case-06-step-02.jpg","品类扩展","EXPAND"],["case-06-step-03.jpg","活动完稿","FINAL"]] },
    { resolution: "1800 × 900", steps: [["case-07-step-01.jpg","线性背景","EXPLORE"],["case-07-step-02.jpg","极简净化","REFINE"]] }
  ];

  var host = document.querySelector("[data-process-stack]");
  if (!host) return;

  var dwellTime = 1500;
  var transitionTime = 1350;
  var controllers = [];
  var imagePath = function (file) { return "../assets/img/process/" + file; };

  cases.forEach(function (item, caseIndex) {
    var article = document.createElement("article");
    article.className = "process-case-block";
    article.innerHTML = [
      '<header class="process-case-index">',
        '<span>CASE</span><b>', String(caseIndex + 1).padStart(2, "0"), '</b>',
        '<small>', String(item.steps.length).padStart(2, "0"), ' STEPS</small>',
      '</header>',
      '<div class="case-console">',
        '<div class="case-media">',
          '<div class="case-images"></div>',
          '<i class="case-light-beam" aria-hidden="true"></i>',
          '<span class="case-image-label">', item.resolution, ' · DETAIL VIEW</span>',
        '</div>',
        '<aside class="case-side">',
          '<div class="case-auto-status"><span><i></i>AUTO PLAY</span><button type="button" aria-label="暂停案例 ', caseIndex + 1, '">暂停</button></div>',
          '<div class="case-step-list" style="--step-count:', item.steps.length, '"></div>',
          '<div class="case-auto-note"><span>01 / ', String(item.steps.length).padStart(2, "0"), '</span><span>1.5S / FRAME</span></div>',
        '</aside>',
      '</div>'
    ].join("");
    host.appendChild(article);

    var media = article.querySelector(".case-media");
    var imagesHost = article.querySelector(".case-images");
    var stepsHost = article.querySelector(".case-step-list");
    var count = article.querySelector(".case-auto-note span:first-child");
    var toggle = article.querySelector(".case-auto-status button");
    var stepIndex = 0;
    var inView = false;
    var manualPaused = false;
    var running = false;
    var transitioning = false;
    var dwellTimer = null;
    var transitionToken = 0;

    item.steps.forEach(function (step, stepIndexValue) {
      var image = document.createElement("img");
      image.src = imagePath(step[0]);
      image.alt = "案例 " + String(caseIndex + 1).padStart(2, "0") + " · 步骤 " + String(stepIndexValue + 1).padStart(2, "0");
      image.loading = caseIndex === 0 ? "eager" : "lazy";
      image.decoding = "async";
      if (stepIndexValue === 0) image.classList.add("active");
      imagesHost.appendChild(image);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "case-auto-step" + (stepIndexValue === 0 ? " active" : "");
      button.innerHTML = '<span class="case-auto-thumb"><img src="' + imagePath(step[0]) + '" alt="步骤 ' + (stepIndexValue + 1) + ' 预览" loading="lazy"><i></i></span><span class="case-step-copy"><small>' + String(stepIndexValue + 1).padStart(2, "0") + ' · ' + step[2] + '</small><b>' + step[1] + '</b></span>';
      stepsHost.appendChild(button);
    });

    var images = Array.prototype.slice.call(imagesHost.children);
    var stepButtons = Array.prototype.slice.call(stepsHost.children);

    function restartProgress() {
      var current = stepButtons[stepIndex];
      current.classList.remove("active");
      void current.offsetWidth;
      current.classList.add("active");
    }

    function stop() {
      running = false;
      clearTimeout(dwellTimer);
      article.classList.remove("is-running");
    }

    function schedule() {
      clearTimeout(dwellTimer);
      if (!running || transitioning) return;
      article.classList.add("is-running");
      restartProgress();
      dwellTimer = setTimeout(function () {
        switchStep((stepIndex + 1) % item.steps.length);
      }, dwellTime);
    }

    function start() {
      if (running || manualPaused || !inView || document.hidden) return;
      running = true;
      article.classList.add("is-running");
      toggle.textContent = "暂停";
      toggle.setAttribute("aria-label", "暂停案例 " + (caseIndex + 1));
      schedule();
    }

    function updateStepUI(nextStep) {
      stepButtons.forEach(function (button, index) { button.classList.toggle("active", index === nextStep); });
      count.textContent = String(nextStep + 1).padStart(2, "0") + " / " + String(item.steps.length).padStart(2, "0");
      if (window.matchMedia("(max-width: 900px)").matches) {
        stepButtons[nextStep].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }

    function switchStep(nextStep) {
      if (transitioning || nextStep === stepIndex) return;
      clearTimeout(dwellTimer);
      transitioning = true;
      article.classList.remove("is-running");
      var previous = images[stepIndex];
      var target = images[nextStep];
      var token = ++transitionToken;
      updateStepUI(nextStep);
      target.classList.add("incoming");
      void target.offsetWidth;
      target.classList.add("revealing");
      media.classList.remove("changing");
      void media.offsetWidth;
      media.classList.add("changing");
      window.setTimeout(function () {
        if (token !== transitionToken) return;
        previous.classList.remove("active");
        target.classList.remove("incoming", "revealing");
        target.classList.add("active");
        stepIndex = nextStep;
        transitioning = false;
        if (running) article.classList.add("is-running");
        schedule();
      }, transitionTime + 40);
    }

    stepButtons.forEach(function (button, index) {
      button.addEventListener("click", function () { if (index !== stepIndex) switchStep(index); });
    });

    toggle.addEventListener("click", function () {
      manualPaused = !manualPaused;
      if (manualPaused) {
        stop();
        toggle.textContent = "继续";
        toggle.setAttribute("aria-label", "继续案例 " + (caseIndex + 1));
      } else {
        start();
      }
    });

    controllers.push({
      article: article,
      setInView: function (value) { inView = value; if (inView) start(); else stop(); },
      sync: function () { if (inView && !manualPaused && !document.hidden) start(); else stop(); }
    });
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var controller = controllers.find(function (item) { return item.article === entry.target; });
        if (controller) controller.setInView(entry.isIntersecting);
      });
    }, { rootMargin: "120px 0px 120px", threshold: .16 });
    controllers.forEach(function (controller) { observer.observe(controller.article); });
  } else {
    controllers.forEach(function (controller) { controller.setInView(true); });
  }

  document.addEventListener("visibilitychange", function () {
    controllers.forEach(function (controller) { controller.sync(); });
  });
})();
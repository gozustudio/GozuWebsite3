(function () {
  var CONTACT_EMAIL = "info@gozustudio.com";
  var PHONE = "+44 07765 577275";
  var LOGO_SVG_PATH = "/static/images/gozustudio-logo.svg";
  var REVIEW_IMAGE_PATH = "/static/images/Review.jpeg";

  var networks = [
    { label: "Telegram", href: "https://t.me/+447765577275", icon: "/static/images/telegram.svg" },
    { label: "Instagram", href: "https://www.instagram.com/gozustudio/", icon: "/static/images/instagram.svg" },
    { label: "WhatsApp", href: "https://wa.me/447765577275", icon: "/static/images/whatsapp.svg" }
  ];

  var cachedLogoSVG = "";
  var logoFetchPromise = null;

  function loadLogoSVG() {
    if (cachedLogoSVG) return Promise.resolve(cachedLogoSVG);
    if (logoFetchPromise) return logoFetchPromise;

    logoFetchPromise = fetch(LOGO_SVG_PATH, { cache: "force-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load logo SVG");
        return res.text();
      })
      .then(function (svgText) {
        cachedLogoSVG = svgText;
        return cachedLogoSVG;
      })
      .catch(function () {
        return "";
      });

    return logoFetchPromise;
  }

  function forceLogo(logoSection) {
    if (!logoSection) return;

    var oldTerminalLogo = logoSection.querySelector(".terminal-logo");
    if (oldTerminalLogo) oldTerminalLogo.remove();

    var holder = logoSection.querySelector(".gozu-logo-inline");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "gozu-logo-inline";
      logoSection.insertBefore(holder, logoSection.firstChild);
    }

    if (holder.getAttribute("data-gozu-ready") === "1") return;

    loadLogoSVG().then(function (svgText) {
      if (svgText) {
        holder.innerHTML = svgText;
        var svg = holder.querySelector("svg");
        if (svg) {
          svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
        }
      } else {
        holder.innerHTML = "";
        var img = document.createElement("img");
        img.src = LOGO_SVG_PATH;
        img.alt = "Gozu Studio";
        img.loading = "eager";
        holder.appendChild(img);
      }
      holder.setAttribute("data-gozu-ready", "1");
    });
  }

  function patchFooter(footer) {
    forceLogo(footer.querySelector(".logo-section"));

    var gartner = footer.querySelector(".gartner-section");
    if (gartner && gartner.getAttribute("data-gozu-patched") !== "1") {
      gartner.classList.add("gozu-proof");
      gartner.innerHTML = "<p class=\"gozu-proof-text\">Thoughtful architecture and interiors designed to improve how people live, work, and gather.</p>";
      gartner.setAttribute("data-gozu-patched", "1");
    }

    var labels = footer.querySelectorAll(".links-list .label span");
    if (labels[0]) labels[0].textContent = "Our Style";
    if (labels[1]) labels[1].textContent = "Company";

    var contactLink = footer.querySelector(".contact-link");
    if (contactLink) {
      contactLink.textContent = "Connect with our experts today.";
      contactLink.href = "mailto:" + CONTACT_EMAIL;
      contactLink.target = "";
      contactLink.rel = "";
    }

    var contactText = footer.querySelector(".contact-text");
    if (contactText) {
      contactText.textContent = "Email " + CONTACT_EMAIL + " or message us on " + PHONE + ".";
    }

    var networksList = footer.querySelector(".networks-list");
    if (networksList && networksList.getAttribute("data-gozu-socials") !== "1") {
      networksList.innerHTML = "";

      networks.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "network-item";

        var a = document.createElement("a");
        a.className = "network-link";
        a.href = item.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", item.label);

        var icon = document.createElement("span");
        icon.className = "gozu-network-icon";
        icon.setAttribute("aria-hidden", "true");

        var img = document.createElement("img");
        img.src = item.icon;
        img.alt = "";
        img.loading = "eager";
        icon.appendChild(img);

        var text = document.createElement("span");
        text.className = "network-label link-active";
        text.textContent = item.label;

        a.appendChild(icon);
        a.appendChild(text);
        li.appendChild(a);
        networksList.appendChild(li);
      });

      networksList.setAttribute("data-gozu-socials", "1");
    }

    var credits = footer.querySelector(".credits");
    if (credits) {
      credits.textContent = "";
      var span = document.createElement("span");
      span.className = "gozu-credit-text";
      span.textContent = "Made by GozuStudio";
      credits.appendChild(span);
    }
  }

  function patchReviewImage() {
    var blocks = document.querySelectorAll(".big-image-content");
    blocks.forEach(function (block) {
      var author = block.querySelector(".quote-author .name, .author-info .name, .name");
      if (!author || !/isabella martin/i.test(author.textContent || "")) {
        return;
      }

      if (block.getAttribute("data-gozu-review-fixed") === "1") {
        return;
      }

      var images = block.querySelectorAll(".image-wrapper img, img");
      if (!images.length) return;

      images.forEach(function (img) {
        img.src = REVIEW_IMAGE_PATH;
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.loading = "eager";
        img.decoding = "async";
        img.style.opacity = "1";
        img.style.visibility = "visible";
      });

      block.querySelectorAll(".image-wrapper source").forEach(function (source) {
        source.srcset = REVIEW_IMAGE_PATH;
      });

      block.setAttribute("data-gozu-review-fixed", "1");
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parseIndex(value) {
    var parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? -1 : parsed;
  }

  function getIndexFromCssVar(section, maxIndex) {
    var inner = section.querySelector(".inner");
    if (!inner) return -1;

    var raw = getComputedStyle(inner).getPropertyValue("--current-item");
    var index = parseIndex(raw);
    if (index < 0) return -1;
    return clamp(index, 0, maxIndex);
  }

  function getLastShownIndex(scrollItems) {
    var index = -1;
    scrollItems.forEach(function (item, i) {
      if (item.classList.contains("show")) index = i;
    });
    return index;
  }

  function getClosestVisibleIndex(scrollItems, maxIndex) {
    var viewportCenter = window.innerHeight * 0.5;
    var bestIndex = 0;
    var bestDistance = Number.POSITIVE_INFINITY;

    scrollItems.forEach(function (item, i) {
      var rect = item.getBoundingClientRect();
      if (rect.height <= 0) return;
      var center = rect.top + rect.height * 0.5;
      var distance = Math.abs(center - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });

    return clamp(bestIndex, 0, maxIndex);
  }

  function resolveActiveIndex(section, scrollItems, maxIndex) {
    var cssIndex = getIndexFromCssVar(section, maxIndex);
    if (cssIndex >= 0) return cssIndex;

    var shownIndex = getLastShownIndex(scrollItems);
    if (shownIndex >= 0) return clamp(shownIndex, 0, maxIndex);

    return getClosestVisibleIndex(scrollItems, maxIndex);
  }

  function syncFeaturesMedia(section) {
    var scrollItems = Array.prototype.slice.call(section.querySelectorAll(".scroll-item"));
    var mediaEls = Array.prototype.slice.call(section.querySelectorAll(".images .media-el"));
    var counterEls = Array.prototype.slice.call(section.querySelectorAll(".counter__mobile"));
    var length = Math.min(scrollItems.length, mediaEls.length);

    if (!length) return;

    var activeIndex = resolveActiveIndex(section, scrollItems, length - 1);
    section.setAttribute("data-gozu-active-index", String(activeIndex));

    counterEls.forEach(function (item, i) {
      item.classList.toggle("show", i === activeIndex);
    });

    mediaEls.forEach(function (mediaEl, i) {
      var isActive = i === activeIndex;
      mediaEl.classList.toggle("is-visible", isActive);
      mediaEl.style.opacity = isActive ? "1" : "0";
      mediaEl.style.visibility = isActive ? "visible" : "hidden";
      mediaEl.style.pointerEvents = isActive ? "auto" : "none";
      mediaEl.style.zIndex = isActive ? "2" : "1";

      var video = mediaEl.querySelector("video");
      if (!video) return;

      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");

      if (isActive) {
        if (video.readyState < 2 && typeof video.load === "function") {
          try {
            video.load();
          } catch (_err) {}
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    });
  }

  function patchFeaturesSteps() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".features-steps"));
    if (!sections.length) return;

    sections.forEach(function (section) {
      if (section.getAttribute("data-gozu-features-patched") === "1") {
        return;
      }

      section.setAttribute("data-gozu-features-patched", "1");

      var rafId = 0;
      function runSync() {
        rafId = 0;
        syncFeaturesMedia(section);
      }

      function queueSync() {
        if (rafId) return;
        rafId = requestAnimationFrame(runSync);
      }

      queueSync();

      var observer = new MutationObserver(function () {
        queueSync();
      });

      observer.observe(section, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "data-state", "aria-current"]
      });

      var io = new IntersectionObserver(
        function () {
          queueSync();
        },
        { threshold: [0.2, 0.35, 0.5, 0.65, 0.8] }
      );

      section.querySelectorAll(".scroll-item").forEach(function (item) {
        io.observe(item);
      });

      section.addEventListener("wheel", queueSync, { passive: true });
      section.addEventListener("scroll", queueSync, { passive: true });
      window.addEventListener("scroll", queueSync, { passive: true });
      window.addEventListener("resize", queueSync, { passive: true });

      var warmupRuns = 0;
      var warmup = setInterval(function () {
        warmupRuns += 1;
        queueSync();
        if (warmupRuns >= 36) {
          clearInterval(warmup);
        }
      }, 350);
    });
  }

  function applyOverrides() {
    document.querySelectorAll(".footer").forEach(patchFooter);
    patchReviewImage();
    patchFeaturesSteps();
  }

  function scheduleApply() {
    var tries = 0;
    var maxTries = 24;

    function run() {
      tries += 1;
      try {
        applyOverrides();
      } catch (_err) {
        // Keep this override fail-safe and non-blocking.
      }
      if (tries >= maxTries) {
        clearInterval(timer);
      }
    }

    run();
    var timer = setInterval(run, 800);
  }

  document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
  window.addEventListener("load", scheduleApply, { once: true });
})();

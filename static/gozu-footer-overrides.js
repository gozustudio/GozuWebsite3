(() => {
  if (window.__gozuMediaRecoveryInitialized) return;
  window.__gozuMediaRecoveryInitialized = true;

  const FALLBACK_REVIEW_IMAGE = "/static/images/Review.jpeg";
  const FALLBACK_LOGO_IMAGE = "/static/images/gozustudio-logo-white.svg";
  let mutationQueued = false;
  let scrollGuardInstalled = false;

  const safePlay = (video) => {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const clearPictureSources = (img) => {
    const picture = img.closest("picture");
    if (!picture) return;
    picture.querySelectorAll("source").forEach((source) => {
      source.removeAttribute("srcset");
      source.removeAttribute("sizes");
    });
  };

  const replaceImageWithFallback = (img, fallback) => {
    if (!img || !img.isConnected) return;
    clearPictureSources(img);
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.setAttribute("src", fallback);
    img.style.objectFit = "contain";
    img.style.opacity = "1";
  };

  const forceHideStuckLoader = () => {
    const candidates = document.querySelectorAll(
      ".app-loader, .loader, .loading-screen, .page-loader, [data-loader], [data-loading]"
    );

    candidates.forEach((el) => {
      if (!el) return;
      const style = window.getComputedStyle(el);
      const className = (el.className || "").toString().toLowerCase();
      const isBlocking =
        style.position === "fixed" ||
        style.position === "sticky" ||
        Number(style.zIndex || 0) > 999 ||
        className.includes("loader");

      if (!isBlocking) return;

      el.style.opacity = "0";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("data-gozu-hidden", "true");
    });

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.touchAction = "auto";
  };

  const patchBrokenStoryblokImages = () => {
    const imgs = document.querySelectorAll('img[src*="storyblok.com"], img[data-src*="storyblok.com"], img[data-nuxt-img]');

    imgs.forEach((img) => {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || img.currentSrc || "";
      if (!src.includes("storyblok.com")) return;

      if (img.dataset.gozuPatched === "1") return;
      img.dataset.gozuPatched = "1";

      const isLogoLike = /(ryder|prologis|nfi|lineage|8vc|logo|coca-cola|hp)\./i.test(src);
      const fallback = isLogoLike ? FALLBACK_LOGO_IMAGE : FALLBACK_REVIEW_IMAGE;

      const checkAndPatch = () => {
        if (!img.isConnected) return;
        if (img.naturalWidth > 0) return;
        replaceImageWithFallback(img, fallback);
      };

      img.addEventListener("error", checkAndPatch, { once: true });
      setTimeout(checkAndPatch, 1500);
      setTimeout(checkAndPatch, 3500);
      setTimeout(checkAndPatch, 7000);
    });
  };

  const patchStoryblokBackgroundImages = () => {
    const elems = document.querySelectorAll("*");
    elems.forEach((el) => {
      if (el.dataset.gozuBgPatched === "1") return;
      const bg = window.getComputedStyle(el).backgroundImage;
      if (!bg || bg === "none" || !bg.includes("storyblok.com")) return;

      el.dataset.gozuBgPatched = "1";
      const match = bg.match(/url\(["']?(.*?)["']?\)/i);
      if (!match || !match[1]) return;

      const tester = new Image();
      tester.onload = () => {
        el.style.setProperty("background-color", "transparent", "important");
      };
      tester.onerror = () => {
        el.style.setProperty("background-image", `url('${FALLBACK_REVIEW_IMAGE}')`, "important");
        el.style.setProperty("background-size", "cover", "important");
        el.style.setProperty("background-position", "center center", "important");
        el.style.setProperty("background-repeat", "no-repeat", "important");
      };
      tester.src = match[1];
    });
  };

  const syncFeatureVideos = () => {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) return;

    videos.forEach((video) => {
      video.loop = true;
      video.preload = "auto";
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            videos.forEach((other) => {
              if (other !== video && !other.paused) other.pause();
            });
            safePlay(video);
          }
        });
      },
      { threshold: [0.45, 0.7] }
    );

    videos.forEach((video) => observer.observe(video));

    const ensureOneVisibleVideoPlays = () => {
      const visible = videos.find((video) => {
        const rect = video.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.2;
      });
      if (visible) safePlay(visible);
    };

    ensureOneVisibleVideoPlays();
    window.addEventListener("scroll", ensureOneVisibleVideoPlays, { passive: true });
  };

  const installHeroSequenceFallback = () => {
    const sequenceRoot = document.querySelector(
      ".video-sequence, [class*='video-sequence'], [class*='hero-sequence'], [class*='get-frames']"
    );
    if (!sequenceRoot) return;
    if (sequenceRoot.querySelector(".gozu-sequence-fallback")) return;

    window.setTimeout(() => {
      const hasCanvas = !!sequenceRoot.querySelector("canvas");
      const hasLoadedFrame = !!sequenceRoot.querySelector("img[src*='hero_anim'], img[src*='frames/home']");
      if (hasCanvas || hasLoadedFrame) return;

      const fallbackVideo = document.createElement("video");
      fallbackVideo.className = "gozu-sequence-fallback";
      fallbackVideo.src = "/static/videos/hp-where-4.mp4";
      fallbackVideo.autoplay = true;
      fallbackVideo.loop = true;
      fallbackVideo.muted = true;
      fallbackVideo.defaultMuted = true;
      fallbackVideo.playsInline = true;
      fallbackVideo.style.width = "100%";
      fallbackVideo.style.height = "100%";
      fallbackVideo.style.objectFit = "cover";
      fallbackVideo.style.display = "block";
      sequenceRoot.appendChild(fallbackVideo);
      safePlay(fallbackVideo);
    }, 3200);
  };

  const installScrollFreezeGuard = () => {
    if (scrollGuardInstalled) return;
    scrollGuardInstalled = true;

    let unchangedScrollTicks = 0;
    let lastY = window.scrollY;

    const unlock = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "auto";
      document.body.style.position = "";
    };

    window.addEventListener(
      "wheel",
      () => {
        const nowY = window.scrollY;
        if (Math.abs(nowY - lastY) < 1) {
          unchangedScrollTicks += 1;
          if (unchangedScrollTicks >= 8) {
            unlock();
            unchangedScrollTicks = 0;
          }
        } else {
          unchangedScrollTicks = 0;
          lastY = nowY;
        }
      },
      { passive: true }
    );

    window.addEventListener("touchmove", unlock, { passive: true });
  };

  const runAllFixes = () => {
    forceHideStuckLoader();
    patchBrokenStoryblokImages();
    patchStoryblokBackgroundImages();
    syncFeatureVideos();
    installHeroSequenceFallback();
    installScrollFreezeGuard();
  };

  const queueRun = () => {
    if (mutationQueued) return;
    mutationQueued = true;
    requestAnimationFrame(() => {
      mutationQueued = false;
      runAllFixes();
    });
  };

  document.addEventListener("DOMContentLoaded", runAllFixes);
  window.addEventListener("load", runAllFixes);
  setTimeout(runAllFixes, 600);
  setTimeout(runAllFixes, 2000);
  setTimeout(runAllFixes, 5000);

  const mo = new MutationObserver(queueRun);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

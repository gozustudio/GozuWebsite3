(() => {
  if (window.__gozuFooterOverridesLoaded) return;
  window.__gozuFooterOverridesLoaded = true;

  const CONTACT_EMAIL = "info@gozustudio.com";
  const PHONE = "+44 07765 577275";
  const LOGO_SVG_PATH = "/static/images/gozustudio-logo.svg";
  const REVIEW_IMAGE_PATH = "/static/images/Review.jpeg";

  const SOCIALS = [
    { label: "Telegram", href: "https://t.me/+447765577275", icon: "/static/images/telegram.svg" },
    { label: "Instagram", href: "https://www.instagram.com/gozustudio/", icon: "/static/images/instagram.svg" },
    { label: "WhatsApp", href: "https://wa.me/447765577275", icon: "/static/images/whatsapp.svg" }
  ];

  let cachedLogoSvg = "";
  let logoPromise = null;
  let applyTimer = null;

  function loadLogoSvg() {
    if (cachedLogoSvg) return Promise.resolve(cachedLogoSvg);
    if (logoPromise) return logoPromise;

    logoPromise = fetch(LOGO_SVG_PATH)
      .then((res) => (res.ok ? res.text() : ""))
      .then((svg) => {
        cachedLogoSvg = svg || "";
        return cachedLogoSvg;
      })
      .catch(() => "");

    return logoPromise;
  }

  function replaceFooterLogo(footer) {
    const logoSection = footer.querySelector(".logo-section");
    if (!logoSection) return;

    logoSection.querySelectorAll(".terminal-logo, .gozu-logo-inline").forEach((el) => el.remove());

    let wrap = logoSection.querySelector(".gozu-logo-img-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "gozu-logo-img-wrap";
      logoSection.insertBefore(wrap, logoSection.firstChild);
    }

    loadLogoSvg().then((svgText) => {
      if (!wrap || !wrap.isConnected) return;

      if (svgText) {
        wrap.innerHTML = svgText;
        const svg = wrap.querySelector("svg");
        if (svg) {
          svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
        }
      } else {
        wrap.innerHTML = "";
        const img = document.createElement("img");
        img.src = LOGO_SVG_PATH;
        img.alt = "Gozu Studio";
        img.loading = "eager";
        wrap.appendChild(img);
      }
    });
  }

  function patchFooter(footer) {
    replaceFooterLogo(footer);

    const gartner = footer.querySelector(".gartner-section");
    if (gartner) {
      gartner.classList.add("gozu-proof");
      gartner.innerHTML =
        '<p class="gozu-proof-text">Thoughtful architecture and interiors designed to improve how people live, work, and gather.</p>';
    }

    const labels = footer.querySelectorAll(".links-list .label span");
    if (labels[0]) labels[0].textContent = "Our Style";
    if (labels[1]) labels[1].textContent = "Company";

    const contactLink = footer.querySelector(".contact-link");
    if (contactLink) {
      contactLink.textContent = "Connect with our experts today.";
      contactLink.href = "mailto:" + CONTACT_EMAIL;
      contactLink.target = "";
      contactLink.rel = "";
    }

    const contactText = footer.querySelector(".contact-text");
    if (contactText) {
      contactText.textContent = `Email ${CONTACT_EMAIL} or message us on ${PHONE}.`;
    }

    const networksList = footer.querySelector(".networks-list");
    if (networksList) {
      networksList.innerHTML = "";
      SOCIALS.forEach((item) => {
        const li = document.createElement("li");
        li.className = "network-item";

        const a = document.createElement("a");
        a.className = "network-link";
        a.href = item.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", item.label);

        const icon = document.createElement("img");
        icon.className = "gozu-network-icon";
        icon.src = item.icon;
        icon.alt = item.label;
        icon.loading = "lazy";

        const label = document.createElement("span");
        label.className = "network-label";
        label.textContent = item.label;

        a.appendChild(icon);
        a.appendChild(label);
        li.appendChild(a);
        networksList.appendChild(li);
      });
    }

    const credits = footer.querySelector(".credits");
    if (credits) {
      credits.innerHTML = "";
      const span = document.createElement("span");
      span.className = "gozu-credit-text";
      span.textContent = "Made by GozuStudio";
      credits.appendChild(span);
    }
  }

  function patchReviewImage() {
    document.querySelectorAll(".big-image-content").forEach((block) => {
      const author = block.querySelector(".quote-author .name, .author-info .name, .name");
      if (!author || !/isabella martin/i.test(author.textContent || "")) return;

      block.setAttribute("data-gozu-review-fixed", "1");
      block.querySelectorAll(".image-wrapper picture source").forEach((s) => s.remove());
      block.querySelectorAll(".image-wrapper img").forEach((img) => {
        img.src = REVIEW_IMAGE_PATH;
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.loading = "eager";
      });
    });
  }

  function apply() {
    try {
      document.querySelectorAll(".footer").forEach(patchFooter);
      patchReviewImage();
    } catch (_) {
      // Avoid breaking page JS if any override fails.
    }
  }

  function queueApply() {
    if (applyTimer) window.clearTimeout(applyTimer);
    applyTimer = window.setTimeout(apply, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }

  window.addEventListener("load", apply);

  const root = document.body || document.documentElement;
  const observer = new MutationObserver(queueApply);
  observer.observe(root, { childList: true, subtree: true });
})();

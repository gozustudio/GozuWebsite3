(function () {
  const CONTACT_EMAIL = "info@gozustudio.com";
  const PHONE = "+44 07765 577275";
  const LOGO_SVG_PATH = "/static/images/gozustudio-logo.svg";
  const REVIEW_IMAGE_PATH = "/static/images/Review.jpeg";

  const networks = [
    { label: "Telegram", href: "https://t.me/+447765577275", icon: "/static/images/telegram.svg" },
    { label: "Instagram", href: "https://www.instagram.com/gozustudio/", icon: "/static/images/instagram.svg" },
    { label: "WhatsApp", href: "https://wa.me/447765577275", icon: "/static/images/whatsapp.svg" }
  ];

  let cachedLogoSVG = "";
  let logoFetchPromise = null;

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
        img.loading = "lazy";
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
        img.style.opacity = "1";
        img.style.visibility = "visible";
      });

      block.querySelectorAll(".image-wrapper source").forEach(function (source) {
        source.srcset = REVIEW_IMAGE_PATH;
      });

      block.setAttribute("data-gozu-review-fixed", "1");
    });
  }

  function applyOverrides() {
    document.querySelectorAll(".footer").forEach(patchFooter);
    patchReviewImage();
  }

  function scheduleApply() {
    var tries = 0;
    var maxTries = 20;

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

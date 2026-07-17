// ==========================================================================
// IdeaRun 2026 — main.js
// Vanilla JS only. No build step required.
// ==========================================================================

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Theme (light/dark) with persistence + system preference fallback
   * ------------------------------------------------------------------- */
  const root = document.documentElement;
  const THEME_KEY = "idearun-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach((t) => t.setAttribute("aria-pressed", theme === "dark"));
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }

  function toggleTheme() {
    const isDark = root.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
  });

  /* ---------------------------------------------------------------------
   * Sticky navbar shadow + mobile menu
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("navbar");
    const onScroll = () => {
      if (window.scrollY > 8) {
        nav.classList.add("shadow-lg");
      } else {
        nav.classList.remove("shadow-lg");
      }
      updateBackToTop();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const menuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("flex");
        mobileMenu.classList.toggle("hidden");
        menuBtn.setAttribute("aria-expanded", String(isOpen));
      });
      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileMenu.classList.add("hidden");
          mobileMenu.classList.remove("flex");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  });

  /* ---------------------------------------------------------------------
   * Scroll reveal (IntersectionObserver)
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || revealEls.length === 0) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || 0;
            setTimeout(() => entry.target.classList.add("is-visible"), Number(delay));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  });

  /* ---------------------------------------------------------------------
   * Timeline "live circuit" wire fill + active node highlighting
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const wrap = document.querySelector(".timeline-wrap");
    const fill = document.querySelector(".timeline-wire-fill");
    const nodes = document.querySelectorAll(".timeline-node");
    if (!wrap || !fill) return;

    function update() {
      const rect = wrap.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height;
      const visibleTop = Math.min(Math.max(viewportH * 0.75 - rect.top, 0), total);
      const pct = total > 0 ? (visibleTop / total) * 100 : 0;
      fill.style.height = pct + "%";

      const wrapTop = rect.top;
      nodes.forEach((node) => {
        const nodeRect = node.getBoundingClientRect();
        const nodeMid = nodeRect.top - wrapTop + nodeRect.height / 2;
        if (nodeMid <= visibleTop) {
          node.classList.add("is-active");
        } else {
          node.classList.remove("is-active");
        }
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------------------------------------------------------------------
   * Resource preview modal (Preview / Fullscreen / Download)
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("resourceModal");
    const modalBox = overlay ? overlay.querySelector(".modal-box") : null;
    const modalTitle = document.getElementById("resourceModalTitle");
    const modalBody = document.getElementById("resourceModalBody");
    const closeBtn = document.getElementById("resourceModalClose");
    let lastFocused = null;

    function openModal(title, html) {
      if (!overlay) return;
      lastFocused = document.activeElement;
      modalTitle.textContent = title;
      modalBody.innerHTML = html;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
      }[char]));
    }

    function buildPreviewHtml(src, title) {
      const safeSrc = escapeHtml(src);
      const safeTitle = escapeHtml(title);
      const fileName = safeSrc.split("/").pop() || safeTitle;
      const ext = fileName.split(".").pop().toLowerCase();

      if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
        return `<div class="preview-frame flex items-center justify-center p-6">
          <img src="${safeSrc}" alt="${safeTitle} preview" class="max-h-full max-w-full rounded-lg border" style="border-color:var(--line)"/>
        </div>`;
      }

      if (ext === "pdf") {
        return `<iframe class="preview-frame" src="${safeSrc}" title="${safeTitle}"></iframe>`;
      }

      const label = ext === "pptx" ? "PowerPoint template" : "Word document";
      const badge = ext.toUpperCase();
      return `<div class="preview-frame document-preview-panel">
        <div class="doc-preview ${ext === "pptx" ? "doc-preview-ppt" : "doc-preview-word"}" aria-hidden="true">
          <span class="file-badge">${badge}</span>
          <div class="${ext === "pptx" ? "slide-lines" : "doc-lines"}">
            ${ext === "pptx" ? "<strong></strong><span></span><span></span>" : "<span></span><span></span><span></span><span></span>"}
          </div>
          <p>${fileName}</p>
        </div>
        <div class="document-preview-copy">
          <p class="eyebrow">${badge} Preview</p>
          <h4>${safeTitle}</h4>
          <p>Browser preview for Office files is limited on local static pages. Use Open File to view the ${label}, or download it directly.</p>
          <div class="flex flex-wrap gap-3">
            <a href="${safeSrc}" target="_blank" rel="noopener" class="btn btn-secondary">Open File</a>
            <a href="${safeSrc}" download class="btn btn-primary">Download</a>
          </div>
        </div>
      </div>`;
    }

    document.querySelectorAll("[data-preview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const title = btn.dataset.previewTitle || "Preview";
        const src = btn.dataset.preview;
        openModal(title, buildPreviewHtml(src, title));
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) closeModal();
    });

    // Fullscreen buttons — request fullscreen on the relevant image/frame
    document.querySelectorAll("[data-fullscreen]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSel = btn.dataset.fullscreen;
        const target = document.querySelector(targetSel);
        if (target && target.requestFullscreen) {
          target.requestFullscreen().catch(() => {
            window.open(target.src || targetSel, "_blank");
          });
        } else if (target) {
          window.open(target.src, "_blank");
        }
      });
    });
  });

  /* ---------------------------------------------------------------------
   * Lazy loading images with shimmer removal on load
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img.lazy-img").forEach((img) => {
      if (img.complete) {
        img.classList.add("is-loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("is-loaded"));
      }
    });
  });

  /* ---------------------------------------------------------------------
   * Back to top button
   * ------------------------------------------------------------------- */
  function updateBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    if (window.scrollY > 480) {
      btn.classList.add("is-visible");
    } else {
      btn.classList.remove("is-visible");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("backToTop");
    if (btn) {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });

  /* ---------------------------------------------------------------------
   * Current year in footer
   * ------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = new Date().getFullYear();
  });
})();

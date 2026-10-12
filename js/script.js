(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const STORAGE_KEY = "nanodx-theme";
  const ICONS = {
    light: "fa-sun",
    dark: "fa-moon",
    system: "fa-desktop"
  };
  const LABELS = {
    light: "Theme: Light (click for Dark)",
    dark: "Theme: Dark (click for System)",
    system: "Theme: System (click for Light)"
  };

  const root = document.documentElement;
  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  /* ---------- Helpers ---------- */
  function getStoredTheme() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "light" || v === "dark" || v === "system" ? v : "system";
    } catch (e) {
      return "system";
    }
  }

  function storeTheme(mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
  }

  function systemPrefersDark() {
    return mql.matches;
  }

  function applyTheme(mode) {
    const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
    root.classList.toggle("dark", dark);
    updateToggleUI(mode);
  }

  function nextTheme(mode) {
    // cycle: system -> light -> dark -> system
    if (mode === "system") return "light";
    if (mode === "light") return "dark";
    return "system";
  }

  function updateToggleUI(mode) {
    document.querySelectorAll("[data-theme-icon]").forEach(function (icon) {
      icon.classList.remove("fa-sun", "fa-moon", "fa-desktop");
      icon.classList.add(ICONS[mode] || ICONS.system);
    });
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", LABELS[mode] || LABELS.system);
      btn.setAttribute("title", LABELS[mode] || LABELS.system);
    });
  }

  /* ---------- Theme toggle wiring ---------- */
  function initTheme() {
    let mode = getStoredTheme();
    applyTheme(mode);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = nextTheme(mode);
        storeTheme(mode);
        applyTheme(mode);
      });
    });

    // React to OS theme changes when in 'system' mode
    const onSystemChange = function () {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    if (mql.addEventListener) mql.addEventListener("change", onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange); // Safari < 14
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function () {
      const isHidden = menu.classList.contains("hidden");
      menu.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(isHidden));
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars", !isHidden);
        icon.classList.toggle("fa-times", isHidden);
      }
    });

    // Close menu when resizing to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && !menu.classList.contains("hidden")) {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
        const icon = btn.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-times");
        }
      }
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Simple form handlers (login / register / contact) ---------- */
  function initFormRedirect(formId, btnId, label, url, delay) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.dataset.original = btn.textContent;
        btn.textContent = label;
        btn.disabled = true;
      }
      setTimeout(function () {
        if (url) window.location.href = url;
        else if (btn) {
          btn.textContent = btn.dataset.original || "Submit";
          btn.disabled = false;
        }
      }, delay || 900);
    });
  }

  /* ---------- Boot ---------- */
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initTheme();
    initMobileMenu();
    initYear();

    // Optional: page-specific form behavior
    initFormRedirect("loginForm", "loginBtn", "Signing In…", "dashboard.html", 900);
    initFormRedirect("registerForm", "registerBtn", "Creating…", "dashboard.html", 900);
  });
})();
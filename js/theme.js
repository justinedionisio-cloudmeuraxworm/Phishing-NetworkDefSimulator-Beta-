/*
  ============================================================
  theme.js — The light/dark mode toggle button
  ============================================================
  PURPOSE OF THIS FILE:
  theme-init.js (loaded earlier, in <head>) already picked the
  right starting theme before the page painted. This file's job
  starts after that: it makes the sun/moon button in the top bar
  actually work.

  This file:
    1) flips the theme and saves the choice when the button is
       clicked, and
    2) keeps following the operating system's light/dark setting
       live, for as long as the participant hasn't clicked the
       button themselves — so "based on their device" and "a
       toggle to override it" both work at once, on every page.

  Loaded normally (with the other scripts, near the end of
  <body>), unlike theme-init.js.
  ============================================================
*/

var THEME_STORAGE_KEY = "cyberSimTheme";

document.addEventListener("DOMContentLoaded", function () {
  wireThemeToggle();
  followSystemThemeUntilOverridden();
});

/**
 * Handles clicks on the sun/moon button: flips the theme,
 * remembers the choice, and updates the button's label.
 * Why the label needs updating in JS (not just the icon, which
 * is handled entirely by CSS): a screen reader announces
 * aria-label, and that text has to say what the button will DO
 * next ("Switch to light mode" / "Switch to dark mode"), which
 * changes every time the theme changes.
 */
function wireThemeToggle() {
  var toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  updateToggleLabel(toggleBtn);

  toggleBtn.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", next);
    updateToggleLabel(toggleBtn);

    try {
      // Saving here is what makes this an override: once this
      // exists, followSystemThemeUntilOverridden() below stops
      // reacting to the OS setting for the rest of this device.
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (err) {
      // If storage is unavailable, the toggle still works for the
      // rest of this page view — it just won't be remembered next
      // time. Not worth interrupting the participant over.
    }
  });
}

function updateToggleLabel(toggleBtn) {
  var current = document.documentElement.getAttribute("data-theme");
  var nextModeLabel = current === "light" ? "dark" : "light";
  toggleBtn.setAttribute("aria-label", "Switch to " + nextModeLabel + " mode");
}

/**
 * Keeps the site following the device's light/dark setting in
 * real time — e.g. if the participant's system switches to dark
 * mode at sunset — but ONLY until they've clicked the toggle
 * button themselves at least once.
 * Why check localStorage here instead of a simpler in-memory
 * flag: this runs fresh on every page load, so the "has this
 * participant already chosen manually?" question has to be
 * answered from something that survives navigating between
 * pages — the same saved value the toggle button writes.
 */
function followSystemThemeUntilOverridden() {
  if (!window.matchMedia) return;

  var systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)");

  systemPrefersLight.addEventListener("change", function (event) {
    var hasManualOverride = false;
    try {
      hasManualOverride = localStorage.getItem(THEME_STORAGE_KEY) !== null;
    } catch (err) {
      // If storage can't be read, we can't tell whether there's an
      // override, so it's safer to leave the theme alone here.
      return;
    }

    if (hasManualOverride) return;

    var newTheme = event.matches ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);

    var toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) updateToggleLabel(toggleBtn);
  });
}

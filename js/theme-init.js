/*
  ============================================================
  theme-init.js — Sets the correct theme BEFORE the page paints
  ============================================================
  PURPOSE OF THIS FILE:
  Without this file, every page would briefly flash dark (the
  CSS default) before JavaScript had a chance to switch it to
  light — a jarring "flash of wrong theme." To avoid that, this
  script is loaded in <head>, and (importantly) WITHOUT the
  `defer` or `async` attribute, so the browser runs it and
  finishes applying the theme before it renders anything in
  <body>.

  This file deliberately does NOT depend on state.js or any
  other file — it needs to run standalone, as early as possible,
  before anything else has loaded.

  HOW THE THEME IS CHOSEN, IN ORDER:
    1) If the participant has manually toggled the theme before
       on this device, localStorage remembers that choice —
       always use it.
    2) Otherwise, fall back to the operating system's own
       light/dark setting (prefers-color-scheme).
    3) If neither is available for some reason, default to dark,
       matching this project's original design.

  Why localStorage and not sessionStorage (like the simulation
  state in state.js): a theme preference is a personal display
  setting, not part of any one simulation run — it should still
  be remembered after the tab closes or the simulation restarts.
  ============================================================
*/

(function () {
  var STORAGE_KEY = "cyberSimTheme";
  var savedTheme = null;

  try {
    savedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    // Some browsers block storage entirely in private/incognito
    // modes. If that happens, we just skip straight to checking
    // the system preference instead of crashing the page.
  }

  var theme;
  if (savedTheme === "light" || savedTheme === "dark") {
    theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    theme = "light";
  } else {
    theme = "dark";
  }

  document.documentElement.setAttribute("data-theme", theme);
})();

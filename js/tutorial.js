/*
  ============================================================
  tutorial.js — Engine for the VPN / Firewall / MFA Tutorials
  ============================================================
  PURPOSE OF THIS FILE:
  This file knows nothing about VPN, Firewall, or MFA specifically
  — it just knows how to PLAY a tutorial script from TUTORIALS
  (tutorials.js). That separation means the actual lesson content
  lives in exactly one place (tutorials.js), and adding a fourth
  tutorial later would mean adding a new entry there, not touching
  this file at all.

  This file:
    1) reads which tutorial to play from the URL
       (tutorial.html?control=vpn, ?control=firewall, or ?control=mfa
       — see the "Learn ___" links on the Dashboard),
    2) renders the current scene: the instructor's line, the stage
       visual, and whatever interaction that scene calls for (a
       Next button, a toggle, or an action button),
    3) advances to the next scene once that interaction happens, and
    4) shows a short "Tutorial Complete" screen with a
       "Return to Dashboard" button once the script ends.

  Depends on state.js (escapeHtml) and tutorials.js (TUTORIALS),
  both loaded before this file.
  ============================================================
*/

let activeTutorial = null; // the whole script, e.g. TUTORIALS.firewall
let sceneIndex = 0; // which scene of that script is showing right now

document.addEventListener("DOMContentLoaded", function () {
  const controlKey = new URLSearchParams(window.location.search).get("control");
  activeTutorial = TUTORIALS[controlKey];

  if (!activeTutorial) {
    // Unknown or missing ?control= value — nothing to play, so
    // don't show a broken half-built page. Send them back to the
    // Dashboard, the only place a real "Learn ___" link ever points
    // here from.
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("tutorial-eyebrow").textContent =
    "Tutorial \u2014 " + activeTutorial.controlName;
  document.getElementById("tutorial-title").textContent =
    "Learn: " + activeTutorial.controlName;

  renderScene();
});

/** Renders whichever scene sceneIndex currently points at. */
function renderScene() {
  if (sceneIndex >= activeTutorial.scenes.length) {
    renderCompleteScreen();
    return;
  }

  const scene = activeTutorial.scenes[sceneIndex];
  document.getElementById("tutorial-instructor-text").textContent = scene.instructor;
  document.getElementById("tutorial-stage").innerHTML = renderVisual(scene.visual);
  renderInteraction(scene);
}

/**
 * Renders whatever the current scene's interaction requires: a
 * plain "Next" button, a toggle switch, or a labeled action button.
 * For toggle/button scenes, clicking swaps the stage visual to
 * that scene's "after" state and REPLACES this interaction with a
 * Next button — so the participant sees the result of their action
 * before moving on, rather than the scene jumping straight to the
 * next one.
 */
function renderInteraction(scene) {
  const controlsEl = document.getElementById("tutorial-controls");
  const interaction = scene.interaction;

  if (interaction.type === "toggle") {
    controlsEl.innerHTML =
      '<button type="button" id="tutorial-toggle" class="toggle-switch" role="switch" aria-checked="false">' +
      '<span class="toggle-switch__track"><span class="toggle-switch__thumb"></span></span>' +
      "</button>" +
      '<span class="tutorial-controls__label">' +
      escapeHtml(interaction.onLabel) +
      "</span>";

    document.getElementById("tutorial-toggle").addEventListener("click", function () {
      this.classList.add("is-on");
      this.setAttribute("aria-checked", "true");
      this.disabled = true;
      document.getElementById("tutorial-stage").innerHTML = renderVisual(
        scene.visualAfterToggle
      );
      showNextButton();
    });
    return;
  }

  if (interaction.type === "button") {
    controlsEl.innerHTML =
      '<button type="button" id="tutorial-action" class="btn btn--primary">' +
      escapeHtml(interaction.label) +
      "</button>";

    document.getElementById("tutorial-action").addEventListener("click", function () {
      this.disabled = true;
      document.getElementById("tutorial-stage").innerHTML = renderVisual(
        scene.visualAfterAction
      );
      showNextButton();
    });
    return;
  }

  // Plain "next" scene.
  controlsEl.innerHTML =
    '<button type="button" id="tutorial-next" class="btn btn--primary">Next</button>';
  document.getElementById("tutorial-next").addEventListener("click", advanceScene);
}

/**
 * Swaps the tutorial-controls area over to a "Next" button, used
 * once a toggle/button scene's action has already happened and the
 * participant just needs to move on.
 */
function showNextButton() {
  const controlsEl = document.getElementById("tutorial-controls");
  controlsEl.innerHTML =
    '<button type="button" id="tutorial-next" class="btn btn--primary">Next</button>';
  document.getElementById("tutorial-next").addEventListener("click", advanceScene);
}

function advanceScene() {
  sceneIndex += 1;
  renderScene();
}

/** The final screen shown once every scene in the script has played. */
function renderCompleteScreen() {
  document.getElementById("tutorial-instructor-text").textContent =
    activeTutorial.complete;
  document.getElementById("tutorial-stage").innerHTML =
    '<div class="tutorial-complete">' +
    '<p class="tutorial-complete__badge">\u2713 Tutorial Complete</p>' +
    "</div>";
  document.getElementById("tutorial-controls").innerHTML =
    '<a href="dashboard.html" class="btn btn--primary">Return to Dashboard</a>';
}

/**
 * Draws one named stage visual. Every visual id used across all
 * three tutorials in tutorials.js has a case here — kept as one
 * lookup table rather than three separate rendering files, since
 * a few of these (the toggle-driven "before/after" pairs) are
 * conceptually close enough to benefit from sitting next to each
 * other.
 * These are deliberately simple (CSS shapes and a few emoji, no
 * image assets) to stay consistent with the rest of the project's
 * lightweight, self-contained diagrams — see the network diagram
 * on dashboard.html for the same approach.
 */
function renderVisual(visualId) {
  const visuals = {
    "computer-idle":
      '<div class="stage-diagram">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">Your Computer</span></div>' +
      "</div>",

    "packets-unblocked":
      '<div class="stage-diagram">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83C\uDF10</span><span class="stage-node__label">Internet</span></div>' +
      '<div class="stage-packets stage-packets--unblocked" aria-hidden="true">' +
      '<span class="stage-packet stage-packet--bad"></span>' +
      '<span class="stage-packet stage-packet--bad"></span>' +
      '<span class="stage-packet stage-packet--bad"></span>' +
      "</div>" +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">Your Computer</span></div>' +
      '<p class="stage-warning">\u26A0 Suspicious Traffic Detected</p>' +
      "</div>",

    "shield-active":
      '<div class="stage-diagram">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83C\uDF10</span><span class="stage-node__label">Internet</span></div>' +
      '<div class="stage-packets" aria-hidden="true">' +
      '<span class="stage-packet stage-packet--bad stage-packet--stopped"></span>' +
      "</div>" +
      '<div class="stage-node stage-node--shield"><span class="stage-node__icon">\uD83D\uDEE1\uFE0F</span><span class="stage-node__label">Firewall</span></div>' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">Your Computer</span></div>' +
      '<p class="stage-safe">Protected</p>' +
      "</div>",

    "packet-blocked":
      '<div class="stage-diagram">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83C\uDF10</span><span class="stage-node__label">Internet</span></div>' +
      '<div class="stage-packets" aria-hidden="true">' +
      '<span class="stage-packet stage-packet--blocked"></span>' +
      "</div>" +
      '<div class="stage-node stage-node--shield"><span class="stage-node__icon">\uD83D\uDEE1\uFE0F</span><span class="stage-node__label">Firewall</span></div>' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">Your Computer</span></div>' +
      '<p class="stage-danger">Threat Detected \u2014 BLOCKED \u274C</p>' +
      "</div>",

    "tunnel-inactive":
      '<div class="stage-diagram">' +
      '<div class="stage-diagram--row">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">You</span></div>' +
      '<div class="stage-link stage-link--open" aria-hidden="true"></div>' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83C\uDF10</span><span class="stage-node__label">Website</span></div>' +
      "</div>" +
      '<p class="stage-warning">No encrypted tunnel \u2014 traffic travels in the open</p>' +
      "</div>",

    "tunnel-active":
      '<div class="stage-diagram">' +
      '<div class="stage-diagram--row">' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83D\uDCBB</span><span class="stage-node__label">You</span></div>' +
      '<div class="stage-link stage-link--tunnel" aria-hidden="true"><span class="stage-link__lock">\uD83D\uDD12</span></div>' +
      '<div class="stage-node"><span class="stage-node__icon">\uD83C\uDF10</span><span class="stage-node__label">Website</span></div>' +
      "</div>" +
      '<p class="stage-safe">Encrypted VPN tunnel active</p>' +
      "</div>",

    "login-form":
      '<div class="stage-login">' +
      '<p class="stage-login__row">Username <span class="stage-login__value">you@ourcompany.com</span></p>' +
      '<p class="stage-login__row">Password <span class="stage-login__value">\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</span></p>' +
      "</div>",

    "login-form-verified":
      '<div class="stage-login">' +
      '<p class="stage-login__row">Username <span class="stage-login__value stage-login__value--ok">\u2713 verified</span></p>' +
      '<p class="stage-login__row">Password <span class="stage-login__value stage-login__value--ok">\u2713 verified</span></p>' +
      "</div>",

    "password-compromised":
      '<div class="stage-diagram">' +
      '<p class="stage-danger">\u26A0 Password Compromised</p>' +
      '<p class="stage-caption">An attacker has obtained this password.</p>' +
      "</div>",

    "mfa-prompt":
      '<div class="stage-diagram">' +
      '<span class="stage-node__icon stage-node__icon--large">\uD83D\uDCF1</span>' +
      '<p class="stage-caption">Verification Required</p>' +
      '<p class="stage-login__value">Enter 6-digit code: \u2022\u2022\u2022\u2022\u2022\u2022</p>' +
      "</div>",

    "mfa-outcome":
      '<div class="stage-split">' +
      '<div class="stage-split__side">' +
      '<p class="stage-split__label">Attacker</p>' +
      '<p class="stage-danger">\u274C Access Denied</p>' +
      "</div>" +
      '<div class="stage-split__side">' +
      '<p class="stage-split__label">You</p>' +
      '<p class="stage-safe">\u2713 Login Successful</p>' +
      "</div>" +
      "</div>",
  };

  return visuals[visualId] || "";
}

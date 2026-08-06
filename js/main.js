/*
  ============================================================
  main.js — Behavior for the Home Page (index.html)
  ============================================================
  This file has two jobs:

    1) render the Study Setup section (all 5 Threat Scenarios +
       Controls Under Evaluation + Evaluation Metrics) from
       THREAT_SCENARIOS (state.js) and CONTROLS (scoring.js), so
       this page can never say something different from what the
       rest of the simulation actually does,
    2) when "Start Simulation" is pressed, send the participant to
       choose.html to pick which scenario to go through. State
       itself isn't reset here — choose.js does that once an actual
       scenario is picked, so nothing is lost if someone visits this
       page and leaves without choosing anything.

  Note on expertise level: earlier versions of this page collected a
  self-reported expertise level here, as the study's moderating
  variable. That's no longer done in-site — it's now collected
  through a separate pre/post Google Forms survey instead, so this
  page has nothing to validate before Start Simulation can be
  pressed.

  Note: this file loads AFTER state.js and scoring.js in index.html,
  so THREAT_SCENARIOS, EVALUATION_METRICS, and CONTROLS are already
  available here.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  renderStudySetup();
  wireStartButton();
});

/**
 * Fills in the Study Setup section: all 5 threat scenarios, the
 * list of controls the dashboard lets a participant switch on and
 * off, and the metrics this study measures.
 * Why pull control names from CONTROLS (scoring.js) instead of
 * writing "VPN, Firewall, MFA" again here: same reasoning as the
 * results page reusing CONTROLS for its configuration chips — the
 * names live in exactly one place in the whole project.
 */
function renderStudySetup() {
  const scenarioEl = document.getElementById("scenario-list");
  const controlsEl = document.getElementById("controls-list");
  const metricsEl = document.getElementById("metrics-list");

  if (scenarioEl) {
    scenarioEl.innerHTML = THREAT_SCENARIOS.map(function (scenario) {
      return (
        "<li><strong>" +
        escapeHtml(scenario.label) +
        "</strong> \u2014 " +
        escapeHtml(scenario.description) +
        "</li>"
      );
    }).join("");
  }

  if (controlsEl && typeof CONTROLS !== "undefined") {
    controlsEl.innerHTML = CONTROLS.map(function (control) {
      return (
        "<li><strong>" +
        escapeHtml(control.name) +
        "</strong> \u2014 " +
        escapeHtml(control.role) +
        "</li>"
      );
    }).join("");
  }

  if (metricsEl) {
    metricsEl.innerHTML = EVALUATION_METRICS.map(function (metric) {
      return (
        "<li><strong>" +
        escapeHtml(metric.label) +
        "</strong> \u2014 " +
        escapeHtml(metric.description) +
        "</li>"
      );
    }).join("");
  }
}

/**
 * Wires up the "Start Simulation" button: simply moves on to
 * choose.html, where the participant picks which scenario to run.
 */
function wireStartButton() {
  const startButton = document.getElementById("start-btn");

  // Safety check: if this file ever gets reused on a page without
  // a start button, don't throw an error — just do nothing.
  if (!startButton) return;

  startButton.addEventListener("click", function () {
    window.location.href = "choose.html";
  });
}

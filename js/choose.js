/*
  ============================================================
  choose.js — Behavior for the Scenario Picker (choose.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page lets the participant pick ONE of the 5 phishing
  scenarios in THREAT_SCENARIOS (state.js) to go through. This
  file:

    1) draws one card per scenario, using each scenario's own
       label/description/channel — so this list can never drift
       out of sync with the scenarios the rest of the site
       actually knows how to run, and
    2) when a card is picked, clears out any leftover state from a
       previous run, records the choice, logs that the run began,
       and sends the participant to that scenario's lure page.

  Note: this file loads AFTER state.js in choose.html, so
  THREAT_SCENARIOS and the resetState / setState / logEvent /
  goToChosenLure / applyChannelLabel functions are already
  available here.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  renderScenarioChoices();
  wireScenarioChoices();
});

/**
 * Draws one card per scenario. Each card shows the scenario's own
 * label and description (so this page can never claim something
 * different from what actually happens once picked), plus a small
 * badge naming its channel — Inbox for the four email-based
 * scenarios, Texts for Smishing — so the participant knows what
 * kind of page they're about to land on.
 */
function renderScenarioChoices() {
  const listEl = document.getElementById("scenario-choice-list");
  if (!listEl) return;

  listEl.innerHTML = THREAT_SCENARIOS.map(function (scenario) {
    return (
      '<li class="scenario-choice glass" data-scenario-key="' +
      scenario.key +
      '" tabindex="0" role="button" aria-label="Start the ' +
      escapeHtml(scenario.label) +
      ' scenario">' +
      '<span class="scenario-choice__channel">' +
      (scenario.channel === "sms" ? "Texts" : "Inbox") +
      "</span>" +
      '<h2 class="scenario-choice__title">' +
      escapeHtml(scenario.label) +
      "</h2>" +
      '<p class="scenario-choice__description">' +
      escapeHtml(scenario.description) +
      "</p>" +
      "</li>"
    );
  }).join("");
}

/**
 * Sets up ONE click listener (and one keyboard listener) on the
 * whole list, the same event-delegation approach used for the
 * inbox and texts lists — one handler that keeps working no matter
 * how the list is re-rendered.
 */
function wireScenarioChoices() {
  const listEl = document.getElementById("scenario-choice-list");
  if (!listEl) return;

  listEl.addEventListener("click", handleScenarioChoiceActivation);

  listEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleScenarioChoiceActivation(event);
    }
  });
}

function handleScenarioChoiceActivation(event) {
  const card = event.target.closest(".scenario-choice");
  if (!card) return;
  chooseScenario(card.getAttribute("data-scenario-key"));
}

/**
 * Records the participant's choice and starts the run: resets any
 * leftover state from a previous attempt, saves which scenario was
 * picked, logs that the run began, and sends them to that
 * scenario's lure page (email.html or sms.html).
 */
function chooseScenario(scenarioKey) {
  resetState(); // defined in state.js — clears any previous run
  setState({ chosenScenarioKey: scenarioKey });
  logEvent("simulation_started", { chosenScenario: scenarioKey });
  goToChosenLure(); // defined in state.js — routes based on this scenario's channel
}

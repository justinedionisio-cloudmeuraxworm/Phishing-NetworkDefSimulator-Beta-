/*
  ============================================================
  results.js — Behavior for the Results Page (results.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This is the last page of the simulation. It brings together
  everything recorded about the scenario the participant chose
  (state.run) and explains it in plain language — no numeric score
  anywhere, per this project's decision to keep every outcome
  qualitative.

  This file:
    1) recaps what the participant actually did, in that scenario's
       own wording (its sender/contact name),
    2) shows the final VPN/Firewall/MFA configuration IF credentials
       were entered (there's nothing to configure against if they
       weren't), and explains that combination's outcome using the
       SAME outcome table dashboard.js used live,
    3) reveals that scenario's specific phishing warning signs,
    4) lets the participant download this run as one readable CSV
       row, plus the full timestamped event log, and
    5) lets the participant restart from a clean state.

  Depends on state.js (getState/getChosenScenario/resetState/
  escapeHtml/logEvent) and scoring.js (CONTROLS/getOutcome), both
  loaded before this file.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  applyChannelLabel();
  const state = getState();
  showEarlyArrivalNotice(state);
  renderScenarioReport(state);
  wireExportButton();
});

/**
 * If someone opens this page directly, without going through the
 * chosen scenario's lure and login pages, state.run will show no
 * engagement at all. We don't hide any content in that case — the
 * report below still has something useful to say — but we do let
 * them know the story assumes they went through the simulation
 * first.
 */
function showEarlyArrivalNotice(state) {
  const noticeEl = document.getElementById("early-arrival-notice");
  if (!noticeEl) return;
  const run = state.run || {};
  noticeEl.hidden = Boolean(run.linkClicked || run.credentialsEntered);
}

/**
 * Builds the single report card for the scenario the participant
 * chose, covering what they did, their final defense configuration
 * (if applicable), and that scenario's specific warning signs.
 */
function renderScenarioReport(state) {
  const container = document.getElementById("scenario-reports");
  if (!container) return;

  const scenario = THREAT_SCENARIOS.find(function (s) {
    return s.key === state.chosenScenarioKey;
  });
  if (!scenario) {
    container.innerHTML =
      '<section class="results-section"><div class="results-card glass">' +
      '<p class="results-card__note">No scenario was recorded for this run.</p>' +
      "</div></section>";
    return;
  }

  const run = state.run || buildEmptyRun();
  container.innerHTML = buildScenarioReportCard(scenario, run);
}

/** Builds the full HTML for the scenario report card. */
function buildScenarioReportCard(scenario, run) {
  return (
    '<section class="results-section">' +
    '<div class="results-card glass">' +
    "<h2>" +
    escapeHtml(scenario.label) +
    "</h2>" +
    '<p id="metric-tag-behavioralSequence" class="metric-tag">Evaluation Metric \u2014 Behavioral Sequence</p>' +
    '<ul class="recap-list">' +
    buildRecapLines(scenario, run)
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("") +
    "</ul>" +
    (run.credentialsEntered
      ? buildConfigAndOutcomeMarkup(run)
      : '<p class="results-card__note">' +
        "You avoided this one, so there's nothing for a defense " +
        "configuration to protect against here." +
        "</p>") +
    '<h3 class="results-card__subhead">Spot the Signs</h3>' +
    '<ul class="indicator-list">' +
    scenario.spotTheSigns
      .map(function (item) {
        return (
          '<li class="indicator-item">' +
          '<p class="indicator-item__title">' +
          escapeHtml(item.title) +
          "</p>" +
          '<p class="indicator-item__detail">' +
          escapeHtml(item.detail) +
          "</p>" +
          "</li>"
        );
      })
      .join("") +
    "</ul>" +
    "</div>" +
    "</section>"
  );
}

/**
 * Describes what the participant actually did, as a short
 * narrative ladder — how far they got, in the chosen scenario's own
 * wording (its sender or contact name).
 */
function buildRecapLines(scenario, run) {
  const senderName =
    scenario.channel === "sms"
      ? scenario.smsMessage.fromLabel
      : scenario.phishingEmail.sender;

  if (run.credentialsEntered) {
    return [
      'You opened the message from "' + senderName + '."',
      "You clicked the sign-in link inside it.",
      "You entered a username and password on the page it led to.",
    ];
  }
  if (run.linkClicked) {
    return [
      'You opened the message from "' + senderName + '."',
      "You clicked the sign-in link, but didn't submit the sign-in form.",
    ];
  }
  if (run.opened) {
    return [
      'You opened the message from "' +
        senderName +
        '," but didn\u2019t click its link.',
    ];
  }
  return ["You didn't engage with this message at all."];
}

/**
 * Builds the Final Defense Configuration + Outcome markup for a run
 * where credentials WERE entered — the only case where there's
 * actually something to defend against.
 * Why reuse CONTROLS from scoring.js instead of writing "VPN",
 * "Firewall", "MFA" again here, and why reuse getOutcome() rather
 * than writing new explanatory text: same reasoning as everywhere
 * else in this project — the names and the outcome logic live in
 * exactly one place, so this section can never contradict what the
 * dashboard already showed live.
 */
function buildConfigAndOutcomeMarkup(run) {
  const configChips = CONTROLS.map(function (control) {
    const isOn = Boolean(run[control.stateField]);
    const chipClass = isOn ? "chip chip--active" : "chip chip--standby";
    const statusText = isOn ? "ON" : "OFF";
    return (
      '<span class="' +
      chipClass +
      '"><span class="chip__dot"></span>' +
      escapeHtml(control.name) +
      " \u2014 " +
      statusText +
      "</span>"
    );
  }).join("");

  const outcome = getOutcome(run.vpnEnabled, run.firewallEnabled, run.mfaEnabled);
  const outcomeBody = outcome.details
    .map(function (line) {
      return "<p>" + escapeHtml(line) + "</p>";
    })
    .join("");

  return (
    '<h3 class="results-card__subhead">Your Final Defense Configuration</h3>' +
    '<p id="metric-tag-finalConfiguration" class="metric-tag">Evaluation Metric \u2014 Final Defense Configuration</p>' +
    '<div class="config-chips">' +
    configChips +
    "</div>" +
    '<h3 class="results-card__subhead">What Happened</h3>' +
    '<p id="metric-tag-accountTakeoverOutcome" class="metric-tag">Evaluation Metric \u2014 Account Takeover Outcome</p>' +
    '<div class="outcome-panel">' +
    '<p class="outcome-panel__headline">' +
    escapeHtml(outcome.headline) +
    "</p>" +
    outcomeBody +
    "</div>"
  );
}

/**
 * Wires the "Download CSV" button. Builds a readable CSV out of the
 * current run's state and outcome, then triggers a browser download
 * — no server involved, matching this project's "runs entirely in
 * your browser" design.
 */
function wireExportButton() {
  const btn = document.getElementById("export-csv-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    logEvent("results_exported"); // record the export itself as part of the run's log
    const state = getState(); // re-read: logEvent just added an entry
    const csv = buildCsvExport(state);
    downloadCsv(csv, "layered-defense-run.csv");
  });
}

/**
 * Builds the export as two clearly separated, plain tables — a
 * one-row run summary, then a blank row, then one row per logged
 * event — rather than packing the whole event log as an escaped
 * JSON string into a single cell.
 */
function buildCsvExport(state) {
  const scenario = THREAT_SCENARIOS.find(function (s) {
    return s.key === state.chosenScenarioKey;
  });
  const run = state.run || buildEmptyRun();
  const outcome = run.credentialsEntered
    ? getOutcome(run.vpnEnabled, run.firewallEnabled, run.mfaEnabled)
    : null;

  const summaryHeaders = [
    "Exported At",
    "Threat Scenario",
    "Opened Phishing Message",
    "Clicked Phishing Link",
    "Entered Credentials",
    "VPN Enabled",
    "Firewall Enabled",
    "MFA Enabled",
    "Account Compromised",
    "Outcome Summary",
  ];

  const summaryRow = [
    new Date().toISOString(),
    scenario ? scenario.label : state.chosenScenarioKey,
    yesNo(run.opened),
    yesNo(run.linkClicked),
    yesNo(run.credentialsEntered),
    run.credentialsEntered ? yesNo(run.vpnEnabled) : "",
    run.credentialsEntered ? yesNo(run.firewallEnabled) : "",
    run.credentialsEntered ? yesNo(run.mfaEnabled) : "",
    run.credentialsEntered ? yesNo(!run.mfaEnabled) : "",
    outcome ? outcome.headline : "Not compromised \u2014 no credentials entered",
  ];

  const logHeaders = ["Event", "Timestamp", "Detail"];
  const logRows = (state.eventLog || []).map(function (entry) {
    return [formatEventLabel(entry.event), entry.timestamp, formatEventDetail(entry)];
  });

  const lines = [
    "=== RUN SUMMARY ===",
    summaryHeaders.map(csvEscape).join(","),
    summaryRow.map(csvEscape).join(","),
    "",
    "=== EVENT LOG ===",
    logHeaders.map(csvEscape).join(","),
  ].concat(
    logRows.map(function (row) {
      return row.map(csvEscape).join(",");
    })
  );

  return lines.join("\r\n");
}

/** Turns a boolean into the friendlier "Yes"/"No" for a human-facing export. */
function yesNo(value) {
  return value ? "Yes" : "No";
}

/**
 * Turns a raw event key (e.g. "phishing_link_clicked") into a
 * plain-language label (e.g. "Phishing Link Clicked") for the
 * event log table. Falls back to the raw key for any event this
 * list doesn't know about, so a future new event type still shows
 * up instead of silently disappearing.
 */
function formatEventLabel(eventName) {
  const labels = {
    simulation_started: "Simulation Started",
    phishing_email_opened: "Phishing Message Opened",
    phishing_link_clicked: "Phishing Link Clicked",
    lure_declined: "Continued Without Clicking",
    credentials_entered: "Credentials Entered",
    control_toggled: "Control Toggled",
    dashboard_completed: "Finished Exploring Controls",
    results_exported: "Results Exported",
  };
  return labels[eventName] || eventName;
}

/**
 * Builds the "Detail" column for one event log entry. Most events
 * are self-explanatory from their label alone and get an empty
 * Detail cell; "control_toggled" is the one event that needs to say
 * WHICH control changed and to what, so this looks up its friendly
 * name from CONTROLS (scoring.js) rather than showing the raw
 * "vpn"/"firewall"/"mfa" key.
 */
function formatEventDetail(entry) {
  if (entry.event !== "control_toggled") return "";

  const control = CONTROLS.find(function (c) {
    return c.key === entry.control;
  });
  const name = control ? control.name : entry.control;
  return name + (entry.turnedOn ? " turned on" : " turned off");
}

/**
 * Wraps one value as a safe CSV field: stringifies it, and if it
 * contains a comma, quote, or newline, wraps it in quotes with any
 * internal quotes doubled — standard CSV escaping.
 */
function csvEscape(value) {
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Triggers a browser download of the given text as a file, using a
 * temporary Blob URL. Nothing here touches a network — the file is
 * built and handed to the browser entirely locally.
 */
function downloadCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

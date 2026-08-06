/*
  ============================================================
  sms.js — Behavior for the Simulated Text Messages (sms.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page loads whenever the scenario the participant CHOSE (on
  choose.html — see getChosenScenario() in state.js) is the
  Smishing one — the only "sms" channel scenario right now. It
  shows a small, fake text message inbox. This file:

    1) holds the data for the three DECOY_THREADS — the ordinary,
       non-phishing conversations that sit alongside the phishing
       one,
    2) builds the actual thread list by combining those decoys
       with the chosen scenario's smsMessage,
    3) draws the thread list on the page,
    4) shows a thread's message when it's tapped,
    5) if the participant taps the phishing thread's link, records
       that and sends them on to the fake login page, and
    6) if the participant decides NOT to tap it, lets them continue
       straight on to Results.

  This deliberately reuses the SAME run fields (opened /
  linkClicked / credentialsEntered) and event names
  (phishing_email_opened / phishing_link_clicked) that email.js
  uses. Why: opening the lure and clicking its link are the same
  behavioral events either way — only the channel they arrived on
  differs — so results.js and the CSV export can describe both
  channels without needing a parallel set of fields.

  IMPORTANT: nothing in this file ever sends data anywhere. The
  "link" below does not go to a real website — it is a button
  styled to look like a link, and it only ever navigates to
  another page inside this same project (login.html).

  This file depends on state.js, which must be loaded first
  (see the <script> order at the bottom of sms.html) — it defines
  getChosenScenario(), applyChannelLabel(), updateRun(), setState(),
  and logEvent().
  ============================================================
*/

/*
  The three conversations that sit alongside the phishing thread.
  "Jordan Reyes" ties back to the same coworker who appears in the
  email inbox's decoy messages, so the fictional workplace feels
  consistent across channels.
*/
const DECOY_THREADS = [
  {
    id: "mom",
    isPhishing: false,
    contactName: "Mom",
    contactNumber: "",
    preview: "Don't forget dinner Sunday! Love you",
    time: "Yesterday",
    messages: ["Don't forget dinner Sunday! Love you \uD83D\uDC99"],
  },
  {
    id: "jordan-reyes-text",
    isPhishing: false,
    contactName: "Jordan Reyes",
    contactNumber: "",
    preview: "Got the files, thanks! See you at the review tomorrow",
    time: "2 days ago",
    messages: ["Got the files, thanks! See you at the review tomorrow"],
  },
  {
    id: "delivery",
    isPhishing: false,
    contactName: "USPS",
    contactNumber: "",
    preview: "Your package is out for delivery today",
    time: "Yesterday",
    messages: ["Your package is out for delivery today between 9am\u20135pm."],
  },
];

/**
 * Builds the full thread list for the scenario the participant
 * chose: its own smsMessage (turned into a proper thread object,
 * with isPhishing set automatically), plus the three DECOY_THREADS
 * above.
 * Why a function instead of a plain array: the phishing thread
 * comes from getChosenScenario() rather than being fixed in this
 * file — this runs fresh each time so it's never stale.
 */
function buildThreadList() {
  const scenario = getChosenScenario();
  const sms = scenario.smsMessage;
  const phishingThread = {
    id: "scenario-phish",
    isPhishing: true,
    contactName: sms.fromLabel,
    contactNumber: sms.fromNumber,
    preview: sms.leadIn,
    time: sms.time,
    leadIn: sms.leadIn,
    displayLinkText: sms.displayLinkText,
    realLinkUrl: sms.realLinkUrl,
  };
  return [phishingThread].concat(DECOY_THREADS);
}

/** Looks up one thread by its id from the current thread list. */
function getThreadById(id) {
  return buildThreadList().find(function (thread) {
    return thread.id === id;
  });
}

/**
 * Draws the list of threads. Mirrors renderInboxList() in email.js:
 * built from data every time, so the list on screen can never drift
 * from what buildThreadList() actually returns.
 */
function renderThreadList() {
  const listEl = document.getElementById("sms-thread-list");
  if (!listEl) return;

  listEl.innerHTML = buildThreadList()
    .map(function (thread) {
      return (
        '<li class="sms-thread-item glass" data-thread-id="' +
        thread.id +
        '" tabindex="0" role="button" aria-label="Open conversation with ' +
        escapeHtml(thread.contactName) +
        '">' +
        '<span class="sms-avatar" aria-hidden="true">' +
        getThreadInitials(thread.contactName) +
        "</span>" +
        '<span class="sms-summary">' +
        '<span class="sms-contact">' +
        escapeHtml(thread.contactName) +
        (thread.contactNumber
          ? ' <span class="sms-contact-number">' +
            escapeHtml(thread.contactNumber) +
            "</span>"
          : "") +
        "</span>" +
        '<span class="sms-preview">' +
        escapeHtml(thread.preview) +
        "</span>" +
        "</span>" +
        '<span class="sms-time">' +
        escapeHtml(thread.time) +
        "</span>" +
        "</li>"
      );
    })
    .join("");
}

/**
 * Turns a contact name into initials for their avatar circle, the
 * same idea as email.js's getInitials — kept as its own copy (not
 * shared) because a text thread's "name" is sometimes a single word
 * like "USPS", which needs slightly different handling than a
 * two-word person's name.
 */
function getThreadInitials(name) {
  const words = name.split(" ");
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .map(function (word) {
      return word[0];
    })
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function initThreadInteractions() {
  const listEl = document.getElementById("sms-thread-list");
  if (!listEl) return;

  listEl.addEventListener("click", handleThreadListActivation);

  listEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleThreadListActivation(event);
    }
  });
}

function handleThreadListActivation(event) {
  const item = event.target.closest(".sms-thread-item");
  if (!item) return;
  openThread(item.getAttribute("data-thread-id"));
}

/**
 * Opens one thread in the detail view.
 * Why this sets the SAME "opened" run field (and logs the same
 * "phishing_email_opened" event) that email.js uses: see the
 * file-level comment at the top of this file — the two channels
 * share one behavioral vocabulary.
 */
function openThread(id) {
  const thread = getThreadById(id);
  if (!thread) return;

  if (thread.isPhishing) {
    updateRun({ opened: true });
    logEvent("phishing_email_opened");
  }

  renderThreadDetail(thread);
  showDetailView();
}

/**
 * Fills in the detail view with one thread's message bubble(s).
 * The phishing thread additionally gets a tappable link inside its
 * bubble — styled and worded like a real shortened link, but it is
 * just a button that (a) shows its real destination on hover/hold
 * and (b) only ever navigates within this same project.
 */
function renderThreadDetail(thread) {
  const detailEl = document.getElementById("sms-detail-view");
  if (!detailEl) return;

  const bubbles = thread.isPhishing
    ? '<div class="sms-bubble sms-bubble--in">' +
      escapeHtml(thread.leadIn) +
      " " +
      '<button type="button" id="phishing-link-btn" class="phishing-link phishing-link--sms" ' +
      'title="Actual destination: ' +
      escapeHtml(thread.realLinkUrl) +
      '">' +
      escapeHtml(thread.displayLinkText) +
      "</button>" +
      "</div>" +
      '<p class="email-hint">Tip: press and hold a link before tapping it. ' +
      "The text you see and the address it actually opens can be two " +
      "different things.</p>"
    : (thread.messages || [])
        .map(function (message) {
          return '<div class="sms-bubble sms-bubble--in">' + escapeHtml(message) + "</div>";
        })
        .join("");

  detailEl.innerHTML =
    '<button type="button" id="back-to-threads" class="btn-back">&larr; Back to Messages</button>' +
    '<div class="sms-detail__header">' +
    '<p class="sms-detail__contact">' +
    escapeHtml(thread.contactName) +
    (thread.contactNumber
      ? " &lt;" + escapeHtml(thread.contactNumber) + "&gt;"
      : "") +
    "</p>" +
    '<p class="sms-detail__time">' +
    escapeHtml(thread.time) +
    "</p>" +
    "</div>" +
    '<div class="sms-detail__thread">' +
    bubbles +
    "</div>";

  document
    .getElementById("back-to-threads")
    .addEventListener("click", showListView);

  const phishingLinkBtn = document.getElementById("phishing-link-btn");
  if (phishingLinkBtn) {
    phishingLinkBtn.addEventListener("click", handlePhishingLinkClick);
  }
}

/**
 * Runs when the participant taps the fake link inside the phishing
 * thread. Same event names as email.js's version — see the
 * file-level comment for why.
 */
function handlePhishingLinkClick() {
  updateRun({ linkClicked: true });
  logEvent("phishing_link_clicked");
  window.location.href = "login.html";
}

/**
 * Wires the "Continue without tapping" affordance — the same idea
 * as email.js's Continue-without-clicking button, worded for texts
 * instead of an inbox. See that file's comment for why this exists.
 */
function wireContinueButton() {
  const btn = document.getElementById("continue-without-clicking-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    logEvent("lure_declined");
    window.location.href = "results.html";
  });
}

function showDetailView() {
  document.getElementById("sms-list-view").hidden = true;
  const detailEl = document.getElementById("sms-detail-view");
  detailEl.hidden = false;
  detailEl.focus();
}

function showListView() {
  document.getElementById("sms-detail-view").hidden = true;
  document.getElementById("sms-list-view").hidden = false;
}

// Entry point: build the thread list as soon as the page's HTML is ready.
document.addEventListener("DOMContentLoaded", function () {
  // Guard against landing here while the CHOSEN scenario isn't
  // Smishing — this page reads getChosenScenario().smsMessage,
  // which doesn't exist on an email-channel scenario, and would
  // otherwise crash. This can't happen through the normal choose ->
  // lure flow, but a stale bookmark, browser history, or someone
  // typing this URL directly can still land here with a different
  // scenario chosen — send them back to the start instead of
  // showing a broken page.
  if (getChosenScenario().channel !== "sms") {
    window.location.href = "index.html";
    return;
  }

  applyChannelLabel();
  renderThreadList();
  initThreadInteractions();
  wireContinueButton();
});

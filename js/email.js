/*
  ============================================================
  email.js — Behavior for the Simulated Inbox (email.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page loads whenever the scenario the participant CHOSE (on
  choose.html — see getChosenScenario() in state.js) is an
  email-channel one — four of the five scenarios are. This file:

    1) holds the data for the four DECOY_EMAILS — the ordinary,
       non-phishing messages that appear alongside whichever
       scenario was chosen, regardless of which one that is,
    2) builds the actual inbox list by combining those decoys with
       whatever the CHOSEN scenario contributes — its
       phishingEmail, plus any extraEmails it needs (Clone Phishing
       doesn't need any; the newsletter it clones is already one of
       the decoys below),
    3) draws the message list on the page,
    4) shows a message's full content when it's clicked,
    5) if the participant clicks the phishing message's link,
       records that and sends them on to the fake login page, and
    6) if the participant decides NOT to click it, lets them
       continue straight on to Results — there's nothing to defend
       in a dashboard if no credentials were ever stolen.

  IMPORTANT: nothing in this file ever sends data anywhere. The
  "phishing link" below does not go to a real website — it is a
  button styled to look like a link, and it only ever navigates
  to another page inside this same project (login.html).

  This file depends on state.js, which must be loaded first
  (see the <script> order at the bottom of email.html) — it
  defines getChosenScenario(), applyChannelLabel(), updateRun(),
  setState(), and logEvent().
  ============================================================
*/

/*
  The four messages that appear alongside every email-channel
  scenario, no matter which one is current. Keeping these separate
  from the scenario-specific phishing message (built in
  buildEmailList() below) means adding a new scenario never means
  re-typing these four — every scenario just gets them for free.

  Each message's "body" is an array of paragraphs rather than
  one long string, so the detail view can print one <p> per
  paragraph without us hand-writing HTML inside the data.
*/
const DECOY_EMAILS = [
  {
    id: "newsletter",
    isPhishing: false,
    sender: "Company Newsletter",
    senderEmail: "newsletter@ourcompany.com",
    subject: "This Month's Highlights",
    preview: "A quick recap of what shipped, who joined, and what's next...",
    date: "Yesterday",
    body: [
      "Here's a quick recap of this month: three product updates shipped, two new teammates joined, and our quarterly all-hands is set for the 28th.",
      "As always, reply to this email with anything you'd like featured next month.",
    ],
  },
  {
    id: "fire-drill",
    isPhishing: false,
    sender: "Facilities Team",
    senderEmail: "facilities@ourcompany.com",
    subject: "Reminder: Fire Drill Tomorrow at 10 AM",
    preview: "Please pause work and head to the nearest exit when the alarm...",
    date: "Yesterday",
    body: [
      "This is a reminder that a scheduled fire drill will take place tomorrow at 10:00 AM.",
      "When the alarm sounds, please save your work, leave your belongings, and head to the nearest marked exit. The drill should take about ten minutes.",
    ],
  },
  {
    id: "project-files",
    isPhishing: false,
    sender: "Jordan Reyes",
    senderEmail: "jordan.reyes@ourcompany.com",
    subject: "Files for tomorrow's review",
    preview: "Sharing the latest versions ahead of our sync tomorrow...",
    date: "2 days ago",
    body: [
      "Hi! Sharing the latest versions ahead of our sync tomorrow — nothing major changed since last week, just tightened up the summary section.",
      "Let me know if you spot anything before we meet.",
    ],
  },
  {
    id: "open-enrollment",
    isPhishing: false,
    sender: "HR Department",
    senderEmail: "hr@ourcompany.com",
    subject: "Open Enrollment Starts Monday",
    preview: "Here's what's changing this year and how to make your...",
    date: "3 days ago",
    body: [
      "Open enrollment begins Monday and runs for two weeks. This year's guide covering what's changing is attached to the internal HR portal.",
      "Sessions to ask questions live are posted on the team calendar.",
    ],
  },
];

/**
 * Builds the full inbox list for the scenario the participant
 * chose: its own phishingEmail (turned into a proper email object,
 * with isPhishing set automatically so no scenario has to repeat
 * that boilerplate), plus any extraEmails it needs, plus the four
 * DECOY_EMAILS every scenario shares.
 * Why a function instead of a plain EMAILS array: the phishing
 * message comes from getChosenScenario() rather than being fixed
 * in this file — this runs fresh each time so it always matches
 * whichever scenario was actually picked on choose.html.
 */
function buildEmailList() {
  const scenario = getChosenScenario();
  const phishing = Object.assign(
    { id: "scenario-phish", isPhishing: true },
    scenario.phishingEmail
  );
  return [phishing].concat(scenario.extraEmails || [], DECOY_EMAILS);
}

/**
 * Looks up one email object by its id, searching the current inbox
 * list (decoys + whatever the chosen scenario contributes) rather
 * than a fixed array, since which scenario was chosen changes which
 * messages exist.
 */
function getEmailById(id) {
  return buildEmailList().find(function (email) {
    return email.id === id;
  });
}

/**
 * Turns a sender's name into two-letter initials for their
 * avatar circle (e.g. "Jordan Reyes" -> "JR").
 * Why: avoids needing separate image files for every sender,
 * which keeps the whole project self-contained and offline-safe.
 */
function getInitials(name) {
  return name
    .split(" ")
    .map(function (word) {
      return word[0];
    })
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Draws the list of messages into the inbox.
 * Why build the list from data in JavaScript, instead of writing
 * the <li> elements by hand in the HTML: it keeps the message
 * content in one place (buildEmailList) and guarantees the list on
 * screen always matches that data.
 */
function renderInboxList() {
  const listEl = document.getElementById("email-list");
  if (!listEl) return;

  listEl.innerHTML = buildEmailList()
    .map(function (email) {
      return (
        '<li class="email-item glass" data-email-id="' +
        email.id +
        '" tabindex="0" role="button" aria-label="Open message from ' +
        escapeHtml(email.sender) +
        ": " +
        escapeHtml(email.subject) +
        '">' +
        '<span class="email-avatar" aria-hidden="true">' +
        getInitials(email.sender) +
        "</span>" +
        '<span class="email-summary">' +
        '<span class="email-sender">' +
        escapeHtml(email.sender) +
        "</span>" +
        '<span class="email-subject">' +
        escapeHtml(email.subject) +
        "</span>" +
        '<span class="email-preview">' +
        escapeHtml(email.preview) +
        "</span>" +
        "</span>" +
        '<span class="email-date">' +
        escapeHtml(email.date) +
        "</span>" +
        "</li>"
      );
    })
    .join("");
}

/**
 * Sets up ONE click listener (and one keyboard listener) on the
 * whole list, instead of one listener per message.
 * Why "event delegation" like this: it's simpler to maintain —
 * if the list is ever re-rendered with different messages, we
 * don't need to remember to re-attach a listener to each new
 * item. The single listener on the container keeps working.
 */
function initInboxInteractions() {
  const listEl = document.getElementById("email-list");
  if (!listEl) return;

  listEl.addEventListener("click", handleEmailListActivation);

  // Keyboard support: Enter or Space activates the focused message,
  // matching how a real inbox (and basic accessibility expectations)
  // would behave for someone not using a mouse.
  listEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleEmailListActivation(event);
    }
  });
}

function handleEmailListActivation(event) {
  const item = event.target.closest(".email-item");
  if (!item) return;
  openEmail(item.getAttribute("data-email-id"));
}

/**
 * Opens one message in the detail view.
 * Why record "opened" separately from "linkClicked": reading the
 * phishing message is a meaningful step on its own. Recording both
 * events separately lets the Results page later describe the exact
 * sequence of what happened, not just the final outcome.
 */
function openEmail(id) {
  const email = getEmailById(id);
  if (!email) return;

  if (email.isPhishing) {
    updateRun({ opened: true });
    logEvent("phishing_email_opened");
  }

  renderEmailDetail(email);
  showDetailView();
}

/**
 * Fills in the detail view with one message's full content.
 * The phishing message additionally gets a fake "verify your
 * account" link — styled and worded like a real one, but it is
 * just a button that (a) shows its real destination on hover and
 * (b) only ever navigates within this same project.
 */
function renderEmailDetail(email) {
  const detailEl = document.getElementById("inbox-detail-view");
  if (!detailEl) return;

  const bodyParagraphs = email.body
    .map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph) + "</p>";
    })
    .join("");

  const phishingLinkMarkup = email.isPhishing
    ? '<p class="phishing-link-wrap">' +
      '<button type="button" id="phishing-link-btn" class="phishing-link" ' +
      'title="Actual destination: ' +
      escapeHtml(email.realLinkUrl) +
      '">' +
      escapeHtml(email.displayLinkText) +
      "</button>" +
      "</p>" +
      '<p class="email-hint">Tip: hover over a link (or press and hold on ' +
      "mobile) before clicking. The text you see and the address it " +
      "actually opens can be two different things.</p>"
    : "";

  detailEl.innerHTML =
    '<button type="button" id="back-to-inbox" class="btn-back">&larr; Back to Inbox</button>' +
    '<div class="email-detail__header">' +
    '<p class="email-detail__sender">' +
    escapeHtml(email.sender) +
    " &lt;" +
    escapeHtml(email.senderEmail) +
    "&gt;</p>" +
    '<h2 class="email-detail__subject">' +
    escapeHtml(email.subject) +
    "</h2>" +
    '<p class="email-detail__date">' +
    escapeHtml(email.date) +
    "</p>" +
    "</div>" +
    '<div class="email-detail__body">' +
    bodyParagraphs +
    phishingLinkMarkup +
    "</div>";

  // Re-attach listeners each time, since innerHTML above just
  // replaced the elements they used to be attached to.
  document
    .getElementById("back-to-inbox")
    .addEventListener("click", showListView);

  const phishingLinkBtn = document.getElementById("phishing-link-btn");
  if (phishingLinkBtn) {
    phishingLinkBtn.addEventListener("click", handlePhishingLinkClick);
  }
}

/**
 * Runs when the participant clicks the fake "verify your account"
 * link inside the phishing message.
 * Why this is its own function: clicking the link is the actual
 * moment the simulated participant "takes the bait" for THIS
 * scenario — it's the single most important event this page
 * records, so it gets a clearly named function of its own rather
 * than being buried inside renderEmailDetail.
 */
function handlePhishingLinkClick() {
  updateRun({ linkClicked: true });
  logEvent("phishing_link_clicked");
  window.location.href = "login.html";
}

/**
 * Wires the "Continue without clicking" affordance: lets a
 * participant who correctly decided NOT to click the phishing link
 * move straight on to Results. No credentials were entered, so
 * there's nothing for a Dashboard to defend — the run is over,
 * successfully avoided.
 */
function wireContinueButton() {
  const btn = document.getElementById("continue-without-clicking-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    logEvent("lure_declined");
    window.location.href = "results.html";
  });
}

/**
 * Swaps from the message list to the detail view.
 * Why move focus with .focus(): when the visible content changes
 * without a full page navigation, keyboard and screen-reader users
 * need to be told where the "new" content starts. Moving focus to
 * the detail container does that.
 */
function showDetailView() {
  document.getElementById("inbox-list-view").hidden = true;
  const detailEl = document.getElementById("inbox-detail-view");
  detailEl.hidden = false;
  detailEl.focus();
}

function showListView() {
  document.getElementById("inbox-detail-view").hidden = true;
  document.getElementById("inbox-list-view").hidden = false;
}

// Entry point: build the inbox as soon as the page's HTML is ready.
document.addEventListener("DOMContentLoaded", function () {
  // Guard against landing here while the CHOSEN scenario isn't an
  // email-channel one — see the matching comment in sms.js for why
  // this can happen and why redirecting beats showing a broken page.
  if (getChosenScenario().channel === "sms") {
    window.location.href = "index.html";
    return;
  }

  applyChannelLabel();
  renderInboxList();
  initInboxInteractions();
  wireContinueButton();
});

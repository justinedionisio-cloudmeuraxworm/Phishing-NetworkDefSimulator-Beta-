/*
  ============================================================
  login.js — Behavior for the Fake Login Page (login.html)
  ============================================================
  PURPOSE OF THIS FILE:
  This page simulates the site a phishing link leads to — a
  different fake destination for each scenario (see
  applyFakeDestinationBranding below), not the same page every
  time. It is the most safety-sensitive page in the whole project,
  so it follows one rule above all others: NEVER read, store, or
  send anything the participant types into the Username or
  Password fields. This file only:

    1) displays this scenario's own branding and lookalike
       destination URL in a small simulated browser bar, reusing
       the exact same values shown on the lure page, so the two
       pages tell one consistent story,
    2) intercepts the login form's submit action so the browser
       never actually "sends" it anywhere, and
    3) records ONLY the yes/no fact that the form was submitted,
       before continuing to the security dashboard.

  Depends on state.js, which must load first — it defines
  getChosenScenario(), applyChannelLabel(), updateRun(), and
  logEvent().
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  applyChannelLabel();
  applyFakeDestinationBranding();
  showFakeAddressBar();
  wireLoginForm();
  wireBackButton();
});

/**
 * Renders this scenario's own fake destination branding — brand
 * name, headline, subtitle, and accent color — from
 * getChosenScenario().fakeDestination (state.js).
 * Why every scenario needs to look different: a participant who's
 * been through this simulation once shouldn't be able to guess
 * "the fake page always looks like Microsoft 365" — each phishing
 * type in real life leads somewhere different, and the destination
 * page should reflect that.
 */
function applyFakeDestinationBranding() {
  const destination = getChosenScenario().fakeDestination;
  if (!destination) return;

  const brandEl = document.getElementById("login-brand");
  const titleEl = document.getElementById("login-title");
  const subtitleEl = document.getElementById("login-subtitle");
  const cardEl = document.getElementById("login-card");

  if (brandEl) brandEl.textContent = destination.brandName;
  if (titleEl) titleEl.textContent = destination.title;
  if (subtitleEl) subtitleEl.textContent = destination.subtitle;
  if (cardEl && destination.accentColor) {
    cardEl.style.setProperty("--login-accent", destination.accentColor);
  }
}

/**
 * Fills in the fake browser address bar with the CURRENT scenario's
 * own lookalike URL — the same value shown (on hover) back on the
 * lure page, so the two pages tell one consistent story.
 * Why read this from getChosenScenario() instead of a single shared
 * constant: each scenario now leads somewhere different (a
 * Microsoft 365 lookalike, a spoofed internal portal, a fake
 * SecureDrive page, and so on) — a single constant would leave
 * every scenario's address bar showing the same URL no matter which
 * one is actually running.
 */
function showFakeAddressBar() {
  const urlEl = document.getElementById("fake-url");
  if (!urlEl) return;

  const scenario = getChosenScenario();
  const realUrl =
    scenario.channel === "sms"
      ? scenario.smsMessage.realLinkUrl
      : scenario.phishingEmail.realLinkUrl;
  urlEl.textContent = realUrl;
}

/**
 * Wires up the fake "Sign In" button.
 * Why this function exists: it is the one place in the entire
 * project where a real phishing site would try to steal data —
 * so it's also the one place where we most deliberately show
 * that this simulation does not.
 */
function wireLoginForm() {
  const form = document.getElementById("fake-login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorEl = document.getElementById("login-error");
  if (!form || !usernameInput || !passwordInput || !errorEl) return;

  form.addEventListener("submit", function (event) {
    // This is the most important line on this page: it stops the
    // browser from doing what a real login form would do (send the
    // entered data somewhere). Because of this line, nothing typed
    // into Username or Password is ever read anywhere in this file
    // for any purpose other than the empty/not-empty check below.
    event.preventDefault();

    // Why check for empty fields at all, on a page that never reads
    // what's typed: a participant clicking straight through without
    // typing anything skips the "I fell for this" moment the
    // simulation is trying to create. This isn't real credential
    // validation — it never looks at WHAT was typed, only whether
    // something was.
    const usernameFilled = usernameInput.value.trim().length > 0;
    const passwordFilled = passwordInput.value.trim().length > 0;

    if (!usernameFilled || !passwordFilled) {
      showLoginError(usernameInput, passwordInput, errorEl, usernameFilled, passwordFilled);
      return; // stop here — do not record credentialsEntered or move on
    }

    hideLoginError(usernameInput, passwordInput, errorEl);

    // Clears the fields immediately, so nothing typed here lingers
    // on screen once we move on.
    form.reset();

    // Why we only ever store a yes/no flag: the research question is
    // whether a participant fell for the phishing attempt, not what
    // text they happened to type. Saving the actual typed values —
    // even fake, made-up ones — would work against the "never
    // collect credentials" rule this whole project is built on.
    updateRun({ credentialsEntered: true });
    logEvent("credentials_entered");

    window.location.href = "dashboard.html";
  });

  // As soon as the participant starts fixing a flagged field, clear
  // that field's red border so the page doesn't keep scolding them
  // for a mistake they're already in the middle of correcting.
  [usernameInput, passwordInput].forEach(function (input) {
    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
      if (usernameInput.value.trim() && passwordInput.value.trim()) {
        errorEl.hidden = true;
      }
    });
  });
}

/**
 * Flags whichever field(s) are empty and shows the shared error
 * message above the Sign In button, then moves keyboard focus to
 * the first empty field — the same thing a real form would do.
 */
function showLoginError(usernameInput, passwordInput, errorEl, usernameFilled, passwordFilled) {
  usernameInput.classList.toggle("is-invalid", !usernameFilled);
  passwordInput.classList.toggle("is-invalid", !passwordFilled);
  errorEl.hidden = false;
  (usernameFilled ? passwordInput : usernameInput).focus();
}

/**
 * Clears any leftover error state from a previous failed attempt.
 * Called right before a successful submit, so a stale red border
 * or message can never survive into the next page.
 */
function hideLoginError(usernameInput, passwordInput, errorEl) {
  usernameInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");
  errorEl.hidden = true;
}

/**
 * Sends the participant back to wherever the lure lives — the
 * inbox for an email-based scenario, or the texts page for
 * Smishing — if they'd rather not continue through the fake
 * sign-in page.
 */
function wireBackButton() {
  const backBtn = document.getElementById("back-btn");
  if (!backBtn) return;

  backBtn.addEventListener("click", function () {
    const previousPage =
      getChosenScenario().channel === "sms" ? "sms.html" : "email.html";
    window.location.href = previousPage;
  });
}

/*
  ============================================================
  state.js — Shared "memory" for the whole simulation
  ============================================================

  THE PROBLEM:
  This project is made of several separate HTML pages
  (index.html, email.html, login.html, dashboard.html,
  results.html) with NO backend server and NO single-page
  app framework. A normal JavaScript variable resets itself
  every time the browser loads a new page — so on its own,
  main.js on the login page has no way of knowing what
  happened on the email page.

  THE SOLUTION:
  sessionStorage — a small storage area built into every
  browser. It behaves like a simple key/value box that:
    - stays on the participant's OWN device, in this ONE tab
    - is cleared automatically when the tab is closed
    - never sends anything to a server (there is no server)
    - works completely offline

  RULE FOR THIS PROJECT:
  Every other JS file should read and write simulation state
  ONLY through the three functions below (getState, setState,
  resetState) instead of touching sessionStorage directly.
  That way, if we ever need to change *how* state is stored,
  we only have to change it in this one file.

  This file also holds a couple of shared, unchanging scenario
  constants (like the fake phishing URLs) that more than one
  page needs to agree on. It's the natural place for them,
  since it's the one script guaranteed to load on every page.
  ============================================================
*/

// The single key we use inside sessionStorage to store everything.
const STATE_KEY = "cyberSimState";

// --- Shared scenario constants ---
// These two URLs describe the fake phishing link used in the
// simulation. They live here (rather than inside email.js) because
// BOTH the inbox page (which shows the link) and the fake login page
// (which shows a fake address bar) need to agree on the exact same
// values. Keeping a single source of truth means the story can never
// drift out of sync between pages.
const PHISHING_DISPLAY_URL = "https://login.microsoftonline.com/ourcompany";
const PHISHING_REAL_URL =
  "https://login.microsoftonline-secure-verify.net/ourcompany";

// --- Input: evaluation metrics ---
// The conceptual framework's third Input item. Like Threat Scenario
// and Controls Under Evaluation above, this is something a sound
// study design decides BEFORE a run happens — what will be measured
// — rather than choosing metrics after seeing results. Each entry
// here is deliberately paired with a Results page section that
// already reports it (see the resultsSection note on each one), so
// declaring these up front is a promise the site already keeps, not
// a new feature to build separately.
// Note: this project's other design decision — no numeric score,
// see the note at the top of scoring.js — still stands. "Metrics"
// here means WHAT is recorded and reported, not a points system.
const EVALUATION_METRICS = [
  {
    key: "behavioralSequence",
    label: "Behavioral Sequence",
    description:
      "Whether the phishing message was opened, its link clicked, and credentials entered on the fake page.",
    resultsSection: "What You Did",
  },
  {
    key: "finalConfiguration",
    label: "Final Defense Configuration",
    description:
      "Which of VPN, Firewall, and MFA the participant left switched on by the end of the run.",
    resultsSection: "Your Final Defense Configuration",
  },
  {
    key: "accountTakeoverOutcome",
    label: "Account Takeover Outcome",
    description:
      "Whether that final control combination was enough to let the stolen credentials sign in.",
    resultsSection: "What Happened",
  },
];

// --- Input: threat scenario under test ---
// The participant picks ONE of the 5 scenarios below, on a
// dedicated selection page (choose.html) — see the comment above
// getChosenScenario() further down for how that choice is tracked.
//
// THREAT_SCENARIOS is the library all five variants live in. Each
// scenario carries everything its pages need to render it:
//   - channel: "email" or "sms" — decides whether a given step
//     sends the participant to email.html or sms.html, and which
//     step label ("Inbox" vs "Texts") the topbar shows for it.
//   - phishingEmail / smsMessage: the actual lure content, in the
//     same shape email.js / sms.js already expect.
//   - extraEmails: any additional inbox context a scenario needs
//     (Clone Phishing doesn't need this — the "genuine" message it
//     clones is simply the existing Company Newsletter decoy).
//   - spotTheSigns: this scenario's specific tells, shown on the
//     Results page's reveal for that scenario — kept here instead
//     of hardcoded on that page, so the reveal always matches what
//     actually ran.
const THREAT_SCENARIOS = [
  {
    key: "phishing-m365",
    label: "Email Phishing \u2014 fake Microsoft 365 sign-in alert",
    description:
      "A spoofed \u201cunusual sign-in activity\u201d email, sent broadly rather than aimed at anyone specific, leading to a lookalike Microsoft 365 sign-in page.",
    channel: "email",
    phishingEmail: {
      sender: "Microsoft 365 Administrator",
      senderEmail: "admin@0ffice365-alerts.com",
      subject: "Unusual sign-in activity detected",
      preview:
        "We noticed a new sign-in to your account from a device we don't recognize...",
      date: "8:14 AM",
      body: [
        "We noticed a new sign-in to your Microsoft 365 account from a device we don't recognize.",
        "If this wasn't you, verify your identity below to help keep your account secure. If this was you, no action is needed.",
        "This is an automated message from the Microsoft 365 security team.",
      ],
      displayLinkText: PHISHING_DISPLAY_URL,
      realLinkUrl: PHISHING_REAL_URL,
    },
    fakeDestination: {
      brandName: "Microsoft 365",
      title: "Sign in to continue",
      subtitle: "to verify your account access",
      accentColor: "#0A84D6",
    },
    extraEmails: [],
    spotTheSigns: [
      {
        title: "The sender's address didn't match the name.",
        detail:
          '"Microsoft 365 Administrator" is just a display name \u2014 anyone can type anything there. The real address was admin@0ffice365-alerts.com, a domain Microsoft doesn\u2019t own, using a zero in place of the letter O.',
      },
      {
        title: "The message used a vague, generic hook.",
        detail:
          '"Unusual sign-in activity" with no device, location, or time named is a common way to prompt a fast reaction before you stop to check the details.',
      },
      {
        title: "The link's visible text didn't match where it led.",
        detail:
          "The text shown was a real Microsoft address (login.microsoftonline.com). The actual destination was a similar-looking domain Microsoft doesn't own (login.microsoftonline-secure-verify.net).",
      },
      {
        title: "The browser's address bar told the truth the whole time.",
        detail:
          "On the sign-in page itself, the address bar showed that same mismatched domain \u2014 visible the entire time, but easy to skip past when focused on signing in quickly.",
      },
    ],
  },
  {
    key: "spear-phishing-review",
    label: "Spear Phishing \u2014 targeted email naming a coworker",
    description:
      "A personalized email impersonating IT Support, naming a real coworker and a specific upcoming review to feel targeted rather than mass-sent.",
    channel: "email",
    phishingEmail: {
      sender: "IT Support Desk",
      senderEmail: "itsupport@0urcompany-helpdesk.com",
      subject: "Access confirmation needed before your review with Jordan",
      preview:
        "Jordan Reyes asked us to confirm your access ahead of tomorrow's review...",
      date: "9:02 AM",
      body: [
        "Hi \u2014 Jordan Reyes let us know you're presenting at tomorrow's review and asked us to double-check your account has the access it needs beforehand.",
        "Could you confirm your login below so we can finish this before the meeting? It only takes a minute.",
        "\u2014 IT Support Desk",
      ],
      displayLinkText: "portal.ourcompany.com",
      realLinkUrl: "portal.0urcompany-helpdesk.com",
    },
    fakeDestination: {
      brandName: "OurCompany Portal",
      title: "Confirm your access",
      subtitle: "IT Support needs this verified before tomorrow's review",
      accentColor: "#0F766E",
    },
    extraEmails: [],
    spotTheSigns: [
      {
        title: "The message used a real name to feel personal.",
        detail:
          '"Jordan Reyes" and "tomorrow\u2019s review" are specific, correct details \u2014 exactly what a mass phishing email wouldn\u2019t have. A coworker\u2019s name being right doesn\u2019t mean the sender actually is who they claim.',
      },
      {
        title: "The sender's address didn't match the name.",
        detail:
          '"IT Support Desk" is just a display name. The real address was itsupport@0urcompany-helpdesk.com \u2014 not ourcompany.com, with a zero in place of the letter O and an extra "-helpdesk" your real IT team\u2019s address wouldn\u2019t have.',
      },
      {
        title: "It created urgency around a real-sounding deadline.",
        detail:
          '"Before tomorrow\u2019s review" pushes for a fast reaction, leaving less time to stop and check whether IT would really need this.',
      },
      {
        title: "The browser's address bar told the truth the whole time.",
        detail:
          "On the sign-in page itself, the address bar showed a mismatched domain \u2014 visible the entire time, but easy to miss when focused on getting access sorted quickly.",
      },
    ],
  },
  {
    key: "clone-phishing-newsletter",
    label: "Clone Phishing \u2014 a duplicated newsletter, link swapped",
    description:
      "A near-identical copy of the legitimate Company Newsletter already in the inbox, resent with its real content swapped for a malicious link.",
    channel: "email",
    phishingEmail: {
      sender: "Company Newsletter",
      senderEmail: "newsletter@0urcompany.com",
      subject: "Corrected link: This Month's Highlights",
      preview:
        "Our last newsletter had a broken link \u2014 here's the corrected version...",
      date: "10:20 AM",
      body: [
        "Sorry about this \u2014 the link in our last newsletter wasn't working for everyone. Here's a corrected version, with the same recap of this month's product updates, new teammates, and the all-hands date.",
        "Click below to view the corrected version.",
      ],
      displayLinkText: "docs.ourcompany.com",
      realLinkUrl: "docs.0urcompany.com",
    },
    fakeDestination: {
      brandName: "OurCompany Docs",
      title: "Sign in to view this file",
      subtitle: "This document is restricted to verified accounts",
      accentColor: "#7C3AED",
    },
    // No extraEmails needed: the genuine original this clones is
    // already sitting in the inbox as the "newsletter" decoy
    // message every scenario includes (see DECOY_EMAILS in
    // email.js) — comparing the two is the whole point.
    extraEmails: [],
    spotTheSigns: [
      {
        title: "It copied a message you'd already seen.",
        detail:
          'The real "This Month\u2019s Highlights" newsletter was already sitting in your inbox. Cloning something you already trust \u2014 and resending it with a small excuse like a "broken link" \u2014 is what makes clone phishing convincing.',
      },
      {
        title: "The sender's address was almost right, but not quite.",
        detail:
          "The genuine newsletter came from newsletter@ourcompany.com. This one came from newsletter@0urcompany.com \u2014 a zero standing in for the letter O.",
      },
      {
        title: "The excuse existed only to justify a second link.",
        detail:
          'A "corrected link" is a reasonable-sounding excuse to resend something and ask you to click again \u2014 worth comparing against the original before trusting it.',
      },
      {
        title: "The browser's address bar told the truth the whole time.",
        detail:
          "On the sign-in page itself, the address bar showed a mismatched domain \u2014 visible the entire time, but easy to miss when it looks like a routine follow-up.",
      },
    ],
  },
  {
    key: "smishing-account-alert",
    label: "Smishing \u2014 fake text message about account access",
    description:
      "A fake SMS mimicking an IT security alert, using a shortened lookalike link \u2014 sent to a phone instead of an inbox.",
    channel: "sms",
    smsMessage: {
      fromLabel: "IT-Alerts",
      fromNumber: "+1 (555) 019-2843",
      time: "8:47 AM",
      leadIn: "Unusual sign-in detected on your work account. Verify now to keep access:",
      displayLinkText: "0ffice365-verify.co/secure",
      realLinkUrl: "account-verify-secure.co/confirm",
    },
    fakeDestination: {
      brandName: "Account Security Center",
      title: "Verify your identity",
      subtitle: "to keep access to your account",
      accentColor: "#DC2626",
    },
    spotTheSigns: [
      {
        title: "The number wasn't a real contact.",
        detail:
          '"IT-Alerts" is just a label \u2014 anyone can set their outgoing name to anything. The actual number, +1 (555) 019-2843, matched nothing saved in your phone.',
      },
      {
        title: "The link used a shortened, unfamiliar domain.",
        detail:
          "0ffice365-verify.co uses a zero in place of the letter O and a domain Microsoft doesn't own \u2014 but on a phone screen, short links like this are much harder to check carefully than a full web address.",
      },
      {
        title: "It pushed urgency in very few words.",
        detail:
          '"Verify now to keep access" is built for a fast tap, not a careful read \u2014 texts get read and acted on faster than email, which is exactly why this channel gets used.',
      },
      {
        title: "The browser's address bar told the truth the whole time.",
        detail:
          "Once the link opened, the address bar showed the real mismatched domain \u2014 visible the entire time, but easy to miss on a small screen.",
      },
    ],
  },
  {
    key: "email-website-spoofing",
    label: "Email & Website Spoofing \u2014 a forged sender leading to a lookalike external site",
    description:
      "A spoofed notification impersonating a file-sharing service you don't actually use, leading to a fully replicated lookalike sign-in page.",
    channel: "email",
    phishingEmail: {
      sender: "SecureDrive Notifications",
      senderEmail: "notify@securedrive-files.com",
      subject: "A file was shared with you: Q3_Budget_Review.xlsx",
      preview:
        "A colleague shared a file with you via SecureDrive. This link expires in 24 hours...",
      date: "11:05 AM",
      body: [
        'A colleague has shared a file with you through SecureDrive: "Q3_Budget_Review.xlsx."',
        "For security, this shared-file link expires in 24 hours. Click below to view it.",
      ],
      displayLinkText: "securedrive.com/view",
      realLinkUrl: "securedrive-files.com/view",
    },
    fakeDestination: {
      brandName: "SecureDrive",
      title: "Sign in to SecureDrive",
      subtitle: "to view the shared file",
      accentColor: "#059669",
    },
    extraEmails: [],
    spotTheSigns: [
      {
        title: "You don't actually use this service.",
        detail:
          '"SecureDrive" isn\u2019t a tool this company uses \u2014 a legitimate file-share notification would come from a service you already have an account with, not one appearing for the first time.',
      },
      {
        title: "The sender's domain wasn't the real company's.",
        detail:
          "notify@securedrive-files.com doesn't match any domain this company actually owns \u2014 the extra \u201c-files\u201d is a common spoofing trick to look official at a glance.",
      },
      {
        title: "The countdown pushed a fast click.",
        detail:
          '"Expires in 24 hours" creates urgency around a link that was never legitimate in the first place, leaving less time to stop and check.',
      },
      {
        title: "The browser's address bar told the truth the whole time.",
        detail:
          'On the sign-in page itself, the address bar showed a mismatched domain \u2014 visible the entire time, but easy to miss when focused on getting the file before it "expires."',
      },
    ],
  },
];

// --- Single-choice model: participant picks ONE scenario ---
// The participant chooses which of the 5 THREAT_SCENARIOS above to
// go through, on a dedicated selection page (choose.html) — not
// something the site picks for them, and not all 5 back to back.
// This is a deliberate simplification from an earlier version of
// this project that ran all scenarios in a randomized sequence per
// participant; the current design instead lets each participant
// self-select the one attack type they want to see.
//
// Note for whoever picks this project back up later: letting
// participants choose their own scenario does mean different
// participants experience different attacks by their own pick,
// which affects how directly results can be compared across
// participants — worth keeping in mind if this project's use shifts
// back toward a tightly controlled comparative study.

/**
 * The empty shape of the participant's one scenario run — see
 * DEFAULT_STATE below.
 */
function buildEmptyRun() {
  return {
    opened: false, // did they open/view the lure (email or text)?
    linkClicked: false, // did they click the link inside it?
    credentialsEntered: false, // did they submit the fake destination page's form?
    vpnEnabled: false, // dashboard toggle: VPN
    firewallEnabled: false, // dashboard toggle: Firewall
    mfaEnabled: false, // dashboard toggle: MFA
  };
}

/**
 * Looks up the scenario the participant picked, from
 * state.chosenScenarioKey. Every page that needs to know which
 * scenario is running — the lure pages, the fake destination page,
 * the dashboard, the topbar's channel label, the results recap and
 * "Spot the Signs" reveal, the CSV export — calls this instead of
 * reading state.chosenScenarioKey directly, so there's exactly one
 * place that decides "which scenario."
 * Falls back to the first scenario in the list if nothing has been
 * chosen yet (e.g. a page visited out of order), so a missing
 * choice fails safe instead of crashing.
 */
function getChosenScenario() {
  const state = getState();
  return (
    THREAT_SCENARIOS.find(function (s) {
      return s.key === state.chosenScenarioKey;
    }) || THREAT_SCENARIOS[0]
  );
}

/** Returns the participant's results so far (see buildEmptyRun above). */
function getRun() {
  return getState().run;
}

/**
 * Updates the participant's run (e.g. { linkClicked: true }),
 * leaving the rest of state untouched. Every page that records
 * something about what the participant did goes through this
 * instead of touching state.run directly.
 */
function updateRun(partialUpdate) {
  const state = getState();
  return setState({ run: Object.assign({}, state.run, partialUpdate) });
}

/**
 * Sends the participant to whichever page the CHOSEN scenario's
 * lure lives on — email.html for an email-channel scenario,
 * sms.html for Smishing. Called both right after the choice is made
 * (choose.js) and from the "back" button on the fake destination
 * page (login.js).
 */
function goToChosenLure() {
  window.location.href =
    getChosenScenario().channel === "sms" ? "sms.html" : "email.html";
}

/**
 * Updates the topbar's step-02 label to match the chosen scenario's
 * channel ("Inbox" for email, "Texts" for sms). Called once from
 * each page's own init that has this label in its topbar.
 */
function applyChannelLabel() {
  const stepLabel = document.getElementById("step-label-inbox");
  if (!stepLabel) return;
  stepLabel.textContent =
    getChosenScenario().channel === "sms" ? "Texts" : "Inbox";
}

// The "shape" of a brand-new simulation run. Every property here
// represents one fact the simulation needs to remember as the
// participant moves between pages.
// Note on expertise level: an earlier version of this project
// captured a self-reported expertise level here, as the study's
// moderating variable. That's no longer done in-site — the study
// now collects it through a separate pre/post Google Forms survey
// instead, so there's no expertise field in state. This project's
// state and CSV export cover the Input/Process/Output side of the
// framework only.
const DEFAULT_STATE = {
  chosenScenarioKey: null, // input: which of the 5 scenarios this participant picked, set on choose.html
  eventLog: [], // process: one combined timestamped record across the whole run — see logEvent() below
  run: buildEmptyRun(), // output: this participant's results — see updateRun() above
};

/**
 * Reads the current simulation state from sessionStorage.
 * If nothing has been saved yet (e.g. first visit), returns
 * a fresh copy of DEFAULT_STATE instead.
 */
function getState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }
    // Merge saved data on top of the defaults, so that if we ever
    // add a new field to DEFAULT_STATE later, old saved state
    // won't be missing it.
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (err) {
    // sessionStorage can fail in rare cases (e.g. private browsing
    // mode with storage disabled). If that happens, we fail safely
    // by just starting fresh instead of crashing the page.
    console.warn("Could not read simulation state, starting fresh.", err);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Appends one timestamped entry to the run's event log and saves
 * it, without disturbing anything else in state.
 *
 * This is what actually fulfills "Data Log Aggregation" from the
 * conceptual framework: every page in the Process stage (email,
 * login, dashboard) calls this at its own key moments, and each
 * call folds its entry into the SAME array — so by the time a
 * participant reaches Results, one combined, ordered record of the
 * whole run has been aggregated, not just a handful of final
 * booleans.
 *
 * `details`, if given, is merged into the entry alongside `event`
 * and `timestamp` — e.g. logEvent("control_toggled", { control:
 * "vpn", turnedOn: true }) records WHICH control changed and to
 * what, not just that "something" happened.
 *
 * Example:
 *   logEvent("phishing_link_clicked");
 *   logEvent("control_toggled", { control: "mfa", turnedOn: true });
 */
function logEvent(eventName, details) {
  const current = getState();
  const entry = Object.assign(
    { event: eventName, timestamp: new Date().toISOString() },
    details || {}
  );
  const updatedLog = (current.eventLog || []).concat([entry]);
  return setState({ eventLog: updatedLog });
}

/**
 * Updates one or more fields in the simulation state, keeping
 * everything else unchanged.
 *
 * Example:
 *   setState({ vpnEnabled: true });
 */
function setState(partialUpdate) {
  const current = getState();
  const updated = { ...current, ...partialUpdate };
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Could not save simulation state.", err);
  }
  return updated;
}

/**
 * Wipes the simulation state completely, returning the
 * participant to a "brand-new run" state. Called when the
 * simulation starts (or restarts) from the landing page.
 */
function resetState() {
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch (err) {
    console.warn("Could not reset simulation state.", err);
  }
  return { ...DEFAULT_STATE };
}

/**
 * Escapes text before it's inserted into the page as HTML.
 * Why this lives here, in the one file every page loads: both
 * email.js and dashboard.js build little bits of HTML out of
 * plain text (an email subject, a control's name) and both want
 * this same safety habit — treat text as text, never as markup —
 * without copying the same function into every file.
 */
function escapeHtml(text) {
  const holder = document.createElement("div");
  holder.textContent = text;
  return holder.innerHTML;
}

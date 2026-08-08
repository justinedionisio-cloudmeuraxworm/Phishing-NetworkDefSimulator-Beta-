/*
  ============================================================
  minigame-data.js — Question bank for the "Inbox Blitz" mini-game
  ============================================================
  PURPOSE OF THIS FILE:
  Every question in QUIZ_BANK is drawn from facts that already
  exist elsewhere in this project — the five THREAT_SCENARIOS and
  their spotTheSigns tells (state.js), and the CONTROLS / OUTCOMES
  copy that explains what VPN, Firewall, and MFA actually do
  (scoring.js). Nothing here is generic security trivia; it's all
  a direct quiz on the run the participant just did.

  SHAPE OF EACH QUESTION:
    {
      id: a stable short string (used to avoid repeats in one run),
      difficulty: 1 (easy), 2 (medium), or 3 (hard),
      q: the question text,
      choices: exactly 4 answer strings, correct one FIRST,
      explain: one line shown after a wrong answer, reinforcing
               the real tell/fact this question is testing.
    }
  minigame.js shuffles each question's choices at render time (and
  tracks the new correct index) — they're always authored with the
  right answer first here just for readability.

  DIFFICULTY:
    1 — spotting a single, concrete red flag in one message.
    2 — how VPN / Firewall / MFA actually work, or matching a
        specific detail back to its scenario.
    3 — reasoning about a full VPN/Firewall/MFA combination and
        what it does (and doesn't) stop — needs synthesizing more
        than one fact at once.

  Depends on nothing at runtime (plain data) — but every fact here
  is kept in sync BY HAND with state.js / scoring.js, since this is
  a static site with no build step to derive one from the other.
  If those files' wording changes, revisit this list too.
  ============================================================
*/

const QUIZ_BANK = [
  // ---------------- Difficulty 1 — spot the single red flag ----------------
  {
    id: "t1-m365-domain",
    difficulty: 1,
    q: '"admin@0ffice365-alerts.com" was used to impersonate which real company?',
    choices: ["Microsoft", "Google", "Apple", "Amazon"],
    explain: "The fake Microsoft 365 sign-in alert used a zero in place of the letter O, in a domain Microsoft doesn't own.",
  },
  {
    id: "t1-m365-trick",
    difficulty: 1,
    q: 'What trick does "0ffice365-alerts.com" use to look real at a glance?',
    choices: [
      "A zero standing in for the letter O",
      "An extra hyphen, nothing else",
      "A .org ending instead of .com",
      "It's a real Microsoft subdomain",
    ],
    explain: "Swapping a zero for the letter O is a classic lookalike-domain trick — easy to miss at a glance.",
  },
  {
    id: "t1-gift-cards",
    difficulty: 1,
    q: 'A "CEO (personal Gmail)" account emails: "Need you to buy gift cards ASAP." What\u2019s the giveaway?',
    choices: [
      "Executives don't email from personal Gmail asking for gift cards",
      "It was sent outside business hours",
      "The subject line has no punctuation",
      "Gmail can't send attachments",
    ],
    explain: "This is a classic executive-impersonation script — a real CEO won't ask for gift cards from a personal account.",
  },
  {
    id: "t1-redelivery-fee",
    difficulty: 1,
    q: '"Missed delivery — pay $2.99 redelivery fee." Why is this phishing?',
    choices: [
      "Real carriers don't charge small redelivery fees by text link",
      "$2.99 is too expensive for shipping",
      "Delivery notices never arrive by text",
      "It was sent on a weekend",
    ],
    explain: "The tiny dollar amount is deliberate — it's designed to feel too small to question before clicking.",
  },
  {
    id: "t1-securedrive",
    difficulty: 1,
    q: '"SecureDrive" shares a file with you and gives you 24 hours to view it. What\u2019s suspicious?',
    choices: [
      "SecureDrive isn't a service this company actually uses",
      "24 hours is too generous a window",
      "Shared files never expire",
      "The subject line is too short",
    ],
    explain: "A file-share notice from a service you've never used, with a countdown attached, is a common pressure tactic.",
  },
  {
    id: "t1-sender-pick",
    difficulty: 1,
    q: "Which of these is a classic authority-impersonation phishing script?",
    choices: [
      '"CEO (personal Gmail)" asking you to buy gift cards',
      '"HR Department" — open enrollment reminder',
      '"Payroll" — your pay stub is available',
      '"Calendar" — 1:1 with your manager at 3 PM',
    ],
    explain: "Impersonating a senior exec to create urgency and pressure is one of the most common phishing scripts.",
  },
  {
    id: "t1-mailbox-full",
    difficulty: 1,
    q: '"Your mailbox is full — click to expand storage," sent from a no-reply address. What\u2019s the tell?',
    choices: [
      "A generic alarming claim, sent from an address built to discourage checking back",
      "Mailboxes can't actually run out of storage",
      "No-reply addresses are always safe to trust",
      "Storage warnings always list an exact size",
    ],
    explain: "Vague urgency plus a no-reply sender is designed to make you act before you'd think to verify it.",
  },
  {
    id: "t1-clone-type",
    difficulty: 1,
    q: 'A message titled "Corrected link: this month\u2019s highlights" resends something already sitting in your inbox. What kind of attack is this?',
    choices: ["Clone phishing", "Spear phishing", "Smishing", "Whaling"],
    explain: "Clone phishing copies a message you already trust and resends it with the link swapped for a malicious one.",
  },
  {
    id: "t1-spoofed-def",
    difficulty: 1,
    q: 'What does a "spoofed" sender address mean?',
    choices: [
      "The display name doesn't match the real underlying email address",
      "The address bounces back automatically",
      "The address contains too many numbers",
      "It's a shared team inbox",
    ],
    explain: "Anyone can type any display name they want — it's the actual address behind it that matters.",
  },
  {
    id: "t1-sms-urgency",
    difficulty: 1,
    q: 'An SMS from "IT-Alerts" says "Verify now to keep access" in very few words. What is that built for?',
    choices: [
      "A fast tap, not a careful read",
      "Confirming your phone number",
      "Testing your mobile data plan",
      "Updating your saved contacts",
    ],
    explain: "Short, urgent texts are built for a reflexive tap — texts get read and acted on faster than email.",
  },

  // ---------------- Difficulty 2 — how the controls work / detail matching ----------------
  {
    id: "t2-vpn-role",
    difficulty: 2,
    q: "Which control encrypts the connection between your device and a site, but can't tell whether the site itself is trustworthy?",
    choices: ["VPN", "Firewall", "MFA", "Antivirus"],
    explain: "A VPN protects data in transit — it will just as happily encrypt a perfect connection to a phishing page.",
  },
  {
    id: "t2-firewall-role",
    difficulty: 2,
    q: "Which control is better suited to catching follow-up malicious traffic than the moment a password is typed into a fake form?",
    choices: ["Firewall", "VPN", "MFA", "Ad blocker"],
    explain: "A password typed into a normal-looking web form doesn't look unusual to a firewall.",
  },
  {
    id: "t2-mfa-role",
    difficulty: 2,
    q: "Which control can't stop a password from being stolen, but CAN stop that stolen password alone from being enough to sign in?",
    choices: ["Multi-Factor Authentication (MFA)", "VPN", "Firewall", "Spam filter"],
    explain: "MFA requires a second proof of identity — a stolen password on its own isn't enough with it turned on.",
  },
  {
    id: "t2-spear-personal",
    difficulty: 2,
    q: "In the Spear Phishing scenario, the email named a real coworker and an upcoming review in order to:",
    choices: [
      "Feel personally targeted rather than mass-sent",
      "Automatically bypass spam filters",
      "Prove the sender's identity",
      "Qualify the recipient for a discount",
    ],
    explain: "A correct name and a real event are exactly what a mass phishing blast wouldn't have — that specificity is the trap.",
  },
  {
    id: "t2-link-mismatch",
    difficulty: 2,
    q: "The fake Microsoft sign-in link's visible text showed a real Microsoft address, but the actual destination was different. What's this called?",
    choices: [
      "A mismatched link destination",
      "A dead link",
      "A redirect loop",
      "An expired certificate",
    ],
    explain: "Link text can say anything — what matters is where it actually leads, which the address bar reveals.",
  },
  {
    id: "t2-addressbar",
    difficulty: 2,
    q: "On the fake sign-in pages in this simulation, what stayed visible the entire time but was easy to miss?",
    choices: [
      "The browser's address bar showing the mismatched domain",
      "The phone's battery icon",
      "The current time of day",
      "The sender's profile photo",
    ],
    explain: "The address bar never lied in this simulation — it's just easy to skip past when focused on getting something done.",
  },
  {
    id: "t2-countdown",
    difficulty: 2,
    q: 'Why do phishing messages so often include a countdown, like "expires in 24 hrs"?',
    choices: [
      "To create urgency and rush a click before careful checking happens",
      "To comply with data retention rules",
      "To match the company's real policy",
      "To reduce email server load",
    ],
    explain: "Artificial deadlines exist to short-circuit careful checking, not because anything is actually expiring.",
  },
  {
    id: "t2-clone-domain",
    difficulty: 2,
    q: 'The cloned newsletter came from "newsletter@0urcompany.com" instead of the real "newsletter@ourcompany.com." What changed?',
    choices: [
      "A zero replaced the letter O",
      "An extra letter was added at the end",
      "The domain ending changed to .net",
      "Nothing — the addresses were identical",
    ],
    explain: "One character off from the genuine domain is often all it takes to look right at a glance.",
  },
  {
    id: "t2-vpn-blindspot",
    difficulty: 2,
    q: "A VPN will happily encrypt a connection to which kind of destination?",
    choices: [
      "A phishing page, just as readily as a legitimate one",
      "Only pre-approved company sites",
      "Only sites with a valid certificate",
      "Only sites on the same network",
    ],
    explain: "Encryption protects the connection itself — it says nothing about whether the destination can be trusted.",
  },
  {
    id: "t2-mfa-secondfactor",
    difficulty: 2,
    q: "What does MFA typically require beyond a password?",
    choices: [
      "A second proof of identity, like a one-time code or an approval on another device",
      "A longer password",
      "A CAPTCHA on every login",
      "A security question only",
    ],
    explain: "That second factor is exactly what stops a stolen password from being enough on its own.",
  },

  // ---------------- Difficulty 3 — reasoning about full control combinations ----------------
  {
    id: "t3-000",
    difficulty: 3,
    q: "VPN off, Firewall off, MFA off — credentials get entered on the fake page. What happens?",
    choices: [
      "Full account compromise — nothing was in place to stop it",
      "The connection is encrypted, so it's safe",
      "The firewall blocks the sign-in",
      "MFA silently blocks it anyway",
    ],
    explain: "With none of the three controls active, the stolen username and password are enough on their own to sign in.",
  },
  {
    id: "t3-100",
    difficulty: 3,
    q: "VPN on, Firewall off, MFA off — credentials get entered on the fake page. What happens?",
    choices: [
      "The connection is encrypted, but the account is still compromised",
      "VPN alone fully prevents the takeover",
      "The firewall stops the credential theft",
      "Nothing happens without MFA, regardless",
    ],
    explain: "A VPN protects data in transit, but it can't see or stop credentials being typed straight into an attacker's form.",
  },
  {
    id: "t3-only-mfa-stops",
    difficulty: 3,
    q: "Which SINGLE control, on its own, is enough in this simulation to stop the account takeover even after credentials are phished?",
    choices: [
      "Multi-Factor Authentication (MFA)",
      "VPN",
      "Firewall",
      "None of them alone",
    ],
    explain: "MFA is the one control in this simulation that stops a takeover by itself — the stolen password alone isn't enough with it on.",
  },
  {
    id: "t3-111",
    difficulty: 3,
    q: "VPN on, Firewall on, MFA on — the phishing link is still clicked and the fake form still submitted. What still happened?",
    choices: [
      "The phishing click itself wasn't stopped by any of the three controls",
      "Nothing — all three fully block phishing emails",
      "The account was still taken over anyway",
      "MFA prevented the email from being opened",
    ],
    explain: "Even the best-covered combination in this simulation can't stop the click itself — only recognizing the warning signs can.",
  },
  {
    id: "t3-010",
    difficulty: 3,
    q: "Firewall on, VPN off, MFA off — is the account taken over?",
    choices: [
      "Yes — a firewall doesn't inspect what you type into a web form",
      "No — the firewall blocks the fake login form",
      "No — firewalls always stop credential theft",
      "It depends on the browser used",
    ],
    explain: "A firewall restricts suspicious outbound traffic — a password typed into a normal-looking form doesn't trigger it.",
  },
  {
    id: "t3-what-stops-click",
    difficulty: 3,
    q: "According to this simulation, what's the one thing that stops the phishing click from happening in the first place?",
    choices: [
      "Recognizing the warning signs beforehand — none of the three controls can",
      "Enabling all three controls",
      "Using a stronger password",
      "Antivirus software",
    ],
    explain: "VPN, Firewall, and MFA all react to what happens AFTER a click — none of them can stop the click itself.",
  },
  {
    id: "t3-110",
    difficulty: 3,
    q: "VPN on, Firewall on, MFA off — is the account taken over?",
    choices: [
      "Yes — neither VPN nor Firewall inspects what you type into a form",
      "No — VPN and Firewall together are enough",
      "No — two controls always beat one",
      "Yes, but only for the first 24 hours",
    ],
    explain: "Neither VPN nor Firewall looks at form input — without MFA, the stolen credentials are still enough to sign in.",
  },
  {
    id: "t3-001",
    difficulty: 3,
    q: "Only MFA is enabled. Credentials are phished. Is the account taken over?",
    choices: [
      "No — MFA is what stops it, since the stolen password alone isn't enough to sign in",
      "Yes — MFA doesn't apply to phished credentials",
      "No — MFA also blocks the phishing email itself",
      "Yes, but only after 24 hours",
    ],
    explain: "The credentials are still stolen — but signing in also needs the second factor the attacker doesn't have.",
  },
];

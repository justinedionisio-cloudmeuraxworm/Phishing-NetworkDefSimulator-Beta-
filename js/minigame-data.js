/*
  ============================================================
  minigame-data.js — Question bank for the "Inbox Blitz" mini-game
  ============================================================
  PURPOSE OF THIS FILE:
  Every question in QUIZ_BANK is drawn from facts that already
  exist elsewhere in this project — the five THREAT_SCENARIOS and
  their spotTheSigns tells (state.js), the four DECOY_EMAILS every
  scenario shares (email.js), and the CONTROLS / OUTCOMES copy that
  explains what VPN, Firewall, and MFA actually do (scoring.js).
  Nothing here is generic security trivia; it's all a direct quiz
  on the run the participant just did.

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

  ON CHOICE LENGTH (read before adding a question):
  minigame.js shuffles POSITION every render, so "always choice A"
  was never a working strategy — but an earlier version of this
  file had a different, quieter tell: the correct choice was
  written with real supporting detail while the three distractors
  were short and dismissive, so "always pick the longest option"
  could stand in for actually reading the question. Every entry
  below (including the original 28) was rewritten so the four
  choices land within roughly 10-15 characters of each other, and
  correct answers are deliberately NOT always the longest one —
  some are the shortest, most sit in the middle. When adding new
  questions, keep it that way: pad thin distractors with a clause
  of their own rather than leaving them short, and don't let the
  correct answer be the one choice that "sounds most explained."
  A quick gut-check before adding a question: could someone answer
  it correctly from length alone, without reading it? If yes,
  rewrite the choices before it goes in.

  Depends on nothing at runtime (plain data) — but every fact here
  is kept in sync BY HAND with state.js / scoring.js / email.js,
  since this is a static site with no build step to derive one
  from the other. If those files' wording changes, revisit this
  list too.
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
      "It's actually a real Microsoft subdomain",
    ],
    explain: "Swapping a zero for the letter O is a classic lookalike-domain trick — easy to miss at a glance.",
  },
  {
    id: "t1-gift-cards",
    difficulty: 1,
    q: 'A "CEO (personal Gmail)" account emails: "Need you to buy gift cards ASAP." What\u2019s the giveaway?',
    choices: [
      "A personal Gmail account asking for gift cards",
      "The email arrived outside normal business hours",
      "The subject line was missing a period",
      "Gmail accounts can't send file attachments",
    ],
    explain: "This is a classic executive-impersonation script — a real CEO won't ask for gift cards from a personal account.",
  },
  {
    id: "t1-redelivery-fee",
    difficulty: 1,
    q: '"Missed delivery — pay $2.99 redelivery fee." Why is this phishing?',
    choices: [
      "Carriers don't charge redelivery fees over text",
      "$2.99 is too expensive to be a real shipping fee",
      "Delivery notices never arrive by text message",
      "It was sent late on a weekend afternoon",
    ],
    explain: "The tiny dollar amount is deliberate — it's designed to feel too small to question before clicking.",
  },
  {
    id: "t1-securedrive",
    difficulty: 1,
    q: '"SecureDrive" shares a file with you and gives you 24 hours to view it. What\u2019s suspicious?',
    choices: [
      "It's not a service this company actually uses",
      "24 hours is far too generous a viewing window",
      "Legitimate shared files are never set to expire",
      "The subject line doesn't mention a sender name",
    ],
    explain: "A file-share notice from a service you've never used, with a countdown attached, is a common pressure tactic.",
  },
  {
    id: "t1-sender-pick",
    difficulty: 1,
    q: "Which of these is a classic authority-impersonation phishing script?",
    choices: [
      '"CEO" from a personal Gmail, asking for gift cards',
      '"HR Department" with an open enrollment reminder',
      '"Payroll" letting you know your pay stub is ready',
      '"Calendar" confirming a 1:1 with your manager',
    ],
    explain: "Impersonating a senior exec to create urgency and pressure is one of the most common phishing scripts.",
  },
  {
    id: "t1-mailbox-full",
    difficulty: 1,
    q: '"Your mailbox is full — click to expand storage," sent from a no-reply address. What\u2019s the tell?',
    choices: [
      "A vague claim sent from an address that avoids replies",
      "Mailboxes can't actually ever truly run out of storage space",
      "No-reply addresses are always safe to click",
      "Real storage warnings always list an exact size",
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
      "The display name doesn't match the real address",
      "The address automatically bounces back replies",
      "The address is shared across an entire team",
      "The address was registered earlier that day",
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
  {
    id: "t1-spear-domain",
    difficulty: 1,
    q: 'The Spear Phishing email\u2019s address was "itsupport@0urcompany-helpdesk.com." Besides the zero-for-O swap, what else marks it as fake?',
    choices: [
      "An added \"-helpdesk\" your real IT team wouldn't use",
      "A missing \"www\" placed right before the domain name entirely",
      "An unusually long subject line for IT mail",
      "A sender name typed in all capital letters",
    ],
    explain: "Real IT addresses at this company don't carry an extra \"-helpdesk\" on the end — that's a spoofing tell, not a real subdomain.",
  },
  {
    id: "t1-clone-source",
    difficulty: 1,
    q: "The Clone Phishing message claimed to fix a broken link. What was actually being cloned?",
    choices: [
      "The genuine newsletter already in your inbox",
      "A calendar invite sent earlier that week",
      "An earlier email from the facilities team",
      "A file shared through a cloud drive link",
    ],
    explain: "The real \"This Month's Highlights\" newsletter was already sitting in your inbox — cloning something you already trust is what makes this work.",
  },
  {
    id: "t1-smishing-contact",
    difficulty: 1,
    q: 'The smishing text came from "IT-Alerts." What made the number itself suspicious?',
    choices: [
      "It matched no contact saved in your phone",
      "It came from a landline, not a mobile number",
      "It included letters instead of only digits",
      "It was one digit shorter than a normal number",
    ],
    explain: "\"IT-Alerts\" is just a label — anyone can set it. The actual number matched nothing saved in your contacts.",
  },
  {
    id: "t1-smishing-link",
    difficulty: 1,
    q: 'What made the smishing link, "0ffice365-verify.co/secure," suspicious?',
    choices: [
      "A zero standing in for the letter O, again",
      "It used the word 'secure' in the path",
      "It was noticeably longer than a typical text link",
      "It contained an underscore character",
    ],
    explain: "The same zero-for-O trick shows up again here — but on a phone screen, short links like this are much harder to check carefully.",
  },
  {
    id: "t1-securedrive-domain",
    difficulty: 1,
    q: 'SecureDrive\u2019s email came from "notify@securedrive-files.com." What\u2019s off about that domain?',
    choices: [
      "Extra \"-files\" the real service lacks",
      "It's missing the required https prefix",
      "It uses a number instead of a letter",
      "It ends in .net instead of .com",
    ],
    explain: "The added \"-files\" is a common spoofing trick to look official at a glance — it doesn't match any domain this company actually owns.",
  },
  {
    id: "t1-securedrive-urgency",
    difficulty: 1,
    q: 'Why does SecureDrive\u2019s "This link expires in 24 hours" line matter?',
    choices: [
      "It rushes a click before you'd stop to check",
      "It confirms exactly how large the file is",
      "It matches this company's real file-sharing policy",
      "It proves SecureDrive is a legitimate, trusted sender",
    ],
    explain: "The countdown creates urgency around a link that was never legitimate in the first place, leaving less time to check.",
  },
  {
    id: "t1-decoy-genuine",
    difficulty: 1,
    q: "Which sender address below belongs to a genuine, non-phishing message in this simulation's inbox?",
    choices: [
      "hr@ourcompany.com",
      "admin@0ffice365-alerts.com",
      "notify@securedrive-files.com",
      "newsletter@0urcompany.com",
    ],
    explain: "The three wrong options all use a lookalike domain trick — hr@ourcompany.com is one of the four ordinary decoy messages every scenario includes.",
  },
  {
    id: "t1-decoy-firedrill",
    difficulty: 1,
    q: "Which of these is one of the four everyday (non-phishing) messages that appear in this simulation's inbox?",
    choices: [
      "A reminder about tomorrow's fire drill",
      "A password reset confirmation",
      "A calendar sync error notice",
      "An expired VPN security certificate alert notice",
    ],
    explain: "The fire drill reminder from Facilities is one of the four ordinary decoy emails every scenario shares, regardless of which one you picked.",
  },
  {
    id: "t1-spoofing-subject",
    difficulty: 1,
    q: "In the Email & Website Spoofing scenario, what was the phishing email's subject line about?",
    choices: [
      "A shared file needing your sign-in to view",
      "A password that was about to expire",
      "A meeting invite needing your response",
      "A storage quota that was nearly being exceeded",
    ],
    explain: 'The subject read "A file was shared with you: Q3_Budget_Review.xlsx" — a shared-file notice from a service the company never actually used.',
  },
  {
    id: "t1-securedrive-unfamiliar",
    difficulty: 1,
    q: "What's the real reason SecureDrive being unfamiliar matters, even though the email looked professional?",
    choices: [
      "You'd never actually signed up for that service",
      "The email lacked a company logo image",
      "The message was sent very early in the morning",
      "The file name used lowercase letters only",
    ],
    explain: "A legitimate file-share notice would come from a service you already have an account with, not one appearing for the first time.",
  },
  {
    id: "t1-clone-char",
    difficulty: 1,
    q: 'The Clone Phishing sender address was "newsletter@0urcompany.com." What\u2019s the ONE character that changed from the real address?',
    choices: [
      "A zero replacing the letter O",
      "An extra dot before the domain",
      "A hyphen added after 'newsletter'",
      "The .com ending swapped for .org",
    ],
    explain: "The genuine newsletter comes from newsletter@ourcompany.com — one zero standing in for the letter O is the entire difference.",
  },
  {
    id: "t1-m365-addressbar-reveal",
    difficulty: 1,
    q: "What specifically did the fake Microsoft sign-in page's address bar reveal, if you looked at it?",
    choices: [
      "A domain that didn't match the real Microsoft one",
      "A padlock icon that was missing entirely",
      "A page that repeatedly failed to finish loading correctly",
      "A warning banner about an unsafe site",
    ],
    explain: "The address bar showed a similar-looking domain Microsoft doesn't own — visible the whole time, easy to skip past.",
  },
  {
    id: "t1-addressbar-common",
    difficulty: 1,
    q: "Across the simulation, what's the ONE thing every fake sign-in page's address bar has in common?",
    choices: [
      "It always shows the real, mismatched destination",
      "It always displays a red warning triangle",
      "It automatically refreshes every few seconds regardless",
      "It hides behind the page's loading spinner",
    ],
    explain: "None of the fake pages ever lie in the address bar — it tells the truth the entire time, in every scenario.",
  },
  {
    id: "t1-spear-name-purpose",
    difficulty: 1,
    q: 'The Spear Phishing email invoked "Jordan Reyes" and an upcoming review. Why pick a coworker\u2019s real name?',
    choices: [
      "To feel personally targeted, not mass-sent",
      "To automatically skip spam filtering",
      "To more closely match the company's email template",
      "To confirm the sender's real identity",
    ],
    explain: "A correct name and a real event are exactly what a mass phishing blast wouldn't have — that specificity is the trap.",
  },
  {
    id: "t1-redelivery-amount",
    difficulty: 1,
    q: "The redelivery-fee text asked for $2.99. Why such a small amount specifically?",
    choices: [
      "It's small enough to not feel worth questioning",
      "It matches the real carrier's standard fee",
      "It covers the cost of a text message",
      "It's the minimum amount most card readers will accept",
    ],
    explain: "The tiny dollar amount is deliberate — designed to feel too small to question before clicking through.",
  },
  {
    id: "t1-vague-alarm-pattern",
    difficulty: 1,
    q: "What's the general pattern behind messages like the mailbox-full alert and the redelivery-fee text?",
    choices: [
      "A vague, alarming claim built for a fast reaction",
      "A very specific, itemized technical error code",
      "A request to reply with personal details",
      "A link to an official company portal",
    ],
    explain: "Both lean on a vague, alarming claim rather than any real specifics — built to get a fast reaction before you'd think to check.",
  },
  {
    id: "t1-real-exec-request",
    difficulty: 1,
    q: "The CEO gift-card email came from a personal Gmail account. What does a REAL executive request usually look like instead?",
    choices: [
      "Sent from the company's own work email address",
      "Sent with a formal letterhead attached",
      "Sent only during normal business hours",
      "Sent with the CEO's direct phone number included",
    ],
    explain: "A real CEO's request would come from their actual company address — not a personal Gmail account.",
  },
  {
    id: "t1-shared-lookalike-trick",
    difficulty: 1,
    q: "What's the shared trick behind EVERY lookalike domain used across this simulation's scenarios?",
    choices: [
      "A small, easy-to-miss change from the real domain",
      "A domain that's noticeably longer than the usual one",
      "A domain hosted in a different country",
      "A domain that uses no punctuation at all",
    ],
    explain: "Whether it's a swapped zero, an added hyphen, or an extra word, every fake domain relies on a small change that's easy to miss at a glance.",
  },
  {
    id: "t1-decoy-meeting",
    difficulty: 1,
    q: "Which of these is a genuine, non-phishing email that mentions an actual upcoming meeting?",
    choices: [
      "Files for tomorrow's review, from Jordan Reyes",
      "An urgent company-wide password expiration warning",
      "A sudden locked-account notification",
      "A pending refund confirmation email",
    ],
    explain: "Jordan Reyes's \"Files for tomorrow's review\" is one of the four genuine decoy emails — the other three are phishing-style red flags, not real inbox messages.",
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
    choices: [
      "Multi-Factor Authentication (MFA)",
      "A Virtual Private Network (VPN)",
      "A standard network Firewall",
      "A basic inbox Spam filter",
    ],
    explain: "MFA requires a second proof of identity — a stolen password on its own isn't enough with it turned on.",
  },
  {
    id: "t2-spear-personal",
    difficulty: 2,
    q: "In the Spear Phishing scenario, the email named a real coworker and an upcoming review in order to:",
    choices: [
      "Feel personally targeted rather than mass-sent",
      "Automatically bypass the company's spam filters",
      "Formally prove who the real sender was",
      "Qualify the recipient for a special discount",
    ],
    explain: "A correct name and a real event are exactly what a mass phishing blast wouldn't have — that specificity is the trap.",
  },
  {
    id: "t2-link-mismatch",
    difficulty: 2,
    q: "The fake Microsoft sign-in link's visible text showed a real Microsoft address, but the actual destination was different. What's this called?",
    choices: [
      "A mismatched link destination",
      "A permanently dead, broken link",
      "An infinite redirect loop error",
      "An expired security certificate",
    ],
    explain: "Link text can say anything — what matters is where it actually leads, which the address bar reveals.",
  },
  {
    id: "t2-addressbar",
    difficulty: 2,
    q: "On the fake sign-in pages in this simulation, what stayed visible the entire time but was easy to miss?",
    choices: [
      "The address bar's mismatched domain",
      "The phone's battery charge icon",
      "The exact current time of day",
      "The sender's small profile photo",
    ],
    explain: "The address bar never lied in this simulation — it's just easy to skip past when focused on getting something done.",
  },
  {
    id: "t2-countdown",
    difficulty: 2,
    q: 'Why do phishing messages so often include a countdown, like "expires in 24 hrs"?',
    choices: [
      "To rush a click before you'd check carefully",
      "To comply with a data retention regulation",
      "To match the company's actual internal policy",
      "To help reduce load on the mail server",
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
      "A phishing page just as readily as a real one",
      "Only the specific sites pre-approved by the company",
      "Only sites carrying a valid certificate",
      "Only sites on the exact same network",
    ],
    explain: "Encryption protects the connection itself — it says nothing about whether the destination can be trusted.",
  },
  {
    id: "t2-mfa-secondfactor",
    difficulty: 2,
    q: "What does MFA typically require beyond a password?",
    choices: [
      "A second proof, like a one-time code",
      "A noticeably longer password",
      "A CAPTCHA shown at every single login attempt",
      "A single security question",
    ],
    explain: "That second factor is exactly what stops a stolen password from being enough on its own.",
  },
  {
    id: "t2-spear-domain-extra",
    difficulty: 2,
    q: "In the Spear Phishing scenario, what did the sender's domain add beyond the usual zero-for-O swap?",
    choices: [
      "An extra \"-helpdesk\" segment IT wouldn't use",
      "An extra number tacked onto the very end of it",
      "A capital letter placed in the middle",
      "A missing top-level domain, like .com",
    ],
    explain: "The real address was itsupport@0urcompany-helpdesk.com — not just a zero for an O, but an extra \"-helpdesk\" a real IT team's address wouldn't have.",
  },
  {
    id: "t2-clone-link-dest",
    difficulty: 2,
    q: 'The Clone Phishing email\u2019s display link read "docs.ourcompany.com." Where did it actually lead?',
    choices: [
      "docs.0urcompany.com — a zero for the letter O",
      "docs.ourcompany.net — a changed ending",
      "files.ourcompany.com — a different subdomain",
      "docs-ourcompany.com — an added hyphen",
    ],
    explain: "Link text can say anything you like — the real destination used a zero in place of the letter O.",
  },
  {
    id: "t2-smishing-link-dest",
    difficulty: 2,
    q: 'The Smishing link displayed as "0ffice365-verify.co/secure." Where did it actually go?',
    choices: [
      "account-verify-secure.co/confirm",
      "0ffice365-verify.com/secure",
      "office365-verify.co/login",
      "0ffice365-alert.co/verify",
    ],
    explain: "The displayed link text and the real destination were two entirely different domains — a mismatch that's much easier to miss on a phone screen.",
  },
  {
    id: "t2-spoofing-link-dest",
    difficulty: 2,
    q: 'The Email & Website Spoofing link displayed as "securedrive.com/view." Where did it actually lead?',
    choices: [
      "securedrive-files.com/view",
      "securedrive.co/view",
      "secure-drive.com/view",
      "securedrive.com/files",
    ],
    explain: "The visible link text showed the real SecureDrive domain — the actual destination added \"-files\" to a domain the company doesn't own.",
  },
  {
    id: "t2-m365-link-dest",
    difficulty: 2,
    q: "The fake Microsoft sign-in link displayed as a real Microsoft address. What was the actual destination?",
    choices: [
      "login.microsoftonline-secure-verify.net",
      "login.microsoft-online-support.com",
      "login.microsoftonline-support.org",
      "signin.microsoftonline-portal.net",
    ],
    explain: "The visible text read login.microsoftonline.com — the real destination was a similar-looking domain Microsoft doesn't own.",
  },
  {
    id: "t2-scenario-channel",
    difficulty: 2,
    q: "Which THREAT_SCENARIO in this simulation is delivered by text message rather than email?",
    choices: [
      "Smishing — fake account-access alert",
      "Clone Phishing — duplicated newsletter",
      "Spear Phishing — targeted coworker email",
      "Email & Website Spoofing — forged sender",
    ],
    explain: "Smishing is the one scenario sent to a phone as a text rather than to the inbox as an email.",
  },
  {
    id: "t2-vpn-limitation-wording",
    difficulty: 2,
    q: "Which control's description explicitly states it \"can't tell whether the site itself is trustworthy\"?",
    choices: ["VPN", "Firewall", "MFA", "Antivirus"],
    explain: "A VPN protects the connection, not your judgment about the destination — that limitation is stated plainly in this simulation's own wording.",
  },
  {
    id: "t2-firewall-limitation-wording",
    difficulty: 2,
    q: "Which control's limitation is that a normal-looking web form doesn't trigger it?",
    choices: ["Firewall", "VPN", "MFA", "Spam filter"],
    explain: "A firewall watches network traffic — a password typed into an ordinary-looking form doesn't look unusual to it.",
  },
  {
    id: "t2-mfa-role-wording",
    difficulty: 2,
    q: 'Which control\u2019s role is described as requiring "a second proof of identity"?',
    choices: ["MFA", "VPN", "Firewall", "Antivirus"],
    explain: "MFA's whole role is that second proof — a one-time code or an approval on another device.",
  },
  {
    id: "t2-securedrive-filename",
    difficulty: 2,
    q: "In the SecureDrive scenario, what specific file name did the phishing email claim to share?",
    choices: [
      "Q3_Budget_Review.xlsx",
      "Q3_Sales_Report.xlsx",
      "Team_Roster_2024.xlsx",
      "Budget_Forecast.pdf",
    ],
    explain: 'The email\u2019s subject line was "A file was shared with you: Q3_Budget_Review.xlsx."',
  },
  {
    id: "t2-m365-time",
    difficulty: 2,
    q: "What time was the fake Microsoft sign-in alert email sent, per the inbox?",
    choices: ["8:14 AM", "9:02 AM", "10:20 AM", "11:05 AM"],
    explain: "The Microsoft 365 alert is timestamped 8:14 AM in the inbox — the other times belong to different messages.",
  },
  {
    id: "t2-decoy-coworker",
    difficulty: 2,
    q: "Which decoy (non-phishing) email in the inbox comes from a coworker by name, not a department?",
    choices: [
      "Jordan Reyes — files for tomorrow's review",
      "Facilities Team — fire drill reminder",
      "HR Department — open enrollment starting Monday",
      "Company Newsletter — monthly highlights",
    ],
    explain: "Jordan Reyes is the one decoy sender who's an individual coworker rather than a department or team account.",
  },
  {
    id: "t2-final-defense-metric",
    difficulty: 2,
    q: 'What does the Results page\u2019s "Final Defense Configuration" actually record?',
    choices: [
      "Which of VPN, Firewall, and MFA you left switched on",
      "How many phishing emails you personally correctly reported",
      "How quickly you completed the whole simulation",
      "Which scenario you originally chose to run",
    ],
    explain: "It's specifically which of the three controls were left enabled by the end of your run — nothing about speed or scenario choice.",
  },
  {
    id: "t2-behavioral-sequence-metric",
    difficulty: 2,
    q: 'What does "Behavioral Sequence," one of this simulation\u2019s tracked metrics, actually record?',
    choices: [
      "Whether you opened, clicked, then entered credentials",
      "How many total emails you personally opened that entire day",
      "Which browser tab stayed open the longest",
      "How many times you toggled a security control",
    ],
    explain: "It's the specific sequence of whether the lure was opened, its link clicked, and credentials entered on the fake page.",
  },
  {
    id: "t2-single-scenario-design",
    difficulty: 2,
    q: "According to this project's own notes, why does a participant now pick ONE scenario instead of running all five?",
    choices: [
      "To let each participant self-select their own attack type",
      "Running all five back-to-back caused repeated technical errors",
      "Five full scenarios took too long to complete",
      "Only one scenario was ever fully written and tested",
    ],
    explain: "It's a deliberate design simplification from an earlier version that ran all five scenarios per participant — not a technical limitation.",
  },
  {
    id: "t2-smishing-leadin",
    difficulty: 2,
    q: 'What did the Smishing message\u2019s opening line, "Unusual sign-in detected... Verify now to keep access," rely on to work?',
    choices: [
      "Very few words built for a fast, reflexive tap",
      "A detailed explanation of the account issue",
      "A formal, business-style greeting line",
      "A direct phone number to call for help",
    ],
    explain: "Short, urgent texts are built for a fast tap, not a careful read — texts get acted on faster than email.",
  },
  {
    id: "t2-smishing-time",
    difficulty: 2,
    q: "What time was the smishing text sent, per the message details?",
    choices: ["8:47 AM", "8:14 AM", "9:02 AM", "10:20 AM"],
    explain: "The smishing text is timestamped 8:47 AM — the other times belong to different scenarios' emails.",
  },

  // ---------------- Difficulty 3 — reasoning about full control combinations ----------------
  {
    id: "t3-000",
    difficulty: 3,
    q: "VPN off, Firewall off, MFA off — credentials get entered on the fake page. What happens?",
    choices: [
      "Full account compromise — nothing stopped it",
      "The connection stays encrypted, so it's safe",
      "The firewall quietly blocks the sign-in",
      "MFA silently blocks the sign-in anyway",
    ],
    explain: "With none of the three controls active, the stolen username and password are enough on their own to sign in.",
  },
  {
    id: "t3-100",
    difficulty: 3,
    q: "VPN on, Firewall off, MFA off — credentials get entered on the fake page. What happens?",
    choices: [
      "Encrypted, but the account is still compromised",
      "VPN's encryption alone fully prevents it",
      "The firewall still stops the credential theft",
      "Nothing happens at all without MFA present",
    ],
    explain: "A VPN protects data in transit, but it can't see or stop credentials being typed straight into an attacker's form.",
  },
  {
    id: "t3-only-mfa-stops",
    difficulty: 3,
    q: "Which SINGLE control, on its own, is enough in this simulation to stop the account takeover even after credentials are phished?",
    choices: [
      "Multi-Factor Authentication (MFA)",
      "A Virtual Private Network (VPN)",
      "A network Firewall alone",
      "None of the three alone",
    ],
    explain: "MFA is the one control in this simulation that stops a takeover by itself — the stolen password alone isn't enough with it on.",
  },
  {
    id: "t3-111",
    difficulty: 3,
    q: "VPN on, Firewall on, MFA on — the phishing link is still clicked and the fake form still submitted. What still happened?",
    choices: [
      "The phishing click still wasn't stopped by any control",
      "Nothing at all — all three fully block every phishing email",
      "The account still ended up taken over anyway",
      "MFA somehow prevented the email from opening",
    ],
    explain: "Even the best-covered combination in this simulation can't stop the click itself — only recognizing the warning signs can.",
  },
  {
    id: "t3-010",
    difficulty: 3,
    q: "Firewall on, VPN off, MFA off — is the account taken over?",
    choices: [
      "Yes — firewalls don't inspect typed web form data",
      "No — the firewall always blocks the fake login form",
      "No — firewalls always stop credential theft",
      "It depends entirely on which browser is used",
    ],
    explain: "A firewall restricts suspicious outbound traffic — a password typed into a normal-looking form doesn't trigger it.",
  },
  {
    id: "t3-what-stops-click",
    difficulty: 3,
    q: "According to this simulation, what's the one thing that stops the phishing click from happening in the first place?",
    choices: [
      "Recognizing the warning signs beforehand",
      "Having all three controls enabled at once",
      "Using a noticeably stronger password",
      "Running dedicated antivirus software",
    ],
    explain: "VPN, Firewall, and MFA all react to what happens AFTER a click — none of them can stop the click itself.",
  },
  {
    id: "t3-110",
    difficulty: 3,
    q: "VPN on, Firewall on, MFA off — is the account taken over?",
    choices: [
      "Yes — neither control inspects typed form data",
      "No — VPN and Firewall together are always enough",
      "No — any two controls always beat one",
      "Yes, but only for the first 24 hours",
    ],
    explain: "Neither VPN nor Firewall looks at form input — without MFA, the stolen credentials are still enough to sign in.",
  },
  {
    id: "t3-001",
    difficulty: 3,
    q: "Only MFA is enabled. Credentials are phished. Is the account taken over?",
    choices: [
      "No — the stolen password alone isn't enough",
      "Yes — MFA doesn't apply to phished credentials",
      "No — MFA also blocks the phishing email itself",
      "Yes, but only for the first 24 hours",
    ],
    explain: "The credentials are still stolen — but signing in also needs the second factor the attacker doesn't have.",
  },
  {
    id: "t3-011",
    difficulty: 3,
    q: "VPN off, Firewall on, MFA on — credentials are phished. Is the account taken over?",
    choices: [
      "No — MFA alone stops it even without VPN",
      "Yes — a firewall alone can't block sign-in",
      "No — the firewall blocks the credential theft",
      "Yes, but only for the first 24 hours",
    ],
    explain: "MFA is what actually stopped the takeover here — the stolen password alone still wasn't enough to sign in without the second factor.",
  },
  {
    id: "t3-101",
    difficulty: 3,
    q: "VPN on, Firewall off, MFA on — credentials are phished. Is the account taken over?",
    choices: [
      "No — MFA alone is enough, even without a firewall",
      "Yes — VPN's encryption alone doesn't stop sign-in either",
      "No — VPN alone blocks the fake page",
      "Yes, but only if firewall is also off",
    ],
    explain: "VPN encrypted the connection but didn't stop the credential theft — MFA is what actually mattered here.",
  },
  {
    id: "t3-two-without-mfa",
    difficulty: 3,
    q: "Which TWO controls, even used together without MFA, still fail to stop the account takeover?",
    choices: [
      "VPN and Firewall",
      "Firewall and MFA",
      "VPN and MFA",
      "Any two together are always enough",
    ],
    explain: "VPN and Firewall together still don't inspect what's typed into the fake form — without MFA, the takeover still succeeds.",
  },
  {
    id: "t3-determining-variable",
    difficulty: 3,
    q: "What's the ONE variable, across all 8 control combinations in this simulation, that fully determines whether the account is taken over?",
    choices: [
      "Whether MFA specifically is enabled",
      "Whether VPN specifically is enabled",
      "Whether Firewall specifically is enabled",
      "Whether any two of the three are enabled",
    ],
    explain: "Across all 8 combinations, MFA on always means no takeover, and MFA off always means takeover — VPN and Firewall never change that outcome.",
  },
  {
    id: "t3-101-mechanism",
    difficulty: 3,
    q: 'For combination "101" (VPN on, Firewall off, MFA on), what actually stopped the takeover?',
    choices: [
      "MFA — the stolen password alone wasn't enough",
      "VPN — the encrypted connection blocked it",
      "Both VPN and MFA working together",
      "Nothing — the account was still taken over",
    ],
    explain: "VPN encrypted the connection but that didn't stop the credential theft itself — MFA is what actually mattered here.",
  },
  {
    id: "t3-011-mechanism",
    difficulty: 3,
    q: 'For combination "011" (Firewall on, VPN off, MFA on), what actually stopped the takeover?',
    choices: [
      "MFA — the stolen password alone wasn't enough",
      "Firewall — it blocked the credential form",
      "Both Firewall and MFA working together",
      "Nothing — the account was still taken over",
    ],
    explain: "Suspicious outbound communication was restricted by the firewall, but MFA is what actually stopped the takeover.",
  },
  {
    id: "t3-firewall-form-reasoning",
    difficulty: 3,
    q: "Why can't a firewall alone stop the exact moment credentials are typed into a fake sign-in form?",
    choices: [
      "A normal-looking web form doesn't look unusual to it",
      "Firewalls only inspect email attachments",
      "Firewalls are disabled during active sign-ins",
      "Firewalls are built to only monitor outgoing file transfers",
    ],
    explain: "A firewall watches network traffic patterns — a password typed into an ordinary-looking form simply doesn't register as unusual.",
  },
  {
    id: "t3-vpn-encryption-reasoning",
    difficulty: 3,
    q: "Why can't VPN encryption stop credentials from being stolen on a fake sign-in page?",
    choices: [
      "It secures the connection, not the destination itself",
      "It only encrypts email traffic, never the web",
      "It's automatically and fully switched off on sign-in pages",
      "It only functions on a trusted company network",
    ],
    explain: "A VPN protects data in transit — it has no way of evaluating whether the destination itself deserves your credentials.",
  },
  {
    id: "t3-all-mfa-off",
    difficulty: 3,
    q: "Synthesizing all 8 outcomes: what's true about EVERY combination where MFA is off?",
    choices: [
      "The account is always taken over",
      "The account is taken over half the time",
      "The account is never taken over",
      "It depends on which other two controls are on",
    ],
    explain: "In every one of this simulation's 8 outcomes, MFA being off means the stolen credentials alone are enough to sign in.",
  },
  {
    id: "t3-all-mfa-on",
    difficulty: 3,
    q: "Synthesizing all 8 outcomes: what's true about EVERY combination where MFA is on?",
    choices: [
      "The account is never taken over, no matter the other two",
      "The account is still compromised roughly half of the time",
      "It still depends on whether VPN is also switched on",
      "The initial phishing click is always blocked too",
    ],
    explain: "In every outcome where MFA is on, the stolen password alone isn't enough — regardless of whether VPN or Firewall are also on.",
  },
  {
    id: "t3-only-real-defense",
    difficulty: 3,
    q: "What does this simulation's design suggest is the ONLY real defense against the phishing click itself?",
    choices: [
      "Recognizing the warning signs before clicking at all",
      "Running the whole simulation with all three controls on",
      "Using a noticeably longer, more complex password",
      "Making sure MFA is enabled on every single account",
    ],
    explain: "None of the three controls can stop the click itself — only recognizing the warning signs beforehand can, according to this simulation.",
  },
  {
    id: "t3-000-vs-111",
    difficulty: 3,
    q: 'Comparing "000" and "111": what\u2019s the one thing that does NOT change between them?',
    choices: [
      "The phishing click and form submission both still happen",
      "Whether the account ultimately ends up taken over",
      "Whether any of the traffic gets encrypted at all",
      "Whether any suspicious outbound traffic gets restricted at all",
    ],
    explain: "Every control in this simulation reacts to what happens after the click — the click and the form submission happen regardless of which controls are on.",
  },
  {
    id: "t3-form-inspection",
    difficulty: 3,
    q: "Given the three controls' stated limitations, which is the ONLY one that acts on what you actually TYPE into a form, rather than the surrounding traffic?",
    choices: [
      "MFA — it requires a second factor at sign-in",
      "VPN — it inspects form submissions directly",
      "Firewall — it filters form contents specifically",
      "None of the three inspect form contents directly",
    ],
    explain: "MFA is the one control that acts at the moment of sign-in itself, requiring a second factor no amount of typed-in credentials alone can satisfy.",
  },
  {
    id: "t3-shared-headline",
    difficulty: 3,
    q: 'Which pair of combinations share the exact same "Credentials stolen, account protected" headline?',
    choices: ["101 and 011", "100 and 010", "110 and 111", "001 and 111"],
    explain: "101 (VPN+MFA) and 011 (Firewall+MFA) both stop the takeover through MFA alone, and share that identical outcome headline.",
  },
];

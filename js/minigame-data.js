/*
  ============================================================
  minigame-data.js — Content for the "Inbox Blitz" mini-game
  ============================================================
  PURPOSE OF THIS FILE:
  A pool of 20 short message previews — 10 genuinely benign, 10
  phishing-flavored — that minigame.js samples 10 of at random each
  playthrough (5 of each, shuffled), so replays don't always show
  the same round in the same order.

  These are DELIBERATELY different messages from the 5 full
  THREAT_SCENARIOS in state.js, not reuses of them — this game is a
  quick reflex round testing the same pattern-recognition skill
  across a wider variety of phishing tricks (typosquatting, fake
  urgency, authority impersonation, fake fees, storage scams), not
  a memory-for-specifics quiz on the scenarios already played.

  Each item's `tell` is a one-line reason, shown only in the
  end-of-round recap for anything missed — kept out of the round
  itself so the game stays fast-paced rather than turning into
  another reading exercise.
  ============================================================
*/

const MINIGAME_ITEMS = [
  // --- Legit (10) ---
  { sender: "Mom", subject: "Dinner Sunday?", isPhishing: false },
  { sender: "HR Department", subject: "Open enrollment reminder", isPhishing: false },
  { sender: "Jordan Reyes", subject: "Files for tomorrow's review", isPhishing: false },
  { sender: "Facilities Team", subject: "Fire drill at 10 AM tomorrow", isPhishing: false },
  { sender: "Company Newsletter", subject: "This month's highlights", isPhishing: false },
  { sender: "IT Support Desk", subject: "Your ticket #4521 was resolved", isPhishing: false },
  { sender: "USPS", subject: "Package out for delivery today", isPhishing: false },
  { sender: "Calendar", subject: "Reminder: 1:1 with your manager at 3 PM", isPhishing: false },
  { sender: "GitHub", subject: "Your weekly digest is ready", isPhishing: false },
  { sender: "Payroll", subject: "Your pay stub for this period is available", isPhishing: false },

  // --- Phishing (10) ---
  {
    sender: "Microsoft 365 Administrator",
    subject: "Unusual sign-in activity detected",
    isPhishing: true,
    tell: "Sent from admin@0ffice365-alerts.com \u2014 a zero standing in for the letter O, and a domain Microsoft doesn't own.",
  },
  {
    sender: "IT Support Desk",
    subject: "Confirm your access before tomorrow's review",
    isPhishing: true,
    tell: "The real address was itsupport@0urcompany-helpdesk.com \u2014 not the company's actual domain.",
  },
  {
    sender: "Company Newsletter",
    subject: "Corrected link: this month's highlights",
    isPhishing: true,
    tell: "A resend of something already delivered, from newsletter@0urcompany.com \u2014 one character off from the real one.",
  },
  {
    sender: "IT-Alerts (text message)",
    subject: "Verify now to keep your account access",
    isPhishing: true,
    tell: "A number that matched no saved contact, pushing for a fast tap with very few words.",
  },
  {
    sender: "SecureDrive Notifications",
    subject: "A file was shared with you \u2014 expires in 24 hrs",
    isPhishing: true,
    tell: "\"SecureDrive\" isn't a service this company actually uses \u2014 and the countdown exists to rush a click.",
  },
  {
    sender: "Account Security",
    subject: "Your password expires in 1 hour \u2014 act now",
    isPhishing: true,
    tell: "An artificial deadline designed to short-circuit careful checking, from a generic \"security team\" that isn't named.",
  },
  {
    sender: "Payroll Dept",
    subject: "Update your direct deposit info immediately",
    isPhishing: true,
    tell: "Real payroll changes go through an internal portal, not an urgent unsolicited email link.",
  },
  {
    sender: "CEO (personal Gmail)",
    subject: "Need you to buy gift cards ASAP",
    isPhishing: true,
    tell: "Executives don't email from personal Gmail accounts asking for gift cards \u2014 a classic impersonation script.",
  },
  {
    sender: "Delivery Notice",
    subject: "Missed delivery \u2014 pay $2.99 redelivery fee",
    isPhishing: true,
    tell: "Real carriers don't charge a small \"redelivery fee\" by text link \u2014 the tiny amount is designed to feel too small to question.",
  },
  {
    sender: "IT Helpdesk",
    subject: "Your mailbox is full \u2014 click to expand storage",
    isPhishing: true,
    tell: "A generic, alarming claim about storage, from a \"no-reply\" address built to discourage anyone checking back.",
  },
];

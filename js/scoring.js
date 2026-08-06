/*
  ============================================================
  scoring.js — Shared outcome explanations
  ============================================================
  A NOTE ON THE FILENAME:
  Despite being called "scoring.js" (matching this project's
  original planned file structure), this file does NOT produce
  any numeric score. Per this project's research requirements,
  every outcome is explained in plain language only — no points,
  no percentages, no gauge.

  WHAT THIS FILE HOLDS:

    1) CONTROLS — the name, honest role, and honest limitation of
       each of the three security controls (VPN, Firewall, MFA).
       Used by the Security Dashboard to build its three toggle
       rows, so the wording lives in one place.

    2) getOutcome(vpn, firewall, mfa) — given any combination of
       the three toggles, returns a plain-language explanation of
       what happened to the account and the traffic. Used by BOTH
       the Dashboard (as a live "what's happening right now"
       preview) and the Results page (as the final explanation),
       so the two pages can never end up telling a different
       story from each other.

  Load this file after state.js and before dashboard.js.
  ============================================================
*/

/*
  Each control's copy is written to state its LIMITATION plainly,
  not just its benefit — e.g. we never say a firewall "stops
  phishing." Getting this wording right matters more than almost
  anything else in the project, since overstating a control's
  power is exactly the kind of technical inaccuracy a research
  reviewer would flag.
*/
const CONTROLS = [
  {
    key: "vpn",
    stateField: "vpnEnabled",
    name: "VPN",
    role: "Encrypts the connection between your device and whatever site you're visiting, making it harder for someone else on the same network to eavesdrop on your traffic.",
    limitation: "It has no way of knowing whether the site itself is trustworthy — a VPN will just as happily encrypt a perfect connection straight to a phishing page.",
  },
  {
    key: "firewall",
    stateField: "firewallEnabled",
    name: "Firewall",
    role: "Monitors network connections and can restrict suspicious outbound communication, such as malware trying to contact an attacker's server.",
    limitation: "A password typed into a normal-looking web form doesn't look unusual to a firewall — it's better suited to catching follow-up malicious traffic than the initial credential entry itself.",
  },
  {
    key: "mfa",
    stateField: "mfaEnabled",
    name: "Multi-Factor Authentication (MFA)",
    role: "Requires a second proof of identity — like a one-time code or an approval on another device — before granting access to an account.",
    limitation: "It can't stop a password from being stolen in the first place, but it can stop that stolen password alone from being enough to sign in.",
  },
];

/**
 * Plain-language outcomes for all 8 possible VPN / Firewall / MFA
 * combinations, keyed as "vpn-firewall-mfa" using 1 for on and 0
 * for off (e.g. "101" = VPN on, Firewall off, MFA on).
 * Why a lookup table instead of a chain of if/else statements:
 * with three independent switches there are exactly 8 outcomes —
 * a small enough number that spelling each one out in plain
 * English is easier to read, and easier for a research adviser
 * to fact-check, than nested conditional logic would be.
 */
const OUTCOMES = {
  "000": {
    accountTakeover: true,
    headline: "Full compromise — nothing here was in place to stop it.",
    details: [
      "Your connection to the fake sign-in page was not encrypted by a VPN.",
      "No firewall was active to restrict any follow-up suspicious activity.",
      "With no second factor required, the stolen username and password were enough on their own to sign in as you.",
    ],
  },
  "100": {
    accountTakeover: true,
    headline: "Encrypted, but still compromised.",
    details: [
      "VPN encrypted the connection to the fake page — but encryption protects data in transit, it doesn't check whether the destination is trustworthy.",
      "The credentials were typed directly into the attacker's form, a step no VPN can see or stop.",
      "With no second factor required, the stolen credentials were still enough on their own to sign in as you.",
    ],
  },
  "010": {
    accountTakeover: true,
    headline: "Some traffic restricted, but the account was still compromised.",
    details: [
      "A firewall inspects network connections, but a password typed into a normal-looking web form doesn't look unusual to it.",
      "If the attacker's systems attempted follow-up outbound communication, suspicious outbound communication would be restricted.",
      "With no second factor required, the stolen credentials were still enough on their own to sign in as you.",
    ],
  },
  "001": {
    accountTakeover: false,
    headline: "Credentials stolen — but the account held.",
    details: [
      "The username and password were still typed into the fake page and stolen, exactly as before.",
      "This time, signing in also required a second factor the attacker didn't have, so the stolen credentials alone weren't enough to get in.",
      "MFA is the one single control in this simulation that stops the takeover on its own.",
    ],
  },
  "110": {
    accountTakeover: true,
    headline: "Better-protected traffic, same compromised account.",
    details: [
      "VPN encrypted the connection, and suspicious outbound communication was restricted by the firewall.",
      "Neither control inspects what you type into a web form, so the credential theft itself still succeeded.",
      "With no second factor required, the stolen credentials were still enough on their own to sign in as you.",
    ],
  },
  "101": {
    accountTakeover: false,
    headline: "Credentials stolen, account protected.",
    details: [
      "VPN encrypted the connection, but that didn't stop the credential theft — the real password was still typed into the fake page.",
      "MFA is what actually mattered here: the stolen password alone wasn't enough to sign in without the second factor.",
    ],
  },
  "011": {
    accountTakeover: false,
    headline: "Credentials stolen, account protected.",
    details: [
      "Suspicious outbound communication was restricted by the firewall, but the credential theft itself still happened through the form.",
      "MFA is what actually stopped the takeover: the stolen password alone wasn't enough without the second factor.",
    ],
  },
  "111": {
    accountTakeover: false,
    headline: "The best-covered outcome in this simulation — but the click still happened.",
    details: [
      "VPN encrypted the connection and suspicious outbound communication was restricted by the firewall.",
      "MFA is still the control that actually stopped the account takeover, since the stolen password alone was not enough to sign in.",
      "Even with all three enabled, none of them stopped the phishing click itself — only recognizing the warning signs beforehand can do that.",
    ],
  },
};

/**
 * Looks up the plain-language outcome for one specific
 * combination of toggles.
 * Why the three values are passed in as separate booleans instead
 * of a whole state object: it keeps this function usable from
 * anywhere (the dashboard's live preview, the results page, or
 * even a future test) without it needing to know anything about
 * sessionStorage or how state is stored.
 */
function getOutcome(vpnEnabled, firewallEnabled, mfaEnabled) {
  const key =
    (vpnEnabled ? "1" : "0") +
    (firewallEnabled ? "1" : "0") +
    (mfaEnabled ? "1" : "0");
  return OUTCOMES[key];
}

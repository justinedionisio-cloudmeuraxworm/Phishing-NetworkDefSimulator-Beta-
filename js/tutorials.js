/*
  ============================================================
  tutorials.js — Content for the VPN / Firewall / MFA Tutorials
  ============================================================
  PURPOSE OF THIS FILE:
  Holds the full script for each of the three "Learn ___" tutorials
  reachable from the Dashboard. Keeping this as pure data (not mixed
  with the engine that plays it — see tutorial.js) means the whole
  script for any tutorial can be read, checked, or edited in one
  place, and a new tutorial could be added later just by adding a
  new entry here.

  SCENE SCHEMA — every scene in every tutorial below follows this
  shape:
    {
      instructor: "what the Cyber Instructor says on this scene",
      visual: "which stage visual is showing" (see tutorial.js's
        renderVisual() for the full list of what each id draws),
      interaction: one of —
        { type: "next" } — a plain "Next" button advances the scene
        { type: "toggle", onLabel: "..." } — a toggle switch;
          flipping it swaps the visual to visualAfterToggle, then
          reveals a "Next" button
        { type: "button", label: "..." } — a labeled action button;
          clicking it swaps the visual to visualAfterAction, then
          reveals a "Next" button
      visualAfterToggle / visualAfterAction: only present on
        toggle/button scenes — which visual to switch to once that
        interaction happens.
    }

  Each tutorial also has a short "complete" message shown on its
  final screen, before the "Return to Dashboard" button.
  ============================================================
*/

const TUTORIALS = {
  firewall: {
    controlName: "Firewall",
    scenes: [
      {
        instructor:
          'Welcome to the Firewall Training Module. Imagine your computer is like a school building. Would you allow anyone to enter without checking who they are?',
        visual: "computer-idle",
        interaction: { type: "next" },
      },
      {
        instructor:
          "Right now, your computer has NO firewall. Any incoming connection can attempt to reach your device.",
        visual: "packets-unblocked",
        interaction: { type: "next" },
      },
      {
        instructor: "Let's fix that.",
        visual: "packets-unblocked",
        interaction: { type: "toggle", onLabel: "Turn ON the Firewall" },
        visualAfterToggle: "shield-active",
      },
      {
        instructor:
          "Now watch what happens when another suspicious packet arrives.",
        visual: "packet-blocked",
        interaction: { type: "next" },
      },
      {
        instructor:
          "The firewall examines incoming traffic before allowing it to reach your device. Suspicious traffic can be blocked based on configured security rules.",
        visual: "shield-active",
        interaction: { type: "next" },
      },
    ],
    complete: "You're now ready to see the firewall in action during the simulation.",
  },

  vpn: {
    controlName: "VPN",
    scenes: [
      {
        instructor:
          "Now let's learn how a Virtual Private Network, or VPN, protects your connection.",
        visual: "tunnel-inactive",
        interaction: { type: "next" },
      },
      {
        instructor:
          "Without a VPN, your data travels across the network without an encrypted tunnel.",
        visual: "tunnel-inactive",
        interaction: { type: "next" },
      },
      {
        instructor: "Let's secure the connection.",
        visual: "tunnel-inactive",
        interaction: { type: "toggle", onLabel: "Enable VPN" },
        visualAfterToggle: "tunnel-active",
      },
      {
        instructor: "Data now travels safely inside the encrypted tunnel.",
        visual: "tunnel-active",
        interaction: { type: "next" },
      },
      {
        instructor:
          "The VPN encrypts your internet traffic while it travels across the network. Keep in mind that a VPN protects the connection itself, but it does not automatically identify phishing websites.",
        visual: "tunnel-active",
        interaction: { type: "next" },
      },
    ],
    complete:
      "Continue to the simulation to observe how VPN protection works in different scenarios.",
  },

  mfa: {
    controlName: "Multi-Factor Authentication (MFA)",
    scenes: [
      {
        instructor:
          "Passwords can sometimes be stolen. Let's see how Multi-Factor Authentication adds another layer of protection.",
        visual: "login-form",
        interaction: { type: "next" },
      },
      {
        instructor: "Let's try logging in with just a password.",
        visual: "login-form",
        interaction: { type: "button", label: "Press LOGIN" },
        visualAfterAction: "password-compromised",
      },
      {
        instructor:
          "If your password is the only requirement, someone else could attempt to access your account with it too.",
        visual: "password-compromised",
        interaction: { type: "next" },
      },
      {
        instructor: "Let's add another layer.",
        visual: "login-form-verified",
        interaction: { type: "toggle", onLabel: "Enable MFA" },
        visualAfterToggle: "mfa-prompt",
      },
      {
        instructor:
          "A verification code was sent to your device. Let's enter it.",
        visual: "mfa-prompt",
        interaction: { type: "button", label: "Enter Code" },
        visualAfterAction: "mfa-outcome",
      },
      {
        instructor:
          "Even though the correct password was entered, access is only granted after the second verification step is completed. This additional authentication factor helps prevent unauthorized access.",
        visual: "mfa-outcome",
        interaction: { type: "next" },
      },
    ],
    complete:
      "You've learned how Multi-Factor Authentication provides an additional layer of account security. You'll be able to use this knowledge during the simulation.",
  },
};

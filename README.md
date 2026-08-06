# Layered Defense — A Phishing Response Simulation

An interactive, browser-only simulation built for a quantitative research
study on layered network security. It walks a participant through a
realistic phishing scenario, then lets them switch on **VPN**, **Firewall**,
and **Multi-Factor Authentication (MFA)** to see — control by control — what
each one actually stops during an attack, and what it doesn't.

## Important: this is a simulation, not a real attack

- No real credentials are ever collected, stored, or transmitted.
- The site makes **no network requests** and has **no backend server**.
- Everything happens as local state inside your browser tab.
- Works fully offline once the page is loaded.

## Tech stack

Plain **HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build
step, no dependencies. This keeps the project simple to read, easy to
grade, and trivially deployable on GitHub Pages.

## Light / dark mode

The site follows the visitor's operating system setting (`prefers-color-scheme`)
by default, and every page has a sun/moon button in the top bar to switch
manually. Once that button has been clicked, the manual choice is
remembered (via `localStorage`) and takes over from the system setting on
that device, until it's clicked again.

## Project structure

```
/
├── index.html          Landing page
├── email.html           Simulated phishing inbox
├── login.html            Fake credential-entry page
├── dashboard.html        VPN / Firewall / MFA dashboard
├── results.html          Outcome explanation + indicator reveal
├── css/
│   └── style.css        Shared design system + page styles
├── js/
│   ├── theme-init.js     Sets light/dark theme before first paint
│   ├── theme.js           Theme toggle button + follows OS setting
│   ├── state.js          sessionStorage-backed simulation state + shared helpers
│   ├── scoring.js        Shared plain-language outcome table
│   ├── main.js            Landing page behavior
│   ├── email.js           Inbox data + interactions
│   ├── login.js           Fake login page behavior
│   ├── dashboard.js       Dashboard toggles + live diagram
│   └── results.js         Recap, outcome, and indicator reveal
├── assets/               Icons & images (currently unused — all
│                         graphics are inline SVG for simplicity)
└── README.md
```

Pages/scripts marked with a phase are added in that build phase and don't
exist yet on a fresh checkout of an in-progress build.

## Running it locally

No install and no server required — just open `index.html` in any modern
browser.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set the source to your default branch
   (e.g. `main`) and the root folder (`/`).
4. Save. GitHub will publish the site at
   `https://<your-username>.github.io/<repository-name>/`.

## Build progress

- [x] Phase 1 — Folder structure & landing page
- [x] Phase 2 — Email inbox
- [x] Phase 3 — Fake login
- [x] Phase 4 — Security dashboard
- [x] Phase 5 — Results page
- [ ] Phase 6 — Animation, responsive design & final polish

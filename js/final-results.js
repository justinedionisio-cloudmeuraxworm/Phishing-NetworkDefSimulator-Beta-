/*
  ============================================================
  final-results.js — Behavior for Final Results (final-results.html)
  ============================================================
  PURPOSE OF THIS FILE:
  The last page of the whole simulation. This file:

    1) checks sessionStorage for a mini-game result recorded by
       minigame.js — if the participant just played a round, shows
       a short recap line; if they skipped straight here from
       Security Results, that section stays hidden entirely rather
       than showing a placeholder or an empty state, and
    2) wires the Restart Simulation button, same as Security
       Results' own restart button.

  Depends on state.js (resetState), loaded before this file.
  ============================================================
*/

document.addEventListener("DOMContentLoaded", function () {
  showMinigameRecapIfPlayed();
  wireRestartButton();
});

/**
 * Reads the mini-game's last result from sessionStorage (set by
 * minigame.js's endGame()) and shows a one-line recap if present.
 * Why sessionStorage and not the mini-game's own localStorage high
 * score: the high score persists across visits on purpose (it's a
 * "your best ever" record), but THIS section specifically means
 * "you just played" — sessionStorage naturally clears when that's
 * no longer true (a new tab, a restart), which is exactly the
 * behavior wanted here.
 */
function showMinigameRecapIfPlayed() {
  let result = null;
  try {
    const raw = sessionStorage.getItem("layered_defense_minigame_last_result");
    result = raw ? JSON.parse(raw) : null;
  } catch (err) {
    result = null;
  }

  if (!result) return;

  document.getElementById("minigame-recap-section").hidden = false;
  document.getElementById("minigame-recap-line").textContent =
    "You scored " +
    result.score +
    " / " +
    result.total +
    " in Inbox Blitz, with a best streak of " +
    result.bestStreak +
    ".";
}

function wireRestartButton() {
  const btn = document.getElementById("restart-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    resetState();
    window.location.href = "index.html";
  });
}

/*
  ============================================================
  minigame.js — Engine for "Inbox Blitz" (minigame.html)
  ============================================================
  PURPOSE OF THIS FILE:
  A fast, optional reflex round: 10 message previews, sorted from
  MINIGAME_ITEMS (minigame-data.js) — 5 legit and 5 phishing,
  shuffled fresh each playthrough — and a few seconds to call each
  one Legit or Phishing before the clock runs out.

  Why this exists as its own quick game rather than more reading:
  the main simulation already TEACHES the specific tells. This is
  the fast-paced victory lap that tests whether it stuck, under a
  little time pressure — a different kind of engagement than
  reading explanations, on purpose.

  This file:
    1) picks 10 rounds for this playthrough,
    2) runs the round loop: show a message, start a countdown, lock
       in the answer (tapped or timed out), give immediate flash
       feedback, then advance,
    3) tracks score and streak, saving a local best score
       (localStorage — a personal high score on THIS device, not
       shared or sent anywhere), and
    4) shows an end screen recapping anything missed, with Play
       Again and Continue to Final Results.

  Depends on state.js (escapeHtml) and minigame-data.js
  (MINIGAME_ITEMS), both loaded before this file.
  ============================================================
*/

const ROUND_COUNT = 10;
const ROUND_SECONDS = 6;
const HIGH_SCORE_KEY = "layered_defense_minigame_high_score";

let rounds = [];
let roundIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let missed = [];
let timerId = null;
let timerStart = 0;
let answerLocked = false;

document.addEventListener("DOMContentLoaded", function () {
  startGame();
  document.getElementById("play-again-btn").addEventListener("click", startGame);
});

/** Resets every piece of round state and deals a fresh 10 rounds. */
function startGame() {
  rounds = dealRounds();
  roundIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  missed = [];

  document.getElementById("minigame-end").hidden = true;
  document.getElementById("minigame-round").hidden = false;

  renderRound();
}

/**
 * Picks 5 legit + 5 phishing items at random from MINIGAME_ITEMS
 * (without repeats within one playthrough), then shuffles the
 * combined 10 into a random order.
 */
function dealRounds() {
  const legit = shuffle(MINIGAME_ITEMS.filter(function (i) { return !i.isPhishing; })).slice(0, 5);
  const phishing = shuffle(MINIGAME_ITEMS.filter(function (i) { return i.isPhishing; })).slice(0, 5);
  return shuffle(legit.concat(phishing));
}

/** Fisher-Yates shuffle — returns a new array, doesn't mutate the input. */
function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = arr[i];
    arr[i] = arr[j];
    arr[j] = swap;
  }
  return arr;
}

/** Draws the current round's message card and (re)starts its countdown. */
function renderRound() {
  answerLocked = false;
  const item = rounds[roundIndex];

  document.getElementById("round-counter").textContent =
    "Round " + (roundIndex + 1) + " of " + rounds.length;
  document.getElementById("score-counter").textContent = "Score: " + score;
  document.getElementById("streak-counter").textContent = "Streak: " + streak;

  const cardEl = document.getElementById("minigame-card");
  cardEl.className = "minigame-card glass"; // clears any leftover flash class
  cardEl.innerHTML =
    '<p class="minigame-card__sender">' + escapeHtml(item.sender) + "</p>" +
    '<p class="minigame-card__subject">' + escapeHtml(item.subject) + "</p>";

  document.getElementById("feedback-flash").textContent = "";
  document.getElementById("feedback-flash").className = "minigame-feedback";

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timerStart = Date.now();
  const barEl = document.getElementById("timer-bar");
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  barEl.style.transition = "none";
  barEl.style.width = "100%";

  if (!reduceMotion) {
    // Force a reflow so the transition below actually animates from
    // 100% instead of jumping straight to 0% — without this, the
    // browser can coalesce the two width changes into one.
    void barEl.offsetWidth;
    barEl.style.transition = "width " + ROUND_SECONDS + "s linear";
    barEl.style.width = "0%";
  }
  // Under reduced motion, the bar just stays full — the round
  // still ends on time via the setTimeout below, so nothing about
  // how the game plays changes, only the visual countdown motion.

  timerId = setTimeout(function () {
    if (!answerLocked) lockAnswer(null);
  }, ROUND_SECONDS * 1000);
}

/**
 * Wires the two big Legit/Phishing buttons — called once, since
 * the buttons themselves never get rebuilt between rounds (only
 * the card content and timer do).
 */
function wireAnswerButtons() {
  document.getElementById("answer-legit").addEventListener("click", function () {
    lockAnswer(false);
  });
  document.getElementById("answer-phishing").addEventListener("click", function () {
    lockAnswer(true);
  });
}

/**
 * Locks in an answer for the current round — either what the
 * participant tapped, or `null` if the timer ran out. Shows quick
 * flash feedback, updates score/streak, then advances after a
 * short pause so the feedback is actually visible before the next
 * round appears.
 */
function lockAnswer(guessedPhishing) {
  if (answerLocked) return;
  answerLocked = true;
  clearInterval(timerId);

  const item = rounds[roundIndex];
  const correct = guessedPhishing === item.isPhishing;
  const cardEl = document.getElementById("minigame-card");
  const flashEl = document.getElementById("feedback-flash");

  if (correct) {
    score += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    cardEl.classList.add("minigame-card--correct");
    flashEl.textContent = streak > 1 ? "\u2713 Correct \u2014 " + streak + " streak!" : "\u2713 Correct!";
    flashEl.classList.add("minigame-feedback--correct");
  } else {
    streak = 0;
    missed.push(item);
    cardEl.classList.add("minigame-card--wrong");
    flashEl.textContent = guessedPhishing === null ? "\u23F1 Too slow!" : "\u2717 Not quite.";
    flashEl.classList.add("minigame-feedback--wrong");
  }

  setTimeout(advanceRound, 700);
}

function advanceRound() {
  roundIndex += 1;
  if (roundIndex >= rounds.length) {
    endGame();
    return;
  }
  renderRound();
}

/** Shows the end screen: final score, best streak, high score, and a recap of anything missed. */
function endGame() {
  document.getElementById("minigame-round").hidden = true;
  const endEl = document.getElementById("minigame-end");
  endEl.hidden = false;

  const priorBest = getHighScore();
  const isNewHighScore = score > priorBest;
  if (isNewHighScore) setHighScore(score);

  document.getElementById("final-score").textContent = score + " / " + rounds.length;
  document.getElementById("final-streak").textContent = String(bestStreak);
  document.getElementById("high-score-line").textContent = isNewHighScore
    ? "New personal best on this device!"
    : "Personal best on this device: " + Math.max(priorBest, score) + " / " + rounds.length;

  // Remembered only for THIS tab's session, so Final Results can
  // say "you scored X" if they just finished a round — separate
  // from the high score above, which persists across visits.
  try {
    sessionStorage.setItem(
      "layered_defense_minigame_last_result",
      JSON.stringify({ score: score, total: rounds.length, bestStreak: bestStreak })
    );
  } catch (err) {
    // Non-fatal — Final Results just won't have a score to show.
  }

  const recapEl = document.getElementById("missed-recap");
  if (missed.length === 0) {
    recapEl.innerHTML = '<p class="minigame-card__subject">Perfect round \u2014 nothing missed.</p>';
  } else {
    recapEl.innerHTML =
      '<p class="results-card__note">Worth a second look:</p>' +
      '<ul class="indicator-list">' +
      missed.map(function (item) {
        return (
          '<li class="indicator-item">' +
          '<p class="indicator-item__title">' + escapeHtml(item.sender) + ' \u2014 "' + escapeHtml(item.subject) + '"</p>' +
          '<p class="indicator-item__detail">' + escapeHtml(item.tell || "This one was phishing.") + "</p>" +
          "</li>"
        );
      }).join("") +
      "</ul>";
  }
}

function getHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch (err) {
    return 0;
  }
}

function setHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch (err) {
    // If storage is unavailable (private browsing, etc.), the game
    // still works fine — it just won't remember a best score.
  }
}

wireAnswerButtons();

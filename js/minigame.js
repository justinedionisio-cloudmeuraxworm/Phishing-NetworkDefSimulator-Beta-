/*
  ============================================================
  minigame.js — Engine for "Outrun the Inbox" (minigame.html)
  ============================================================
  PURPOSE OF THIS FILE:
  An endless runner (canvas), Chrome-offline-dino style: jump
  malware bugs, crouch under phishing hooks, and the run speeds
  up the longer it goes. Every collision freezes the run and
  opens a 5-question quiz drawn from QUIZ_BANK (minigame-data.js).
  A wrong answer costs one of 5 shields, shared for the whole
  playthrough — not refilled between quizzes. Shields at zero
  ends the run and shows a results screen. Surviving a quiz
  resumes the run. Each successive hit pulls harder questions
  and gives less time to answer (floor: 5 seconds).

  Two independent scores are tracked, for two different jobs:
    - distance (this run's/best-ever "how far") — shown in the
      HUD and on the results screen, kept in localStorage.
    - quiz accuracy (correct / answered, best streak) — written
      to sessionStorage in the exact shape final-results.js
      already expects, so that page needed zero changes.
  ============================================================
*/

// ---------------------------------------------------------------
// Tunables — every constant that shapes difficulty/feel lives
// here, so the whole game can be re-balanced without hunting
// through the logic below.
// ---------------------------------------------------------------
var CANVAS_W = 640;
var CANVAS_H = 220;
var GROUND_Y = 172;
var PLAYER_X = 64;

var STAND_W = 30, STAND_H = 40;
var CROUCH_W = 44, CROUCH_H = 20;

var GRAVITY = 1550; // px/s^2
// Jump apex works out to JUMP_SPEED^2 / (2*GRAVITY) ≈ 34.6px. That's
// deliberately kept between BUG_H (22 — how high you must rise to
// clear a bug) and HOOK_CLEARANCE + HOOK_H (44 — how high you'd have
// to rise to fly clean over a hook). A jumping player's hitbox is
// STAND_H (40) tall the whole time they're airborne, which spans the
// hook's 30–44 band unless they clear it entirely — so capping the
// apex below 44 means jumping can never dodge a hook, only a bug.
// Crouching is the only way under a hook now.
var JUMP_SPEED = 380; // px/s, upward

var BASE_SPEED = 230; // px/s
// No ceiling on speed — see update(): it climbs by SPEED_RAMP_PER_SEC
// every second of survival, forever. SPAWN_TIGHTEN_SPEED below is
// only a curve-shape reference for nextSpawnGap(), not a cap.
var SPAWN_TIGHTEN_SPEED = 380; // px/s above BASE_SPEED to reach ~half the max spawn tightening
var SPAWN_GAP_MIN_FLOOR = 0.45; // seconds — spawn gap never drops below this, however fast the run gets
var SPEED_RAMP_PER_SEC = 4.5; // speed gained per second of running time

var BUG_W = 26, BUG_H = 22; // ground obstacle — must jump
var HOOK_W = 32, HOOK_H = 14; // air obstacle — must crouch
var HOOK_CLEARANCE = 30; // hook's bottom edge sits this far above the ground

var HP_MAX = 5;
var QUESTIONS_PER_HIT = 5;
// Timer values, sized to the actual quiz bank: with the expanded
// 78-question pool, a question plus its 4 choices average 32-45
// words to read (up to 57 for the longest tier-3 ones) — at a
// moderate ~200 words/min reading pace that's already 10-17s just
// to read once, before deciding. The old values (15s down to a 5s
// floor) were sized for the original bank's shorter, more skimmable
// questions and left no real time to read the newer, harder ones.
var TIMER_BASE_SEC = 24;
var TIMER_STEP_SEC = 2;
var TIMER_MIN_SEC = 10;

var HIT_PAUSE_MS = 450; // beat before the quiz appears, so the hit reads clearly
var ANSWER_FEEDBACK_MS = 1200; // time to read right/wrong before advancing
var RESUME_GRACE_SEC = 1.1; // no new obstacles spawn for this long after resuming

var HIGH_SCORE_KEY = "layered_defense_dino_high_score";
var SESSION_RESULT_KEY = "layered_defense_minigame_last_result";

var prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------
// DOM references (filled in on DOMContentLoaded)
// ---------------------------------------------------------------
var canvas, ctx;
var dinoGameSection, dinoResultsSection, dinoStageEl;
var startOverlayEl, startBtn;
var quizOverlayEl, quizProgressEl, quizHitBadgeEl, quizTimerBarEl, quizQuestionEl, quizChoicesEl, quizFeedbackEl;
var choiceButtons;
var shieldRowEl, scoreCounterEl, bestCounterEl;
var btnJump, btnCrouch;
var finalDistanceEl, finalSummaryEl, highScoreLineEl, missedRecapEl, playAgainBtn;

// ---------------------------------------------------------------
// Game state
// ---------------------------------------------------------------
var gameRunning = false;
var quizActive = false;
var rafId = null;
var lastTs = 0;

var player = { offset: 0, vy: 0, jumping: false, crouching: false, runPhase: 0 };
var obstacles = [];
var speed = BASE_SPEED;
var distance = 0;
var elapsedRunTime = 0;
var spawnCooldown = 1.2;
var invulnerable = false;
var invulnerableUntil = 0;
var lastObstacleTypes = [];

var hp = HP_MAX;
var hitCount = 0;
var quizQuestions = [];
var quizIndex = 0;
var quizTimerSec = TIMER_BASE_SEC;
var quizTimerId = null;
var quizAnswerLocked = false;
var currentChoiceOrder = [0, 1, 2, 3];
var askedIds = {};

var correctStreak = 0;
var bestStreak = 0;
var totalCorrect = 0;
var totalAnswered = 0;
var missed = [];

// ---------------------------------------------------------------
// Palette — read from the site's own CSS custom properties so the
// canvas automatically follows the light/dark toggle instead of
// hard-coding a second copy of the color system.
// ---------------------------------------------------------------
var palette = readPalette();

function readPalette() {
  var cs = getComputedStyle(document.documentElement);
  return {
    ground: cs.getPropertyValue("--color-border-strong").trim() || "#3a4a5c",
    track: cs.getPropertyValue("--color-border").trim() || "#22303f",
    player: cs.getPropertyValue("--color-cyan").trim() || "#5ee7ff",
    bug: cs.getPropertyValue("--color-red").trim() || "#ff6b6b",
    hook: cs.getPropertyValue("--color-amber").trim() || "#ffb84d",
    text: cs.getPropertyValue("--color-text").trim() || "#e8eef4",
  };
}

// Keep the canvas palette in sync with the light/dark toggle,
// without needing theme.js to know this page exists.
new MutationObserver(function () {
  palette = readPalette();
}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

// ---------------------------------------------------------------
// Boot
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  cacheDom();
  setupCanvas();
  wireControls();
  renderShields();
  updateScoreHud();
  draw(); // paint one static frame behind the start overlay
});

function cacheDom() {
  canvas = document.getElementById("dino-canvas");
  ctx = canvas.getContext("2d");

  dinoGameSection = document.getElementById("dino-game");
  dinoResultsSection = document.getElementById("dino-results");
  dinoStageEl = document.getElementById("dino-stage");

  startOverlayEl = document.getElementById("start-overlay");
  startBtn = document.getElementById("start-btn");

  quizOverlayEl = document.getElementById("quiz-overlay");
  quizProgressEl = document.getElementById("quiz-progress");
  quizHitBadgeEl = document.getElementById("quiz-hitbadge");
  quizTimerBarEl = document.getElementById("quiz-timer-bar");
  quizQuestionEl = document.getElementById("quiz-question");
  quizChoicesEl = document.getElementById("quiz-choices");
  quizFeedbackEl = document.getElementById("quiz-feedback");
  choiceButtons = Array.prototype.slice.call(quizChoicesEl.querySelectorAll(".quiz-choice-btn"));

  shieldRowEl = document.getElementById("shield-row");
  scoreCounterEl = document.getElementById("score-counter");
  bestCounterEl = document.getElementById("best-counter");

  btnJump = document.getElementById("btn-jump");
  btnCrouch = document.getElementById("btn-crouch");

  finalDistanceEl = document.getElementById("final-distance");
  finalSummaryEl = document.getElementById("final-summary");
  highScoreLineEl = document.getElementById("high-score-line");
  missedRecapEl = document.getElementById("missed-recap");
  playAgainBtn = document.getElementById("play-again-btn");
}

function setupCanvas() {
  var dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_W * dpr;
  canvas.height = CANVAS_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------------------------------------------------------------
// Controls — keyboard, on-screen buttons, and tap-canvas-to-jump.
// ---------------------------------------------------------------
function wireControls() {
  startBtn.addEventListener("click", beginRun);
  startOverlayEl.addEventListener("click", function (e) {
    if (e.target === startOverlayEl) beginRun();
  });

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      handleJumpInput();
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      e.preventDefault();
      handleCrouchStart();
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "ArrowDown" || e.code === "KeyS") handleCrouchEnd();
  });

  canvas.addEventListener("pointerdown", function () {
    handleJumpInput();
  });

  btnJump.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    handleJumpInput();
  });
  btnCrouch.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    handleCrouchStart();
  });
  window.addEventListener("pointerup", handleCrouchEnd);
  window.addEventListener("pointercancel", handleCrouchEnd);

  choiceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      answerQuiz(parseInt(btn.getAttribute("data-choice"), 10));
    });
  });

  playAgainBtn.addEventListener("click", playAgain);
}

function handleJumpInput() {
  if (!gameRunning) {
    if (!startOverlayEl.hidden) beginRun();
    return;
  }
  if (quizActive || player.jumping) return;
  player.jumping = true;
  player.crouching = false;
  player.vy = JUMP_SPEED;
}

function handleCrouchStart() {
  if (!gameRunning || quizActive || player.jumping) return;
  player.crouching = true;
}

function handleCrouchEnd() {
  player.crouching = false;
}

// ---------------------------------------------------------------
// Run lifecycle
// ---------------------------------------------------------------
function beginRun() {
  resetRunState();
  startOverlayEl.hidden = true;
  startLoop();
}

function playAgain() {
  resetRunState();
  dinoResultsSection.hidden = true;
  dinoGameSection.hidden = false;
  startOverlayEl.hidden = true;
  startLoop();
}

function resetRunState() {
  player.offset = 0;
  player.vy = 0;
  player.jumping = false;
  player.crouching = false;
  player.runPhase = 0;

  obstacles = [];
  speed = BASE_SPEED;
  distance = 0;
  elapsedRunTime = 0;
  spawnCooldown = 1.2;
  invulnerable = false;
  lastObstacleTypes = [];

  hp = HP_MAX;
  hitCount = 0;
  quizQuestions = [];
  quizIndex = 0;
  askedIds = {};

  correctStreak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAnswered = 0;
  missed = [];

  renderShields();
  updateScoreHud();
}

function startLoop() {
  gameRunning = true;
  lastTs = performance.now();
  rafId = requestAnimationFrame(frame);
}

function frame(ts) {
  if (!gameRunning) return;
  var dt = Math.min((ts - lastTs) / 1000, 0.05);
  lastTs = ts;
  update(dt);
  draw();
  if (gameRunning) rafId = requestAnimationFrame(frame);
}

// ---------------------------------------------------------------
// Update — physics, spawning, speed ramp, collision
// ---------------------------------------------------------------
function update(dt) {
  elapsedRunTime += dt;
  // Uncapped: the run keeps getting faster for as long as you survive.
  speed = BASE_SPEED + elapsedRunTime * SPEED_RAMP_PER_SEC;
  distance += speed * dt;

  if (invulnerable && performance.now() > invulnerableUntil) invulnerable = false;

  // Jump physics
  if (player.jumping) {
    player.vy -= GRAVITY * dt;
    player.offset += player.vy * dt;
    if (player.offset <= 0) {
      player.offset = 0;
      player.vy = 0;
      player.jumping = false;
    }
  } else {
    player.runPhase += dt * (speed / BASE_SPEED) * 8;
  }

  // Obstacles: move, cull, spawn
  for (var i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= speed * dt;
    if (obstacles[i].x + obstacles[i].w < 0) obstacles.splice(i, 1);
  }

  spawnCooldown -= dt;
  if (spawnCooldown <= 0) {
    spawnObstacle();
    spawnCooldown = nextSpawnGap();
  }

  updateScoreHud();

  if (!invulnerable && !quizActive) checkCollisions();
}

function nextSpawnGap() {
  // Speed has no ceiling now, so this can't lerp against a fixed max
  // speed the way it used to (that plateaus the spawn rate the moment
  // MAX_SPEED is reached). Instead, tightness asymptotically approaches
  // 1 as speed climbs — spawn gaps keep shrinking for the whole run,
  // never quite reaching SPAWN_GAP_MIN_FLOOR but getting arbitrarily
  // close to it. Base gaps (at tightness ~0) are also tighter than
  // before (1.2–2.1s vs the old 1.5–2.5s) as a general spawn-rate buff.
  var speedAboveBase = speed - BASE_SPEED;
  var tightness = speedAboveBase / (speedAboveBase + SPAWN_TIGHTEN_SPEED);
  var minGap = Math.max(SPAWN_GAP_MIN_FLOOR, lerp(0.8, 0.5, tightness));
  var maxGap = Math.max(SPAWN_GAP_MIN_FLOOR + 0.35, lerp(1.5, 0.85, tightness));
  return minGap + Math.random() * (maxGap - minGap);
}

function spawnObstacle() {
  var isBug = Math.random() < 0.55;
  // Light anti-repeat: avoid a 3rd identical type in a row.
  if (lastObstacleTypes.length >= 2 && lastObstacleTypes[0] === lastObstacleTypes[1]) {
    isBug = lastObstacleTypes[0] !== "bug";
  }
  var type = isBug ? "bug" : "hook";
  lastObstacleTypes = [type, lastObstacleTypes[0]];

  if (type === "bug") {
    obstacles.push({ type: "bug", x: CANVAS_W, w: BUG_W, top: GROUND_Y - BUG_H, bottom: GROUND_Y });
  } else {
    var bottom = GROUND_Y - HOOK_CLEARANCE;
    obstacles.push({ type: "hook", x: CANVAS_W, w: HOOK_W, top: bottom - HOOK_H, bottom: bottom });
  }
}

function playerBox() {
  var crouching = player.crouching && !player.jumping;
  var w = crouching ? CROUCH_W : STAND_W;
  var h = crouching ? CROUCH_H : STAND_H;
  var footY = GROUND_Y - player.offset;
  return {
    left: PLAYER_X - w / 2,
    right: PLAYER_X + w / 2,
    top: footY - h,
    bottom: footY,
  };
}

function checkCollisions() {
  var p = playerBox();
  for (var i = 0; i < obstacles.length; i++) {
    var o = obstacles[i];
    var oLeft = o.x, oRight = o.x + o.w;
    if (p.left < oRight && p.right > oLeft && p.top < o.bottom && p.bottom > o.top) {
      onHit();
      return;
    }
  }
}

function onHit() {
  gameRunning = false;
  if (rafId) cancelAnimationFrame(rafId);

  if (!prefersReducedMotion) {
    dinoStageEl.classList.add("dino-stage--shake");
    setTimeout(function () {
      dinoStageEl.classList.remove("dino-stage--shake");
    }, HIT_PAUSE_MS);
  }

  setTimeout(startQuizSession, HIT_PAUSE_MS);
}

// ---------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------
function startQuizSession() {
  quizActive = true;
  hitCount += 1;

  var tier = Math.min(3, hitCount);
  quizTimerSec = Math.max(TIMER_MIN_SEC, TIMER_BASE_SEC - (hitCount - 1) * TIMER_STEP_SEC);
  quizQuestions = pickQuestions(tier, QUESTIONS_PER_HIT);
  quizIndex = 0;

  obstacles = [];
  quizOverlayEl.hidden = false;
  dinoStageEl.classList.add("dino-stage--quiz");
  renderQuizQuestion();
}

function pickQuestions(tier, count) {
  var pool = QUIZ_BANK.filter(function (q) {
    return q.difficulty === tier && !askedIds[q.id];
  });
  if (pool.length < count) {
    // This tier's pool is exhausted for this playthrough — recycle it
    // rather than let a long run run out of questions.
    QUIZ_BANK.forEach(function (q) {
      if (q.difficulty === tier) delete askedIds[q.id];
    });
    pool = QUIZ_BANK.filter(function (q) {
      return q.difficulty === tier;
    });
  }
  var chosen = shuffle(pool).slice(0, count);
  chosen.forEach(function (q) {
    askedIds[q.id] = true;
  });
  return chosen;
}

function renderQuizQuestion() {
  quizAnswerLocked = false;
  var q = quizQuestions[quizIndex];

  currentChoiceOrder = shuffle([0, 1, 2, 3]);
  quizProgressEl.textContent = "Question " + (quizIndex + 1) + " of " + quizQuestions.length;
  quizHitBadgeEl.textContent = "Hit " + hitCount;
  quizQuestionEl.textContent = q.q;
  quizFeedbackEl.textContent = "";
  quizFeedbackEl.className = "quiz-feedback";

  choiceButtons.forEach(function (btn, displayIdx) {
    var originalIdx = currentChoiceOrder[displayIdx];
    btn.textContent = q.choices[originalIdx];
    btn.className = "btn quiz-choice-btn";
    btn.disabled = false;
  });

  renderShields();
  startQuizTimer();
}

function startQuizTimer() {
  clearTimeout(quizTimerId);
  quizTimerBarEl.style.transition = "none";
  quizTimerBarEl.style.width = "100%";

  if (prefersReducedMotion) {
    // Still enforce the real time limit — just skip the moving bar.
    quizTimerId = setTimeout(function () {
      answerQuiz(null);
    }, quizTimerSec * 1000);
    return;
  }

  // Force layout so the width:100% above is committed before the
  // transition to 0% starts (same technique used elsewhere on this
  // site for the round timer bar).
  // eslint-disable-next-line no-unused-expressions
  quizTimerBarEl.offsetWidth;
  quizTimerBarEl.style.transition = "width " + quizTimerSec + "s linear";
  quizTimerBarEl.style.width = "0%";

  quizTimerId = setTimeout(function () {
    answerQuiz(null);
  }, quizTimerSec * 1000);
}

function answerQuiz(displayIdx) {
  if (quizAnswerLocked) return;
  quizAnswerLocked = true;
  clearTimeout(quizTimerId);

  var q = quizQuestions[quizIndex];
  var chosenOriginalIdx = displayIdx === null ? null : currentChoiceOrder[displayIdx];
  var correct = chosenOriginalIdx === 0; // authored with the right answer first
  totalAnswered++;

  choiceButtons.forEach(function (btn, dIdx) {
    btn.disabled = true;
    var origIdx = currentChoiceOrder[dIdx];
    if (origIdx === 0) btn.classList.add("quiz-choice-btn--correct");
    else if (dIdx === displayIdx) btn.classList.add("quiz-choice-btn--wrong");
  });

  if (correct) {
    totalCorrect++;
    correctStreak++;
    bestStreak = Math.max(bestStreak, correctStreak);
    quizFeedbackEl.textContent = "\u2713 Correct.";
    quizFeedbackEl.className = "quiz-feedback quiz-feedback--correct";
  } else {
    correctStreak = 0;
    hp = Math.max(0, hp - 1);
    missed.push({ q: q.q, correctAnswer: q.choices[0], explain: q.explain });
    quizFeedbackEl.textContent =
      (displayIdx === null ? "\u23F1 Too slow \u2014 " : "\u2717 Not quite \u2014 ") + q.explain;
    quizFeedbackEl.className = "quiz-feedback quiz-feedback--wrong";
    renderShields();
  }

  setTimeout(function () {
    if (hp <= 0) {
      showGameOver();
      return;
    }
    quizIndex++;
    if (quizIndex >= quizQuestions.length) endQuizSession();
    else renderQuizQuestion();
  }, ANSWER_FEEDBACK_MS);
}

function endQuizSession() {
  quizActive = false;
  quizOverlayEl.hidden = true;
  dinoStageEl.classList.remove("dino-stage--quiz");
  resumeRun();
}

function resumeRun() {
  invulnerable = true;
  invulnerableUntil = performance.now() + RESUME_GRACE_SEC * 1000;
  spawnCooldown = RESUME_GRACE_SEC + 0.4;
  startLoop();
}

// ---------------------------------------------------------------
// Game over / results
// ---------------------------------------------------------------
function showGameOver() {
  quizActive = false;
  gameRunning = false;
  quizOverlayEl.hidden = true;
  dinoStageEl.classList.remove("dino-stage--quiz");
  dinoGameSection.hidden = true;
  dinoResultsSection.hidden = false;

  var finalScore = Math.floor(distance);
  var prevBest = getHighScore();
  var isNew = finalScore > prevBest;
  if (isNew) setHighScore(finalScore);

  finalDistanceEl.textContent = finalScore + " m";
  finalSummaryEl.textContent =
    "You took " +
    hitCount +
    (hitCount === 1 ? " hit" : " hits") +
    " and answered " +
    totalCorrect +
    " / " +
    totalAnswered +
    " quiz questions correctly, with a best streak of " +
    bestStreak +
    ".";
  highScoreLineEl.textContent = isNew
    ? "New personal best on this device."
    : "Personal best on this device: " + Math.max(prevBest, finalScore) + " m.";

  renderMissedRecap();

  try {
    sessionStorage.setItem(
      SESSION_RESULT_KEY,
      JSON.stringify({ score: totalCorrect, total: totalAnswered, bestStreak: bestStreak })
    );
  } catch (err) {
    // Not worth interrupting the participant over a storage failure.
  }
}

function renderMissedRecap() {
  if (missed.length === 0) {
    missedRecapEl.innerHTML = '<p class="results-card__note">Perfect quiz record this run \u2014 nothing missed.</p>';
    return;
  }
  var html = '<p class="results-card__note">Worth a second look:</p><ul class="indicator-list">';
  missed.forEach(function (m) {
    html +=
      '<li class="indicator-item"><p class="indicator-item__title">' +
      escapeHtml(m.q) +
      '</p><p class="indicator-item__detail">Correct answer: ' +
      escapeHtml(m.correctAnswer) +
      " \u2014 " +
      escapeHtml(m.explain) +
      "</p></li>";
  });
  html += "</ul>";
  missedRecapEl.innerHTML = html;
}

function getHighScore() {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10) || 0;
  } catch (err) {
    return 0;
  }
}
function setHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch (err) {
    // Fine if this can't be saved — the run itself still worked.
  }
}

// ---------------------------------------------------------------
// HUD
// ---------------------------------------------------------------
function renderShields() {
  var html = "";
  for (var i = 0; i < HP_MAX; i++) {
    var lost = i >= hp;
    html +=
      '<span class="shield-icon' +
      (lost ? " shield-icon--lost" : "") +
      '"><svg width="16" height="16" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><polygon points="8,1 14.1,4.5 14.1,11.5 8,15 1.9,11.5 1.9,4.5" /></svg></span>';
  }
  shieldRowEl.innerHTML = html;
}

function updateScoreHud() {
  scoreCounterEl.textContent = String(Math.floor(distance)).padStart(5, "0");
  bestCounterEl.textContent = "BEST " + String(getHighScore()).padStart(5, "0");
}

// ---------------------------------------------------------------
// Draw
// ---------------------------------------------------------------
function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawGround();
  obstacles.forEach(drawObstacle);
  drawPlayer();
}

function drawGround() {
  ctx.strokeStyle = palette.ground;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 1);
  ctx.lineTo(CANVAS_W, GROUND_Y + 1);
  ctx.stroke();

  // Scrolling dashes give a sense of speed without affecting collision.
  ctx.strokeStyle = palette.track;
  ctx.lineWidth = 2;
  var dashLen = 18, gapLen = 22, period = dashLen + gapLen;
  var offset = distance % period;
  ctx.beginPath();
  for (var x = CANVAS_W + dashLen - offset; x > -dashLen; x -= period) {
    ctx.moveTo(x, GROUND_Y + 8);
    ctx.lineTo(x - dashLen, GROUND_Y + 8);
  }
  ctx.stroke();
}

function drawPlayer() {
  var crouching = player.crouching && !player.jumping;
  var w = crouching ? CROUCH_W : STAND_W;
  var h = crouching ? CROUCH_H : STAND_H;
  var footY = GROUND_Y - player.offset;
  var top = footY - h;
  var cx = PLAYER_X;

  ctx.save();
  if (invulnerable) {
    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(performance.now() / 60);
  }

  // Shield-shaped body (same hexagon motif as the site's brand mark).
  ctx.fillStyle = palette.player;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + w / 2, top + h * 0.28);
  ctx.lineTo(cx + w / 2, top + h * 0.72);
  ctx.lineTo(cx, footY);
  ctx.lineTo(cx - w / 2, top + h * 0.72);
  ctx.lineTo(cx - w / 2, top + h * 0.28);
  ctx.closePath();
  ctx.fill();

  // Simple eyes for readability/personality.
  ctx.fillStyle = "rgba(10, 16, 22, 0.85)";
  var eyeY = top + h * 0.4;
  ctx.beginPath();
  ctx.arc(cx - w * 0.14, eyeY, Math.max(1.4, w * 0.06), 0, Math.PI * 2);
  ctx.arc(cx + w * 0.14, eyeY, Math.max(1.4, w * 0.06), 0, Math.PI * 2);
  ctx.fill();

  // Two small legs, alternating while grounded and running.
  if (!player.jumping) {
    var phase = Math.sin(player.runPhase);
    var legLen = crouching ? 4 : 7;
    ctx.strokeStyle = palette.player;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.18, footY);
    ctx.lineTo(cx - w * 0.18 + phase * 3, footY + legLen);
    ctx.moveTo(cx + w * 0.18, footY);
    ctx.lineTo(cx + w * 0.18 - phase * 3, footY + legLen);
    ctx.stroke();
  }

  ctx.restore();
}

function drawObstacle(o) {
  if (o.type === "bug") {
    drawBug(o);
  } else {
    drawHook(o);
  }
}

function drawBug(o) {
  var cx = o.x + o.w / 2, cy = (o.top + o.bottom) / 2, r = o.w / 2.6;
  ctx.strokeStyle = palette.bug;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    var angle = (Math.PI * 2 * i) / 6;
    ctx.moveTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
    ctx.lineTo(cx + Math.cos(angle) * r * 1.5, cy + Math.sin(angle) * r * 1.5);
  }
  ctx.stroke();

  ctx.fillStyle = palette.bug;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
}

function drawHook(o) {
  var left = o.x, right = o.x + o.w, midY = (o.top + o.bottom) / 2;
  ctx.strokeStyle = palette.hook;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  // A small envelope trailing a curved hook — the "phishing hook" motif.
  ctx.beginPath();
  ctx.moveTo(left, o.top);
  ctx.lineTo(left + o.w * 0.45, o.bottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(right - o.w * 0.22, midY, o.w * 0.22, Math.PI * 0.15, Math.PI * 1.5);
  ctx.stroke();
}

// ---------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Fisher-Yates shuffle — returns a new array, leaves the input alone. */
function shuffle(list) {
  var copy = list.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

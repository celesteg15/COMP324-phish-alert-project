/** Seconds per question; driven by each scenario's difficulty label (not the filter dropdown). */
export const TIMER_SECONDS_BY_DIFFICULTY = {
  Easy: 60,
  Medium: 45,
  Hard: 30
};

export const HINT_PENALTY_POINTS = 25;
export const TIME_PENALTY_POINTS = 40;
export const POINTS_PER_CORRECT = 100;

export function getTimerSecondsForScenario(difficulty) {
  return TIMER_SECONDS_BY_DIFFICULTY[difficulty] ?? 60;
}

export function computeQuestionPoints({ correct, hintUsed, late }) {
  let pts = correct ? POINTS_PER_CORRECT : 0;
  if (hintUsed) {
    pts -= HINT_PENALTY_POINTS;
  }
  if (late) {
    pts -= TIME_PENALTY_POINTS;
  }
  return Math.max(0, pts);
}

export const state = {
  scenarios: [],
  status: "loading", // loading | error | empty | success
  errorMessage: "",
  currentIndex: 0,
  selectedAnswer: null,
  submitted: false,
  hintVisible: false, // Control whether the hint box is currently visible.
  activeDifficulty: "all",
  score: 0, // Added to track how many answers the user got correct
  answeredCount: 0, // Track how many questions the user has answered total
  pointsTotal: 0,
  /** When the current question's timer hits zero (still allowed to submit with penalties). */
  timerExpired: false,
  /** True if the user opened the hint before submitting this question. */
  hintRevealedBeforeSubmit: false,
  /** Wall-clock ms when the current question's timer reaches zero. */
  questionDeadlineMs: 0,
  /** `${activeDifficulty}:${currentIndex}` — reset deadline when this changes. */
  timerStamp: "",
  /** Set after each submit; cleared when moving to the next question. */
  submitSnapshot: null
};

/*
  Start or reset the per-question countdown from the scenario's difficulty.
  Call when the active question changes (filter, index, or new load).
*/
export function syncQuestionTimerForCurrentQuestion() {
  const scenario = getCurrentScenario();
  if (!scenario || state.submitted) {
    return;
  }

  const stamp = `${state.activeDifficulty}:${state.currentIndex}`;
  if (state.timerStamp !== stamp) {
    state.timerStamp = stamp;
    state.timerExpired = false;
    state.hintRevealedBeforeSubmit = false;
    const seconds = getTimerSecondsForScenario(scenario.difficulty);
    state.questionDeadlineMs = Date.now() + seconds * 1000;
  }
}

/*
  New selector:
  Returns the list of scenarios based on the active difficulty filter.
  This keeps filtering logic in state.js instead of render.js.
*/
export function getFilteredScenarios() {
  if (state.activeDifficulty === "all") {
    return state.scenarios;
  }

  return state.scenarios.filter(
    (scenario) => scenario.difficulty === state.activeDifficulty
  );
}

/*
  Updated selector:
  The original version got the current scenario from all scenarios.
  This version gets it from the filtered scenario list instead,
  so the displayed question matches the selected difficulty.
*/
export function getCurrentScenario() {
  return getFilteredScenarios()[state.currentIndex] ?? null;
}

/*
  Existing selector:
  Determines whether Submit should stay disabled.
  Submit is disabled unless the app is in success state,
  an answer is selected, and the question has not already been submitted.
*/
export function isSubmitDisabled() {
  if (state.status !== "success" || state.submitted) {
    return true;
  }
  if (state.selectedAnswer !== null) {
    return false;
  }
  /* After time runs out, user may submit with no selection (counts as incorrect). */
  return !state.timerExpired;
}

/*
  New selector:
  Checks whether there is another question available in the
  current filtered scenario list. Used for the Next button.
*/
export function canGoNext() {
  return state.currentIndex < getFilteredScenarios().length - 1;
}

/*
  New selector:
  Calculates the user's score percentage.
  Returns 0 when no questions have been answered yet
  to avoid dividing by zero.
*/
export function getScorePercent() {
  if (state.answeredCount === 0) {
    return 0;
  }

  return Math.round((state.score / state.answeredCount) * 100);
}
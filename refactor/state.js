export const state = {
  scenarios: [],
  status: "loading", // loading | error | empty | success
  errorMessage: "",
  currentIndex: 0,
  selectedAnswer: null,
  submitted: false,
  hintVisible: false, // Control whether the hint box is currently visible.
  score: 0, // Added to track how many answers the user got correct
  answeredCount: 0, // Track how many questions the user has answered total
  activeDifficulty: "all", // New property to track the currently selected difficulty filter
};

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
  return state.status !== "success" || state.selectedAnswer === null || state.submitted;
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
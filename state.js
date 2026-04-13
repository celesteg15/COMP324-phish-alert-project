export const state = {
  scenarios: [],
  status: "loading", // loading | error | empty | success
  errorMessage: "",
  currentIndex: 0,
  selectedAnswer: null,
  submitted: false
};

export function getCurrentScenario() {
  return state.scenarios[state.currentIndex] ?? null;
}

export function isSubmitDisabled() {
  return state.status !== "success" || state.selectedAnswer === null || state.submitted;
}
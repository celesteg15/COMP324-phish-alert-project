// main.js

import { loadScenarios } from "./api.js";
import {
  state,
  getFilteredScenarios,
  getCurrentScenario,
  computeQuestionPoints,
  syncQuestionTimerForCurrentQuestion,
  getTimerSecondsForScenario
} from "./state.js";
import { dom } from "./dom.js";
import { render } from "./render.js";
import { openPointsModal, closePointsModal, wirePointsModal } from "./pointsModal.js";

/*
  Group all UI event handlers in one object so render() can receive
  every callback it needs in a single argument.
*/
const handlers = {
  onRetry: startLoad,
  onSelect: handleSelect,
  onSubmit: handleSubmit,
  onNext: handleNext,
  onToggleHint: handleToggleHint,
  onFilterChange: handleFilterChange
};

/*
  Reset state that belongs only to the current question.
  This is used when reloading, changing filters, or moving to the next scenario.
*/
function resetQuestionState() {
  state.selectedAnswer = null;
  state.submitted = false;
  state.hintVisible = false;
  state.hintRevealedBeforeSubmit = false;
  state.timerExpired = false;
  state.submitSnapshot = null;
}

/*
  Load scenario data and initialize the quiz state.
  Also handles loading, empty, success, and error UI states.
*/
async function startLoad() {
  closePointsModal();
  state.status = "loading";
  state.errorMessage = "";
  resetQuestionState();
  state.currentIndex = 0;
  state.timerStamp = "";
  render(handlers);

  try {
    state.scenarios = await loadScenarios();
    state.score = 0;
    state.answeredCount = 0;
    state.pointsTotal = 0;
    state.currentIndex = 0;
    state.timerStamp = "";
    state.status = state.scenarios.length === 0 ? "empty" : "success";
  } catch (error) {
    state.status = "error";
    state.errorMessage = error.message;
  }

  render(handlers);
}

/*
  Save the user's selected answer, but only if the quiz is in a valid
  success state and the current question has not already been submitted.
*/
function handleSelect(value) {
  if (state.status !== "success" || state.submitted) {
    return;
  }

  state.selectedAnswer = value;
  render(handlers);
}

/*
  Submit the current answer, lock the question, and update score stats.
  Prevents submission if no scenario exists, no answer is selected,
  or the question was already submitted.
*/
function handleSubmit() {
  const scenario = getCurrentScenario();

  if (!scenario || state.submitted) {
    return;
  }

  const canSubmitWithoutAnswer = state.timerExpired && state.selectedAnswer === null;
  if (state.selectedAnswer === null && !canSubmitWithoutAnswer) {
    return;
  }

  const late = Date.now() > state.questionDeadlineMs;
  const correct =
    state.selectedAnswer !== null && state.selectedAnswer === scenario.answer;

  const earned = computeQuestionPoints({
    correct,
    hintUsed: state.hintRevealedBeforeSubmit,
    late
  });
  state.pointsTotal += earned;
  state.submitSnapshot = { earned, hintUsed: state.hintRevealedBeforeSubmit, late };

  state.submitted = true;
  state.answeredCount += 1;

  if (correct) {
    state.score += 1;
  }

  render(handlers);
  openPointsModal({
    earned,
    correct,
    hintUsed: state.submitSnapshot.hintUsed,
    late: state.submitSnapshot.late
  });
}

/*
  Move to the next scenario in the currently filtered scenario list.
  Also clears question-specific state before rerendering.
*/
function handleNext() {
  if (state.currentIndex >= getFilteredScenarios().length - 1) {
    return;
  }

  closePointsModal();
  state.currentIndex += 1;
  resetQuestionState();
  render(handlers);
}

/*
  Show or hide the hint for the current scenario.
*/
function handleToggleHint() {
  if (!getCurrentScenario()) {
    return;
  }

  state.hintVisible = !state.hintVisible;
  if (state.hintVisible) {
    state.hintRevealedBeforeSubmit = true;
  }
  render(handlers);
}

/*
  Update the active difficulty filter, reset the quiz view to the first
  matching scenario, and rerender the filtered results.
*/
function handleFilterChange(value) {
  closePointsModal();
  state.activeDifficulty = value;
  state.currentIndex = 0;
  resetQuestionState();

  if (state.scenarios.length === 0) {
    state.status = "empty";
  } else {
    state.status = "success";
  }

  render(handlers);
}

function updateTimerDisplay() {
  const el = dom.timerLine;
  if (!el) {
    return;
  }

  if (state.status !== "success") {
    el.hidden = true;
    el.textContent = "";
    el.classList.remove("timer-warning", "timer-expired");
    return;
  }

  const scenario = getCurrentScenario();
  if (!scenario || state.submitted) {
    el.hidden = true;
    el.textContent = "";
    el.classList.remove("timer-warning", "timer-expired");
    return;
  }

  syncQuestionTimerForCurrentQuestion();

  const secondsTotal = getTimerSecondsForScenario(scenario.difficulty);
  const remainingMs = Math.max(0, state.questionDeadlineMs - Date.now());
  const remainingSec = Math.ceil(remainingMs / 1000);

  if (remainingSec <= 0 && !state.timerExpired) {
    state.timerExpired = true;
    render(handlers);
    return;
  }

  el.hidden = false;
  const mm = Math.floor(remainingSec / 60);
  const ss = remainingSec % 60;
  el.textContent = `Time: ${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")} / ${secondsTotal}s`;
  el.classList.toggle("timer-warning", remainingSec > 0 && remainingSec <= 10);
  el.classList.toggle("timer-expired", state.timerExpired || remainingSec === 0);
}

wirePointsModal();
setInterval(updateTimerDisplay, 250);
updateTimerDisplay();
startLoad();

/*
import { loadScenarios } from "./api.js";
import { state } from "./state.js";
import { render } from "./render.js";
import { dom } from "./dom.js";

async function startLoad() {
  state.status = "loading";
  state.errorMessage = "";
  render(startLoad, handleSelect, handleSubmit);

  try {
    const scenarios = await loadScenarios();
    state.scenarios = scenarios;

    if (scenarios.length === 0) {
      state.status = "empty";
    } else {
      state.status = "success";
    }
  } catch (error) {
    state.status = "error";
    state.errorMessage = error.message;
  }

  render(startLoad, handleSelect, handleSubmit);
}

function handleSelect(value) {
  state.selectedAnswer = value;
  state.submitted = false;
  render(startLoad, handleSelect, handleSubmit);
}

function handleSubmit() {
  state.submitted = true;
  render(startLoad, handleSelect, handleSubmit);
}

dom.submit.addEventListener("click", handleSubmit);
startLoad();
*/
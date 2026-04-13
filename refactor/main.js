// main.js

import { loadScenarios } from "./api.js";
import { state, getFilteredScenarios, getCurrentScenario } from "./state.js";
import { render } from "./render.js";

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
}

/*
  Load scenario data and initialize the quiz state.
  Also handles loading, empty, success, and error UI states.
*/
async function startLoad() {
  state.status = "loading";
  state.errorMessage = "";
  resetQuestionState();
  state.currentIndex = 0;
  render(handlers);

  try {
    state.scenarios = await loadScenarios();
    state.score = 0;
    state.answeredCount = 0;
    state.currentIndex = 0;
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

  if (!scenario || state.selectedAnswer === null || state.submitted) {
    return;
  }

  state.submitted = true;
  state.answeredCount += 1;

  if (state.selectedAnswer === scenario.answer) {
    state.score += 1;
  }

  render(handlers);
}

/*
  Move to the next scenario in the currently filtered scenario list.
  Also clears question-specific state before rerendering.
*/
function handleNext() {
  if (state.currentIndex >= getFilteredScenarios().length - 1) {
    return;
  }

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
  render(handlers);
}

/*
  Update the active difficulty filter, reset the quiz view to the first
  matching scenario, and rerender the filtered results.
*/
function handleFilterChange(value) {
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

/* Start the app when the page loads. */
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
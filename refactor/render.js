// render.js
import { dom } from "./dom.js";
import {
  state,
  getFilteredScenarios,
  getCurrentScenario,
  isSubmitDisabled,
  canGoNext,
  getScorePercent
} from "./state.js";
import { renderAnswerChoices } from "./components/answerChoices.js";

// Clears the visible scenario metadata
function clearScenarioFields() {
  dom.sender.textContent = "—";
  dom.subject.textContent = "—";
  dom.type.textContent = "—";
  dom.difficulty.textContent = "—";
}

/*
  Creates and displays a Retry button inside the retry container.
  This gives the user a visible way to re-attempt loading data.
*/
function renderRetryButton(onRetry) {
  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.textContent = "Retry";
  retryButton.addEventListener("click", onRetry);
  dom.retryContainer.replaceChildren(retryButton);
}

/*
  Removes any existing Retry button when the app is no longer
  in the error state.
*/
function clearRetryButton() {
  dom.retryContainer.replaceChildren();
}

/* Updates the UI based on the current state and wires up
   all event handlers for the interactive controls.
*/
export function render(handlers) {
  const { onRetry, onSelect, onSubmit, onNext, onToggleHint, onFilterChange } = handlers;

  dom.difficultyFilter.value = state.activeDifficulty;
  dom.difficultyFilter.onchange = (event) => onFilterChange(event.target.value);
  dom.hintButton.onclick = onToggleHint;
  dom.submitButton.onclick = onSubmit;
  dom.nextButton.onclick = onNext;
  dom.scoreLine.textContent = `Score: ${state.score}/${state.answeredCount} correct (${getScorePercent()}%)`;

  clearRetryButton();
  dom.hintBox.hidden = true;
  dom.hintText.textContent = "";
  dom.hintButton.textContent = "Show Hint";
  dom.hintButton.disabled = true;
  dom.nextButton.disabled = true;
  dom.submitButton.disabled = true;
  renderAnswerChoices({
    container: dom.answerActions,
    selectedAnswer: state.selectedAnswer,
    disabled: true,
    onSelect
  });
// Loading State
  if (state.status === "loading") {
    clearScenarioFields();
    dom.content.textContent = "Loading quiz scenarios...";
    dom.feedback.textContent = "Please wait while the scenarios load.";
    return;
  }
// Error state with a retry action
  if (state.status === "error") {
    clearScenarioFields();
    dom.content.textContent = "Unable to load scenarios.";
    dom.feedback.textContent = state.errorMessage;
    renderRetryButton(onRetry);
    return;
  }

  const filteredScenarios = getFilteredScenarios();

/* Handles both a truly empty dataset and the case where no
    scenarios match the currently selected difficulty filter.
*/
  if (state.status === "empty" || filteredScenarios.length === 0) {
    clearScenarioFields();
    dom.content.textContent = "No quiz scenarios match this difficulty right now.";
    dom.feedback.textContent =
      state.activeDifficulty === "all"
        ? "Add a scenario to scenarios.json and reload the page."
        : `Try another difficulty filter or switch back to All difficulties.`;
    return;
  }

  const scenario = getCurrentScenario();

  clearScenarioFields();
  dom.sender.textContent = scenario.sender;
  dom.subject.textContent = scenario.subject;
  dom.type.textContent = scenario.type;
  dom.difficulty.textContent = scenario.difficulty;
  dom.content.textContent = scenario.content;
  dom.hintButton.disabled = false;
  dom.submitButton.disabled = isSubmitDisabled();
  dom.nextButton.disabled = !canGoNext();

  renderAnswerChoices({
    container: dom.answerActions,
    selectedAnswer: state.selectedAnswer,
    disabled: state.submitted,
    onSelect
  });
  // Show hint only when requested
  if (state.hintVisible) {
    dom.hintBox.hidden = false;
    dom.hintText.textContent = scenario.hint || "No hint is available.";
    dom.hintButton.textContent = "Hide Hint";
  }

  if (!state.submitted) {
    dom.feedback.textContent = `Question ${state.currentIndex + 1} of ${filteredScenarios.length}: Submit your answer to see feedback.`;
    return;
  }

  if (state.selectedAnswer === scenario.answer) {
    dom.feedback.textContent = `Correct. ${scenario.feedback}`;
  } else {
    dom.feedback.textContent = `Incorrect. ${scenario.feedback}`;
  }
// Append final score at the end of the filtered scenario list
  if (!canGoNext()) {
    dom.feedback.textContent += ` Final score: ${state.score}/${state.answeredCount}.`;
  }
}

/*
export function render(onRetry, onSelect, onSubmit) {
  if (state.status === "loading") {
    dom.content.textContent = "Loading...";
    dom.feedback.textContent = "Loading quiz scenario...";
    dom.submit.disabled = true;
    return;
  }

  if (state.status === "error") {
    dom.content.textContent = "Unable to load scenarios.";
    dom.feedback.textContent = state.errorMessage;
    dom.submit.disabled = true;
    return;
  }

  if (state.status === "empty") {
    dom.content.textContent = "No scenarios available.";
    dom.feedback.textContent = "Try again later.";
    dom.submit.disabled = true;
    return;
  }

  const scenario = getCurrentScenario();
  dom.sender.textContent = scenario.sender;
  dom.subject.textContent = scenario.subject;
  dom.type.textContent = scenario.type;
  dom.difficulty.textContent = scenario.difficulty;
  dom.content.textContent = scenario.content;
  dom.submit.disabled = isSubmitDisabled();

  renderAnswerChoices({
    container: dom.actions,
    selectedAnswer: state.selectedAnswer,
    disabled: state.submitted,
    onSelect
  });

  if (!state.submitted) {
    dom.feedback.textContent = "Submit your answer to see feedback.";
  } else {
    dom.feedback.textContent =
      state.selectedAnswer === scenario.answer
        ? scenario.feedback
        : `Incorrect. ${scenario.feedback}`;
  }
}
*/
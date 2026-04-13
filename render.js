// render.js
import { dom } from "./dom.js";
import { state, getCurrentScenario, isSubmitDisabled } from "./state.js";
import { renderAnswerChoices } from "./components/answerChoices.js";

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
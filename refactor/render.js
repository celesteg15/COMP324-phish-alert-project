// render.js
import { dom } from "./dom.js";
import {
  state,
  getFilteredScenarios,
  getCurrentScenario,
  isSubmitDisabled,
  canGoNext,
  getScorePercent,
  syncQuestionTimerForCurrentQuestion,
  HINT_PENALTY_POINTS,
  TIME_PENALTY_POINTS
} from "./state.js";
import { renderAnswerChoices } from "./components/answerChoices.js";

// Clears the visible scenario metadata
function clearScenarioFields() {
  dom.sender.textContent = "—";
  dom.subject.textContent = "—";
  dom.type.textContent = "—";
}

/*
  Underline the main explanatory clause (typically starting at "because …")
  so the core reason stands out from the rest of the feedback sentence.
*/
function appendExplanationWithKeyUnderline(container, text) {
  const becauseRe = /(?:^|\s)because\b/i;
  const m = text.match(becauseRe);
  if (!m || m.index === undefined) {
    container.append(document.createTextNode(text));
    return;
  }
  const start = m.index;
  container.append(document.createTextNode(text.slice(0, start)));
  const tail = text.slice(start);
  const sentMatch = tail.match(/^[\s\S]+?[.!?](?=\s|$)/);
  const underLen = sentMatch ? sentMatch[0].length : tail.length;
  const span = document.createElement("span");
  span.className = "feedback-key";
  span.textContent = tail.slice(0, underLen);
  container.append(span);
  if (underLen < tail.length) {
    container.append(document.createTextNode(tail.slice(underLen)));
  }
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

function setSubmittedFeedbackVerdict(isCorrect, explanation, trailingSuffix) {
  dom.feedback.replaceChildren();
  const verdict = document.createElement("strong");
  verdict.className = "feedback-verdict";
  verdict.textContent = isCorrect ? "CORRECT. " : "INCORRECT. ";
  dom.feedback.append(verdict);
  appendExplanationWithKeyUnderline(dom.feedback, explanation);
  if (trailingSuffix) {
    dom.feedback.append(document.createTextNode(trailingSuffix));
  }
}

/* Updates the UI based on the current state and wires up
   all event handlers for the interactive controls.
*/
export function render(handlers) {
  const { onRetry, onSelect, onSubmit, onNext, onToggleHint, onFilterChange } = handlers;

  dom.difficultyFilter.value = state.activeDifficulty;
  dom.difficultyFilter.classList.remove(
    "filter-all",
    "filter-easy",
    "filter-medium",
    "filter-hard"
  );
  if (state.activeDifficulty === "all") dom.difficultyFilter.classList.add("filter-all");
  else if (state.activeDifficulty === "Easy") dom.difficultyFilter.classList.add("filter-easy");
  else if (state.activeDifficulty === "Medium") dom.difficultyFilter.classList.add("filter-medium");
  else if (state.activeDifficulty === "Hard") dom.difficultyFilter.classList.add("filter-hard");

  dom.difficultyFilter.onchange = (event) => onFilterChange(event.target.value);
  dom.hintButton.onclick = onToggleHint;
  dom.submitButton.onclick = onSubmit;
  dom.nextButton.onclick = onNext;
  dom.scoreLine.textContent = `Score: ${state.score}/${state.answeredCount} correct (${getScorePercent()}%) · ${state.pointsTotal} pts`;
  const pct = getScorePercent();
  dom.scoreLine.classList.remove("score-good", "score-mid", "score-low", "score-neutral");
  if (state.answeredCount === 0) {
    dom.scoreLine.classList.add("score-neutral");
  } else if (pct >= 80) {
    dom.scoreLine.classList.add("score-good");
  } else if (pct >= 50) {
    dom.scoreLine.classList.add("score-mid");
  } else {
    dom.scoreLine.classList.add("score-low");
  }

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

  if (!state.submitted) {
    syncQuestionTimerForCurrentQuestion();
  }

  clearScenarioFields();
  dom.sender.textContent = scenario.sender;
  dom.subject.textContent = scenario.subject;
  dom.type.textContent = scenario.type;
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
    let prompt = `Question ${state.currentIndex + 1} of ${filteredScenarios.length}: Submit your answer to see feedback.`;
    if (state.timerExpired && state.selectedAnswer === null) {
      prompt =
        "TIME'S UP! — press Submit to record this question with no answer. Point penalties for hint or late submit still apply.";
    }
    dom.feedback.textContent = prompt;
    return;
  }

  const isCorrect = state.selectedAnswer === scenario.answer;
  let trailing = "";
  if (state.submitSnapshot) {
    const { earned, hintUsed, late } = state.submitSnapshot;
    const pen = [];
    if (hintUsed) {
      pen.push(`hint −${HINT_PENALTY_POINTS}`);
    }
    if (late) {
      pen.push(`time −${TIME_PENALTY_POINTS}`);
    }
    trailing += ` Points this question: ${earned}`;
    trailing += pen.length ? ` (${pen.join(", ")}).` : ".";
    trailing += ` Total points: ${state.pointsTotal}.`;
  }
  if (!canGoNext()) {
    trailing += ` Final score: ${state.score}/${state.answeredCount} correct.`;
  }
  setSubmittedFeedbackVerdict(isCorrect, scenario.feedback, trailing);
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
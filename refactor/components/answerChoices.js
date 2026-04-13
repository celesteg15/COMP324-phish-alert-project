// components/answerChoices.js

// Component: AnswerChoices
// Input: { container, selectedAnswer, disabled, onSelect }
// Output: DOM nodes mounted inside `container`
// Events: onSelect(value) — called when user selects an answer
// Dependencies: none

export function renderAnswerChoices({ container, selectedAnswer, disabled, onSelect }) {
  const phishingBtn = document.createElement("button");
  phishingBtn.type = "button";
  phishingBtn.textContent = "Phishing";
  phishingBtn.setAttribute("aria-pressed", String(selectedAnswer === "phishing"));
  // Added: visually highlight the selected button using CSS
  phishingBtn.classList.toggle("is-selected", selectedAnswer === "phishing");
  phishingBtn.disabled = disabled;
  phishingBtn.addEventListener("click", () => onSelect("phishing"));

  const legitimateBtn = document.createElement("button");
  legitimateBtn.type = "button";
  legitimateBtn.textContent = "Legitimate";
  legitimateBtn.setAttribute("aria-pressed", String(selectedAnswer === "legitimate"));
  //Added: visually highlight the selected button using CSS
  legitimateBtn.classList.toggle("is-selected", selectedAnswer === "legitimate");
  legitimateBtn.disabled = disabled;
  legitimateBtn.addEventListener("click", () => onSelect("legitimate"));

  container.replaceChildren(phishingBtn, legitimateBtn);
}
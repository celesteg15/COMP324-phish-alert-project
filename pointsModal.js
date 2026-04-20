import { dom } from "./dom.js";
import { HINT_PENALTY_POINTS, TIME_PENALTY_POINTS, POINTS_PER_CORRECT } from "./state.js";

export function openPointsModal({ earned, correct, hintUsed, late }) {
  if (!dom.pointsModal || !dom.pointsModalEarned || !dom.pointsModalBreakdown) {
    return;
  }

  const sign = earned > 0 ? "+" : "";
  dom.pointsModalEarned.textContent = `${sign}${earned} points this question`;
  dom.pointsModalEarned.classList.toggle("points-modal__earned--zero", earned === 0);
  dom.pointsModalEarned.classList.toggle("points-modal__earned--positive", earned > 0);

  const list = dom.pointsModalBreakdown;
  list.replaceChildren();

  const addLi = (t) => {
    const li = document.createElement("li");
    li.textContent = t;
    list.append(li);
  };

  if (correct) {
    addLi(`Base: +${POINTS_PER_CORRECT} (correct answer)`);
  } else {
    addLi("Base: 0 (incorrect or no answer)");
  }
  if (hintUsed) {
    addLi(`Hint used: −${HINT_PENALTY_POINTS}`);
  }
  if (late) {
    addLi(`Past the timer deadline: −${TIME_PENALTY_POINTS}`);
  }
  if (correct && !hintUsed && !late) {
    addLi("No penalties — full credit.");
  }
  if (!correct && !hintUsed && !late) {
    addLi("No extra penalties on this question.");
  }

  dom.pointsModal.classList.remove("is-hidden");
  dom.pointsModalClose?.focus();
}

export function closePointsModal() {
  dom.pointsModal?.classList.add("is-hidden");
}

export function wirePointsModal() {
  dom.pointsModalClose?.addEventListener("click", () => closePointsModal());
  dom.pointsModal?.addEventListener("click", (e) => {
    if (e.target === dom.pointsModal) {
      closePointsModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      dom.pointsModal &&
      !dom.pointsModal.classList.contains("is-hidden")
    ) {
      closePointsModal();
    }
  });
}

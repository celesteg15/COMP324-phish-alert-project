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

export function openWinModal({ totalPoints }) {
  const winModal = dom.winModal;
  if (!winModal) return;
  const scoreEl = dom.winModalScore;
  const msgEl = dom.winModalMessage;
  if (scoreEl) {
    scoreEl.textContent = `Total points: ${totalPoints}`;
  }
  if (msgEl) {
    msgEl.textContent = "You've improved your resistance to modern phishing scams.";
  }
  winModal.classList.remove("is-hidden");
  dom.winModalPlay?.focus();
}

export function closeWinModal() {
  dom.winModal?.classList.add("is-hidden");
}

export function wireWinModal(onPlayAgain) {
  dom.winModalPlay?.addEventListener("click", () => {
    closeWinModal();
    if (typeof onPlayAgain === "function") {
      onPlayAgain();
      return;
    }
    // fallback: dispatch global event
    document.dispatchEvent(new CustomEvent("play-again"));
  });
  dom.winModal?.addEventListener("click", (e) => {
    if (e.target === dom.winModal) {
      closeWinModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dom.winModal && !dom.winModal.classList.contains("is-hidden")) {
      closeWinModal();
    }
  });
}

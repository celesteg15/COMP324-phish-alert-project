// main.js
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
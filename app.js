const DATA_URL = "./data/scenarios.json";
const LOAD_TIMEOUT_MS = 8000;

const sender = document.querySelector("#sender");
const subject = document.querySelector("#subject");
const type = document.querySelector("#type");
const difficulty = document.querySelector("#difficulty");
const content = document.querySelector("#content");
const feedback = document.querySelector("#feedback");

const phishingButton = document.querySelector("#btn-phishing");
const legitimateButton = document.querySelector("#btn-legitimate");
const hintButton = document.querySelector("#btn-hint");
const submitButton = document.querySelector("#btn-submit");

const hintBox = document.querySelector("#hint-box");
const hintText = document.querySelector("#hint-text");
const retryContainer = document.querySelector("#retry-container");

let currentScenario = null;
let hintVisible = false;
let selectedAnswer = "";

function resetHint() {
     hintVisible = false;
    hintBox.hidden = true;
    hintButton.textContent = "Show Hint";
    hintText.textContent = "";
}

function clearRetryButton() {
    retryContainer.replaceChildren();
}
function showRetryButton() {
    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", init);
    retryContainer.replaceChildren(retryButton);
}

function renderLoadingState() {
    currentScenario = null;
    selectedAnswer = "";
    submitButton.disabled = true;
    hintButton.disabled = true;
    resetHint();
    clearRetryButton();

    sender.textContent = "—";
    subject.textContent = "—";
    type.textContent = "—";
    difficulty.textContent = "—";
    content.textContent = "Loading quiz scenario...";
    feedback.textContent = "Please wait while the scenarios load.";
}

function renderErrorState(message) {
    currentScenario = null;
    selectedAnswer = "";
    submitButton.disabled = true;
    hintButton.disabled = true;
    resetHint();

    sender.textContent = "—";
    subject.textContent = "—";
    type.textContent = "—";
    difficulty.textContent = "—";
    content.textContent = "Unable to load scenarios.";
    feedback.textContent = message;

    showRetryButton();
}

function renderEmptyState() {
    currentScenario = null;
    selectedAnswer = "";
    submitButton.disabled = true;
    hintButton.disabled = true;
    resetHint();
    clearRetryButton();

    sender.textContent = "—";
    subject.textContent = "—";
    type.textContent = "—";
    difficulty.textContent = "—";
    content.textContent = "No quiz scenarios are available right now.";
    feedback.textContent = "Add a scenario to scenarios.json and reload the page.";
}
function renderScenario(scenario) {
    sender.textContent = scenario.sender;
    subject.textContent = scenario.subject;
    type.textContent = scenario.type;
    difficulty.textContent = scenario.difficulty;
    content.textContent = scenario.content;
    feedback.textContent = "Submit your answer to see feedback.";
    selectedAnswer = "";
    submitButton.disabled = true;

    resetHint();
}

function toggleHint() {
        const scenario = scenarios[0];

    hintVisible = !hintVisible;
    hintBox.hidden = !hintVisible;
    hintButton.textContent = hintVisible ? "Hide Hint" : "Show Hint";

    if (hintVisible) {
        hintText.textContent = scenario.hint;
    } else {
        hintText.textContent = "";
    }
}

function chooseAnswer(answer) {
    if (!currentScenario) {
        return;
    }

    selectedAnswer = answer;
    submitButton.disabled = false;
}


function checkAnswer() {
    if (!currentScenario) {
        return;
    }

    if (selectedAnswer === currentScenario.answer) {
        feedback.textContent = currentScenario.feedback;
    } else {
        feedback.textContent = "That is not correct. Try again.";
    }
}

function validateScenarioFields(scenario, index) {
    const requiredFields = [
        "sender",
        "subject",
        "type",
        "difficulty",
        "content",
        "answer",
        "feedback"
    ];

    for (const field of requiredFields) {
        if (typeof scenario[field] !== "string" || scenario[field].trim() === "") {
            throw new Error(`Scenario ${index + 1} is missing a valid ${field}.`);
        }
    }
}

function validateScenarios(data) {
    if (!Array.isArray(data)) {
        throw new Error("The JSON file must contain an array of scenarios.");
    }

    for (let i = 0; i < data.length; i += 1) {
        validateScenarioFields(data[i], i);
    }
}

async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(function () {
        controller.abort();
    }, timeoutMs);

    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
}

async function loadScenarios() {
    try {
        const response = await fetchWithTimeout(DATA_URL, LOAD_TIMEOUT_MS);

        if (!response.ok) {
            throw new Error(`Unable to load scenarios (HTTP ${response.status}).`);
        }

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error("The scenario file is not valid JSON.");
        }

        validateScenarios(data);
        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Loading timed out. Please try again.");
        }

        if (error instanceof TypeError) {
            throw new Error("A network error occurred while loading the scenarios.");
        }

        throw error;
    }
}

async function init() {
    renderLoadingState();

    try {
        const scenarios = await loadScenarios();

        if (scenarios.length === 0) {
            renderEmptyState();
            return;
        }

        renderScenario(scenarios[0]);
    } catch (error) {
        renderErrorState(error.message);
    }
}

phishingButton.addEventListener("click", function () {
    chooseAnswer("phishing");
});

legitimateButton.addEventListener("click", function () {
    chooseAnswer("legitimate");
});

hintButton.addEventListener("click", toggleHint);
submitButton.addEventListener("click", checkAnswer);

renderScenario(scenarios[0]);

init();
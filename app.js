const DATA_URL = "./data/scenarios.json";

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
const nextButton = document.querySelector("#btn-next");

const hintBox = document.querySelector("#hint-box");
const hintText = document.querySelector("#hint-text");
const retryContainer = document.querySelector("#retry-container")
const scoreLine = document.querySelector("#score-line");

let scenarios = [];
let currentScenario = null;
let currentIndex = 0;
let hintVisible = false;
let selectedAnswer = "";
let score = 0;
let answeredCount = 0;
let hasSubmitted = false;

function updateScoreLine() {
    const percent = answeredCount === 0 ? 0 : Math.round((score / answeredCount) * 100);
    scoreLine.textContent = `Score: ${score}/${answeredCount} correct (${percent}%)`;
}

function resetHint() {
    hintVisible = false;
    hintBox.hidden = true;
    hintButton.textContent = "Show Hint";
    hintText.textContent = "";
}

function clearScenario() {
    sender.textContent = "—";
    subject.textContent = "—";
    type.textContent = "—";
    difficulty.textContent = "—";
    content.textContent = "";
    currentScenario = null;
    selectedAnswer = "";
    hasSubmitted = false;
    submitButton.disabled = true;
    nextButton.disabled = true;
    hintButton.disabled = true;
    resetHint();
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
    clearScenario();
    clearRetryButton();
    content.textContent = "Loading quiz scenario...";
    feedback.textContent = "Please wait while the scenarios load.";
}

function renderErrorState(message) {
    clearScenario();
    content.textContent = "Unable to load scenarios.";
    feedback.textContent = message;
    showRetryButton();
}

function renderEmptyState() {
    clearScenario();
    clearRetryButton();
    content.textContent = "No quiz scenarios are available right now.";
    feedback.textContent = "Add a scenario to scenarios.json and reload the page.";
}

function renderScenario(scenario) {
    currentScenario = scenario;
    selectedAnswer = "";
    hasSubmitted = false;
    submitButton.disabled = true;
    nextButton.disabled = true;
    hintButton.disabled = false;
    clearRetryButton();
    resetHint();

    sender.textContent = scenario.sender;
    subject.textContent = scenario.subject;
    type.textContent = scenario.type;
    difficulty.textContent = scenario.difficulty;
    content.textContent = scenario.content;
    feedback.textContent = `Question ${currentIndex + 1} of ${scenarios.length}: Submit your answer to see feedback.`;
}

function toggleHint() {
    if (!currentScenario) {
        return;
    }

    hintVisible = !hintVisible;
    hintBox.hidden = !hintVisible;
    hintButton.textContent = hintVisible ? "Hide Hint" : "Show Hint";
    hintText.textContent = hintVisible ? (currentScenario.hint || "No hint is available.") : "";
}

function chooseAnswer(answer) {
    if (!currentScenario || hasSubmitted || selectedAnswer === "") {
        return;
    }

    hasSubmitted = true;
    answeredCount += 1;

    if (selectedAnswer === currentScenario.answer) {
        score += 1;
        feedback.textContent = `Correct. ${currentScenario.feedback}`;
    } else {
        feedback.textContent = `Incorrect. ${currentScenario.feedback}`;
    }

    updateScoreLine();
    submitButton.disabled = true;

    if (currentIndex < scenarios.length - 1) {
        nextButton.disabled = false;
    } else {
        nextButton.disabled = true;
        feedback.textContent += ` Final score: ${score}/${answeredCount}.`;
    }
}

function checkAnswer() {
    if (!currentScenario || hasSubmitted || selectedAnswer === "") {
        return;
    }

    hasSubmitted = true;
    answeredCount += 1;

    if (selectedAnswer === currentScenario.answer) {
        score += 1;
        feedback.textContent = `Correct. ${currentScenario.feedback}`;
    } else {
        feedback.textContent = `Incorrect. ${currentScenario.feedback}`;
    }

    updateScoreLine();
    submitButton.disabled = true;

    if (currentIndex < scenarios.length - 1) {
        nextButton.disabled = false;
    } else {
        nextButton.disabled = true;
        feedback.textContent += ` Final score: ${score}/${answeredCount}.`;
    }
}
function goToNextScenario() {
    if (currentIndex >= scenarios.length - 1) {
        return;
    }

    currentIndex += 1;
    renderScenario(scenarios[currentIndex]);
}

function isValidScenario(scenario) {
    return (
        typeof scenario.sender === "string" &&
        typeof scenario.subject === "string" &&
        typeof scenario.type === "string" &&
        typeof scenario.difficulty === "string" &&
        typeof scenario.content === "string" &&
        typeof scenario.answer === "string" &&
        typeof scenario.feedback === "string"
    );
}

async function loadScenarios() {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
        throw new Error(`Unable to load scenarios (HTTP ${response.status}).`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("The JSON file must contain an array of scenarios.");
    }

    for (const scenario of data) {
        if (!isValidScenario(scenario)) {
            throw new Error("One or more scenarios are missing required fields.");
        }
    }

    return data;
}

async function init() {
    renderLoadingState();

    try {
        scenarios = await loadScenarios();

        if (scenarios.length === 0) {
            renderEmptyState();
            return;
        }
        currentIndex = 0;
        score = 0;
        answeredCount = 0;
        updateScoreLine();
        renderScenario(scenarios[currentIndex]);
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
nextButton.addEventListener("click", goToNextScenario);


init();
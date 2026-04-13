const scenarios = [
    {
        sender: "loyola-support@secure-reset.com",
        subject: "Urgent: Reset Your Password",
        type: "Email",
        difficulty: "Easy",
        content:
            "Your Loyola account has been flagged for suspicious activity. Click the link below immediately to verify your password or your account will be locked.",
        answer: "phishing",
        feedback:
            "This is phishing because it uses urgency and a suspicious sender address that does not match Loyola's official domain.",
        hint:
            "Look closely at the sender domain and the urgent language asking you to act immediately."
    }
];


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

let hintVisible = false;
let selectedAnswer = "";

function resetHint() {
     hintVisible = false;
    hintBox.hidden = true;
    hintButton.textContent = "Show Hint";
    hintText.textContent = "";
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
    selectedAnswer = answer;
    submitButton.disabled = false;
}

function checkAnswer() {
    const scenario = scenarios[0];
    if (selectedAnswer === scenario.answer) {
        feedback.textContent = scenario.feedback;
    } else {
        feedback.textContent = "That is not correct. Try again.";
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
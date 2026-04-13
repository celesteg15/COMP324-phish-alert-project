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
            "This is phishing because it uses urgency and a suspicious sender address that does not match Loyola's official domain."
    }
];


const sender = document.querySelector("#sender");
const subject = document.querySelector("#subject");
const type = document.querySelector("#type");
const difficulty = document.querySelector("#difficulty");
const content = document.querySelector("#content");
const feedback = document.querySelector("#feedback");


function renderScenario(scenario) {
    sender.textContent = scenario.sender;
    subject.textContent = scenario.subject;
    type.textContent = scenario.type;
    difficulty.textContent = scenario.difficulty;
    content.textContent = scenario.content;
    feedback.textContent = "Submit your answer to see feedback.";
}

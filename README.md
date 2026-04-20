# PhishQuiz

PhishQuiz is an interactive quiz app that helps users practice telling whether a message is **phishing** or **legitimate**. The app loads quiz scenarios from a local JSON file and lets users read each message, choose an answer, get feedback, use a hint if they need one, move to the next question, and keep track of their score as they go.
## How to run

## How to run

Start a local server from the project folder:

```bash
python3 -m http.server 5501

## Deployed URL
https://celesteg15.github.io/COMP324-phish-alert-project/

# Module map
- `index.html` — main page structure and semantic regions
- `styles.css` — styling for layout, buttons, feedback, and modal
- `main.js` — app startup, event wiring, and quiz flow control
- `api.js` — data loading, timeout handling, cancellation, validation, and fetch errors
- `state.js` — single state object, selectors, and quiz helpers
- `render.js` — rendering the loading, error, empty, and success UI states
- `dom.js` — centralized DOM element references
- `pointsModal.js` — points modal behavior
- `components/answerChoices.js` — extracted answer-choice component
- `data/scenarios.json` — quiz scenario data

## Component contracts
The extracted component in the project is:

- `AnswerChoices`

```js
// Component: AnswerChoices
// Input: { container, selectedAnswer, disabled, onSelect }
// Output: DOM nodes mounted inside `container`
// Events: onSelect(value) — called when user selects an answer
// Dependencies: none
```

## Resilience patterns applied
The app currently uses these resilience patterns in the data-loading flow:
- **Structured error messages** — shows clear error messages for HTTP loading failures, invalid JSON structure, and missing required scenario fields
- **Retry button** — shows a visible Retry button in the error state so the user can try loading again without refreshing the page
- **Data validation** — checks that the JSON file contains an array and that each scenario has the required fields before the app tries to render it

## Current feature status

### Working now
- loads quiz scenarios from `data/scenarios.json`
- displays all four UI states:
  - loading
  - error
  - empty
  - success
- lets the user choose **Phishing** or **Legitimate**
- enables **Submit** after an answer is selected
- shows feedback after submission
- tracks score and grade percentage
- supports multiple scenarios
- includes a **Next** button to move through questions
- includes a **Show Hint / Hide Hint** toggle

### Still in progress
- fully switching the live app from the single-file `app.js` version to the modular `main.js`, `api.js`, `state.js`, `render.js`, and `dom.js` version
- finalizing modular selector and state usage in the live version
- finishing integration of the extracted component into the running modular flow
- additional cleanup and testing before final submission
- Previous button
- retrying button on quiz
- filter difficulty 
- fix the showing of a visible Retry button in the error state

# PhishQuiz

PhishQuiz is an interactive quiz app that helps users practice telling whether a message is **phishing** or **legitimate**. The app loads quiz scenarios from a local JSON file and lets users read each message, choose an answer, get feedback, use a hint if they need one, move to the next question, and keep track of their score as they go.

## How to run

Start a local server from the project folder:

```bash
python3 -m http.server 5501
```
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

#### Feature list
- Load quiz scenarios from a local JSON file
- Display sender, subject, type, and message content
- Select Phishing or Legitimate
- Enable Submit after answer selection
- Show correctness feedback after submission
- Show points popup after submission
- Deduct 25 points when hint is used
- Apply late-submission penalty after timer expires
- Move to the next question
- Filter scenarios by difficulty
- Track score, accuracy percentage, and total points
- Show win modal when target points are reached

## Known issues / limitations

- Quiz progress does not persist after refreshing the page.
- The app uses a local JSON dataset instead of a live phishing API.
- The project does not include user accounts, saved profiles, leaderboards, or long-term score tracking.
- Accessibility was tested manually, but a full formal screen-reader audit was not completed.


## Component contracts

### `main.js`
- Coordinates app behavior and user interaction
- Calls state, render, and modal helpers
- Handles answer selection, submission, next-question flow, hint toggling, and difficulty changes

### `api.js`
- Loads scenario data from `data/scenarios.json`
- Validates scenario structure before the app renders it
- Returns usable scenario data or throws a readable error

### `state.js`
- Stores quiz state such as current question, selected answer, score, timer, and points
- Exposes helper functions for filtering, scoring, next-question checks, and timer setup

### `render.js`
- Updates the visible UI based on the current app state
- Displays feedback, score, timer, retry UI, and scenario content

### `components/answerChoices.js`
- Inputs: `container`, `selectedAnswer`, `disabled`, `onSelect`
- Output: answer buttons rendered into the container
- Behavior: calls `onSelect(value)` when the user chooses an answer

### `pointsModal.js`
- Displays the score breakdown after each submission
- Handles modal open/close behavior for the points modal and win modal

## Testing summary

The project was tested through manual browser testing, feature-level checks, smoke testing, accessibility checks, and GitHub Pages deployment verification.

- Original structured test cases: 12
- Additional accessibility test cases: 3
- Total documented test cases: 15
- Testing categories covered: success paths, edge cases, failure modes, accessibility, and deployment
- Smoke test completed before final demo: yes
- Bug fixes were re-tested after changes to confirm the app still worked correctly

## Team Members

- Alexa Solorzano — Project concept development, scenario writing, modular code refactoring, feature implementation, testing, bug fixes, timer/scoring behavior, modal behavior, and final project polish.
- Celeste Gonzalez — Documentation, presentation design, state/data feature implementation, test execution, README/publication readiness, GitHub Pages deployment verification, and final report support.


## Accessibility

PhishQuiz includes several accessibility-supporting features:

- Semantic HTML structure with clear headings and sections
- Labeled difficulty dropdown
- Clearly named buttons for Phishing, Legitimate, Submit, Next, Hint, and modal actions
- Visible focus styling for keyboard users
- Keyboard-reachable controls through normal tab navigation
- `aria-pressed` behavior on answer buttons to show which answer is selected
- `aria-live` regions for dynamic updates such as the timer, scenario content, feedback, and points message
- Modal dialogs for points and win states with labeled dialog titles
- Points and win modals can be dismissed through normal controls, including buttons and the Escape key

Accessibility was also tested through three additional manual test cases:
- TC-13: Keyboard navigation
- TC-14: Dynamic feedback and readable updates
- TC-15: Modal behavior

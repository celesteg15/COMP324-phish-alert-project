const DATA_URL = "./data/scenarios.json";
const REQUEST_TIMEOUT_MS = 8000;
let activeController = null;

/*
  Helper function to validate the structure of each scenario object.
  Ensures all required fields exist and are the correct type.
*/
function isValidScenario(scenario) {
  return (
    typeof scenario?.sender === "string" &&
    typeof scenario?.subject === "string" &&
    typeof scenario?.type === "string" &&
    typeof scenario?.difficulty === "string" &&
    typeof scenario?.content === "string" &&
    typeof scenario?.answer === "string" &&
    typeof scenario?.feedback === "string" &&
    typeof scenario?.hint === "string"
  );
}

/* Fetches scenario data, applies timeout + cancellation,
   validates the data, and returns usable results.
*/
export async function loadScenarios() {
  // If a previous request is still in progress, cancel it.
  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;

  /*
    Set up a timeout that automatically aborts the request
    if it takes longer than the allowed time.
  */
  const timeoutId = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DATA_URL, {
      signal: controller.signal,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Unable to load scenarios (HTTP ${response.status}).`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("The scenario data could not be parsed as valid JSON.");
    }

    if (!Array.isArray(data)) {
      throw new Error("The API must return an array of scenarios.");
    }

    // Validate each scenario individually and keep only the valid ones.
    const valid = [];
    const invalidCount = 0;
    for (let i = 0; i < data.length; i++) {
      const scenario = data[i];
      if (isValidScenario(scenario)) {
        valid.push(scenario);
      } else {
        // Log a helpful message for debugging but don't fail the entire load.
        // Keep messages minimal so students can inspect the data file if needed.
        // eslint-disable-next-line no-console
        console.warn(`Skipping invalid scenario at index ${i}`);
      }
    }

    if (valid.length === 0) {
      throw new Error("No valid scenarios found in the data.");
    }

    return valid;
  } catch (error) {
  if (controller.signal.aborted) {
  if (controller.signal.reason === "timeout") {
    throw new Error("Request timed out after 8 seconds. Please try again.");
  }

  const staleRequestError = new Error("A newer request started.");
  staleRequestError.code = "STALE_REQUEST";
  throw staleRequestError;
  }

  if (error instanceof TypeError) {
    throw new Error("Network error while loading scenarios. Please try again.");
  }

    throw error;
  } finally {
    clearTimeout(timeoutId);

    if (activeController === controller) {
      activeController = null;
    }
  }
}

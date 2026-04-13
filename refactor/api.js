//timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 8000);

try {
  // fetch call here
} catch (error) {
  if (error.name === "AbortError") {
    throw new Error("Request timed out. Please try again.");
  }
  throw new Error("Network or loading error.");
}

//structured errors
export async function loadScenarios(signal) {
  const response = await fetch("./data/scenarios.json", { signal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid data shape");
  }

  return data;
}
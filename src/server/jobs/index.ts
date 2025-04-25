import "./job-handlers"; // Import to register handlers

import { startDevWorker } from "./dev-worker";

let workerStarted = false;

/**
 * This function initializes the worker. It should only be called once and only
 * in development mode.
 *
 */
async function initializeDevWorker() {
  if (workerStarted) return;
  workerStarted = true;

  const interval = 1000; // 1 second
  console.log(`Initializing dev worker with interval of ${interval}ms...`);
  try {
    await startDevWorker(interval);
  } catch (error) {
    workerStarted = false;

    console.error("Error starting dev worker:", error);
    throw error;
  }
}

// Initialize the dev worker on the server
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  initializeDevWorker().catch(console.error);
}

import "./job-handlers"; // Import to register handlers

import { startDevWorker } from "./dev-worker";

let workerStarted = false;

/**
 * This function initializes the worker. It should only be called once and only
 * in development mode.
 *
 */
export async function initializeDevWorker() {
  if (workerStarted) return;

  await startDevWorker(1000);
  workerStarted = true;
}

// Initialize the dev worker on the server
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  initializeDevWorker().catch(console.error);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { jobQueue } from "./job-queue";

// Map of job handlers
const jobHandlers: Record<string, (payload: any) => Promise<any>> = {};

// Register a job handler
export function registerJobHandler<T, R>(
  jobType: string,
  handler: (payload: T) => Promise<R>
) {
  jobHandlers[jobType] = handler as any;
}

// Process a single job
async function processJob(job: Job): Promise<void> {
  try {
    // Mark job as processing
    const canProcess = await jobQueue.markJobAsProcessing(job.id);
    if (!canProcess) return; // Job was already processed or is being processed

    // Get the handler for this job type
    const handler = jobHandlers[job.type];
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }

    // Execute the handler
    const result = await handler(job.payload);

    // Mark job as completed
    await jobQueue.completeJob(job.id, result);

    console.log(`Job ${job.id} of type ${job.type} completed successfully`);
  } catch (error) {
    // Mark job as failed
    await jobQueue.failJob(
      job.id,
      error instanceof Error ? error.message : String(error)
    );
    console.error(`Job ${job.id} of type ${job.type} failed:`, error);
  }
}

export async function processJobs(limit = 10): Promise<number> {
  // Get jobs that are ready to be processed
  const jobs = await jobQueue.getReadyJobs(limit);

  if (jobs.length === 0) return 0;

  // Process each job
  await Promise.all(jobs.map(processJob));

  return jobs.length;
}

// Start the worker to process jobs
export async function startDevWorker(intervalMs: number): Promise<void> {
  async function workerLoop() {
    try {
      await processJobs();
    } catch (error) {
      console.error("Error in worker loop:", JSON.stringify(error));
    } finally {
      setTimeout(workerLoop, intervalMs);
    }
  }

  // Initial kick-off
  workerLoop();
}

export interface Job<T = any> {
  id: string;
  type: string;
  payload: T;
  scheduledFor: number; // Unix timestamp in ms
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import redis from "./redis";
import { v4 as uuidv4 } from "uuid";

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

export class JobQueue {
  private readonly jobsKey = "delayed-jobs";
  private readonly jobPrefix = "job:";

  // Add a new job to the queue
  async addJob<T>(type: string, payload: T, delayMs = 0): Promise<Job<T>> {
    const id = uuidv4();
    const now = Date.now();
    const scheduledFor = now + delayMs;

    const job: Job<T> = {
      id,
      type,
      payload,
      scheduledFor,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    // Store the job details
    await redis.set(`${this.jobPrefix}${id}`, JSON.stringify(job));

    // Add job ID to the sorted set with score as execution time
    await redis.zadd(this.jobsKey, { score: scheduledFor, member: id });

    return job;
  }

  // Get jobs that are ready to be processed
  async getReadyJobs(limit = 10): Promise<Job[]> {
    const now = Date.now();

    // Get job IDs that are scheduled for execution (score <= now)
    console.log(`Fetching jobs ready for processing (limit: ${limit})`);
    const jobIds = await redis.zrangebyscore(this.jobsKey, 0, now, {
      limit: { offset: 0, count: limit },
    });

    if (!jobIds.length) return [];

    // Get job details for each ID
    const jobPromises = jobIds.map(async (id) => {
      const jobData = await redis.get(`${this.jobPrefix}${id}`);
      return jobData ? JSON.parse(jobData) : null;
    });

    const jobs = await Promise.all(jobPromises);
    return jobs.filter(Boolean) as Job[];
  }

  // Mark a job as processing
  async markJobAsProcessing(jobId: string): Promise<boolean> {
    const jobKey = `${this.jobPrefix}${jobId}`;
    const jobData = await redis.get(jobKey);

    if (!jobData) return false;

    const job = JSON.parse(jobData) as Job;

    // Only mark as processing if it's still pending
    if (job.status !== "pending") return false;

    job.status = "processing";
    job.updatedAt = Date.now();

    await redis.set(jobKey, JSON.stringify(job));
    return true;
  }

  // Complete a job
  async completeJob(jobId: string, result?: any): Promise<void> {
    const jobKey = `${this.jobPrefix}${jobId}`;
    const jobData = await redis.get(jobKey);

    if (!jobData) return;

    const job = JSON.parse(jobData) as Job;

    job.status = "completed";
    job.result = result;
    job.updatedAt = Date.now();

    await redis.set(jobKey, JSON.stringify(job));
    await redis.zrem(this.jobsKey, jobId);
  }

  // Mark a job as failed
  async failJob(jobId: string, error: string): Promise<void> {
    const jobKey = `${this.jobPrefix}${jobId}`;
    const jobData = await redis.get(jobKey);

    if (!jobData) return;

    const job = JSON.parse(jobData) as Job;

    job.status = "failed";
    job.error = error;
    job.updatedAt = Date.now();

    await redis.set(jobKey, JSON.stringify(job));
    await redis.zrem(this.jobsKey, jobId);
  }

  // Get a job by ID
  async getJob(jobId: string): Promise<Job | null> {
    const jobData = await redis.get(`${this.jobPrefix}${jobId}`);
    return jobData ? JSON.parse(jobData) : null;
  }

  // Clean up old completed or failed jobs
  async cleanupOldJobs(olderThanMs = 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now();
    const cutoff = now - olderThanMs;

    // Get all job IDs
    const allJobKeys = await redis.keys(`${this.jobPrefix}*`);
    let cleanedCount = 0;

    for (const key of allJobKeys) {
      const jobData = await redis.get(key);
      if (!jobData) continue;

      const job = JSON.parse(jobData) as Job;

      // If job is completed or failed and older than cutoff, delete it
      if (
        (job.status === "completed" || job.status === "failed") &&
        job.updatedAt < cutoff
      ) {
        await redis.del(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

export const jobQueue = new JobQueue();

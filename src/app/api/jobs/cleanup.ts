import { NextResponse } from "next/server";
import { jobQueue } from "~/server/jobs/job-queue";

// This should match the cron job interval in vercel.json
const JOB_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// This endpoint will be called by Vercel Cron to clean up old jobs
export async function GET() {
  try {
    // Clean up jobs older than 24 hours
    const cleanedCount = await jobQueue.cleanupOldJobs(JOB_CLEANUP_INTERVAL);

    return NextResponse.json({
      success: true,
      cleanedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

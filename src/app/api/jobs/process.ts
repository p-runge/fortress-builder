import { NextResponse } from "next/server";
import { processJobs } from "~/server/jobs/dev-worker";

const JOB_PROCESSING_BATCH_SIZE = 25;

// This endpoint will be called by Vercel Cron
export async function GET() {
  try {
    // Process up to 25 jobs in a single invocation
    const processedCount = await processJobs(JOB_PROCESSING_BATCH_SIZE);

    return NextResponse.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

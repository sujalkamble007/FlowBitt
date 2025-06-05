import { NextResponse } from "next/server"
import { addCronJob, removeCronJob, listCronJobs, reloadCronJobs } from "@/lib/cron"
// @ts-ignore
import { v4 as uuidv4 } from "uuid"

// Helper to trigger a workflow (manual/cron)
import { triggerLangflowWorkflow } from "../trigger/route"

// POST /api/cron - Add a new cron job
export async function POST(request: Request) {
  try {
    const { workflowId, engine, schedule, inputPayload } = await request.json()
    if (!workflowId || !engine || !schedule) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const id = uuidv4()
    const job = { id, workflowId, engine, schedule, inputPayload }
    addCronJob(job, async (jobConfig) => {
      await triggerLangflowWorkflow(jobConfig.workflowId, jobConfig.inputPayload)
    })
    return NextResponse.json({ success: true, job })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add cron job" }, { status: 500 })
  }
}

// GET /api/cron - List all cron jobs
export async function GET() {
  try {
    const jobs = listCronJobs()
    return NextResponse.json({ jobs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to list cron jobs" }, { status: 500 })
  }
}

// DELETE /api/cron - Remove a cron job by id
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "Missing job id" }, { status: 400 })
    removeCronJob(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove cron job" }, { status: 500 })
  }
}

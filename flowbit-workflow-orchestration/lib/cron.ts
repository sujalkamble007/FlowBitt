// @ts-ignore
import cron from "node-cron"
import fs from "fs"
import path from "path"

const CRON_JOBS_FILE = path.join(process.cwd(), "lib", "cron-jobs.json")

interface CronJobConfig {
  id: string
  workflowId: string
  engine: string
  schedule: string
  inputPayload: any
}

let scheduledJobs: Record<string, cron.ScheduledTask> = {}

function loadCronJobs(): CronJobConfig[] {
  if (!fs.existsSync(CRON_JOBS_FILE)) return []
  const data = fs.readFileSync(CRON_JOBS_FILE, "utf-8")
  return JSON.parse(data)
}

function saveCronJobs(jobs: CronJobConfig[]) {
  fs.writeFileSync(CRON_JOBS_FILE, JSON.stringify(jobs, null, 2))
}

export function scheduleCronJob(job: CronJobConfig, trigger: (job: CronJobConfig) => void) {
  if (scheduledJobs[job.id]) {
    scheduledJobs[job.id].stop()
  }
  const task = cron.schedule(job.schedule, () => trigger(job))
  scheduledJobs[job.id] = task
}

export function unscheduleCronJob(jobId: string) {
  if (scheduledJobs[jobId]) {
    scheduledJobs[jobId].stop()
    delete scheduledJobs[jobId]
  }
}

export function reloadCronJobs(trigger: (job: CronJobConfig) => void) {
  const jobs = loadCronJobs()
  jobs.forEach(job => scheduleCronJob(job, trigger))
}

export function addCronJob(job: CronJobConfig, trigger: (job: CronJobConfig) => void) {
  const jobs = loadCronJobs()
  jobs.push(job)
  saveCronJobs(jobs)
  scheduleCronJob(job, trigger)
}

export function removeCronJob(jobId: string) {
  const jobs = loadCronJobs().filter(j => j.id !== jobId)
  saveCronJobs(jobs)
  unscheduleCronJob(jobId)
}

export function listCronJobs(): CronJobConfig[] {
  return loadCronJobs()
}

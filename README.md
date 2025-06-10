# FlowBit Workflow Orchestration Platform

## Overview
FlowBit is a workflow orchestration platform that integrates with LangFlow and n8n, allowing you to trigger, monitor, and manage workflow executions from a unified UI. This project supports manual, cron, and webhook triggers, and provides a dashboard to view execution history and details.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Running the Platform](#running-the-platform)
- [Key Functionality](#key-functionality)
  - [1. Workflow Discovery](#1-workflow-discovery)
  - [2. Manual Trigger](#2-manual-trigger)
  - [3. Cron Trigger](#3-cron-trigger)
  - [4. Webhook Trigger](#4-webhook-trigger)
  - [5. Executions Dashboard](#5-executions-dashboard)
  - [6. Execution Details](#6-execution-details)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Features
- Discover available workflows (LangFlow flows and n8n workflows)
- Trigger workflows manually, via cron, or via webhook
- View and filter execution history
- Inspect execution details, logs, and outputs
- Real-time updates and error handling

---

## Architecture
- **Frontend:** Next.js React app (`flowbit-workflow-orchestration/`)
- **Backend:** LangFlow (Python, API), n8n (optional)
- **API Layer:** Next.js API routes for orchestration, trigger, and execution management
- **Persistence:** Flows are stored as JSON files in `backend/flows/`

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- Python 3.8+
- Docker Desktop (for n8n, optional)

### 2. Backend Setup (LangFlow)
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install langflow
langflow run --host 0.0.0.0 --port 7861
```

### 3. Frontend Setup
```sh
cd flowbit-workflow-orchestration
cp .env.local.example .env.local # Edit with your LangFlow/n8n URLs and API keys
pnpm install # or npm install
pnpm dev # or npm run dev
```

### 4. (Optional) n8n Setup
- Install Docker Desktop
- Start n8n:
```sh
docker compose up
```

---

## Key Functionality

### 1. Workflow Discovery
- Flows are stored as JSON files in `backend/flows/`.
- The API (`/api/flows`) lists all available flows by reading this directory.
- The UI displays these flows for selection and triggering.

### 2. Manual Trigger
- Trigger a workflow from the UI by providing a JSON input payload.
- The frontend sends a POST to `/api/trigger`.
- The backend forwards the request to LangFlow (`/api/v1/build/{flowId}/flow`) or n8n.
- On success, the UI shows a toast and refreshes the executions dashboard.

### 3. Cron Trigger
- Schedule workflows to run on a cron schedule.
- The frontend sends a POST to `/api/cron` with the schedule and input payload.
- The backend manages cron jobs and triggers workflows at the specified times.

### 4. Webhook Trigger
- Each workflow exposes a webhook endpoint at `/api/hooks/{workflowId}`.
- Send a POST request with a JSON payload to trigger the workflow.
- The backend forwards the request to LangFlow or n8n.

### 5. Executions Dashboard
- The dashboard fetches execution history from `/api/executions`.
- Displays status, workflow name, engine, trigger type, duration, and start time.
- Supports filtering by workflow, engine, status, and folder.

### 6. Execution Details
- Click on an execution to view detailed logs, node outputs, and error messages.
- Data is fetched from `/api/executions/{id}`.
- Real-time logs are streamed for running executions.

---

## API Endpoints
- `GET /api/flows` — List available workflows
- `POST /api/trigger` — Trigger a workflow manually
- `POST /api/cron` — Schedule a workflow with a cron expression
- `POST /api/hooks/{workflowId}` — Trigger a workflow via webhook
- `GET /api/executions` — List all executions
- `GET /api/executions/{id}` — Get execution details

---

## Environment Variables
Set these in your `.env.local` file in `flowbit-workflow-orchestration/`:

```
LANGFLOW_BASE_URL=http://localhost:7861
LANGFLOW_API_KEY=your_langflow_api_key # (if required)
N8N_BASE_URL=http://localhost:5678 # (if using n8n)
N8N_API_KEY=your_n8n_api_key # (if using n8n)
```

---

## Troubleshooting
- **Mock Data Warning:** If you see a warning about mock data, check your environment variables and ensure LangFlow/n8n are running and accessible.
- **LangFlow API returns HTML:** Make sure LangFlow is started with `langflow run --host 0.0.0.0 --port 7861`.
- **Workflow not triggering:** Check backend logs and verify the correct flow ID is used.
- **Docker Compose issues:** Use `docker compose up` (with a space) for newer Docker versions.

---

## Project Structure
- `backend/flows/` — JSON files for each LangFlow workflow
- `flowbit-workflow-orchestration/app/api/` — API routes for orchestration
- `flowbit-workflow-orchestration/components/` — UI components

---

## Example: Trigger Workflow via API (Postman/curl)

**POST** `http://localhost:3000/api/trigger`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "workflowId": "YOUR_LANGFLOW_FLOW_ID",
  "engine": "langflow",
  "triggerType": "manual",
  "inputPayload": {
    "input_value": "There is a problem with my previous order, please look into it."
  }
}
```

---

## Credits
- Built with Next.js, LangFlow, n8n, and Docker.
- See individual files for more details on each functionality.

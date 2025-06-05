import { NextResponse } from "next/server"

// GET /langflow/runs - Return last 50 runs (status, duration, flow name)
export async function GET() {
  try {
    const langflowBaseUrl = process.env.LANGFLOW_BASE_URL || "http://localhost:7860"
    const response = await fetch(`${langflowBaseUrl}/api/v1/runs?limit=50`)
    if (!response.ok) {
      throw new Error(`LangFlow API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    // Optionally map/format data here
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch runs" }, { status: 500 })
  }
}

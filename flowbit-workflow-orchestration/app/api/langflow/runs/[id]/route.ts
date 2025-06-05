import { NextResponse } from "next/server"

// GET /langflow/runs/:id - Return full output, node details, logs
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const langflowBaseUrl = process.env.LANGFLOW_BASE_URL || "http://localhost:7860"
    const response = await fetch(`${langflowBaseUrl}/api/v1/runs/${params.id}`)
    if (!response.ok) {
      throw new Error(`LangFlow API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch run details" }, { status: 500 })
  }
}

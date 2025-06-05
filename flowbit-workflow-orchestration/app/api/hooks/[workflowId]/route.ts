import { NextResponse } from "next/server"

// Public webhook that forwards input to LangFlow run
export async function GET() {
  return NextResponse.json({ error: "Use POST to trigger the workflow." }, { status: 405 })
}

export async function POST(request: Request, { params }: { params: { workflowId: string } }) {
  try {
    const inputPayload = await request.json()
    const langflowBaseUrl = process.env.LANGFLOW_BASE_URL || "http://localhost:7860"
    const url = `${langflowBaseUrl}/api/v1/run/${params.workflowId}`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputPayload),
    })
    if (!response.ok) {
      throw new Error(`LangFlow API error: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to trigger workflow" }, { status: 500 })
  }
}

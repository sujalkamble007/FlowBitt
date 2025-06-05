import { NextResponse } from "next/server"

// GET /langflow/runs/:id/stream - SSE stream while run is active
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const langflowBaseUrl = process.env.LANGFLOW_BASE_URL || "http://localhost:7860"
  const url = `${langflowBaseUrl}/api/v1/runs/${params.id}/stream`
  // Proxy the SSE stream from LangFlow
  const response = await fetch(url)
  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

import { useEffect, useState } from "react"

export function useSSELogs(runId: string | null) {
  const [logs, setLogs] = useState<string[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!runId) return

    const eventSource = new EventSource(`/api/langflow/runs/${runId}/stream`)
    setConnected(true)

    eventSource.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data])
    }

    eventSource.onerror = () => {
      setConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [runId])

  return { logs, connected }
}

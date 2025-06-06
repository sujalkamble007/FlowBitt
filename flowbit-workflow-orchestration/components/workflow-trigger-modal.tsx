"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface WorkflowTriggerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
  engine: string
  onTriggered?: () => void
}

export function WorkflowTriggerModal({ open, onOpenChange, workflowId, engine, onTriggered }: WorkflowTriggerModalProps) {
  const [tab, setTab] = useState("manual")
  // Suggest a default input for LangFlow TextInput flows
  function getDefaultInput() {
    // If the engine is langflow, suggest the input_value field
    if (engine === "langflow") {
      return '{"input_value": "There is a problem with my previous order, please look into it."}'
    }
    return "{}"
  }

  const [manualInput, setManualInput] = useState(getDefaultInput())
  const [cronInput, setCronInput] = useState(getDefaultInput())
  const [cronSchedule, setCronSchedule] = useState("* * * * *")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { toast } = useToast()

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/hooks/${workflowId}` : ""

  // Validate JSON input for manual and cron
  function validateJsonInput(input: string) {
    try {
      const parsed = JSON.parse(input)
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return false
      return Object.keys(parsed).length > 0
    } catch {
      return false
    }
  }

  // Validate cron string (very basic, just 5 space-separated fields)
  function validateCron(cron: string) {
    return /^([*\d\/,\-]+\s+){4}[*\d\/,\-]+$/.test(cron.trim())
  }

  const handleManualTrigger = async () => {
    setLoading(true)
    setErrorMsg(null)
    if (!validateJsonInput(manualInput)) {
      setErrorMsg("Input Payload must be valid non-empty JSON object.")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          engine,
          triggerType: "manual",
          inputPayload: JSON.parse(manualInput),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Triggered!", description: "Workflow triggered successfully." })
        onOpenChange(false)
        if (onTriggered) onTriggered()
      } else {
        setErrorMsg(data.error || JSON.stringify(data) || "Failed to trigger workflow.")
        toast({ title: "Error", description: data.error || JSON.stringify(data) || "Failed to trigger workflow." })
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Invalid input or network error.")
      toast({ title: "Error", description: e?.message || "Invalid input or network error." })
    } finally {
      setLoading(false)
    }
  }

  const handleCronTrigger = async () => {
    setLoading(true)
    setErrorMsg(null)
    if (!validateCron(cronSchedule)) {
      setErrorMsg("Invalid cron schedule. Use 5 space-separated fields (e.g. '* * * * *').")
      setLoading(false)
      return
    }
    if (!validateJsonInput(cronInput)) {
      setErrorMsg("Input Payload must be valid non-empty JSON object.")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          engine,
          schedule: cronSchedule,
          inputPayload: JSON.parse(cronInput),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Scheduled!", description: "Cron job scheduled successfully." })
        onOpenChange(false)
        if (onTriggered) onTriggered()
      } else {
        setErrorMsg(data.error || JSON.stringify(data) || "Failed to schedule cron job.")
        toast({ title: "Error", description: data.error || JSON.stringify(data) || "Failed to schedule cron job." })
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Invalid input or network error.")
      toast({ title: "Error", description: e?.message || "Invalid input or network error." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trigger Workflow</DialogTitle>
          <DialogDescription>
            Choose how you want to trigger this workflow.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="cron">Cron</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Input Payload (JSON)</label>
              <Textarea
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                rows={4}
                placeholder='{"key": "value"}'
              />
              <Button onClick={handleManualTrigger} disabled={loading} className="w-full mt-2">
                Trigger Now
              </Button>
              {errorMsg && tab === "manual" && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  <strong>Error:</strong> {errorMsg}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="webhook">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Webhook URL</label>
              <Input value={webhookUrl} readOnly onFocus={e => e.target.select()} />
              <div className="text-xs text-gray-500">
                Send a POST request to this URL to trigger the workflow.<br />
                <b>Example:</b>
                <pre className="bg-gray-50 p-2 rounded text-xs mt-2">{'{"input_value": "test webhook"}'}</pre>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="cron">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Cron Schedule</label>
              <Input
                value={cronSchedule}
                onChange={e => setCronSchedule(e.target.value)}
                placeholder="* * * * *"
              />
              <label className="block text-sm font-medium">Input Payload (JSON)</label>
              <Textarea
                value={cronInput}
                onChange={e => setCronInput(e.target.value)}
                rows={4}
                placeholder='{"key": "value"}'
              />
              <Button onClick={handleCronTrigger} disabled={loading} className="w-full mt-2">
                Schedule Cron
              </Button>
              {errorMsg && tab === "cron" && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  <strong>Error:</strong> {errorMsg}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

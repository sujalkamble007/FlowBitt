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
}

export function WorkflowTriggerModal({ open, onOpenChange, workflowId, engine }: WorkflowTriggerModalProps) {
  const [tab, setTab] = useState("manual")
  const [manualInput, setManualInput] = useState("{}")
  const [cronInput, setCronInput] = useState("{}")
  const [cronSchedule, setCronSchedule] = useState("* * * * *")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/hooks/${workflowId}` : ""

  const handleManualTrigger = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          engine,
          triggerType: "manual",
          inputPayload: JSON.parse(manualInput || "{}"),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Triggered!", description: "Workflow triggered successfully." })
        onOpenChange(false)
      } else {
        toast({ title: "Error", description: data.error || JSON.stringify(data) || "Failed to trigger workflow." })
      }
    } catch (e) {
      toast({ title: "Error", description: "Invalid input or network error." })
    } finally {
      setLoading(false)
    }
  }

  const handleCronTrigger = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          engine,
          schedule: cronSchedule,
          inputPayload: JSON.parse(cronInput || "{}"),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Scheduled!", description: "Cron job scheduled successfully." })
        onOpenChange(false)
      } else {
        toast({ title: "Error", description: data.error || JSON.stringify(data) || "Failed to schedule cron job." })
      }
    } catch (e) {
      toast({ title: "Error", description: "Invalid input or network error." })
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
            </div>
          </TabsContent>
          <TabsContent value="webhook">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Webhook URL</label>
              <Input value={webhookUrl} readOnly onFocus={e => e.target.select()} />
              <div className="text-xs text-gray-500">
                Send a POST request to this URL to trigger the workflow.
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
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { ExecutionsDashboard } from "@/components/executions-dashboard"
import { CreateWorkflowModal } from "@/components/create-workflow-modal"
import { FolderManagementModal } from "@/components/folder-management-modal"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WorkflowTriggerModal } from "@/components/workflow-trigger-modal"

// Define folder type
export interface Folder {
  id: string
  name: string
  workflowCount: number
  isDefault: boolean
}

// Initial folders data
const initialFolders: Folder[] = [
  { id: "unassigned", name: "Unassigned", workflowCount: 2, isDefault: true },
  { id: "marketing", name: "Marketing Automation", workflowCount: 2, isDefault: false },
  { id: "data-processing", name: "Data Processing", workflowCount: 2, isDefault: false },
]

export function OrchestrationDashboard() {
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false)
  const [folderManagementOpen, setFolderManagementOpen] = useState(false)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>(initialFolders)
  const [flows, setFlows] = useState<any[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null)
  const [triggerModalOpen, setTriggerModalOpen] = useState(false)

  // Fetch flows on mount
  useEffect(() => {
    fetch("/api/flows")
      .then((res) => res.json())
      .then((data) => setFlows(data.flows || []))
  }, [])

  // Update selectedWorkflow when selectedWorkflowId changes
  useEffect(() => {
    if (!selectedWorkflowId) {
      setSelectedWorkflow(null)
      return
    }
    const found = flows.find((f) => f.uuid === selectedWorkflowId)
    setSelectedWorkflow(found || null)
  }, [selectedWorkflowId, flows])

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar
          selectedWorkflowId={selectedWorkflowId}
          onWorkflowSelect={setSelectedWorkflowId}
          onManageFolders={() => setFolderManagementOpen(true)}
        />
        <div className="flex-1 flex flex-col">
          <DashboardHeader onCreateWorkflow={() => setCreateWorkflowOpen(true)} />
          <main className="flex-1 p-6">
            {selectedWorkflow ? (
              <div className="mb-6">
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedWorkflow.name}
                      <Badge variant="outline">{selectedWorkflow.uuid?.slice(0, 8)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Workflow ID: <span className="font-mono text-xs">{selectedWorkflow.uuid}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Button onClick={() => setTriggerModalOpen(true)} className="bg-[#7575e4] text-white">
                        Trigger Workflow
                      </Button>
                      <Badge variant="secondary">Engine: LangFlow</Badge>
                    </div>
                  </CardContent>
                </Card>
                <WorkflowTriggerModal
                  open={triggerModalOpen}
                  onOpenChange={setTriggerModalOpen}
                  workflowId={selectedWorkflow.uuid}
                  engine="langflow"
                />
              </div>
            ) : (
              <div className="mb-6 text-gray-500 text-center">Select a workflow to view details and trigger it.</div>
            )}
            <ExecutionsDashboard selectedWorkflowId={selectedWorkflowId} />
          </main>
        </div>
      </div>

      <CreateWorkflowModal open={createWorkflowOpen} onOpenChange={setCreateWorkflowOpen} folders={folders} />
      <FolderManagementModal
        open={folderManagementOpen}
        onOpenChange={setFolderManagementOpen}
        folders={folders}
        setFolders={setFolders}
      />
    </SidebarProvider>
  )
}

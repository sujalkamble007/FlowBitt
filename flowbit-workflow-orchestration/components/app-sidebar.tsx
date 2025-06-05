"use client"

import { useState, useEffect } from "react"
import { Settings, Workflow } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Update the props interface to accept folders
interface AppSidebarProps {
  selectedWorkflowId: string | null
  onWorkflowSelect: (workflowId: string | null) => void
  onManageFolders?: () => void // optional for now
}

interface Flow {
  id: string // filename-based id
  name: string
  fileName: string
  uuid: string | null
}

export function AppSidebar({ selectedWorkflowId, onWorkflowSelect, onManageFolders }: AppSidebarProps) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFlows() {
      setLoading(true)
      try {
        const res = await fetch("/api/flows")
        const data = await res.json()
        setFlows(data.flows || [])
      } catch (e) {
        setFlows([])
      } finally {
        setLoading(false)
      }
    }
    fetchFlows()
  }, [])

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7575e4] rounded-lg flex items-center justify-center">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">FlowBit</h1>
            <p className="text-xs text-gray-500">Orchestration</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Workflows</span>
            {onManageFolders && (
              <Button variant="ghost" size="sm" onClick={onManageFolders} className="h-6 w-6 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton className="w-full justify-start" disabled>
                    Loading...
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : flows.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton className="w-full justify-start" disabled>
                    No agents found
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                flows.map((flow) => (
                  <SidebarMenuItem key={flow.id}>
                    <SidebarMenuButton
                      onClick={() => onWorkflowSelect(flow.uuid)}
                      isActive={selectedWorkflowId === flow.uuid}
                      className="w-full justify-start"
                    >
                      <Workflow className="w-4 h-4" />
                      <span>{flow.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">FlowBit Orchestration v1.1</div>
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import { CreateWorkspaceCard } from "@/app/welcome/CreateWorkspaceCard"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { workspaceType } from "@/lib/types"
import { Loader2, Plus, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function WorkspaceContents(props: { workspaces: workspaceType[], currentWorkspace: workspaceType}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(props.currentWorkspace.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    props.workspaces.forEach(workspace => {
      router.prefetch(`/w/${workspace.id}`);
    });
  }, [props.workspaces, router]);

  const handleWorkspaceChange = (workspaceId: string) => {
    if (workspaceId === activeWorkspaceId) return;
    
    setIsNavigating(true);
    setActiveWorkspaceId(workspaceId);
    
    router.push(`/w/${workspaceId}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="font-semibold text-lg">yep-done: {props.currentWorkspace.name}</div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} disabled={isNavigating}>
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Open"
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {props.workspaces.map((workspace) => (
                <DropdownMenuItem 
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  disabled={isNavigating}
                >
                  {workspace.name}
                  {isNavigating && activeWorkspaceId === workspace.id && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>

          </DropdownMenu>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="User profile">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Your workspace content goes here */}
        <CreateWorkspaceCard />
      </div>
    </div>
  )
}
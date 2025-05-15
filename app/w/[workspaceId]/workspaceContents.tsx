"use client"

import { CreateWorkspaceCard } from "@/app/welcome/CreateWorkspaceCard"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createWorkspaceAction } from "@/lib/actions"
import { workspaceType } from "@/lib/types"
import { Loader2, Plus, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { z } from "zod"

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

export function WorkspaceContents(props: { workspaces: workspaceType[], currentWorkspace: workspaceType}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(props.currentWorkspace.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
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

  const handleCreateWorkspace = async () => {
      setIsLoading(true);
      setError("");
      try {
        const validation = workspaceNameSchema.safeParse({ name: workspaceName });
        if (!validation.success) {
          setError(validation.error.format().name?._errors[0] || "Invalid workspace name");
          console.log(validation.error.format().name?._errors[0]);
          return;
        }
        const response = await createWorkspaceAction(workspaceName);
        if(response.success) {
          console.log("Workspace created successfully:", response.workspaceId);
          setWorkspaceName("");
          router.push(`/w/${response.workspaceId}`);
          setIsDialogOpen(false);
          
        }else {
          console.log(response.error)
        }
        
      }catch(err) {
        console.error("Error creating workspace:", err);
        setError("Failed to create workspace. Please try again.");
      }finally {
        setIsLoading(false);
      }
    }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="font-semibold text-lg">yep-done: {props.currentWorkspace.name}</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} disabled={isNavigating}>
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  props.currentWorkspace.name
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
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new workspace</DialogTitle>
              <Input placeholder="Name of your new workspace" onChange={(e) => setWorkspaceName(e.target.value)} />
              <Button onClick={handleCreateWorkspace}>Create</Button>
            </DialogHeader>
          </DialogContent>
          </Dialog>
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
        {/* <CreateWorkspaceCard /> */}
      </div>
    </div>
  )
}
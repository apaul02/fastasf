"use client"

import { NewTodoButton } from "@/components/newTodoButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createWorkspaceAction, deleteWorkspaceAction } from "@/lib/actions"
import { TodosType, workspaceType } from "@/lib/types"
import { Loader2, Plus, Trash2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { z } from "zod"
import { TodoCard } from "./todo-card"
import { add, endOfDay, isBefore, isToday, parse } from "date-fns"
import { authClient } from "@/lib/auth-client"

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function WorkspaceContents(props: { workspaces: workspaceType[], currentWorkspace: workspaceType, todos: TodosType[]}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(props.currentWorkspace.id);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string>("");
  
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
          setIsNewWorkspaceDialogOpen(false);
          
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

    const categorizeTodos = useMemo(() => {
      const today = getStartOfDay(new Date());
      const nextSevenDays = endOfDay(add(today, { days: 7 }));

      const overdueTodayNoDateTodos: TodosType[] = [];
      const nextSevenDaysTodos: TodosType[] = [];
      const upcomingTodos: TodosType[] = [];
      const completedTodos: TodosType[] = [];

      props.todos.forEach(todo => {
        if(todo.completed) {
          completedTodos.push(todo);
          return;
        }

        if(!todo.dueDate) {
          overdueTodayNoDateTodos.push(todo);
          return;
        }

        const parsedDate = parse(todo.dueDate,"yyyy-MM-dd'T'HH:mm:ss", new Date())

        if(isBefore(parsedDate, today)) {
          overdueTodayNoDateTodos.push(todo);
        } else if(isToday(parsedDate)) {
          overdueTodayNoDateTodos.push(todo);
        }
        else if(isBefore(parsedDate, nextSevenDays)) {
          nextSevenDaysTodos.push(todo);
        }else {
          upcomingTodos.push(todo);
        }
      })
      return {
        overdueTodayNoDateTodos,
        nextSevenDaysTodos,
        upcomingTodos,
        completedTodos
      }

    }, [props.todos]);

    const handleDeleteWorkspace = async (workspaceId: string) => {
      if (workspaceId === props.workspaces[0].id) {
        console.error("Cannot delete personal workspace");
        setIsDeleteDialogOpen(false);
        return;
      }
      
      try {
        const response = await deleteWorkspaceAction(workspaceId);
        if(response.success) {
          console.log("Workspace deleted successfully:", response.workspaceId);
          if (response.workspaceId === props.currentWorkspace.id) {
            router.push(`/w/${props.workspaces[0].id}`);
          }
          router.refresh();
        }else {
          console.log(response.error)
        }
      }catch(err) {
        console.error("Error deleting workspace:", err);
      }finally {
        setIsDeleteDialogOpen(false);
      }
    }  
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="font-semibold text-lg">yep-done: {props.currentWorkspace.name}</div>
        <div>
          <Dialog open={isNewWorkspaceDialogOpen} onOpenChange={setIsNewWorkspaceDialogOpen}>
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
                <div key={workspace.id} className="flex justify-between ">
                  
                  <DropdownMenuItem 
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    disabled={isNavigating}
                    className="w-full"
                  >
                    {workspace.name}
                    {isNavigating && activeWorkspaceId === workspace.id && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </DropdownMenuItem>
                  {props.workspaces.indexOf(workspace) !== 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setWorkspaceToDelete(workspace.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="" />
                    </Button>
                  )}
                </div>
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
        
        {/* Separate Dialog for workspace deletion */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setWorkspaceToDelete("");
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              {workspaceToDelete === props.workspaces[0]?.id ? (
                <p className="text-red-500 font-medium">Cannot delete personal workspace</p>
              ) : (
                <p>This action cannot be undone.</p>
              )}
            </DialogHeader>
            <div className="flex justify-end">
              <Button 
                variant={"destructive"} 
                onClick={() => {
                  if (workspaceToDelete && workspaceToDelete !== props.workspaces[0]?.id) {
                    handleDeleteWorkspace(workspaceToDelete);
                  }
                }}
                disabled={workspaceToDelete === props.workspaces[0]?.id}
              >
                Delete
              </Button>
              <Button variant={"outline"} onClick={() => setIsDeleteDialogOpen(false)} className="ml-2">
                Cancel
              </Button>  
            </div>
          </DialogContent>
        </Dialog>
        <div>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="User profile">
            <User className="h-5 w-5" />
          </Button>
          <Button onClick={() => {authClient.signOut({
            fetchOptions: {
              onSuccess: () => router.push("/"),
            }
          })}}>Signout</Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <NewTodoButton workspaceId={props.currentWorkspace.id} />
        <div>
          <h2 className="text-xl font-semibold mt-4">Overdue Todos / No Date / Today</h2>
          {categorizeTodos.overdueTodayNoDateTodos.length > 0 ? (
            <TodoCard todos={categorizeTodos.overdueTodayNoDateTodos} />
          ) : (
            <div className="text-gray-500">No overdue todos</div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mt-4">Next 7 Days</h2>
          {categorizeTodos.nextSevenDaysTodos.length > 0 ? (
            <TodoCard todos={categorizeTodos.nextSevenDaysTodos} />
          ) : (
            <div className="text-gray-500">No todos due in the next 7 days</div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mt-4">Upcoming Todos</h2>
          {categorizeTodos.upcomingTodos.length > 0 ? (
            <TodoCard todos={categorizeTodos.upcomingTodos} />
          ) : (
            <div className="text-gray-500">No upcoming todos</div>
          )}
        </div>
      </div>
    </div>
  )
}
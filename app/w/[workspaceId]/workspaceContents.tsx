"use client"

import { NewTodoButton } from "@/components/newTodoButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createWorkspaceAction, deleteWorkspaceAction, kickFromWorkspaceAction, leaveWorkspaceAction, updateDueDateAction, checkWorkspaceMembershipAction } from "@/lib/actions"
import { commentsType, TodosType, WorkspaceMemberWithDetails, workspaceType } from "@/lib/types"
import { Share2, ArrowRightFromLine, Loader2, Plus, Trash2, User2 } from "lucide-react"
import { notFound, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { add, endOfDay, isBefore, isToday, parse, format } from "date-fns"
import { authClient } from "@/lib/auth-client"
import { TodoCard } from "./newTodoCard"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { ModeToggle } from "@/components/toggle-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Image from "next/image"
import { GenerateInvite } from "@/components/GenerateInvite"
import { AcceptInvite } from "@/components/AcceptInvite"

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function WorkspaceContents(props: { workspaces: workspaceType[], currentWorkspace: workspaceType, todos: TodosType[], comments: commentsType[], image?: string | null, userId: string, workspaceMembers: WorkspaceMemberWithDetails[] }) {
  const router = useRouter();
  
  // All useState hooks must be declared before any conditional logic
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<workspaceType>(props.currentWorkspace);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [optimisticTodos, setOptimisticTodos] = useState<TodosType[]>(props.todos);
  const [isMobile, setIsMobile] = useState(false);
  const [isWorkspceDeleting, setIsWorkspaceDeleting] = useState(false);
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<{ userId: string; name: string }>({ userId: "", name: "" });
  const [isKicking, setIsKicking] = useState(false);

  // Safeguard: If currentWorkspace is undefined, redirect to personal workspace
  useEffect(() => {
    if (!props.currentWorkspace) {
      console.log("Current workspace is undefined, redirecting to personal workspace");
      const personalWorkspace = props.workspaces?.find(ws => ws.name === "Personal") || props.workspaces?.[0];
      if (personalWorkspace?.id) {
        router.push(`/w/${personalWorkspace.id}`);
      } else {
        router.push("/");
      }
      return;
    }
  }, [props.currentWorkspace, props.workspaces, router]);

  // Check if user is still member of current workspace (for auto-redirect when kicked)
  useEffect(() => {
    // Don't run membership checks if currentWorkspace is undefined
    if (!props.currentWorkspace?.id) {
      return;
    }

    let interval: NodeJS.Timeout;
    
    const checkWorkspaceMembership = async () => {
      try {
        const response = await checkWorkspaceMembershipAction(props.currentWorkspace.id);
        
        if (response.success && !response.data.isMember && props.currentWorkspace.name !== "Personal") {
          console.log("User is no longer a member of this workspace, redirecting to personal workspace");
          toast.info("You have been removed from this workspace", {
            description: "Redirecting to your personal workspace",
            duration: 4000,
            dismissible: true,
          });
          
          // Find personal workspace or first workspace
          const personalWorkspace = props.workspaces.find(ws => ws.name === "Personal") || props.workspaces[0];
          if (personalWorkspace?.id) {
            router.push(`/w/${personalWorkspace.id}`);
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error checking workspace membership:", error);
      }
    };

    const startPolling = () => {
      interval = setInterval(checkWorkspaceMembership, 5000);
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    // Start polling when page becomes visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        checkWorkspaceMembership(); // Check immediately when page becomes visible
        startPolling();
      }
    };

    // Listen for kick events and workspace deletion events from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `workspace-kick-${props.currentWorkspace?.id}`) {
        console.log("Kick event detected for this workspace, checking membership");
        checkWorkspaceMembership();
      } else if (e.key === `workspace-delete-${props.currentWorkspace?.id}`) {
        console.log("Workspace deletion event detected, redirecting to personal workspace");
        toast.info("This workspace has been deleted", {
          description: "Redirecting to your personal workspace",
          duration: 4000,
          dismissible: true,
        });
        
        // Find personal workspace or first workspace
        const personalWorkspace = props.workspaces.find(ws => ws.name === "Personal") || props.workspaces[0];
        if (personalWorkspace?.id) {
          router.push(`/w/${personalWorkspace.id}`);
        } else {
          router.push("/");
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Start polling if page is visible
    if (!document.hidden) {
      startPolling();
    }

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [props.currentWorkspace?.id, props.currentWorkspace?.name, props.workspaces, router]);

  // Initial check on component mount
  useEffect(() => {
    // Don't run initial check if currentWorkspace is undefined
    if (!props.currentWorkspace?.id) {
      return;
    }

    const initialCheck = async () => {
      try {
        const response = await checkWorkspaceMembershipAction(props.currentWorkspace.id);
        
        if (response.success && !response.data.isMember && props.currentWorkspace.name !== "Personal") {
          console.log("User is not a member of this workspace on mount, redirecting");
          toast.info("You are not a member of this workspace", {
            description: "Redirecting to your personal workspace",
            duration: 4000,
            dismissible: true,
          });
          
          const personalWorkspace = props.workspaces.find(ws => ws.name === "Personal") || props.workspaces[0];
          if (personalWorkspace?.id) {
            router.push(`/w/${personalWorkspace.id}`);
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error checking initial workspace membership:", error);
      }
    };

    initialCheck();
  }, []); // Only run on mount

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categorizeTodos = useMemo(() => {
    const today = getStartOfDay(new Date());
    const nextSevenDays = endOfDay(add(today, { days: 7 }));

    const overdueTodayNoDateTodos: TodosType[] = [];
    const nextSevenDaysTodos: TodosType[] = [];
    const upcomingTodosList: TodosType[] = [];

    optimisticTodos.forEach(todo => {
      if(todo.completed) {
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
        upcomingTodosList.push(todo);
      }
    })
    return [
      {
        id: "overdueTodayNoDateTodos",
        title: "Overdue / Today",
        todos: overdueTodayNoDateTodos
      },
      {
        id: "nextSevenDaysTodos",
        title: "Next 7 Days",
        todos: nextSevenDaysTodos
      },
      {
        id: "upcomingTodosList",
        title: "Upcoming",
        todos: upcomingTodosList
      }
    ]
  }, [optimisticTodos]);

  // Early return if currentWorkspace is undefined to prevent rendering errors
  if (!props.currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  if(!props.workspaces || Object.keys(props.workspaces).length === 0) {
    notFound();
  }
  

  const handleWorkspaceChange = (workspace: workspaceType) => {
    if (workspace.id ===  activeWorkspace.id) return;
    
    setIsNavigating(true);
    setActiveWorkspace(workspace);
    
    router.push(`/w/${workspace.id}`);
  };


const handleCreateWorkspace = async () => {
      setIsLoading(true);
      try {
        const validation = workspaceNameSchema.safeParse({ name: workspaceName });
        if (!validation.success) {
          toast.error("Invalid workspace name", {
            description: validation.error.format().name?._errors[0] || "Please enter a valid workspace name",
            duration: 3000,
            dismissible: true,
          });
          console.log(validation.error.format().name?._errors[0]);
          return;
        }
        const response = await createWorkspaceAction(workspaceName);
        if(response.success) {
          console.log("Workspace created successfully:", response.data.id);
          setWorkspaceName("");
          router.push(`/w/${response.data.id}`);
          setIsNewWorkspaceDialogOpen(false);
          toast.success("Workspace created successfully", {
            description: "Your workspace has been created.",
            duration: 3000,
            dismissible: true,
          });
          
        }else {
          const errorCode = response.error.code;
          const errorMessage = response.error.message;
          if (errorCode === 'AUTH_ERROR') {
            toast.error("Authentication error", { description: errorMessage });
            router.push("/");
          }
          else if (errorCode === 'VALIDATION_ERROR') {
            toast.error("Invalid Input", { description: errorMessage });
          }
          else if (errorCode === 'DB_ERROR') {
            toast.error("Database error", { description: errorMessage });
          }
          else {
            toast.error("Failed to create workspace", { description: errorMessage });
          }
        }
        
      }catch(err) {
        console.error("Error creating workspace:", err);
        toast.error("Failed to create workspace", {
          description: "An error occurred while creating the workspace. Please try again.",
          duration: 3000,
          dismissible: true,
        });
      }finally {
        setIsLoading(false);
      }
    }

    const handleDeleteWorkspace = async (workspaceId: string) => {
      setIsWorkspaceDeleting(true);
      if (workspaceId === props.workspaces[0].id) {
        console.error("Cannot delete personal workspace");
        setIsDeleteDialogOpen(false);
        return;
      }
      
      try {
        const response = await deleteWorkspaceAction(workspaceId);
        if(response.success) {
          console.log("Workspace deleted successfully:", response.data.id);
          
          // Trigger workspace deletion event for all users in this workspace
          localStorage.setItem(`workspace-delete-${workspaceId}`, Date.now().toString());
          
          // Clean up the localStorage entry after 10 seconds
          setTimeout(() => {
            localStorage.removeItem(`workspace-delete-${workspaceId}`);
          }, 10000);
          
          if (response.data.id === props.currentWorkspace.id) {
            const remainingWorkspaces = props.workspaces.filter(ws => ws.id !== response.data.id);
            const personalWorkspace = remainingWorkspaces.find(ws => ws.name === "Personal") || remainingWorkspaces[0];
            
            if (personalWorkspace?.id) {
              router.push(`/w/${personalWorkspace.id}`);
            } else {
              router.push("/");
            }
          }
          router.refresh();
          toast.success("Workspace deleted successfully", {
            description: "Your workspace has been removed.",
            duration: 3000,
            dismissible: true,
          });
        }else {
          const errorCode = response.error.code;
          const errorMessage = response.error.message;
          if (errorCode === 'AUTH_ERROR') {
            toast.error("Authentication error", { description: errorMessage });
            router.push("/");
          }
          else if (errorCode === 'NOT_FOUND') {
            toast.error("Workspace not found", { description: errorMessage });
          }
          else if (errorCode === 'DB_ERROR') {
            toast.error("Database error", { description: errorMessage });
          }
          else {
            toast.error("Failed to delete workspace", { description: errorMessage });
          }
        }
      }catch(err) {
        console.error("Error deleting workspace:", err);
        toast.error("Failed to delete workspace", {
          description: "An error occurred while deleting the workspace. Please try again.",
          duration: 3000,
          dismissible: true,
        });
      }finally {
        setIsWorkspaceDeleting(false);
        setIsDeleteDialogOpen(false);
        setIsDropdownOpen(false);
      }
    }

    const handleLeaveWorkspace = async (workspaceId: string) =>  {
      setIsDropdownOpen(false)
      console.log("Leaving workspace:", workspaceId);
      try {
        const response = await leaveWorkspaceAction(workspaceId);
        if(response.success) {
          
          console.log("Left workspace successfully:", response.data.id);
          toast.success("left workspace successfully", {
            description: "You have left the workspace.",
            duration: 3000,
            dismissible: true,
          })
          if(workspaceId === props.currentWorkspace.id) {
            router.push(`/w/${props.workspaces[0].id}`);
          }else {
            router.refresh();
          }
        }else {
          console.log(workspaceId)
          const errorCode = response.error.code;
          const errorMessage = response.error.message;
          if (errorCode === 'AUTH_ERROR') {
            toast.error("Authentication error", { description: errorMessage });
            router.push("/");
          }
          else if (errorCode === 'NOT_FOUND') {
            toast.error("Workspace not found", { description: errorMessage });
          }
          else if (errorCode === 'OWNERSHIP_ERROR') {
            toast.error("Ownership error", { description: errorMessage });
          }
          else if (errorCode === 'DB_ERROR') {
            toast.error("Database error", { description: errorMessage });
          }
          else {
            toast.error("Failed to leave workspace", { description: errorMessage });
          }
        }
      }catch(err) {
        console.error("Error leaving workspace:", err);
        toast.error("Failed to leave workspace", {
          description: "An error occurred while leaving the workspace. Please try again.",
          duration: 3000,
          dismissible: true,
        });
      }
    }

    const handleKickFromWorkspace = async (workspaceId: string, userId: string) => {
      setIsKicking(true);
      console.log("Kicking user:", userId, "from workspace:", workspaceId);
      try {
        const response = await kickFromWorkspaceAction(workspaceId, userId);
        if(response.success) {
          console.log("User kicked successfully from workspace:", response.data.id);
          toast.success("User kicked successfully", {
            description: "The user has been removed from the workspace.",
            duration: 3000,
            dismissible: true,
          });
          
          // Trigger immediate membership check for all users in this workspace
          localStorage.setItem(`workspace-kick-${workspaceId}`, Date.now().toString());
          
          // Clean up the localStorage entry after 10 seconds to prevent buildup
          setTimeout(() => {
            localStorage.removeItem(`workspace-kick-${workspaceId}`);
          }, 10000);
          
          router.refresh();
        }else {
          const errorCode = response.error.code;
          const errorMessage = response.error.message;
          if (errorCode === 'AUTH_ERROR') {
            toast.error("Authentication error", { description: errorMessage });
            router.push("/");
          }
          else if (errorCode === 'NOT_FOUND') {
            toast.error("Workspace or user not found", { description: errorMessage });
          }
          else if (errorCode === 'OWNERSHIP_ERROR') {
            toast.error("Ownership error", { description: errorMessage });
          }
          else if (errorCode === 'DB_ERROR') {
            toast.error("Database error", { description: errorMessage });
          }
          else {
            toast.error("Failed to kick user from workspace", { description: errorMessage });
          }
        }
      }catch(err) {
        console.error("Error kicking user from workspace:", err);
        toast.error("Failed to kick user from workspace", {
          description: "An error occurred while removing the user. Please try again.",
          duration: 3000,
          dismissible: true,
        });
      }finally {
        setIsKicking(false);
        setIsKickDialogOpen(false);
        setMemberToKick({ userId: "", name: "" });
      }
    }

    const handleOptimisticTodoCreate = (newTodo: TodosType) => {
      setOptimisticTodos(prev => [...prev, newTodo]);
    }
    const handleOptimisticTodoDelete = (todoId: string) => {
      setOptimisticTodos(prev => prev.filter(todo => todo.id !== todoId));
    }
    const handleMarkTodo = (todo: TodosType) => {
      setOptimisticTodos(prev => prev.map(t => 
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      ));
    }
    const handleCreationSuccess = (realTodo: TodosType, tempId: string) => {
      setOptimisticTodos(prev => 
        prev.map(todo => 
          todo.id === tempId ? realTodo : todo
        )
      );
    };


    const handleDragEnd = async (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const { draggableId, destination } = result;
      const todoId = draggableId;
      const dropZoneId = destination.droppableId;
      
      let newDueDate: string;
      const now = new Date();

      switch (dropZoneId) {
        case "overdueTodayNoDateTodos":
          // Set to current time to ensure it stays in today category
          newDueDate = format(now, "yyyy-MM-dd'T'HH:mm:ss");
          break;
          
        case "nextSevenDaysTodos":
          // Set to 7 days from today at 9 AM
          const sevenDaysLater = add(now, { days: 7 });
          sevenDaysLater.setHours(9, 0, 0, 0);
          newDueDate = format(sevenDaysLater, "yyyy-MM-dd'T'HH:mm:ss");
          break;
          
        case "upcomingTodosList":
          // Set to 8th day from today at 9 AM
          const eightDaysLater = add(now, { days: 8 });
          eightDaysLater.setHours(9, 0, 0, 0);
          newDueDate = format(eightDaysLater, "yyyy-MM-dd'T'HH:mm:ss");
          break;
          
        default:
          console.log("Unknown drop zone:", dropZoneId);
          return;
      }

      // Store original state for rollback
      const originalTodos = optimisticTodos;
      
      // Optimistic update - update UI immediately
      setOptimisticTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, dueDate: newDueDate } : todo
      ));

      try {
        const response = await updateDueDateAction(todoId, newDueDate);
        if (response.success) {
          console.log("Todo due date updated successfully:", response.data.id);
          // No need to refresh since we already updated optimistically
        } else {
          // Revert to original state on error
          setOptimisticTodos(originalTodos);
          console.error("Error updating todo due date:", response.error);
        }
      } catch (error) {
        // Revert to original state on error
        setOptimisticTodos(originalTodos);
        console.error("Error updating todo due date:", error);
      }
    }  
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 z-50 bg-background/95  backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Image src="/Untitled.svg" alt="Logo" width={30} height={30} />
          
          <Dialog open={isNewWorkspaceDialogOpen} onOpenChange={setIsNewWorkspaceDialogOpen}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} disabled={isNavigating}>
                  {isNavigating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Switching...
                    </>
                  ) : (
                    activeWorkspace.name
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[200px]">
                {props.workspaces.map((workspace) => (
                  <div key={workspace.id} className="flex justify-between items-center">
                    
                    <DropdownMenuItem 
                      key={workspace.id}
                      onClick={() => handleWorkspaceChange(workspace)}
                      disabled={isNavigating}
                      className="w-full min-w-[120px] px-3 py-2"
                    >
                      {workspace.name}
                      {isNavigating && activeWorkspace.id === workspace.id && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                    </DropdownMenuItem>
                    {props.workspaces.indexOf(workspace) !== 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        {/* Share Workspace Button - only show for non-personal workspaces and only for owners */}
                        {workspace.name !== "Personal" && workspace.userId === props.userId && (
                          <GenerateInvite workspace={workspace} disabled={isNavigating || isLoading}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-full h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation(); 
                              }}
                              aria-label="Share workspace"
                              title="Share workspace"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </GenerateInvite>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-6 w-6"
                          disabled={workspace.userId !== props.userId}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setWorkspaceToDelete(workspace.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          aria-label="Delete workspace"
                          title="Delete workspace"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleLeaveWorkspace(workspace.id);
                          }}
                          aria-label="Leave workspace"
                          title="Leave workspace"
                        >
                          <ArrowRightFromLine className="h-3 w-3" />
                        </Button>
                      </div>
                      
                    )}
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <DialogTrigger asChild>
                    <DropdownMenuItem 
                      className="px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span className="font-medium">New Workspace</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <AcceptInvite disabled={isNavigating || isLoading}>
                    <DropdownMenuItem 
                      className="px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <User2 className="mr-2 h-4 w-4" />
                      <span className="font-medium">Join Workspace</span>
                    </DropdownMenuItem>
                  </AcceptInvite>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="pd-2">Create a new workspace</DialogTitle>
                <Input placeholder="Name of your new workspace" onChange={(e) => setWorkspaceName(e.target.value)} onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateWorkspace();
                  }
                }} />
                <Button disabled={isLoading} onClick={handleCreateWorkspace}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NewTodoButton workspaceId={props.currentWorkspace.id} onOptimisticCreate={handleOptimisticTodoCreate} onOptimisticTodoDelete={handleOptimisticTodoDelete}
          onCreationSuccess={handleCreationSuccess} />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Workspace Members Dropdown - only show if there are multiple members */}
          {props.workspaceMembers.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <User2 className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">
                    Members ({props.workspaceMembers.length})
                  </span>
                  <span className="md:hidden ml-1 text-xs">
                    {props.workspaceMembers.length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 sm:w-64">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">
                  Workspace Members
                </div>
                {props.workspaceMembers.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image || undefined} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {member.name}
                          {member.userId === props.userId && " (You)"}
                          {member.userId === props.currentWorkspace.userId && " (Owner)"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </div>
                    {/* Only show kick button if current user is owner and member is not the owner */}
                    {props.currentWorkspace.userId === props.userId && 
                     member.userId !== props.userId && 
                     member.userId !== props.currentWorkspace.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setMemberToKick({ userId: member.userId, name: member.name });
                          setIsKickDialogOpen(true);
                        }}
                        title="Remove from workspace"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="User profile">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={props.image || undefined} alt="User Avatar" />
                  <AvatarFallback><User2 /></AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/"),
                }
              })}}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <>
                  {(() => {
                    const workspace = props.workspaces.find(w => w.id === workspaceToDelete);
                    if (workspace && workspace.userId !== props.userId) {
                      return <p className="text-red-500 font-medium">Only the workspace owner can delete this workspace</p>;
                    }
                    return <p>This action cannot be undone.</p>;
                  })()}
                </>
              )}
            </DialogHeader>
            <div className="flex justify-end">
              <Button 
                variant={"destructive"} 
                onClick={() => {
                  if (workspaceToDelete && workspaceToDelete !== props.workspaces[0]?.id) {
                    const workspace = props.workspaces.find(w => w.id === workspaceToDelete);
                    if (workspace && workspace.userId === props.userId) {
                      handleDeleteWorkspace(workspaceToDelete);
                    }
                  }
                }}
                disabled={(() => {
                  if (workspaceToDelete === props.workspaces[0]?.id || isWorkspceDeleting) return true;
                  const workspace = props.workspaces.find(w => w.id === workspaceToDelete);
                  return workspace ? workspace.userId !== props.userId : true;
                })()}
              >
                {isWorkspceDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Workspace"
                )}
              </Button>
              <Button variant={"outline"} onClick={() => setIsDeleteDialogOpen(false)} className="ml-2">
                Cancel
              </Button>  
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog for kicking members */}
        <Dialog open={isKickDialogOpen} onOpenChange={(open) => {
          setIsKickDialogOpen(open);
          if (!open) setMemberToKick({ userId: "", name: "" });
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Member</DialogTitle>
              <p>Are you sure you want to remove <span className="font-semibold">{memberToKick.name}</span> from this workspace?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone. They will lose access to all todos and will need to be re-invited to join again.</p>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsKickDialogOpen(false)} disabled={isKicking}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleKickFromWorkspace(activeWorkspace.id, memberToKick.userId)}
                disabled={isKicking}
              >
                {isKicking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Member"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-20">
            <div className="flex flex-col w-full md:w-1/3">
              <h2 className="text-xl text-center font-bold mb-2">Overdue & Today</h2>
              <div>
                <Droppable droppableId="overdueTodayNoDateTodos">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-2 rounded-lg transition-colors 
                      }`}
                    >
                      {categorizeTodos.find(cat => cat.id === "overdueTodayNoDateTodos")?.todos.map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={isMobile}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticDeleteTodo={handleOptimisticTodoDelete} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)}  />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-1/3">
              <h2 className="text-xl text-center font-bold mb-2">Next 7 Days</h2>
              <div>
                <Droppable droppableId="nextSevenDaysTodos">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-2 rounded-lg transition-colors 
                      }`}
                    >
                      {categorizeTodos.find(cat => cat.id === "nextSevenDaysTodos")?.todos.map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={isMobile}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticDeleteTodo={handleOptimisticTodoDelete} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)}  />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            <div className="flex flex-col w-full md:w-1/3">
              <h2 className="text-xl text-center font-bold mb-2">Upcoming</h2>
              <div>
                <Droppable droppableId="upcomingTodosList">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] p-2 rounded-lg transition-colors 
                      }`}
                    >
                      {categorizeTodos.find(cat => cat.id === "upcomingTodosList")?.todos.map((todo, index) => (
                        <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={isMobile}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticDeleteTodo={handleOptimisticTodoDelete} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)}  />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

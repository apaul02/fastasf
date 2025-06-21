"use client"

import { NewTodoButton } from "@/components/newTodoButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { createWorkspaceAction, deleteWorkspaceAction, updateDueDateAction } from "@/lib/actions"
import { commentsType, TodosType, workspaceType } from "@/lib/types"
import { Loader2, Plus, Trash2, User2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { z } from "zod"
import { add, endOfDay, isBefore, isToday, parse, format } from "date-fns"
import { authClient } from "@/lib/auth-client"
import { TodoCard } from "./newTodoCard"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { ModeToggle } from "@/components/toggle-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function WorkspaceContents(props: { workspaces: workspaceType[], currentWorkspace: workspaceType, todos: TodosType[], comments: commentsType[], image?: string | null}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(props.currentWorkspace.id);
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [optimisticTodos, setOptimisticTodos] = useState<TodosType[]>(props.todos);
  
  useEffect(() => {
    props.workspaces.forEach(workspace => {
      router.prefetch(`/w/${workspace.id}`);
    });
  }, [props.workspaces, router]);

  useEffect(() => {
    setOptimisticTodos(props.todos);
  }, [props.todos]);


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
        setIsDropdownOpen(false);
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
          console.log("Todo due date updated successfully:", response.todoId);
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 py-2 border-b">
        <div className="font-semibold text-lg">yep-done</div>
        
        <div className="flex items-center gap-3">
          <NewTodoButton workspaceId={props.currentWorkspace.id} onOptimisticCreate={handleOptimisticTodoCreate} onOptimisticTodoDelete={handleOptimisticTodoDelete} />
          
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
                {error && (
                  <div className="text-red-500 text-sm mt-2">
                    {error}
                  </div>
                )}
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
        
        <div className="flex items-center gap-2">
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
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex justify-between gap-20">
            <div className="flex flex-col w-1/3">
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
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)}  />
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
            <div className="flex flex-col w-1/3">
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
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)}  />
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
            <div className="flex flex-col w-1/3">
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
                        <Draggable key={todo.id} draggableId={todo.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoCard todo={todo} optimisticMarkTodo={handleMarkTodo} comments={props.comments.filter((comment) => comment.todoId === todo.id)} />
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
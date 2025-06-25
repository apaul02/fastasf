"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { deleteTodoAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

export function DeleteTodoButton(props: { todoId: string, optimisticDeleteTodo: (todoId: string) => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDeleteTodo = async () => {
    try {
      props.optimisticDeleteTodo(props.todoId);
      const response = await deleteTodoAction(props.todoId);
      if (response.success) {
        console.log("Todo deleted successfully:", response.todoId);
        router.refresh();
        toast.success("Todo deleted successfully", {
          description: "The todo has been removed.",
          duration: 3000,
          dismissible: true,
          })
        
      } else {
        console.error("Error deleting todo:", response.error);
        toast.error("Failed to delete todo", {
          description: response.error || "An error occurred while deleting the todo.",
          duration: 3000,
          dismissible: true,
        });
        props.optimisticDeleteTodo(props.todoId); // Revert optimistic update
      }
    }catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo", {
        description: "An error occurred while deleting the todo. Please try again.",
        duration: 3000,
        dismissible: true,
      });
      props.optimisticDeleteTodo(props.todoId); 
    }finally {
      setOpen(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"}><Trash2Icon color="#ff0000" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant={"destructive"} onClick={handleDeleteTodo}>Delete</Button>
          <Button variant={"outline"} onClick={() => setOpen(false)} className="ml-2">
            Cancel
          </Button>  
        </div>
      </DialogContent>
    </Dialog>
  )
}
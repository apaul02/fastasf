"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { deleteTodoAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Loader2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

export function DeleteTodoButton(props: { todoId: string, optimisticDeleteTodo: (todoId: string) => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTodo = async () => {
    try {
      setIsDeleting(true);
      props.optimisticDeleteTodo(props.todoId);
      const response = await deleteTodoAction(props.todoId);
      if (response.success) {
        router.refresh();
        toast.success("Todo deleted successfully", {
          description: "The todo has been removed.",
          duration: 3000,
          dismissible: true,
          })
        
      } else {
        props.optimisticDeleteTodo(props.todoId); // Revert optimistic update
        const errorCode = response.error.code;
        const errorMessage = response.error.message;
        if (errorCode === 'AUTH_ERROR') {
          toast.error("Authentication error", { description: errorMessage });
          router.push("/");
        }
        else if (errorCode === 'NOT_FOUND') {
          toast.error("Todo not found", { description: errorMessage });
        }
        else if (errorCode === 'DB_ERROR') {
          toast.error("Database error", { description: errorMessage });
        }
        else {
          toast.error("Failed to delete todo", { description: errorMessage });
        }
      }
    }catch {
      props.optimisticDeleteTodo(props.todoId); 
      toast.error("Failed to delete todo", {
        description: "An error occurred while deleting the todo. Please try again.",
        duration: 3000,
        dismissible: true,
      });
    }finally {
      setIsDeleting(false);
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
          <Button variant={"destructive"} onClick={handleDeleteTodo}>{isDeleting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />): ("Delete")}</Button>
          <Button disabled= {isDeleting} variant={"outline"} onClick={() => setOpen(false)} className="ml-2">
            Cancel
          </Button>  
        </div>
      </DialogContent>
    </Dialog>
  )
}
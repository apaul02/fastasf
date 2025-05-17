"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { deleteTodoAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function DeleteTodoButton(props: { todoId: string}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDeleteTodo = async () => {
    try {
      const response = await deleteTodoAction(props.todoId);
      if (response.success) {
        console.log("Todo deleted successfully:", response.todoId);
        router.refresh();
        
      } else {
        console.error("Error deleting todo:", response.error);
      }
    }catch (error) {
      console.error("Error deleting todo:", error);
    }finally {
      setOpen(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>Delete Todo</Button>
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
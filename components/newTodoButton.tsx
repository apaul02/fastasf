"use client"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"


const todoSchema = z.object({
  title: z.string().min(1).max(100),
  priority: z.number().min(1).max(5),
  dueDate: z.string(),
})

function onSubmit(data: z.infer<typeof todoSchema>) {
  console.log("Form submitted", data)
}


export function NewTodoButton() {
  const form = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      priority: 1,
      dueDate: "",
    },
  })
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"default"}>New Todo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Create a new Todo</DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter todo title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="Enter due date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant={"default"}>Create Todo</Button>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  )
}
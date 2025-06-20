"use client";
import { z } from "zod";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TodosType } from "@/lib/types";
import { format, parse } from "date-fns";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, TimerResetIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { extractDateFromTitle } from "./newTodoButton";
import { updateDueDateAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

const updateDueDateSchema = z.object({
  dueDate: z.date().optional(),
  dateText: z.string().optional()
})

export function UpdateDueDateButton(props: {todo: TodosType }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(props.todo.dueDate ? parse(props.todo.dueDate, "yyyy-MM-dd'T'HH:mm:ss", new Date()) : undefined);
  const router = useRouter();

  const form = useForm<z.infer<typeof updateDueDateSchema>>({
    resolver: zodResolver(updateDueDateSchema),
    defaultValues: {
      dueDate: selectedDate,
      dateText: ""
    }
  })

  const setDueDate = (date: Date) => {
    form.setValue("dueDate", date)
  }
  
  const watchDateText = form.watch("dateText");
  
  useEffect(() => {
    if (watchDateText) {
      const detectedDate = extractDateFromTitle(watchDateText);
      if (detectedDate) {
        setSelectedDate(detectedDate);
        form.setValue("dueDate", detectedDate);
      }
    }
  }, [watchDateText, form]);
  
  const handleSubmit = form.handleSubmit(async (data) => {
    if (!data.dueDate || !props.todo.id) return;
    
    try {
      const response = await updateDueDateAction(
        props.todo.id,
        format(data.dueDate, "yyyy-MM-dd'T'HH:mm:ss")
      );
      
      console.log("Due date updated", response);
      router.refresh();
      
      setTimeout(() => {
        form.reset({
          dueDate: data.dueDate,
          dateText: ""
        });
        setOpen(false);
      }, 100);
      
      return data;
    } catch (error) {
      console.error("Error updating due date:", error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <TimerResetIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Due Date</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="dateText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter Due Date</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="Enter date (e.g. 'tomorrow at 2pm')"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date)
                              setDueDate(date)
                              field.onChange("")
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage>
                    {form.getValues("dueDate") && (
                      <span className="text-xs">
                        Due: {format(form.getValues("dueDate") as Date, "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
            >
              Update Due Date
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
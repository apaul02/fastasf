"use client"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format, isValid, addDays } from "date-fns"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { DialogTitle } from "@radix-ui/react-dialog"
import { createTodoAction } from "@/lib/actions"
import { TodosType } from "@/lib/types"
import { toast } from "sonner"

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title should be less than 100 characters"),
  priority: z.number().min(1).max(5),
  dueDate: z.date().optional(),
  workspaceId: z.string()
})

export function extractDateFromTitle(title: string): Date | null {
  const today = new Date()
  
  const patterns = [
    { 
      regex: /\b(?:today|tonight)\b/i, 
      handler: () => today 
    },
    { 
      regex: /\b(?:tomorrow)\b/i, 
      handler: () => addDays(today, 1) 
    },
    { 
      regex: /\b(?:day after tomorrow|the day after tomorrow)\b/i, 
      handler: () => addDays(today, 2) 
    },
    // Next week
    { 
      regex: /\bnext week\b/i, 
      handler: () => addDays(today, 7) 
    },
    // Next month
    { 
      regex: /\bnext month\b/i, 
      handler: () => {
        const nextMonth = new Date(today)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      }
    },
    // Format: dec 11, dec 11 2pm
    {
      regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?\b/i,
      handler: (match: RegExpMatchArray) => {
        const monthStr = match[1].toLowerCase()
        const day = parseInt(match[2])
        
        const months: Record<string, number> = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 
          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        }
        
        const month = months[monthStr]
        let year = today.getFullYear()
        
        // If the date has already passed this year, use next year
        const currentMonth = today.getMonth()
        const currentDay = today.getDate()
        
        if ((month < currentMonth) || (month === currentMonth && day < currentDay)) {
          year += 1
        }
        
        const date = new Date(year, month, day)
        
        // If we have time information (match[3]), set the time
        if (match[3]) {
          let hours = parseInt(match[3])
          const minutes = match[4] ? parseInt(match[4]) : 0
          const ampm = match[5] ? match[5].toLowerCase() : null
          
          if (ampm === 'pm' && hours < 12) {
            hours += 12
          } else if (ampm === 'am' && hours === 12) {
            hours = 0
          }
          
          date.setHours(hours, minutes, 0, 0)
        }
        
        return date
      }
    },
    // Date formats: June 22, 22 June, 22/06/2023, 22-06-2023, etc.
    {
      regex: /\b(\d{1,2})(?:th|st|nd|rd)? (?:of )?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i,
      handler: (match: RegExpMatchArray) => {
        const day = parseInt(match[1])
        const monthStr = match[2].toLowerCase()
        const months: Record<string, number> = {
          'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
          'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
          'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
          'nov': 10, 'november': 10, 'dec': 11, 'december': 11
        }
        
        const month = months[monthStr.substring(0, 3)]
        let year = today.getFullYear()
        
        // If the date has already passed this year, use next year
        const currentMonth = today.getMonth()
        const currentDay = today.getDate()
        
        if ((month < currentMonth) || (month === currentMonth && day < currentDay)) {
          year += 1
        }
        
        const date = new Date(year, month, day)
        return date
      }
    },
    {
      regex: /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?) (\d{1,2})(?:th|st|nd|rd)?(?:,? (\d{4}))?\b/i,
      handler: (match: RegExpMatchArray) => {
        const monthStr = match[1].toLowerCase()
        const day = parseInt(match[2])
        
        // Only use the specified year if provided in the input
        let year = match[3] ? parseInt(match[3]) : today.getFullYear()
        
        const months: Record<string, number> = {
          'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
          'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
          'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
          'nov': 10, 'november': 10, 'dec': 11, 'december': 11
        }
        
        const month = months[monthStr.substring(0, 3)]
        
        // If a specific year wasn't provided and the date has already passed this year, use next year
        if (!match[3]) {
          const currentMonth = today.getMonth()
          const currentDay = today.getDate()
          
          if ((month < currentMonth) || (month === currentMonth && day < currentDay)) {
            year += 1
          }
        }
        
        const date = new Date(year, month, day)
        return date
      }
    },
    // MM/DD/YYYY or DD/MM/YYYY (assuming MM/DD for US format)
    {
      regex: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
      handler: (match: RegExpMatchArray) => {
        const first = parseInt(match[1])
        const second = parseInt(match[2])
        
        // If year is specified, use it; otherwise use current year
        const yearPart = match[3] ? parseInt(match[3]) : today.getFullYear()
        let year = yearPart < 100 ? 2000 + yearPart : yearPart
        
        // Assume MM/DD format if first number is 12 or less
        let month, day
        if (first <= 12) {
          month = first - 1
          day = second
        } else {
          month = second - 1
          day = first
        }
        
        // If a specific year wasn't provided and the date has already passed this year, use next year
        if (!match[3]) {
          const currentMonth = today.getMonth()
          const currentDay = today.getDate()
          
          if ((month < currentMonth) || (month === currentMonth && day < currentDay)) {
            year += 1
          }
        }
        
        const date = new Date(year, month, day)
        return date
      }
    },
    // Time extraction for hours (will be added to the detected date)
    {
      regex: /\b(?:at|by)?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
      handler: (match: RegExpMatchArray, existingDate: Date | null) => {
        const dateToModify = existingDate || new Date()
        
        let hours = parseInt(match[1])
        const minutes = match[2] ? parseInt(match[2]) : 0
        const ampm = match[3] ? match[3].toLowerCase() : null
        
        if (ampm === 'pm' && hours < 12) {
          hours += 12
        } else if (ampm === 'am' && hours === 12) {
          hours = 0
        }
        
        dateToModify.setHours(hours, minutes, 0, 0)
        return dateToModify
      }
    }
  ]

  if (!title) return null
  
  let detectedDate: Date | null = null
  
  for (const pattern of patterns) {
    const match = title.match(pattern.regex)
    if (match) {
      if (pattern.regex.toString().includes('am|pm') && !pattern.regex.toString().includes('jan|feb|mar')) {
        // This is a standalone time pattern (not combined month-day-time), add it to the existing date
        detectedDate = pattern.handler(match, detectedDate)
      } else {
        // This is a date pattern or combined date-time pattern
        detectedDate = pattern.handler(match, detectedDate)
      }
    }
  }
  
  return detectedDate && isValid(detectedDate) ? detectedDate : null
}

export function NewTodoButton(props: { workspaceId: string; onOptimisticCreate?: (todo: TodosType) => void; onOptimisticTodoDelete?: (todoId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  
  const form = useForm<z.infer<typeof todoSchema>>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      priority: 3,
      dueDate: undefined,
      workspaceId: props.workspaceId,
    },
  })
  
  const watchTitle = form.watch("title")
  
  const handleSubmit = form.handleSubmit(async (data) => {
    form.setValue("workspaceId", props.workspaceId)
    
    const formattedData = {
      title: data.title,
      priority: data.priority,
      workspaceId: props.workspaceId,
      dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd'T'HH:mm:ss") : "",
    }
    
    console.log("Form submitted", formattedData)
    
    try {
      // Create optimistic todo
      const optimisticTodo = {
        id: `temp-${Date.now()}`, 
        title: formattedData.title,
        priority: formattedData.priority,
        workspaceId: formattedData.workspaceId,
        dueDate: formattedData.dueDate || null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "", 
      }

      // Optimistically add the todo
      if (props.onOptimisticCreate) {
        props.onOptimisticCreate(optimisticTodo);
        setOpen(false);
      }

      const response = await createTodoAction(
        formattedData.title,
        formattedData.workspaceId, 
        formattedData.priority, 
        formattedData.dueDate
      )
      console.log("Todo created", response)
      
      if (response.success) {
        toast.success("New todo created successfully!", {
          description: `Todo "${formattedData.title}" has been created.`,
          duration: 3000,
          dismissible: true
        })
      } else {
        // Handle error - you might want to remove the optimistic todo here
        if(props.onOptimisticTodoDelete) {
          props.onOptimisticTodoDelete(optimisticTodo.id);
        }
        toast.error("Failed to create todo", {
          description: response.error || "An error occurred while creating the todo.",
          duration: 3000,
          dismissible: true
        })
        console.error("Failed to create todo:", response.error);
      }
      
      form.reset();
      setSelectedDate(undefined);
      setOpen(false);
      
      return formattedData
    } catch (error) {
      console.error("Error creating todo:", error)
      toast.error("Failed to create todo", {
        description: "An error occurred while creating the todo. Please try again.",
        duration: 3000,
        dismissible: true
      })
    }
  })
  
  const setDueDate = (date: Date) => {
    form.setValue("dueDate", date)
  }
  
  useEffect(() => {
    const detectedDate = extractDateFromTitle(watchTitle)
    if (detectedDate) {
      setSelectedDate(detectedDate)
      form.setValue("dueDate", detectedDate)
    }
  }, [watchTitle, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"default"}>New Todo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-xl font-semibold mb-4">
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                    <FormControl>
                      <Input 
                        placeholder="e.g. 'Take out trash tomorrow at 2pm'" 
                        className="w-full"
                        {...field} 
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Set Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          // captionLayout="dropdown"
                          disabled= {(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const compareDate = new Date(date)
                            compareDate.setHours(0, 0, 0, 0)
                            return compareDate < today
                          }}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date)
                              setDueDate(date)
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
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2 - Medium-Low</SelectItem>
                      <SelectItem value="3">3 - Medium</SelectItem>
                      <SelectItem value="4">4 - Medium-High</SelectItem>
                      <SelectItem value="5">5 - High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
            >
              Create Todo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
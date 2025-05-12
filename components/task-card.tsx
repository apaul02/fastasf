"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, Check, MessageSquare, Trash2 } from "lucide-react"

import type { Task } from "./kanban-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { format, isBefore, parseISO } from "date-fns"

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onMarkAsDone: (id: string) => void
  onAddComment: (taskId: string, comment: string) => void
}

export function TaskCard({ task, onDelete, onMarkAsDone, onAddComment }: TaskCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [newComment, setNewComment] = useState("")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  const getDueDateStatus = () => {
    if (!task.dueDate) return null

    const today = new Date()
    const dueDate = parseISO(task.dueDate)

    // Due in the next 2 days
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(today.getDate() + 2)

    if (isBefore(dueDate, today)) {
      return "text-red-600 font-medium"
    } else if (isBefore(dueDate, twoDaysFromNow)) {
      return "text-amber-600 font-medium"
    }
    return "text-gray-600"
  }

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(task.id, newComment)
      setNewComment("")
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="flex flex-row items-start justify-between p-3 pb-0">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-600 hover:bg-green-100 hover:text-green-700"
            onClick={(e) => {
              e.stopPropagation()
              onMarkAsDone(task.id)
            }}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as done</span>
          </Button>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>

            {task.dueDate && (
              <div className={`flex items-center text-xs ${getDueDateStatus()}`}>
                <Calendar className="mr-1 h-3 w-3" />
                {format(parseISO(task.dueDate), "MMM d, yyyy")}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-full justify-start p-0 text-xs text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setIsCommentsOpen(true)
            }}
          >
            <MessageSquare className="mr-1 h-3 w-3" />
            {task.comments.length} {task.comments.length === 1 ? "comment" : "comments"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{task.title} - Comments</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {task.comments.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4 py-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border p-3">
                    <p className="text-sm">{comment.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(parseISO(comment.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmitComment()
                }
              }}
            />
            <Button onClick={handleSubmitComment}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

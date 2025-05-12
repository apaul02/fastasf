"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { PlusCircle } from "lucide-react"

import { Column as ColumnComponent } from "./column"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type Task = {
  id: string
  title: string
  comments: Comment[]
  priority: "low" | "medium" | "high"
  dueDate: string | null
}

export type Comment = {
  id: string
  text: string
  createdAt: string
}

export type Column = {
  id: string
  title: string
  tasks: Task[]
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "need-to-do",
      title: "Need to Do",
      tasks: [
        {
          id: "task-1",
          title: "Research competitors",
          comments: [
            { id: "comment-1", text: "We should focus on top 5 competitors", createdAt: new Date().toISOString() },
          ],
          priority: "high",
          dueDate: "2025-05-20",
        },
        {
          id: "task-2",
          title: "Design homepage",
          comments: [],
          priority: "medium",
          dueDate: "2025-05-25",
        },
      ],
    },
    {
      id: "doing",
      title: "Doing",
      tasks: [
        {
          id: "task-3",
          title: "Develop API",
          comments: [{ id: "comment-2", text: "Using REST architecture", createdAt: new Date().toISOString() }],
          priority: "medium",
          dueDate: "2025-05-15",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        {
          id: "task-4",
          title: "Setup project",
          comments: [],
          priority: "low",
          dueDate: null,
        },
      ],
    },
  ])

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [newTask, setNewTask] = useState<{
    title: string
    priority: "low" | "medium" | "high"
    dueDate: string | null
  }>({
    title: "",
    priority: "medium",
    dueDate: null,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    priority: "all" as "all" | "low" | "medium" | "high",
    dueDate: null as string | null,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px
      },
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
      return
    }

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
      return
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    setActiveColumn(null)

    const { active, over } = event
    if (!over) return

    // Handle column reordering
    if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
      const activeColumnIndex = columns.findIndex((col) => col.id === active.id)
      const overColumnIndex = columns.findIndex((col) => col.id === over.id)

      if (activeColumnIndex !== overColumnIndex) {
        setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex))
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the active task and its column
    const activeColumnIndex = columns.findIndex((col) => col.tasks.some((task) => task.id === activeId))

    if (activeColumnIndex < 0) return

    // Find the destination column
    const overColumnId =
      over.data.current?.type === "Column"
        ? over.id
        : over.data.current?.task
          ? columns.find((col) => col.tasks.some((task) => task.id === overId))?.id
          : over.data.current?.column?.id

    if (!overColumnId) return

    const overColumnIndex = columns.findIndex((col) => col.id === overColumnId)

    if (overColumnIndex < 0) return

    if (activeColumnIndex === overColumnIndex) return

    setColumns((prev) => {
      const newColumns = [...prev]

      // Find the task in the active column
      const activeColumn = newColumns[activeColumnIndex]
      const taskIndex = activeColumn.tasks.findIndex((task) => task.id === activeId)

      if (taskIndex < 0) return prev

      // Remove the task from the active column
      const [task] = activeColumn.tasks.splice(taskIndex, 1)

      // Add the task to the destination column
      newColumns[overColumnIndex].tasks.push(task)

      return newColumns
    })
  }

  function handleAddTask() {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      comments: [],
      priority: newTask.priority,
      dueDate: newTask.dueDate,
    }

    setColumns((prev) => {
      const newColumns = [...prev]
      // Add to the "Need to Do" column
      const needToDoColumn = newColumns.find((col) => col.id === "need-to-do")
      if (needToDoColumn) {
        needToDoColumn.tasks.push(task)
      }
      return newColumns
    })

    setNewTask({ title: "", priority: "medium", dueDate: null })
    setIsDialogOpen(false)
  }

  function handleDeleteTask(taskId: string) {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      })),
    )
  }

  function handleMarkAsDone(taskId: string) {
    setColumns((prev) => {
      const newColumns = [...prev]

      // Find the task in any column
      let foundTask: Task | null = null
      let sourceColumnIndex = -1

      for (let i = 0; i < newColumns.length; i++) {
        const taskIndex = newColumns[i].tasks.findIndex((task) => task.id === taskId)
        if (taskIndex >= 0) {
          foundTask = { ...newColumns[i].tasks[taskIndex] }
          newColumns[i].tasks.splice(taskIndex, 1)
          sourceColumnIndex = i
          break
        }
      }

      if (foundTask) {
        // Add to the "Done" column
        const doneColumn = newColumns.find((col) => col.id === "done")
        if (doneColumn) {
          doneColumn.tasks.push(foundTask)
        } else if (sourceColumnIndex >= 0) {
          // If "Done" column doesn't exist, put it back
          newColumns[sourceColumnIndex].tasks.push(foundTask)
        }
      }

      return newColumns
    })
  }

  function handleAddComment(taskId: string, commentText: string) {
    if (!commentText.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      createdAt: new Date().toISOString(),
    }

    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === taskId ? { ...task, comments: [...task.comments, comment] } : task,
        ),
      })),
    )
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      // Search filter
      const matchesSearch = filters.search ? task.title.toLowerCase().includes(filters.search.toLowerCase()) : true

      // Priority filter
      const matchesPriority = filters.priority === "all" ? true : task.priority === filters.priority

      // Due date filter
      const matchesDueDate = !filters.dueDate ? true : task.dueDate === filters.dueDate

      return matchesSearch && matchesPriority && matchesDueDate
    }),
  }))

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-semibold">My Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="rounded-md border border-input bg-background px-3 py-2"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate || ""}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value || null })}
                />
              </div>
            </div>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-md border border-input bg-background px-3 py-2"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Input
              type="date"
              value={filters.dueDate || ""}
              onChange={(e) => setFilters({ ...filters, dueDate: e.target.value || null })}
            />
            <Button variant="outline" onClick={() => setFilters({ search: "", priority: "all", dueDate: null })}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SortableContext items={filteredColumns.map((col) => col.id)}>
            {filteredColumns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onDeleteTask={handleDeleteTask}
                onMarkAsDone={handleMarkAsDone}
                onAddComment={handleAddComment}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>{activeTask && <TaskCard task={activeTask} onDelete={() => {}} />}</DragOverlay>
      </DndContext>
    </div>
  )
}

"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import type { Column as ColumnType } from "./kanban-board"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ColumnProps {
  column: ColumnType
  onDeleteTask: (id: string) => void
  onMarkAsDone: (id: string) => void
  onAddComment: (taskId: string, comment: string) => void
}

export function Column({ column, onDeleteTask, onMarkAsDone, onAddComment }: ColumnProps) {
  // const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
  //   id: column.id,
  //   data: {
  //     type: "Column",
  //     column,
  //   },
  // })

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // }

  return (
    <Card
      // ref={setNodeRef}
      // style={style}
      className={`flex h-[calc(100vh-16rem)] flex-col `}
      // {...attributes}
      // {...listeners}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-center text-lg">
          {column.title} ({column.tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onMarkAsDone={onMarkAsDone}
              onAddComment={onAddComment}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

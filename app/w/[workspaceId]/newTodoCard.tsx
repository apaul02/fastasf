"use client"
import { DeleteTodoButton } from "@/components/DeleteTodoButtom";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateDueDateButton } from "@/components/UpdateDueDate";
import { markTodoAction } from "@/lib/actions";
import { TodosType } from "@/lib/types";
import { add, format, isBefore, isToday, isTomorrow, parse } from "date-fns";
import { useState } from "react";


function isBeforeNextSevenDays(date: Date) {
  const today = new Date();
  const nextWeek = add(today, { days: 7 });
  return isBefore(date, nextWeek);
}

function formatDate(date: string | null) {
  if (!date) return "No due date";
  const parsedDate = parse(date, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  if (isToday(parsedDate)) {
    return "Today at" + format(parsedDate, " h a");
  } else if (isTomorrow(parsedDate)) {
    return format(parsedDate, "'Tomorrow' 'at' h a");
  }else if(isBeforeNextSevenDays(parsedDate)) {
    return format(parsedDate, "EEEE ' at ' h a");
  }else {
    return format(parsedDate, "LLLL d, yyyy, 'at' h a");
  }
}

export function TodoCard(props: { todo: TodosType }) {
  const [optimisticTodos, setOptimisticTodos] = useState<TodosType>(props.todo)
  const [isVisible, setIsVisible] = useState(true);

  async function handleTodoChange() {
    const originalTodo = optimisticTodos;
    setOptimisticTodos(prev => ({ ...prev, completed: !prev.completed }));
    setIsVisible(false); // Disappears instantly

    try {
      const response = await markTodoAction(props.todo.id);
      if (response.success) {
        console.log("Todo marked successfully:", response.todoId);
      } else {
        console.error("Error marking todo:", response.error);
        setOptimisticTodos(originalTodo);
        setIsVisible(true); 
      }
    } catch (error) {
      console.error("Error marking todo:", error);
      setOptimisticTodos(originalTodo);
      setIsVisible(true);
    }
  }

  if(!isVisible) {
    return null;
  }
  return (
    <div>
      <div className={`bg-white shadow-md rounded-lg p-4 mb-4 ${optimisticTodos.completed ? "opacity-0" : ""}`.trim()}>
        <div className="flex items-center">
          <Checkbox
            checked={optimisticTodos.completed}
            onCheckedChange={handleTodoChange}
            className="mr-2"
          />
          <div>
            <div>{optimisticTodos.title}</div>
            <div>{formatDate(optimisticTodos.dueDate)}</div>
            <UpdateDueDateButton todo={props.todo} />
            <DeleteTodoButton todoId={props.todo.id} />
          </div>
        </div>

      </div>
    </div>
  )
}
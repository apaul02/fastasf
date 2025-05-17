"use client";
import { DeleteTodoButton } from "@/components/DeleteTodoButtom";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateDueDateButton } from "@/components/UpdateDueDate";
import { markTodoAction } from "@/lib/actions";
import { TodosType } from "@/lib/types";
import { add, format, isBefore, isThisWeek, isToday, isTomorrow, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export function TodoCard(props: { todos: TodosType[] }) {
  const router = useRouter();
  const [optimisticTodos, setOptimisticTodos] = useState<TodosType[]>(props.todos);

  useEffect(() => {
    setOptimisticTodos(props.todos);
  }, [props.todos]);

  const handleTodoChange = async (todoId: string) => {
    const originalTodo = optimisticTodos.find((todo) => todo.id === todoId);
    if (!originalTodo) return;

    const newCompletedStatus = !originalTodo.completed;

    const originalOptimisticTodos = [...optimisticTodos]; 

    if (newCompletedStatus === true) {
      setOptimisticTodos(prevTodos => prevTodos.filter(t => t.id !== todoId));
    } else {
      setOptimisticTodos(prevTodos =>
        prevTodos.map(t =>
          t.id === todoId ? { ...t, completed: newCompletedStatus } : t
        )
      );
    }

    try {
      const result = await markTodoAction(todoId);
      if (result.success) {
        console.log("Todo marked successfully:", result.todoId);
        router.refresh();
      } else {
        console.error("Error marking todo:", result.error);
        setOptimisticTodos(originalOptimisticTodos);
      }
    } catch (error) {
      console.error("Error marking todo:", error);
      setOptimisticTodos(originalOptimisticTodos);
    }
  };

  return (
    <div>
      {optimisticTodos.map((todo) => (
        <div key={todo.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => handleTodoChange(todo.id)}
              className="mr-2"
            />
            <div className="flex-grow flex items-center justify-between">
              <h2 className={`text-xl font-bold ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.title}</h2>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {todo.completed ? 'Done' : 'Pending'}
              </div>
            </div>
          </div>
          <UpdateDueDateButton todo={todo} />
          <DeleteTodoButton todoId={todo.id} />
          <p className="text-gray-500">{formatDate(todo.dueDate)}</p>
        </div>
      ))}
    </div>
  );
}
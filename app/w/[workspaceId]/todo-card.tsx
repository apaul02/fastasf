import { TodosType } from "@/lib/types";

export function TodoCard(props: { todos: TodosType[] }) {
  return (
    <div>
      {props.todos.map((todo) => (
        <div key={todo.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold">{todo.title}</h2>
          <p className="text-gray-500">{todo.dueDate}</p>
        </div>
      ))}
    </div>
  )
}
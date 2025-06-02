"use client"
import { DeleteTodoButton } from "@/components/DeleteTodoButtom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UpdateDueDateButton } from "@/components/UpdateDueDate";
import { createCommentAction, deleteCommentAction, markTodoAction } from "@/lib/actions";
import { commentsType, TodosType } from "@/lib/types";
import { add, format, isBefore, isToday, isTomorrow, parse } from "date-fns";
import { or } from "drizzle-orm";
import { ArrowBigUp, Trash2 } from "lucide-react";
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

export function TodoCard(props: { todo: TodosType, comments: commentsType[], onOptimisticDueDateUpdate?: (todoId: string, newDueDate: string) => void }) {
  const [optimisticTodos, setOptimisticTodos] = useState<TodosType>(props.todo)
  const [isVisible, setIsVisible] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [optimisticComments, setOptimisticComments] = useState<commentsType[]>(props.comments);
  const router = useRouter();

  useEffect(() => {
    setOptimisticComments(props.comments);
  }, [props.comments]);

  async function handleCommentSubmit() {
    if(commentContent.trim() === "") {
      return;
    }
    try {
      const newComment: commentsType = {
        id: `temp-${Date.now()}`, // Temp ID for optimistic ui
        content: commentContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        todoId: props.todo.id,
        userId: ""
      }
      // Optimistically update the UI
      setOptimisticComments(prev => [...prev, newComment]);
      setCommentContent("");
      const response = await createCommentAction(props.todo.id, commentContent);
      if (response.success) {
      console.log("Comment created successfully:", response.commentId);
      router.refresh();

       
      }
      else {
        console.error("Error creating comment:", response.error);
        setOptimisticComments(prev => prev.filter(comment => comment.id !== newComment.id));
      
      }
    }catch (error) {
      console.error("Error creating comment:", error);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const originalComments = optimisticComments;
      setOptimisticComments(prev => prev.filter(comment => comment.id !== commentId));
      const response = await deleteCommentAction(commentId);
      if (response.success) {
        console.log("Comment deleted successfully:", response.commentId);
      } else {
        console.error("Error deleting comment:", response.error);
        setOptimisticComments(originalComments);
      }
    }catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  async function handleTodoChange() {
    const originalTodo = optimisticTodos;
    setOptimisticTodos(prev => ({ ...prev, completed: !prev.completed }));
    setIsVisible(false);

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
            {/* <div>{optimisticTodos.id}</div> */}
            <div>{formatDate(optimisticTodos.dueDate)}</div>
            <UpdateDueDateButton todo={props.todo} />
            <DeleteTodoButton todoId={props.todo.id} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <Input 
            placeholder="Add a comment..." 
            className="mt-2" 
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)} 
          />
          <Button onClick={handleCommentSubmit}><ArrowBigUp /></Button>
        </div>
        <div>
          {optimisticComments.length > 0 ? (
            <div className="mt-2">
              {optimisticComments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 py-2">
                  <p>{comment.content}</p>
                  <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), "PPpp")}</span>
                  <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleDeleteComment(comment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No comments yet.</p>
          )}
        </div>

      </div>
    </div>
  )
}
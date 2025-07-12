"use client"
import { DeleteTodoButton } from "@/components/DeleteTodoButtom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UpdateDueDateButton } from "@/components/UpdateDueDate";
import { createCommentAction, deleteCommentAction, markTodoAction } from "@/lib/actions";
import { commentsType, TodosType } from "@/lib/types";
import { add, format, isBefore, isToday, isTomorrow, parse } from "date-fns";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";



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

export function TodoCard(props: { todo: TodosType, optimisticMarkTodo: (todo: TodosType) => void, comments: commentsType[], optimisticDeleteTodo: (todoId: string) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [optimisticComments, setOptimisticComments] = useState<commentsType[]>(props.comments);
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();
  // const [isPending, startTransition] = useTransition()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  

  async function handleCommentSubmit() {
    if(commentContent.trim() === "" || isSubmittingComment) {
      return;
    }
    setIsSubmittingComment(true);
    
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
      try {
      const response = await createCommentAction(props.todo.id, commentContent);
      if (response.success) {
      
      console.log("Comment created successfully:", response.data.id);
      setCommentContent("");

      router.refresh();
      toast.success("Comment added!")

       
      }
      else {
        setCommentContent(newComment.content);
        console.error("Error creating comment:", response.error);
        setOptimisticComments(prev => prev.filter(comment => comment.id !== newComment.id));

        const errorCode = response.error.code;
        const errorMessage = response.error.message;
        if (errorCode === 'AUTH_ERROR') {
          toast.error("Authentication error", { description: errorMessage });
          router.push("/");
        }
        else if (errorCode === 'VALIDATION_ERROR') {
          toast.error("Invalid Input", { description: errorMessage });
        }
        else {
          toast.error("Failed to create comment", { description: errorMessage });
        }
      
      }
    }catch (error) {
      console.error("Error creating comment:", error);
      setOptimisticComments(prev => prev.filter(comment => comment.id !== newComment.id));
      toast.error("Failed to create comment", {
        description: "An error occurred while creating the comment. Please try again.",
        duration: 3000,
        dismissible: true,
      });
    }finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      if(isDeletingComment) return;
      setIsDeletingComment(true);
      const originalComments = optimisticComments;
      setOptimisticComments(prev => prev.filter(comment => comment.id !== commentId));
      const response = await deleteCommentAction(commentId);
      if (response.success) {
        toast.success("Comment deleted successfully", {
          description: "The comment has been removed.",
          duration: 3000,
          dismissible: true,
        });
      } else {
        setOptimisticComments(originalComments);
        const errorCode = response.error.code;
        const errorMessage = response.error.message;
        if (errorCode === 'AUTH_ERROR') {
          toast.error("Authentication error", { description: errorMessage });
          router.push("/");
        }
        else if (errorCode === 'NOT_FOUND') {
          toast.error("Comment not found", { description: errorMessage });
        }
        else if (errorCode === 'DB_ERROR') {
          toast.error("Database error", { description: errorMessage });
        }
        else {
          toast.error("Failed to delete comment", { description: errorMessage });
        }
      }
    }catch {
      setOptimisticComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.error("Failed to delete comment", {
        description: "An error occurred while deleting the comment. Please try again.",
        duration: 3000,
        dismissible: true,
      });
    }finally {
      setIsDeletingComment(false);
    }
  }

  async function handleTodoChange() {
    props.optimisticMarkTodo(props.todo);
    setIsVisible(false);

    
      const response = await markTodoAction(props.todo.id);
      if (response.success) {
        console.log("Todo marked successfully:", response.data.todoId);
        toast.success("Todo marked successfully", {
          description: `Todo "${props.todo.title}" has been marked as completed.`,
          duration: 3000,
          dismissible: true,
        });
      } else {
        props.optimisticMarkTodo(props.todo);
        setIsVisible(true);
        if(response.error.code === 'AUTH_ERROR') {
          router.push("/");
        }else {
          let description = "An error occurred while marking the todo.";
          if(response.error.code === 'NOT_FOUND') {
            description = "Todo not found. It may have been deleted.";
          } else if(response.error.code === 'DB_ERROR') {
            description = "Database error occurred while marking the todo. Please try again later.";
          }
          toast.error("Failed to mark todo", {
            description: description,
            duration: 3000,
            dismissible: true,
          });
        }      
      }
  }

  if(!isVisible) {
    return null;
  }
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
    >
      <div className={`border-3  rounded-lg p-4 mb-4 ${props.todo.completed ? "opacity-0" : ""}`.trim()}>
        <div className="flex items-start">
          <div>
            <Checkbox
            checked={props.todo.completed}
            onCheckedChange={handleTodoChange}
            className="mr-2 mt-1 w-5 h-5"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <div>
              <div className="text-lg font-semibold">{props.todo.title}</div>
              {/* <div>{props.todo.id}</div> */}
              <div className=" text-slate-500 text-sm">{formatDate(props.todo.dueDate)}</div>
            </div>
            <div className="flex mt-2 sm:mt-0">
              <UpdateDueDateButton todo={props.todo} />
              <DeleteTodoButton todoId={props.todo.id} optimisticDeleteTodo={props.optimisticDeleteTodo} />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowComments(!showComments)}
                className="text-gray-600 hover:text-gray-800 ml-1"
              >
                {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {/* <span className="text-xs ml-1">({optimisticComments.length})</span> */}
              </Button>
            </div>
          </div>
        </div>
      <AnimatePresence>
        {showComments && (
          <motion.div
            // layout 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: showComments ? 1 : 0, height: showComments ? "auto" : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            exit={{ opacity: 0, height: 0 }}
            className={`overflow-hidden mt-2`.trim()}
          >
            <>
              <div className="flex justify-between items-center mt-2">
                <Input 
                  placeholder="Add a comment..." 
                  className="mt-2 w-full border-0  shadow-none focus:ring-0 " 
                  value={commentContent}
                  disabled={isSubmittingComment}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommentSubmit();
                    }
                  }}
                />
                {/* <Button onClick={handleCommentSubmit}><ArrowBigUp /></Button> */}
              </div>
              <div>
                {optimisticComments.length > 0 ? (
                  <div className="mt-2">
                    {optimisticComments.map((comment) => (
                      <div key={comment.id} className=" py-2">
                        <p>{comment.content}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 mt-1">
                          <span className="text-xs text-gray-500">{format(new Date(comment.createdAt), "PPpp")}</span>
                          <Button disabled={isDeletingComment} variant="ghost" size="icon" className="ml-0 sm:ml-2 mt-1 sm:mt-0" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 color="#ff0000" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No comments yet.</p>
                )}
              </div>
            </>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </motion.div>
  )
}
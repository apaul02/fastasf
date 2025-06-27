"use server"

import { cookies, headers } from "next/headers"
import { auth } from "./auth"
import { MUTATIONS, QUERIES } from "./db/queries"
import { commentsType, TActionResult, TodosType } from "./types"
import { AuthError, DatabaseError, NotFoundError, ValidationError } from "./errors"

export async function onBoardUserAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", workspaceId: null, isNew: false }
  }

  const userId = session.user.id;

  const workspaces = await QUERIES.getUserWorkspaces(userId);

  
  if (workspaces && workspaces.length > 0) {
    const personalWorkspace = workspaces.find(ws => ws.name === "Personal") || workspaces[0];
    if (personalWorkspace && personalWorkspace.id) {
      return { success: true, workspaceId: personalWorkspace.id, isNew: false }
    }else {
      return { success: false, error: "Failed to find personal workspace", workspaceId: null, isNew: false }
    }
  } else {

    const newWorkspace = await MUTATIONS.createWorkspace(userId, "Personal");
    if(!newWorkspace || !newWorkspace.id) {
      return { success: false, error: "Failed to create personal workspace for new user", workspaceId: null, isNew: true }
    }
    // const c = await cookies();
    // c.set("force-refresh", JSON.stringify(Math.random()))
    return { success: true, workspaceId: newWorkspace.id, isNew: true }
  }
} 

export async function createWorkspaceAction(workspaceName: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", workspaceId: null }
  }

  const userId = session.user.id;

  const newWorkspace = await MUTATIONS.createWorkspace(userId, workspaceName);
  if(!newWorkspace || !newWorkspace.id) {
    return { success: false, error: "Failed to create personal workspace for new user", workspaceId: null }
  }

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()))
  return { success: true, workspaceId: newWorkspace.id }
}

export async function createTodoAction(title: string, workspaceId: string, priority: number, dueDate?: string): Promise<TActionResult<TodosType>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new AuthError();
    }

    const userId = session.user.id;

    const newTodo = await MUTATIONS.createTodo(title, workspaceId, userId, priority, dueDate);
    return { success: true, data: newTodo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof ValidationError) {
      return { success: false, error: { message: error.message, code: 'VALIDATION_ERROR' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in createTodoAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function markTodoAction(todoId: string): Promise<TActionResult<{ todoId: string}>> {
  try {
    const session = await auth.api.getSession({ headers: await headers()});
    if (!session?.user) {
      throw new AuthError();
    }

    const updatedTodo = await MUTATIONS.markTodo(todoId);

    return { success: true, data: { todoId: updatedTodo.id } };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Todo not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: "Database error occurred", code: 'DB_ERROR' } };
    }

    console.error("Error in markTodoAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' }}
  }
}

export async function updateDueDateAction(todoId: string, dueDate: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", todoId: null }
  }

  try {
    const newTodo = await MUTATIONS.updateDueDate(todoId, dueDate);
    if(!newTodo || !newTodo.id) {
      return { success: false, error: "Failed to update due date", todoId: null }
    }
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()))
    
    return { success: true, todoId: newTodo.id }
  } catch (error) {
    console.error("Error in updateDueDateAction:", error);
    return { success: false, error: "Server error when updating due date", todoId: null }
  }
}

export async function deleteTodoAction(todoId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", todoId: null }
  }

  try {
    const newTodo = await MUTATIONS.deleteTodo(todoId);
    if(!newTodo || !newTodo.id) {
      return { success: false, error: "Failed to delete todo", todoId: null }
    }
    // const c = await cookies();
    // c.set("force-refresh", JSON.stringify(Math.random()))
    
    return { success: true, todoId: newTodo.id }
  } catch (error) {
    console.error("Error in deleteTodoAction:", error);
    return { success: false, error: "Server error when deleting todo", todoId: null }
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", workspaceId: null }
  }

  try {
    const newWorkspace = await MUTATIONS.deleteWorkspace(workspaceId);
    if(!newWorkspace || !newWorkspace.id) {
      return { success: false, error: "Failed to delete workspace", workspaceId: null }
    }
    
    return { success: true, workspaceId: newWorkspace.id }
  } catch (error) {
    console.error("Error in deleteWorkspaceAction:", error);
    return { success: false, error: "Server error when deleting workspace", workspaceId: null }
  }
}

export async function createCommentAction(todoId: string, content: string):Promise<TActionResult<commentsType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const userId = session.user.id;

    const newComment = await MUTATIONS.createComment(todoId, userId, content);
    return { success: true, data: newComment };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof ValidationError) {
      return { success: false, error: { message: error.message, code: 'VALIDATION_ERROR' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in createCommentAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}


export async function deleteCommentAction(commentId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", commentId: null }
  }

  try {
    const deletedComment = await MUTATIONS.deleteComment(commentId);
    if(!deletedComment || !deletedComment.id) {
      return { success: false, error: "Failed to delete comment", commentId: null }
    }
    
    return { success: true, commentId: deletedComment.id }
  } catch (error) {
    console.error("Error in deleteCommentAction:", error);
    return { success: false, error: "Server error when deleting comment", commentId: null }
  }
}
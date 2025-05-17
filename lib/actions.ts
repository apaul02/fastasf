"use server"

import { cookies, headers } from "next/headers"
import { auth } from "./auth"
import { MUTATIONS, QUERIES } from "./db/queries"

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

export async function createTodoAction(title: string, workspaceId: string, priority: number, dueDate?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", todoId: null }
  }

  const userId = session.user.id;

  const newTodo = await MUTATIONS.createTodo(title, workspaceId, userId, priority, dueDate);
  if(!newTodo || !newTodo.id) {
    return { success: false, error: "Failed to create personal workspace for new user", todoId: null }
  }
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()))

  return { success: true, todoId: newTodo.id }
}

export async function markTodoAction(todoId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated", todoId: null }
  }

  try {
    const newTodo = await MUTATIONS.markTodo(todoId);
    if(!newTodo || !newTodo.id) {
      return { success: false, error: "Failed to mark todo", todoId: null }
    }
    
    
    return { success: true, todoId: newTodo.id }
  } catch (error) {
    console.error("Error in markTodoAction:", error);
    return { success: false, error: "Server error when marking todo", todoId: null }
  }
}
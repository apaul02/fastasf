import "server-only";
import { db } from ".";
import { v4 as uuidv4 } from "uuid";
import { comments, todos, workspace } from "./schema";
import { eq, sql } from "drizzle-orm";
import { create } from "domain";

export const MUTATIONS = {
  createWorkspace: async function (userId: string, name: string) {
    const result = await db.insert(workspace).values({
      id: uuidv4(),
      name: name,
      userId: userId,
    }).returning();
    return result[0];
  },
  createTodo: async function (title: string, workspaceId: string, userId: string, priority: number, dueDate?: string) {
    const result = await db.insert(todos).values({
      id: uuidv4(),
      title: title,
      workspaceId: workspaceId,
      userId: userId,
      dueDate: dueDate,
      priority: priority
    }).returning();
    return result[0];
  },
  markTodo: async function (todoId: string) {
    const result = await db.update(todos).set(
      {
        completed: sql`NOT ${todos.completed}`,
      }
    )
    .where(eq(todos.id, todoId))
    .returning();
    return result[0];
  },
  updateDueDate: async function (todoId: string, dueDate: string) {
    const result = await db.update(todos).set(
      {
        dueDate: dueDate,
      }
    )
    .where(eq(todos.id, todoId))
    .returning();
    return result[0];
  },
  deleteTodo: async function (todoId: string) {
    const result = await db.delete(todos).where(eq(todos.id, todoId)).returning();
    return result[0];
  },
  deleteWorkspace: async function (workspaceId: string) {
    const result = await db.delete(workspace).where(eq(workspace.id, workspaceId)).returning();
    return result[0];
  },
  createComment: async function (todoId: string, userId: string, content: string) {
    const result = await db.insert(comments).values({
      id: uuidv4(),
      todoId: todoId,
      userId: userId,
      content: content,
    }).returning();
    return result[0];
  },
  deleteComment: async function (commentId: string) {
    const result = await db.delete(comments).where(eq(comments.id, commentId)).returning();
    return result[0];
  }
}

export const QUERIES = {
  getUserWorkspaces: async function (userId: string) {
    return await db
      .select()
      .from(workspace)
      .where(eq(workspace.userId, userId));
  },
  getTodosByWorkSpaceId: async function (workspaceId: string) {
    return await db
      .select()
      .from(todos)
      .where(eq(todos.workspaceId, workspaceId));
  },
  getWorkspaceById: async function (workspaceId: string) {
    const result = await db
      .select()
      .from(workspace)
      .where(eq(workspace.id, workspaceId));
    return result[0];
  },
  getCommentsByUserId: async function (userId: string) {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.userId, userId));
  }
}
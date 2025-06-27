import "server-only";
import { db } from ".";
import { v4 as uuidv4 } from "uuid";
import { comments, todos, workspace } from "./schema";
import { eq, sql } from "drizzle-orm";
import { commentsType, TodosType } from "../types";
import { DatabaseError, NotFoundError, ValidationError } from "../errors";

export const MUTATIONS = {
  createWorkspace: async function (userId: string, name: string) {
    const result = await db.insert(workspace).values({
      id: uuidv4(),
      name: name,
      userId: userId,
    }).returning();
    return result[0];
  },
  createTodo: async function (title: string, workspaceId: string, userId: string, priority: number, dueDate?: string):Promise<TodosType> {
    if(!title || title.trim().length === 0) {
      throw new ValidationError("Todo title cannot be empty");
    }
    if(!workspaceId || !userId) {
      throw new ValidationError("Workspace ID and User ID are required to create a todo");
    }
    try {
      const result = await db.insert(todos).values({
      id: uuidv4(),
      title: title,
      workspaceId: workspaceId,
      userId: userId,
      dueDate: dueDate,
      priority: priority
    }).returning();

    if(!result || result.length === 0) {
      throw new DatabaseError("Failed to create todo");
    }

    return result[0];
    }catch (error) {
      if(error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      console.error("Database error in createTodo mutation:", error);
      throw new DatabaseError("An error occurred while creating the todo.");
    }
    
  },
  markTodo: async function (todoId: string): Promise<TodosType> {
    try {
      const updatedTodos = await db.update(todos)
        .set({
          completed: sql`NOT ${todos.completed}`,
          updatedAt: new Date(),
        })
        .where(eq(todos.id, todoId))
        .returning();
        if(updatedTodos.length === 0) {
          throw new NotFoundError("Todo to mark was not found");
        }
        return updatedTodos[0];
    }catch (error) {
      if(error instanceof NotFoundError) {
        throw error;
      }
      console.error("Database error in markTodo mutation:", error);
      throw new DatabaseError("Failed to mark todo. Please try again later.");
    }
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
  createComment: async function (todoId: string, userId: string, content: string): Promise<commentsType> {
    if (!content || content.trim().length === 0) {
      throw new ValidationError("Comment content cannot be empty");
    }
    if(!todoId || !userId) {
      throw new ValidationError("Todo ID and User ID are required to create a comment");
    }
    try {
      const result = await db.insert(comments).values({
      id: uuidv4(),
      todoId: todoId,
      userId: userId,
      content: content,
      }).returning();

      if(!result || result.length === 0) {
        throw new DatabaseError("Failed to create comment");
      }

      return result[0];
    }catch (error) {
      if(error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }

      console.error("Database error in createComment mutation:", error);
      throw new DatabaseError("An error occurred while creating the comment.");

    }

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
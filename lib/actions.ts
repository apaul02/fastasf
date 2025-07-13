"use server"

import {  headers } from "next/headers"
import { auth } from "./auth"
import { MUTATIONS, QUERIES } from "./db/queries"
import { commentsType, TActionResult, TodosType, workspaceMemberType, workspaceType } from "./types"
import { AuthError, DatabaseError, NotFoundError, OwnershipError, ValidationError } from "./errors"
import { db } from "./db"
import { invites, workspace_members } from "./db/schema"
import { and, eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid";

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

export async function createWorkspaceAction(workspaceName: string): Promise<TActionResult<workspaceType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new AuthError();
    }

    const userId = session.user.id;

    const newWorkspace = await MUTATIONS.createWorkspace(userId, workspaceName);
    return { success: true, data: newWorkspace };
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

    console.error("Error in createWorkspaceAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
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

export async function updateDueDateAction(todoId: string, dueDate: string): Promise<TActionResult<TodosType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const updatedTodo = await MUTATIONS.updateDueDate(todoId, dueDate);
    return { success: true, data: updatedTodo };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Todo not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in updateDueDateAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function deleteTodoAction(todoId: string): Promise<TActionResult<TodosType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const deletedTodo = await MUTATIONS.deleteTodo(todoId);
    return { success: true, data: deletedTodo };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Todo not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in deleteTodoAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function deleteWorkspaceAction(workspaceId: string): Promise<TActionResult<workspaceType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }
    const isOwner = await QUERIES.checkIfUserIsOwner(workspaceId, session.user.id);
    if (!isOwner) {
      throw new ValidationError("Only workspace owners can delete the workspace");
    }

    const deletedWorkspace = await MUTATIONS.deleteWorkspace(workspaceId);
    return { success: true, data: deletedWorkspace };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Workspace not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in deleteWorkspaceAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
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


export async function deleteCommentAction(commentId: string): Promise<TActionResult<commentsType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const deletedComment = await MUTATIONS.deleteComment(commentId);
    return { success: true, data: deletedComment };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Comment not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in deleteCommentAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function createInviteAction(workspaceId: string): Promise<TActionResult<{ inviteCode: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }
    const userId = session.user.id;

    const isOwner = await QUERIES.checkIfUserIsOwner(workspaceId, session.user.id);
    if (!isOwner) {
      throw new ValidationError("Only workspace owners can create invites");
    }
    const invite = await MUTATIONS.createInvite(workspaceId, userId);
    if (!invite || !invite.code) {
      throw new DatabaseError("Failed to create invite");
    }
    return { success: true, data: { inviteCode: invite.code } };
  }catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Workspace or User not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in createInviteAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function acceptInvite(
  code: string,
): Promise<TActionResult<workspaceMemberType>> {

  

  try {
    if (!code) {
      throw new ValidationError("Invite code and user ID are required.");
    }
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if(!session?.user) {
      throw new AuthError()
    }
    const userId = session.user.id;

    const newMember = await db.transaction(async (tx) => {
      const inviteResult = await tx
        .select()
        .from(invites)
        .where(eq(invites.code, code));

      if (inviteResult.length === 0) {
        throw new NotFoundError("Invite not found or has already been used.");
      }
      const invite = inviteResult[0];

      if (invite.expiresAt < new Date()) {
        await tx.delete(invites).where(eq(invites.code, code));
        throw new ValidationError("This invite has expired.");
      }

      const existingMember = await tx
        .select({ id: workspace_members.id })   
        .from(workspace_members)
        .where(
          and(
            eq(workspace_members.workspaceId, invite.workspaceId),
            eq(workspace_members.userId, userId),
          ),
        )
        .limit(1);

      if (existingMember.length > 0) {
        throw new ValidationError(
          "You are already a member of this workspace.",
        );
      }

      const newMemberResult = await tx
        .insert(workspace_members)
        .values({
          id: uuidv4(),
          workspaceId: invite.workspaceId,
          userId: userId,
          role: "member",
        })
        .returning();

      if (newMemberResult.length === 0) {
        throw new DatabaseError("Failed to add you to the workspace.");
      }

      await tx.delete(invites).where(eq(invites.code, code));

      return newMemberResult[0];
    });

    return { success: true, data: newMember }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "Invite not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }
    if (error instanceof  ValidationError) {
      return { success: false, error: { message: error.message, code: 'VALIDATION_ERROR'}}
    }

    console.error("Unexpected error in acceptInvite:", error);
    throw new DatabaseError("An unexpected error occurred while joining the workspace.");
  }
}

export async function leaveWorkspaceAction(workspaceId: string): Promise<TActionResult<workspaceMemberType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const userId = session.user.id;
    const leftWorkspace = await MUTATIONS.leaveWorkspace(userId, workspaceId);
    return { success: true, data: leftWorkspace };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: error.message, code: 'NOT_FOUND' } };
    }
    if (error instanceof OwnershipError) {
      return { success: false, error: { message: error.message, code: 'OWNERSHIP_ERROR' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in leaveWorkspaceAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function kickFromWorkspaceAction(
  workspaceId: string,
  userId: string
): Promise<TActionResult<workspaceMemberType>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }
    console.log("Kicking user:", userId, "from workspace:", workspaceId, "by user:", session.user.id);


    const kickedMember = await MUTATIONS.kickMemberFromWorkspace(session.user.id, workspaceId, userId);
    return { success: true, data: kickedMember };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: { message: "User or Workspace not found", code: 'NOT_FOUND' } };
    }
    if (error instanceof OwnershipError) {
      return { success: false, error: { message: error.message, code: 'OWNERSHIP_ERROR' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in kickFromWorkspaceAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

export async function checkWorkspaceMembershipAction(
  workspaceId: string
): Promise<TActionResult<{ isMember: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new AuthError();
    }

    const membership = await QUERIES.getWorkspaceMembership(session.user.id, workspaceId);
    return { success: true, data: { isMember: !!membership } };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: { message: "User not authenticated", code: 'AUTH_ERROR' } };
    }
    if (error instanceof DatabaseError) {
      return { success: false, error: { message: error.message, code: 'DB_ERROR' } };
    }

    console.error("Error in checkWorkspaceMembershipAction:", error);
    return { success: false, error: { message: "An unknown error occurred", code: 'UNKNOWN_ERROR' } };
  }
}

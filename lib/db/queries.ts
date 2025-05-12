import "server-only";
import { db } from ".";
import { v4 as uuidv4 } from "uuid";
import { workspace } from "./schema";
import { eq } from "drizzle-orm";

export const MUTATIONS = {
  onBoardUser: async function (userId: string, name: string) {
    const result = await db.insert(workspace).values({
      id: uuidv4(),
      name: name,
      userId: userId,
    }).returning();
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
}
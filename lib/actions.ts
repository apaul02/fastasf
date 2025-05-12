"use server"

import { headers } from "next/headers"
import { auth } from "./auth"
import { MUTATIONS } from "./db/queries"

export async function onBoardUserAction(name: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    return {success: false, error: "User not authenticated" }
  }

  const workspace = await MUTATIONS.onBoardUser(session.user.id, name)
  if (!workspace) {
    return { succes: false, error: "Failed to create workspace" }
  }

  return { success: true, workspaceId: workspace.id }


}
"use server"

import { cookies, headers } from "next/headers"
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
    return { success: false, error: "Failed to create workspace" }
  }
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()))
  return { success: true, workspaceId: workspace }


} 
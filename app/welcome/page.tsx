import { CreateWorkspaceCard } from "./CreateWorkspaceCard";
import { QUERIES } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { WorkspaceCard } from "./workspace-card";
import { redirect } from "next/navigation";

export default async function Welcome() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session?.user) {
    redirect("/")
  }

  const workspaces = await QUERIES.getUserWorkspaces(session?.user.id)
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex items-center justify-center w-full max-w-4xl px-4">
          <CreateWorkspaceCard />
          <WorkspaceCard workspace={workspaces} />
          {JSON.stringify(session?.user)}

        </div>
      </div>
    </main>
  )
}
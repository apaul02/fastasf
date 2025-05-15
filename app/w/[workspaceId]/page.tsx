import { auth } from "@/lib/auth";
import { QUERIES } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceContents } from "./workspaceContents";
import { NewTodoButton } from "@/components/newTodoButton";

export default async function WorkspacePage(props: { params: Promise<{workspaceId: string}> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/")
  }

  const params = await props.params;

  const [ currentWorkspace, allWorkspaces, todos ] = await Promise.all([
    QUERIES.getWorkspaceById(params.workspaceId),
    QUERIES.getUserWorkspaces(session.user.id),
    QUERIES.getTodosByWorkSpaceId(params.workspaceId)
  ]);
  return (
    <main>
      <WorkspaceContents workspaces={allWorkspaces} currentWorkspace={currentWorkspace} />
      <NewTodoButton workspaceId={currentWorkspace.id} />
      {JSON.stringify(todos)}
    </main>
  )

}
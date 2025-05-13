import { auth } from "@/lib/auth";
import { QUERIES } from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspacePage(props: { params: Promise<{workspaceId: string}> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/")
  }

  const params = await props.params;
  const workspace = await QUERIES.getWorkspaceById(params.workspaceId);
  return (
    <main>
      {params.workspaceId}
      {JSON.stringify(workspace)}
    </main>
  )

}
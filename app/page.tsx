import { GithubLoginButton } from "@/components/GithubLoginButton";
import { onBoardUserAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session?.user) {
    const result = await onBoardUserAction();
    if(result.success && result.workspaceId) {
        if(result.isNew) {
          console.log("New user onboarded successfully", result.workspaceId);
        } else {
          console.log("Existing user found, workspace ID:", result.workspaceId);
        }
        redirect(`/w/${result.workspaceId}`);
      }else {
        console.error("Failed to onboard user:", result.error);
        //TODO: Show error message to user
      }
  }
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex items-center justify-center w-full max-w-4xl px-4">
          <div>
            Hello
            <GithubLoginButton />
            {JSON.stringify(session?.user)}
          </div>
        </div>
      </div>
    </main>
  )
}
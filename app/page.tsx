import { LoginButton } from "@/components/LoginButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session?.user) {
    return redirect("/dashboard")
  }
  return (
    <main>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex items-center justify-center w-full max-w-4xl px-4">
          <div>
            Hello
            <LoginButton />
          </div>
        </div>
      </div>
    </main>
  )
}
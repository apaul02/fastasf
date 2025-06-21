import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if(!session?.user) {
    redirect("/")
  }
  return (
     <main className="container mx-auto p-4 md:p-6">
      <h1 className="mb-8 text-3xl font-bold">Kanban Board</h1>
      {JSON.stringify(session)}
    </main>
  )
}
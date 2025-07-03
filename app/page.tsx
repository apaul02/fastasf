import { onBoardUserAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/landing/header";
import { TitleSection } from "@/components/landing/title-section";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    const result = await onBoardUserAction();
    if (result.success && result.workspaceId) {
      if (result.isNew) {
        console.log("New user onboarded successfully", result.workspaceId);
      } else {
        console.log("Existing user found, workspace ID:", result.workspaceId);
      }
      redirect(`/w/${result.workspaceId}`);
    } else {
      console.error("Failed to onboard user:", result.error);
      //TODO: Show error message to user
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <TitleSection />
      </main>
    </div>
  );
}
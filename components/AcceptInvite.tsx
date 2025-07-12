"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptInvite } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AcceptInvite(props: { disabled?: boolean }) {
  const [code, setCode] = useState("")
  const router = useRouter();
  const handleInviteCodeChange = async () => {
    try {
      const result = await acceptInvite(code);
      if (result.success) {
        // Handle successful invite acceptance, e.g., redirect to the workspace
        console.log("Invite accepted successfully:", result.data);
        router.push(`/w/${result.data.workspaceId}`);

      } else {
        // Handle error cases
        const errorCode = result.error.code;
        const errorMessage = result.error.message;
        console.error("Error accepting invite:", errorCode, errorMessage);
        // You can show a toast or alert here with the error message
      }

    }catch (error) {
      console.error("Unexpected error while accepting invite:", error);
      // Handle unexpected errors, e.g., show a toast or alert
    }

  }
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={props.disabled}>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label >code</Label>
              <Input  name="code" value={code} onChange={e => setCode(e.target.value)} placeholder="code"  />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInviteCodeChange}>goooo</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

"use client"
import React, { useState } from "react"
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
import { acceptInvite } from "@/lib/actions"
import { useRouter } from "next/navigation"

export function AcceptInvite(props: { disabled?: boolean, children?: React.ReactNode }) {
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
          {props.children || (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="w-full flex" disabled={props.disabled}>Join workspace</Button>
            </div>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Workspace</DialogTitle>
            <DialogDescription>
              Join a workspace by entering the invite code
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Input  name="code" value={code} className="py-2" onChange={e => setCode(e.target.value)} placeholder="code"  />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInviteCodeChange}>Join</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

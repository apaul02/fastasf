"use client"
import React, { useState } from "react";
import { workspaceType } from "@/lib/types";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createInviteAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function GenerateInvite(props: { workspace: workspaceType, disabled?: boolean, children?: React.ReactNode } ) {
  const [code, setCode] = useState("");
  const router = useRouter();
  const handleGenerateCode =  async () => {
    try {
      const result = await createInviteAction(props.workspace.id);
      if (result.success) {
        setCode(result.data.inviteCode)
      }else {
        const errorCode = result.error.code;
        const errorMessage = result.error.message;
        if(errorCode === "AUTH_ERROR") {
          toast.error("You must be logged in to generate an invite code.");
          router.push("/login");
        }else if(errorCode === "VALIDATION_ERROR") {
          toast.error("You must be a workspace owner to generate an invite code.", {
            description: errorMessage
          });
        }else if (errorCode === "NOT_FOUND") {
          toast.error("Workspace not found.", {
            description: errorMessage
          });
        }else {
          toast.error("An unexpected error occurred while generating the invite code.", {
            description: errorMessage
          });
          console.error("Unexpected error:", result.error);
          // Optionally, you can redirect or take other actions based on the error
        }

      }
    } catch (error) {
      console.error("Error generating invite code:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.children || <Button variant={"outline"} disabled={props.disabled}>Share Workspace</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          Share Workspace
        </DialogTitle>
        <DialogDescription>
          Invite other to your workspace by sharing this id
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <div className="flex gap-2">
            <Input readOnly placeholder="Workspace ID" value={code} className="flex-1" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (code) {
                  navigator.clipboard.writeText(code);
                  toast.success("Invite code copied to clipboard!");
                }
              }}
              disabled={!code}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant={"outline"}>Close</Button>
        </DialogClose>
        <Button onClick={handleGenerateCode} >Generate Code</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )}

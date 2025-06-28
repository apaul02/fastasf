"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceAction } from "@/lib/actions";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

export function CreateWorkspaceCard() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    try {
      const validation = workspaceNameSchema.safeParse({ name: workspaceName });
      if (!validation.success) {
        toast.error("Invalid workspace name", {
          description: validation.error.format().name?._errors[0] || "Please enter a valid workspace name",
          duration: 3000,
          dismissible: true,
        });
        return;
      }
      const response = await createWorkspaceAction  (workspaceName);
      if(response.success) {
        setWorkspaceName("");
        toast.success("Workspace created successfully", {
          description: "Your workspace has been created.",
          duration: 3000,
          dismissible: true,
        });
        
      }else {
        const errorCode = response.error.code;
        const errorMessage = response.error.message;
        if (errorCode === 'AUTH_ERROR') {
          toast.error("Authentication error", { description: errorMessage });
          router.push("/");
        }
        else if (errorCode === 'VALIDATION_ERROR') {
          toast.error("Invalid Input", { description: errorMessage });
        }
        else if (errorCode === 'DB_ERROR') {
          toast.error("Database error", { description: errorMessage });
        }
        else {
          toast.error("Failed to create workspace", { description: errorMessage });
        }
      }
      
    }catch(err) {
      console.error("Error creating workspace:", err);
      toast.error("Failed to create workspace", {
        description: "An error occurred while creating the workspace. Please try again.",
        duration: 3000,
        dismissible: true,
      });
    }finally {
      setIsLoading(false);
    }
  }
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          Welcome to FastASF
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Label>Workspace Name</Label>
          <Input placeholder="Name of your workspace" onChange={(e) => setWorkspaceName(e.target.value) }></Input>  
          <Button onClick={handleCreateWorkspace} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
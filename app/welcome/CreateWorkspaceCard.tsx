"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceAction } from "@/lib/actions";
import { z } from "zod";
import { useState } from "react";

const workspaceNameSchema = z.object({
  name: z.string().min(1, { message: "Please enter a workspace name" }).max(50, { message: "Workspace name must be less than 50 characters" }),
});

export function CreateWorkspaceCard() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    setError("");
    try {
      const validation = workspaceNameSchema.safeParse({ name: workspaceName });
      if (!validation.success) {
        setError(validation.error.format().name?._errors[0] || "Invalid workspace name");
        console.log(validation.error.format().name?._errors[0]);
        return;
      }
      const response = await createWorkspaceAction  (workspaceName);
      if(response.success) {
        console.log("Workspace created successfully:", response.workspaceId);
        setWorkspaceName("");
        
      }else {
        console.log(response.error)
      }
      
    }catch(err) {
      console.error("Error creating workspace:", err);
      setError("Failed to create workspace. Please try again.");
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
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          <Button onClick={handleCreateWorkspace} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
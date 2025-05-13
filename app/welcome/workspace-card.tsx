"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workspaceType } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function WorkspaceCard(props: { workspace: workspaceType[] }) {
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
      <div>
        {props.workspace.map((space) => (
          <Link key={space.id} href={`/w/${space.id}`}
            onClick={(e) => {
              e.preventDefault();
              startTransition(() => {
                navigate.push(`/w/${space.id}`);
              })
            }}
            >
            <Card className="w-full max-w-md" key={space.id}>
              <CardHeader>
                <CardTitle>
                  {space.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>{space.name}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
  )

}
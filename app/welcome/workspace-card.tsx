"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workspaceType } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

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
            <Card className={`w-full max-w-md transition-opacity ${isPending ? 'opacity-50 cursor-wait' : 'hover:shadow-md'}`} key={space.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {space.name}
                  {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <p>{isPending ? "Loading..." : space.name}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
  )

}
"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";
import { useState } from "react";

export function GithubLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/welcome"
      });
    } catch (error) {
      console.error("GitHub login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="relative w-full overflow-hidden bg-white text-black border-[#24292F] hover:bg-[#f6f8fa] hover:border-[#1b1f23] dark:bg-[#24292F] dark:text-white dark:hover:bg-[#2f363d] transition-all duration-300"
      onClick={handleLogin}
      disabled={isLoading}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#2463eb]/10 via-transparent to-[#2463eb]/10 opacity-0 hover:opacity-100 transition-all duration-300" />
      <Github className="size-5 mr-2" />
      <span className="font-semibold">
        {isLoading ? "Connecting..." : "Sign in with GitHub"}
      </span>
      {isLoading && (
        <svg
          className="animate-spin ml-2 h-4 w-4 text-white dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
    </Button>
  );
}
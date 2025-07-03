"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { motion } from "motion/react"
import { RainbowButton } from "./magicui/rainbow-button";
import { Poppins } from "next/font/google";
import { toast } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function GithubLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const authResponse = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
      // window.location.reload();


      if (authResponse.error) {
        toast.error("Failed to login with GitHub. Please try again.");
        //TODO: Show error message to user
        setIsLoading(false);
        return;
      }

      // const result = await onBoardUserAction();

      // if(result.success && result.workspaceId) {
      //   if(result.isNew) {
      //     console.log("New user onboarded successfully", result.workspaceId);
      //   } else {
      //     console.log("Existing user found, workspace ID:", result.workspaceId);
      //   }
      //   navigate.push(`/w/${result.workspaceId}`);
      // }else {
      //   console.error("Failed to onboard user:", result.error);
      //   //TODO: Show error message to user
      // }
    } catch (error) {
      console.error("GitHub login failed:", error);
      //TODO: Show error message to user
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      animate= { { scale: 1, opacity: 1 } }
      transition={{ duration: .2 }}
      >


      <RainbowButton
        onClick={handleLogin}
        disabled={isLoading}
        className={`px-10 py-5 text-lg flex items-center justify-center gap-2 ${poppins.className}`}
      >
        <span className="">
          {isLoading ? "Connecting..." : "Get started"}
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
      </RainbowButton>
    </motion.div>
  );
}
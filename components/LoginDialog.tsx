"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { RainbowButton } from "./magicui/rainbow-button";
import { Poppins } from "next/font/google";
import { RiGithubFill, RiGoogleFill } from "react-icons/ri";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      const authResponse = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (authResponse.error) {
        toast.error("Failed to login with GitHub. Please try again.");
        setGithubLoading(false);
        return;
      }
    } catch (error) {
      console.error("GitHub login failed:", error);
      toast.error("GitHub login failed. Please try again.");
      setGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const authResponse = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (authResponse.error) {
        toast.error("Failed to login with Google. Please try again.");
        setGoogleLoading(false);
        return;
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <RainbowButton
            className={`px-10 py-5 text-lg flex items-center justify-center gap-2 ${poppins.className}`}
          >
            Get Started
          </RainbowButton>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to 2DO
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose your preferred method to get started
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleGithubLogin}
            disabled={githubLoading || googleLoading}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base flex items-center justify-center gap-3"
          >
            <RiGithubFill className="w-5 h-5" />
            {githubLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                Connecting...
              </>
            ) : (
              "Continue with GitHub"
            )}
          </Button>
          
          <Button
            onClick={handleGoogleLogin}
            disabled={githubLoading || googleLoading}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base flex items-center justify-center gap-3"
          >
            <RiGoogleFill className="w-5 h-5" />
            {googleLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                Connecting...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

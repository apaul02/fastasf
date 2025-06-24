"use client";

import { GithubLoginButton } from "../GithubLoginButton";
import { ModeToggle } from "../toggle-button";

export const Header = () => {
  return (
    <header className="p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Yep-Done</h1>
      <div className="flex items-center gap-4">
        <GithubLoginButton size="sm" />
        <ModeToggle />
      </div>
    </header>
  );
};

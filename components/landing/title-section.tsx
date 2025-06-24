"use client";
import { GithubLoginButton } from "../GithubLoginButton";

export const TitleSection = () => {
  return (
    <section className="text-center mt-28 flex flex-col items-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]">
      </div>
      <h1 className="text-5xl font-bold animate-fade-in-up bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Yep-Done
      </h1>
      <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
        A simple and powerful todo app to help you manage your tasks.
      </p>
      <div className="mt-8">
        <GithubLoginButton size="lg" />
      </div>
    </section>
  );
};

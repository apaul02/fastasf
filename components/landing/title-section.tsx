"use client";
import { GithubLoginButton } from "../GithubLoginButton";
import { motion } from "motion/react";

export const TitleSection = () => {
	const text = "A simple todo app that dose simple things.".split(" ");
	return (
		<div className="text-center mt-28 flex flex-col items-center">
      <div className="absolute inset-0 -z-10 h-full w-full" />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="flex flex-col items-center justify-center"
			>
				<h1 className="text-8xl font-bold animate-fade-in-up">2DO.</h1>
			</motion.div>
			<motion.p className="text-lg text-muted-foreground mt-4 max-w-2xl">
				{text.map((el, i) => (
					<motion.span
						initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{
							duration: 0.3,
							delay: i / 10,
						}}
						key={i}
						className="inline-block mr-1.5 text-xl"
					>
						{el}
					</motion.span>
				))}
			</motion.p>
			<div className="mt-8">
				<GithubLoginButton size="lg" />
			</div>
		</div>
	);
};

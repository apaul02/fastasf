// src/components/TitleSection.jsx

"use client";

import Image from "next/image";
import { GithubLoginButton } from "../GithubLoginButton";
import { motion } from "motion/react";

export const TitleSection = () => {
	// Fixed the typo "dose" -> "does"
	const text = "A simple todo app that does simple things.".split(" ");

	return (
		// The root container for the entire page content
		<div className="flex flex-col items-center">

			{/* Section 1: Hero / Title */}
			{/* Takes up the full screen height and centers its content both vertically and horizontally. */}
			<section className="relative flex h-screen w-full max-w-3xl flex-col items-center justify-center text-center">
				<div className="absolute inset-0 -z-10 h-full w-full" />

				{/* Title with fade-in-up animation */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					className="text-8xl font-bold"
				>
					2DO.
				</motion.h1>

				{/* Subtitle with staggered word animation. The parent section's `text-center` handles alignment. */}
				<motion.p className="mt-4 max-w-2xl text-lg text-muted-foreground">
					{text.map((el, i) => (
						<motion.span
							initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							transition={{
								duration: 0.3,
								delay: i / 10,
							}}
							key={i}
							className="mr-1.5 inline-block text-xl"
						>
							{el}
						</motion.span>
					))}
				</motion.p>
				
				{/* Login Button */}
				<div className="mt-8 flex items-center">
					<GithubLoginButton size="lg" />
				</div>
			</section>

			{/* Section 2: Features */}
			{/* Added vertical padding for better spacing between sections */}
			<section className="w-full max-w-3xl py-20">
				<div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
					{/* Text content aligned left for readability */}
					<div className="text-center md:text-left">
						<h2 className="mb-2 text-3xl font-semibold">
							Create, edit, delete
						</h2>
						<p className="text-muted-foreground">
							Easily manage your tasks with simple and intuitive controls.
						</p>
					</div>
					{/* Image */}
					<div>
						<Image
							src={"/image.png"}
							alt="Todo app feature illustration"
							width={500}
							height={500}
							className="h-auto w-full rounded-lg shadow-lg"
						/>
					</div>
				</div>
			</section>
		</div>
	);
};
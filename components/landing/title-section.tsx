// src/components/TitleSection.jsx

"use client";

import Image from "next/image";
import { GithubLoginButton } from "../GithubLoginButton";
import { motion } from "motion/react";

export const TitleSection = () => {
	// Fixed the typo "dose" -> "does"
	const text = "A simple todo app that does simple things.".split(" ");

	return (
		<div className="flex flex-col items-center">

			<section className="relative flex h-screen w-full max-w-3xl flex-col items-center justify-center text-center">
				<div className="absolute inset-0 -z-10 h-full w-full" />

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					className="text-8xl font-bold"
				>
					2DO.
				</motion.h1>

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
				
				<div className="mt-8 flex items-center">
					<GithubLoginButton />
				</div>
			</section>

			<section className="w-full max-w-3xl py-20">
				<div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
					<div className="text-center md:text-left">
						<h2 className="mb-2 text-3xl font-semibold">
							Create, edit, delete
						</h2>
						<p className="text-muted-foreground">
							Easily manage your tasks with simple and intuitive controls.
						</p>
					</div>
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
"use client";
import { motion } from "motion/react"
import { GithubLoginButton } from "./GithubLoginButton";
import Image from "next/image";
import { ModeToggle } from "./toggle-button";
import { Inter } from "next/font/google";
import { RiGithubFill } from "react-icons/ri";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";


const inter = Inter({ subsets: ["latin"] });

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 100,       
    scale: 0.8,   
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,    
  }
};

export function Landing() {
  const text = "A simple todo app that does simple things.".split(" ");
  return (
    <div className={`${inter.className} `}>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm px-4">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Image src="/Untitled.svg" alt="Logo" width={30} height={30} />
            <div className="flex items-center gap-4">
              <ModeToggle />
            </div>
        </div>
      </header>
      <section className="flex min-h-screen justify-center">
        <div className="flex flex-col items-center justify-center">
          <motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeOut" }}
					className="text-8xl font-bold"
				>
					2DO<motion.span className="text-yellow-600" animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        times: [
          0,
          0.5 / 1,          
          0.5 / 1,           
          1
        ],
        ease: "linear",               
        repeat: Infinity,
        repeatType: "loop"
      }}>.</motion.span>
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
        </div>
      </section>
      <section className="w-full py-10 px-10">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView={"visible"}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 14
           }}
        >
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 h-screen">
            <div className="text-center md:text-left space-y-4">
            <h3 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
              Create. Edit. Done.
            </h3>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
              Todo Controls
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto md:mx-0">
              {"Take full control of your task list with simple and intuitive tools. Whether you're adding a new todo, editing an existing one, or checking off a completed task, managing your daily goals has never been easier."}
            </p>
          </div>

          <div className="flex justify-center md:justify-end rounded-2xl border-8">
            <div className="relative  h-auto">
              <Image
                src="/image.png"
                alt="Task preview"
                width={800}
                height={700}
                className="rounded-xl shadow-lg object-contain w-full h-auto"
              />
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView={"visible"}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 14
           }}
        >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 h-screen">
        <div className="flex justify-center md:justify-end rounded-2xl border-8">
          <div className="relative  h-auto">
            <Image
              src="/image2.png"
              alt="Task preview"
              width={800}
              height={600}
              className="rounded-xl shadow-lg object-contain w-full h-auto"
            />
          </div>
        </div>
        <div className="text-center md:text-right space-y-4">
          <h3 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
            Deadlines, auto-detected
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Smart Date Detection
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg md:ml-auto">
            {"No need to manually set due dates—our smart system scans your todo titles and automatically extracts dates and deadlines. Stay ahead of your schedule with zero extra effort."}
          </p>
        </div>       
      </div>
      </motion.div>
      <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView={"visible"}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 14
           }}
        >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 h-screen">
          <div className="text-center md:text-left space-y-4">
          <h3 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
            Divide and conquer.
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Organized Workspaces
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto md:mx-0">
            {"Keep your personal, professional, and collaborative tasks separate by grouping them into dedicated workspaces. Enjoy a clutter-free view of your todos and focus on what matters most in each area of your life."}
          </p>
        </div>

        <div className="flex justify-center md:justify-end rounded-2xl border-8">
          <div className="relative  h-auto">
            <Image
              src="/image.png"
              alt="Task preview"
              width={800}
              height={700}
              className="rounded-xl shadow-lg object-contain w-full h-auto"
            />
          </div>
        </div>
      </div>
      </motion.div>
      <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView={"visible"}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 14
           }}
        >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-4 h-screen">
        <div className="flex justify-center md:justify-end rounded-2xl border-8">
          <div className="relative  h-auto">
            <Image
              src="/image2.png"
              alt="Task preview"
              width={800}
              height={600}
              className="rounded-xl shadow-lg object-contain w-full h-auto"
            />
          </div>
        </div>
        <div className="text-center md:text-right space-y-4">
          <h3 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
            Work together, effortlessly.
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Shared Collaboration
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg md:ml-auto">
            {"Invite teammates, friends, or family to collaborate on shared workspaces. Assign tasks, track progress together, and stay in sync—all in one central place designed for seamless teamwork."}
          </p>
        </div>       
      </div>
      </motion.div>
    </section>
    <footer className="py-8 text-center text-sm text-muted-foreground">
      <div className="flex justify-between px-8">
        <div className="font-semibold">
          2DO.
        </div>
        <p>
          Made with ❤️ by <Link href="https://x.com/thehiro02" target="_blank"><span className="text-yellow-600 underline">Hiro</span></Link>
        </p>
        <div className="flex items-center gap-2">
          <Link href={"https://github.com/apaul02/fastasf"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <RiGithubFill className="h-5 w-5 hover:fill-orange-500 dark:hover:fill-orange-300" />
          </Link>
          <Link href={"https://x.com/thehiro02"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <FaXTwitter className="h-5 w-5 hover:fill-blue-500 dark:hover:fill-blue-300" />
          </Link>
        </div>
      </div>
      
    </footer>
    </div>
  )
}
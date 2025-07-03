import Image from "next/image";
import { ModeToggle } from "../toggle-button";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Image src="/Untitled.svg" alt="Logo" width={30} height={30} />
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};
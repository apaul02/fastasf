
import Image from "next/image";
import { ModeToggle } from "../toggle-button";

export const Header = () => {
  return (
    <div className="p-4 flex justify-between items-center">
      <Image src="/Untitled.svg" alt="Logo" width={30} height={30} />
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </div>
  );
};

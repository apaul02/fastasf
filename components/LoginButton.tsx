import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { GithubLoginButton } from "./GithubLoginButton"


export function LoginButton() {
  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button>SignIn</Button>
      </DialogTrigger>
      <DialogContent>
        <GithubLoginButton />
      </DialogContent>
    </Dialog>
  )
}
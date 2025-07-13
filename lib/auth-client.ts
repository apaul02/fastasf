import { createAuthClient } from "better-auth/react"

const baseURL =
  typeof window !== "undefined"
    ? undefined // let it use same-origin on the client
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL,
})

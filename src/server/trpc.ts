// server/trpc.ts
import { initTRPC } from "@trpc/server";

// Create a new tRPC instance
export const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

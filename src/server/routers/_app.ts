import { router } from "../trpc";
import { voyageRouter } from "./voyage";

export const appRouter = router({
  voyages: voyageRouter,
});

export type AppRouter = typeof appRouter;

import { router } from "../trpc";
import { unitTypeRouter } from "./unitTypes";
import { vesselRouter } from "./vessel";
import { voyageRouter } from "./voyage";

export const appRouter = router({
  voyages: voyageRouter,
  vessels: vesselRouter,
  unitTypes: unitTypeRouter,
});

export type AppRouter = typeof appRouter;

import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";

export const unitTypeRouter = router({
  getUnitTypes: publicProcedure.query(async () => {
    const unitTypes = await prisma.unitType.findMany();
    return unitTypes;
  }),
});

import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";

export const vesselRouter = router({
  getVessels: publicProcedure.query(async () => {
    const vessels = (await prisma.vessel.findMany()).map((vessel) => ({
      label: vessel.name,
      value: vessel.id,
    }));
    return vessels;
  }),
});

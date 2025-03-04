import { router, publicProcedure } from "../trpc";
import { z } from "zod"; // Zod helps validate our inputs
import { prisma } from "src/server/db";

export const voyageRouter = router({
  // Simple query to get all voyages
  getVoyages: publicProcedure.query(async () => {
    const voyages = await prisma.voyage.findMany();
    return voyages;
  }),

  // Mutation to create a user with input validation
  createUser: publicProcedure
    .input(
      z.object({
        // Zod schema defines what inputs are valid
        scheduledDeparture: z.date(),
        scheduledArrival: z.date(),
        portOfLoading: z.string(),
        portOfDischarge: z.string(),
        vesselId: z.string(),
        unitTypes: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      const { unitTypes, ...rest } = input;
      const voyage = await prisma.voyage.create({
        data: {
          ...rest,
          unitTypes: {
            connect: unitTypes.map((id: string) => ({ id })),
          },
        },
      });
      return voyage;
    }),
});

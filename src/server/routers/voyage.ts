import { router, publicProcedure } from "../trpc";
import { z } from "zod"; // Zod helps validate our inputs
import { prisma } from "src/server/db";
import { TRPCError } from "@trpc/server";

export const voyageRouter = router({
  // Simple query to get all voyages
  getVoyages: publicProcedure.query(async () => {
    const voyages = await prisma.voyage.findMany({
      include: {
        vessel: {},
        unitTypes: {},
      },
    });
    return voyages;
  }),

  // Mutation to create a voyage with input validation
  createVoyage: publicProcedure
    .input(
      z.object({
        // Zod schema defines what inputs are valid
        scheduledDeparture: z.string().transform((val) => new Date(val)),
        scheduledArrival: z.string().transform((val) => new Date(val)),
        portOfLoading: z.string(),
        portOfDischarge: z.string(),
        vesselId: z.string(),
        unitTypes: z.array(z.string()).min(5),
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

  // Delete voyage
  deleteVoyage: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      const deletedVoyage = await prisma.voyage.delete({
        where: {
          id,
        },
      });

      if (!deletedVoyage)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voyage not found",
        });
    }),
});

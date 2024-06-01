import { compareAsc } from "date-fns";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

/**
 * @swagger
 * /api/voyage/create:
 *   post:
 *     tags:
 *       - Voyage
 *     summary: Creates a new voyage
 *     description: Creates a new voyage with specified details including departure, arrival, ports, vessel, and unit types.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departure
 *               - arrival
 *               - portOfLoading
 *               - portOfDischarge
 *               - vessel
 *               - unitTypes
 *             properties:
 *               departure:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled departure date and time.
 *               arrival:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled arrival date and time.
 *               portOfLoading:
 *                 type: string
 *                 description: The port where the voyage starts.
 *               portOfDischarge:
 *                 type: string
 *                 description: The port where the voyage ends.
 *               vessel:
 *                 type: string
 *                 description: ID of the vessel used for the voyage.
 *               unitTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of unit type IDs associated with the voyage.
 *     responses:
 *       201:
 *         description: Voyage created successfully.
 *       500:
 *         description: Internal server error, indicates failure to create the voyage.
 *       405:
 *         description: Method not allowed, indicates that the request method is not supported by the endpoint.
 */
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<undefined>,
) => {
  if (req.method !== "POST") res.status(405).end();
  const {
    departure,
    arrival,
    portOfLoading,
    portOfDischarge,
    vessel,
    unitTypes,
  } = JSON.parse(req.body);

  if (portOfLoading === portOfDischarge) {
    res.status(400).end();
    return;
  }
  if (compareAsc(new Date(arrival), new Date(departure)) !== -1)
    res.status(400).end();

  try {
    const createdVoyage = await prisma.voyage.create({
      data: {
        scheduledDeparture: departure,
        scheduledArrival: arrival,
        portOfLoading,
        portOfDischarge,
        vesselId: vessel,
        unitTypes: {
          connect: unitTypes.map((id: string) => ({ id })),
        },
      },
    });
    createdVoyage ? res.status(201) : res.status(500);
    res.end();
    return;
  } catch (e) {
    res.status(400);
  }
};
export default handler;

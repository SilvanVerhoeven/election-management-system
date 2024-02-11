import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"
import getConstituency from "./getConstituency"

/**
 * Returns the latest version of constituencies eligible for the election with the given globalId.
 *
 * @returns Constituencies eligible for the given election
 */
export default resolver.pipe(
  async (electionGlobalId: number, ctx: Ctx): Promise<Constituency[]> => {
    const dbConnections = await db.constituencyEligibility.findMany({
      distinct: ["constituencyId"],
      where: {
        electionId: electionGlobalId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    return await Promise.all(
      dbConnections
        .filter((connection) => !connection.deleted)
        .map(
          async (dbConnection) =>
            await getConstituency({ globalId: dbConnection.constituencyId }, ctx)
        )
    )
  }
)

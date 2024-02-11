import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"
import getStatusGroup from "./getStatusGroup"

/**
 * Returns the latest version of status groups eligible for the election with the given globalId.
 *
 * @returns Status Groups eligible for the given election
 */
export default resolver.pipe(async (electionGlobalId: number, ctx: Ctx): Promise<StatusGroup[]> => {
  const dbConnections = await db.statusGroupEligibility.findMany({
    distinct: ["statusGroupId"],
    where: {
      electionId: electionGlobalId,
    },
    orderBy: { version: { createdAt: "desc" } },
  })

  return await Promise.all(
    dbConnections
      .filter((connection) => !connection.deleted)
      .map(
        async (dbConnection) => await getStatusGroup({ globalId: dbConnection.statusGroupId }, ctx)
      )
  )
})

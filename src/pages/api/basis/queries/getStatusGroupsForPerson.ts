import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { StatusGroup } from "src/types"
import getStatusGroup from "./getStatusGroup"

/**
 * Returns the latest version of status groups the person with the given globalId is member of.
 *
 * @returns Status Groups of given person
 */
export default resolver.pipe(async (personGlobalId: number, ctx: Ctx): Promise<StatusGroup[]> => {
  const dbConnections = await db.statusGroupMembership.findMany({
    distinct: ["statusGroupId"],
    where: {
      personId: personGlobalId,
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

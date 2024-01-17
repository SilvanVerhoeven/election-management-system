import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Election } from "src/types"
import getStatusGroupsForElection from "./getStatusGroupsForElection"
import getConstituenciesForElection from "./getConstituenciesForElection"
import getCommittee from "./getCommittee"

/**
 * Returns individual elections part of the given election set.
 *
 * @returns Elections running at the given election
 */
export default resolver.pipe(async (electionSetId: number, ctx: Ctx): Promise<Election[]> => {
  const dbElections = await db.election.findMany({
    where: {
      runsAtId: electionSetId,
    },
    distinct: ["globalId"],
    orderBy: { version: { createdAt: "desc" } },
  })

  return await Promise.all(
    dbElections.map(async (dbElection): Promise<Election> => {
      const committee = await getCommittee({ globalId: dbElection.committeeId }, ctx)
      const statusGroups = await getStatusGroupsForElection(dbElection.globalId, ctx)
      const constituencies = await getConstituenciesForElection(dbElection.globalId, ctx)
      return {
        ...dbElection,
        committee,
        constituencies,
        statusGroups,
      }
    })
  )
})

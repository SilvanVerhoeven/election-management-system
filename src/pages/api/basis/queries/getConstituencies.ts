import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Constituency } from "src/types"
import getPollingStation from "./getPollingStation"

/**
 * Returns the latest version of all constituencies.
 *
 * @returns All Constituencies
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<Constituency[]> => {
  const dbConstituencies = await db.constituency.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })

  return await Promise.all(
    dbConstituencies.map(async (dbConstituency): Promise<Constituency> => {
      const pollingStation = await getPollingStation(
        { globalId: dbConstituency.presenceVotingAtId },
        ctx
      )
      return {
        ...dbConstituency,
        presenceVotingAt: pollingStation,
      }
    })
  )
})

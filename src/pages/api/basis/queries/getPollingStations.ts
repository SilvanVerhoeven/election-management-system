import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { PollingStation } from "src/types"
import getSite from "./getSite"

/**
 * Returns the latest version of all polling stations.
 *
 * @returns All Polling Stations
 */
export default resolver.pipe(async (_: null, ctx: Ctx): Promise<PollingStation[]> => {
  const dbPollingStations = await db.pollingStation.findMany({
    distinct: ["globalId"],
    orderBy: {
      version: {
        createdAt: "desc",
      },
    },
  })

  return await Promise.all(
    dbPollingStations.map(async (dbPollingStation) => {
      const site = await getSite({ globalId: dbPollingStation.locatedAtId }, ctx)
      return {
        ...dbPollingStation,
        locatedAt: site,
      }
    })
  )
})

import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { PollingStation } from "src/types"
import getSite from "./getSite"

export interface GetPollingStationProps {
  globalId: number
  versionId?: number
}

/**
 * Returns polling station with the given globalId and versionId.
 * Returns latest version if no versionId is given.
 *
 * @returns Polling Station of the given version
 */
export default resolver.pipe(
  async ({ globalId, versionId }: GetPollingStationProps, ctx: Ctx): Promise<PollingStation> => {
    const dbPollingStation = await db.pollingStation.findFirstOrThrow({
      where: {
        globalId,
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const site = await getSite({ globalId: dbPollingStation.locatedAtId }, ctx)

    return {
      ...dbPollingStation,
      locatedAt: site,
    }
  }
)

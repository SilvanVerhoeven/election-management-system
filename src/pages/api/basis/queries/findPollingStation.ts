import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { PollingStation } from "src/types"
import getSite from "./getSite"

export interface FindPollingStationProps {
  nameOrShortName: string
  versionId?: number
}

/**
 * Finds a polling station with the given data.
 *
 * @param nameOrShortName Name or short name of the polling station to find
 * @param versionId ID of the wanted version. Defaults to the latest
 * @throws NotFoundError if site with these attributes cannot be found
 * @returns Found polling station
 */
export default resolver.pipe(
  async (
    { nameOrShortName, versionId }: FindPollingStationProps,
    ctx: Ctx
  ): Promise<PollingStation> => {
    const dbPollingStation = await db.pollingStation.findFirstOrThrow({
      where: {
        OR: [
          {
            name: nameOrShortName,
          },
          {
            shortName: nameOrShortName,
          },
        ],
        versionId,
      },
      orderBy: { version: { createdAt: "desc" } },
    })

    const site = await getSite({ globalId: dbPollingStation.globalId }, ctx)

    return {
      ...dbPollingStation,
      locatedAt: site,
    }
  }
)
